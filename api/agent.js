import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function: Hybrid AI System (IBM Watsonx + Google Gemini)
 * 
 * This function implements a skill-routing architecture:
 * - Vision Tasks (Image Processing): IBM Watsonx (Hackathon Core Requirement)
 * - Complex Logic/Accounting: Google Gemini 1.5 Flash (High Intelligence)
 * 
 * Environment Variables Required:
 * - IBM_CLOUD_API_KEY: IBM Cloud API key for authentication
 * - IBM_PROJECT_ID: IBM Cloud project ID for billing/isolation
 * - IBM_REGION: IBM Cloud region (e.g., us-south)
 * - IBM_WATSONX_HOST: watsonx API host
 * - GEMINI_API_KEY: Google Gemini API key for text/logic tasks
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Robust Destructuring: Check multiple possible keys for image
    const { currentData, prompt } = req.body;
    // Check possible keys for the image
    const imageBase64 = req.body.imageBase64 || req.body.image || req.body.file || req.body.attachment;
    
    // Debug Log: Verify what keys we're receiving
    console.log("Incoming Payload Keys:", Object.keys(req.body));
    console.log("Image Detected:", !!imageBase64);

    // Validate payload size (Vercel limit: 4.5MB)
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 4.5 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Payload too large. Maximum 4.5MB allowed.',
      });
    }

    // FORCE AUTO-EXECUTE FOR VISION
    let processedPrompt = prompt;
    if (imageBase64 && (!prompt || prompt.trim() === "")) {
        console.log("Image detected with empty prompt. Injecting default execution prompt.");
        processedPrompt = `
STRICT INSTRUCTION: 
1. Analyze the attached image (Receipt/Invoice). 
2. Extract Date, Total Amount, Merchant, and Items.
3. AUTOMATICALLY APPEND this as a new transaction to the 'journal_lines' or 'transactions' array in the JSON.
4. Use logic to determine Debit (Expense/Asset) and Credit (Cash/AP) accounts.
5. Return ONLY the fully updated JSON. Do not ask for confirmation.
`;
    }

    let result;

    // SKILL ROUTING: Check if this is a vision task
    if (imageBase64) {
      // Vision Task: Use IBM Watsonx
      console.log('Routing to IBM Watsonx for vision task...');
      result = await handleVisionTask(currentData, imageBase64, processedPrompt);
    } else {
      // Text/Logic Task: Use Google Gemini 2.5 Flash-Lite
      console.log('Routing to Gemini 2.5 Flash-Lite for logic task...');
      result = await handleLogicTask(currentData, processedPrompt);
    }

    // Return parsed JSON response
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in hybrid AI agent:', error);

    // Return error with details in development mode
    return res.status(500).json({
      error: 'Error processing request. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Handle Vision Tasks using IBM Watsonx
 * Processes images for OCR, receipt extraction, etc.
 */
async function handleVisionTask(currentData, imageBase64, prompt) {
  // Step 1: Generate IAM Token
  const iamToken = await generateIAMToken(process.env.IBM_CLOUD_API_KEY);

  // Step 2: Construct watsonx vision payload
  const watsonxPayload = constructVisionPayload(currentData, imageBase64, prompt);

  // Step 3: Call IBM watsonx API
  const watsonxResponse = await callWatsonxAPI(
    iamToken,
    watsonxPayload,
    process.env.IBM_REGION,
    process.env.IBM_WATSONX_HOST,
    process.env.IBM_PROJECT_ID
  );

  // Step 4: Parse and validate response
  return parseWatsonxResponse(watsonxResponse);
}

/**
 * Handle Logic/Accounting Tasks using Google Gemini 1.5 Flash
 * Processes complex business logic, accounting, and data transformations
 */
async function handleLogicTask(currentData, userPrompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try to get the model - handle potential API version requirements
  let model;
  try {
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  } catch (initError) {
    // If initialization fails, try with v1beta API
    console.log('Attempting fallback to v1beta API for Gemini 2.5 Flash-Lite...');
    model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      apiVersion: 'v1beta'
    });
  }

  const dataContext = JSON.stringify(currentData, null, 2);

  const systemPrompt = `You are Numeri, an Expert AI Accountant.

Rules:
1. **Double-Entry:** Translate user intent into strict Journal Entries (Debit/Credit).
2. **Structure:** If user asks to change columns, restructure the JSON schema.
3. **Math:** Calculate balances accurately.
4. **Output:** Return ONLY the valid updated JSON dataset matching the schema.

Current JSON Dataset:
${dataContext}

User Command: ${userPrompt}

Return ONLY this JSON structure (no markdown, no explanations outside JSON):
{
  "filename": "transactions_updated.json",
  "content": [array of updated rows],
  "explanation": "Penjelasan perubahan dalam Bahasa Indonesia"
}`;

  try {
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const responseText = response.response.text();

    // Parse the JSON response
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(responseText);
    } catch (e) {
      // If direct parse fails, try to extract JSON from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }
      parsedJSON = JSON.parse(jsonMatch[0]);
    }

    // Validate structure
    if (!parsedJSON.content || !Array.isArray(parsedJSON.content)) {
      throw new Error('Gemini response missing required "content" array');
    }

    return {
      filename: parsedJSON.filename || 'transactions_updated.json',
      content: parsedJSON.content,
      explanation: parsedJSON.explanation || 'Processing complete.',
    };
  } catch (error) {
    // Log specific error for debugging
    console.error('Failed to connect to Gemini 2.5 Flash-Lite. Check API Key or Model ID.', {
      error: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack
    });
    
    // Re-throw with clear message
    throw new Error(`Gemini model 'gemini-2.5-flash-lite' failed: ${error.message}`);
  }
}

/**
 * Generate IBM Cloud IAM Token
 * Token is valid for ~1 hour; implement caching in production
 */
async function generateIAMToken(apiKey) {
  const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
      response_type: 'cloud_iam',
    }),
  });

  if (!response.ok) {
    throw new Error(`IAM token generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Construct watsonx API payload for vision tasks
 * Uses Llama 3.2 90B Vision for image processing
 */
function constructVisionPayload(currentData, imageBase64, prompt) {
  const dataContext = JSON.stringify(currentData, null, 2);

  const visionPrompt = `You are a receipt/invoice data extraction expert. Extract information from the image and add it to the dataset.

Current JSON Dataset:
${dataContext}

User Command: ${prompt || 'Process this receipt and add it to the dataset.'}

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "filename": "transactions_updated.json",
  "content": [array of ALL rows including the new one],
  "explanation": "Description in Bahasa Indonesia"
}

Image: ${imageBase64}`;

  return {
    model_id: 'meta-llama/llama-3-2-11b-vision-instruct',
    input: visionPrompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 900,
      min_new_tokens: 1,
      repetition_penalty: 1.0,
      stop_sequences: []
    },
  };
}

/**
 * Call IBM watsonx API
 * Implements timeout handling and retry logic
 */
async function callWatsonxAPI(
  iamToken,
  payload,
  region,
  host,
  projectId
) {
  // Correct endpoint: /ml/v1/text/generation with version parameter
  const url = `https://${region}.${host}/ml/v1/text/generation?version=2023-05-29`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${iamToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        project_id: projectId, // Add project_id to payload
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `watsonx API error: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse and validate watsonx API response
 * Extracts generated_text and validates JSON structure
 */
function parseWatsonxResponse(response) {
  if (!response.results || !response.results[0]) {
    throw new Error('Invalid watsonx response structure');
  }

  const generatedText = response.results[0].generated_text;

  // Parse the JSON response from the model
  let parsedJSON;
  try {
    parsedJSON = JSON.parse(generatedText);
  } catch (e) {
    // If direct parse fails, try to extract JSON from the text
    const jsonMatch = generatedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in model response');
    }
    parsedJSON = JSON.parse(jsonMatch[0]);
  }

  // Validate structure
  if (!parsedJSON.content || !Array.isArray(parsedJSON.content)) {
    throw new Error('Response missing required "content" array');
  }

  return {
    filename: parsedJSON.filename || 'transactions_updated.json',
    content: parsedJSON.content,
    explanation: parsedJSON.explanation || 'Processing complete.',
  };
}
