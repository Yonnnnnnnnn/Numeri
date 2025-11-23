import { GoogleGenerativeAI } from '@google/generative-ai';

// Variabel Caching Token untuk IBM watsonx Orchestrate IAM
let cachedOrchestrateToken = null;
let tokenExpiryTime = 0;

/**
 * Vercel Serverless Function: Hybrid AI System (IBM watsonx Orchestrate + Google Gemini)
 * 
 * This function implements a 4-way intelligent routing architecture:
 * - AskOrchestrate Tasks (Explicit Target): IBM watsonx Orchestrate (X-Target-Agent header)
 * - Vision Tasks (Image Processing): Google Gemini 2.5 Flash-Lite (Multimodal)
 * - Cross-File Tasks (Multiple Datasets): IBM watsonx Orchestrate NumeriCrossFileAgent
 * - Single Logic Tasks: Google Gemini 2.5 Flash-Lite
 * 
 * Environment Variables Required:
 * - ORCHESTRATE_BASE_URL: IBM watsonx Orchestrate instance URL
 * - ORCHESTRATE_API_KEY: IBM watsonx Orchestrate API Key (Bearer Token)
 * - ORCHESTRATE_AGENT_NAME: IBM watsonx Orchestrate agent name
 * - ORCHESTRATE_INVOKE_PATH: Path untuk invoke agent (default: "/orchestrate/api/v1/invoke/agents/")
 * - GEMINI_API_KEY: Google Gemini API key for text/logic tasks
 */

// AI IDE Prompt: Modifikasi Routing Logic di api/agent.js untuk Integrasi IBM watsonx Orchestrate

// Tambahkan di awal file (atau di scope yang sesuai):
const ORCHESTRATE_BASE_URL = process.env.ORCHESTRATE_BASE_URL;
const ORCHESTRATE_API_KEY = process.env.ORCHESTRATE_API_KEY;
const ORCHESTRATE_AGENT_NAME = process.env.ORCHESTRATE_AGENT_NAME;
const ORCHESTRATE_INVOKE_PATH = process.env.ORCHESTRATE_INVOKE_PATH || "/orchestrate/api/v1/invoke/agents/";

// Bangun URL endpoint Orchestrate penuh
const ORCHESTRATE_ENDPOINT = `${ORCHESTRATE_BASE_URL}${ORCHESTRATE_INVOKE_PATH}${ORCHESTRATE_AGENT_NAME}`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Robust Destructuring: Check multiple possible keys for image
    const { currentData, prompt, text_prompt } = req.body;
    // Check possible keys for the image
    const imageBase64 = req.body.imageBase64 || req.body.image || req.body.file || req.body.attachment;

    // Debug Log: Verify what keys we're receiving
    console.log("Incoming Payload Keys:", Object.keys(req.body));
    console.log("Image Detected:", !!imageBase64);
    console.log("Target Agent Header:", req.headers['x-target-agent']);

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

    // --- 4-Way Intelligent Routing Logic ---

    // Filter keys untuk menghitung jumlah dataset yang masuk (tidak termasuk image dan prompt)
    const dataKeys = Object.keys(req.body).filter(key =>
      key.toLowerCase().includes('data') && !key.toLowerCase().includes('base64')
    );

    // Priority 1: AskOrchestrate Tasks (Explicit Target via Header)
    if (req.headers['x-target-agent'] === 'AskOrchestrate') {
      console.log('Routing to IBM watsonx Orchestrate (AskOrchestrate - Explicit Target)...');
      result = await handleOrchestrateTask(req.body);

    }
    // Priority 2: Cross-File Tasks (Multiple Datasets)
    else if (dataKeys.length >= 2) {
      console.log(`Routing to IBM watsonx Orchestrate (Cross-File Analysis): ${ORCHESTRATE_ENDPOINT}`);
      result = await handleOrchestrateTask(req.body);

    }
    // Priority 3: Vision Tasks (Image Processing)
    else if (imageBase64) {
      console.log('Routing to Gemini 2.5 Flash-Lite for vision task...');
      result = await handleVisionTask(currentData, imageBase64, processedPrompt);

    }
    // Priority 4: Logic Tasks (Text Processing)
    else if (prompt || text_prompt) {
      console.log('Routing to Gemini 2.5 Flash-Lite for single logic task...');
      result = await handleLogicTask(currentData, prompt || text_prompt);

    }
    // Handle Invalid Input
    else {
      return res.status(400).json({
        error: 'Invalid input format. Please check your data.',
        explanation: 'No valid input detected. Please provide image, text prompt, or data.'
      });
    }

    // Return parsed JSON response
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in hybrid AI agent:', error);

    // Specific error handling for different cases
    let errorMessage = 'Error processing request. Please try again.';
    let statusCode = 500;

    if (error.message && error.message.includes('Orchestrate API failed')) {
      errorMessage = 'Orchestrate API failed - Check IBM configuration';
      statusCode = 502; // Bad Gateway
    } else if (error.message && error.message.includes('Otentikasi IBM Cloud gagal')) {
      errorMessage = error.message; // IAM token specific error
      statusCode = 401; // Unauthorized
    } else if (error.message && error.message.includes('Gemini')) {
      errorMessage = 'Gemini API unavailable - Check configuration';
      statusCode = 502; // Bad Gateway
    }

    // Return error with details in development mode
    return res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Mengambil token akses IAM, menggunakan cache jika token masih valid (dengan buffer 5 menit).
 */
async function getOrchestrateAccessToken() {
  const ORCHESTRATE_API_KEY = process.env.ORCHESTRATE_API_KEY;

  // Cek apakah token masih ada dan belum kadaluarsa (misalnya, 5 menit/300000ms sebelum expire)
  if (cachedOrchestrateToken && Date.now() < tokenExpiryTime - 300000) {
    // console.log('Menggunakan token IAM dari cache.');
    return cachedOrchestrateToken;
  }

  // console.log('Token IAM kadaluarsa atau tidak ada. Mengambil token baru...');

  const formData = new URLSearchParams();
  formData.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
  formData.append('apikey', ORCHESTRATE_API_KEY);

  try {
    const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[IAM Token Error] Status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Simpan token baru dan hitung waktu kedaluwarsa
    cachedOrchestrateToken = data.access_token;
    tokenExpiryTime = Date.now() + (data.expires_in * 1000);

    // DEBUG: Tampilkan token untuk development
    console.log('=== IAM ACCESS TOKEN DEBUG ===');
    console.log('Token:', cachedOrchestrateToken);
    console.log('Expires in:', data.expires_in, 'seconds');
    console.log('Expires at:', new Date(tokenExpiryTime).toISOString());
    console.log('==============================');

    return cachedOrchestrateToken;

  } catch (error) {
    // Logika error handling khusus untuk IAM token
    console.error('Fatal Error IAM Token:', error.message);
    throw new Error(`Otentikasi IBM Cloud gagal. Cek API Key dan Service URL: ${error.message}`);
  }
}



/**
 * Handle Orchestrate Tasks using IBM watsonx Orchestrate /invoke endpoint
 * Processes both AskOrchestrate (explicit target) and Cross-File Analysis requests
 * Uses /invoke endpoint with Accept: application/json header
 */
async function handleOrchestrateTask(requestBody) {
  console.log("Starting IBM watsonx Orchestrate Task (/invoke endpoint)");

  try {
    // Otentikasi - Dapatkan IAM Access Token
    let accessToken;
    try {
      accessToken = await getOrchestrateAccessToken();
      console.log("✅ Using IAM Access Token");
    } catch (iamError) {
      console.log("⚠️ IAM Token failed, falling back to direct API Key");
      console.log("🔑 IAM Error:", iamError.message);
      accessToken = process.env.ORCHESTRATE_API_KEY;
    }

    // Get environment variables
    const agentId = process.env.ORCHESTRATE_AGENT_ID;
    const envId = process.env.ORCHESTRATE_AGENT_ENVIRONMENT_ID;
    const instanceId = process.env.ORCHESTRATE_INSTANCE_ID;

    // Construct /invoke endpoint
    // Try format 1: with 'api.' prefix (from service instance URL)
    const baseUrl1 = `https://api.us-south.watson-orchestrate.cloud.ibm.com`;
    const invokeUrl1 = `${baseUrl1}/instances/${instanceId}/agents/${agentId}/environments/${envId}/invoke`;

    // Try format 2: without 'api.' prefix (from embed script)
    const baseUrl2 = `https://us-south.watson-orchestrate.cloud.ibm.com`;
    const invokeUrl2 = `${baseUrl2}/instances/${instanceId}/agents/${agentId}/environments/${envId}/invoke`;

    console.log("🎯 Trying URL Format 1 (with api.):", invokeUrl1);

    // Prepare request payload
    const userPrompt = requestBody.prompt || requestBody.text_prompt || "Analyze financial data";
    let fullMessage = userPrompt;

    // Include transaction data if available
    if (requestBody.currentData && requestBody.currentData.length > 0) {
      fullMessage = `${userPrompt}\n\nData Transaksi:\n${JSON.stringify(requestBody.currentData, null, 2)}`;
    }

    const payload = {
      message: fullMessage
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    // Try Format 1 first
    let response = await fetch(invokeUrl1, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // Force JSON response
      },
      body: JSON.stringify(payload)
    });

    console.log("📊 Format 1 Response Status:", response.status);

    // If Format 1 fails with 404, try Format 2
    if (response.status === 404) {
      console.log("⚠️ Format 1 failed (404), trying Format 2 (without api.):", invokeUrl2);

      response = await fetch(invokeUrl2, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log("📊 Format 2 Response Status:", response.status);
    }

    // Error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.log("🔥 Error Response:", errorText);
      throw new Error(`[Orchestrate Invoke Error] Status ${response.status}: ${errorText}`);
    }

    // Try to parse as JSON
    const responseText = await response.text();
    console.log("📄 Raw Response (first 500 chars):", responseText.substring(0, 500));

    let orchestrateExplanation;

    try {
      const data = JSON.parse(responseText);
      console.log("✅ Response is JSON:", JSON.stringify(data, null, 2));

      // Extract text from various possible response formats
      if (data.text) {
        orchestrateExplanation = data.text;
      } else if (data.message) {
        orchestrateExplanation = data.message;
      } else if (data.response) {
        orchestrateExplanation = data.response;
      } else if (data.output && data.output.generic && data.output.generic[0]) {
        orchestrateExplanation = data.output.generic[0].text || JSON.stringify(data);
      } else {
        orchestrateExplanation = JSON.stringify(data);
      }
    } catch (parseError) {
      console.log("⚠️ Response is not JSON, treating as text/HTML");

      // If still HTML, extract text from it
      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        // Simple HTML text extraction
        const textContent = responseText
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        orchestrateExplanation = `⚠️ Watson Orchestrate mengembalikan HTML (bukan JSON). Extracted text: ${textContent.substring(0, 500)}`;
      } else {
        orchestrateExplanation = responseText;
      }
    }

    console.log("✅ Extracted explanation:", orchestrateExplanation);

    // Return in Numeri format
    return {
      filename: requestBody.filename || "transactions_updated.json",
      content: requestBody.currentData || [],
      explanation: orchestrateExplanation
    };

  } catch (error) {
    console.error('❌ Orchestrate processing error:', error);

    let errorMessage = "Orchestrate API failed - Check IBM configuration";

    if (error.message && error.message.includes('Otentikasi IBM Cloud gagal')) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = `AskOrchestrate Fail: ${error.message}`;
    }

    return {
      "filename": requestBody.filename || "transactions_updated.json",
      "content": requestBody.content || requestBody.currentData || [],
      "explanation": errorMessage
    };
  }
}

/**
 * Handle Vision Tasks using Gemini 2.5 Flash-Lite with native multimodal support
 * Processes images for OCR, receipt extraction, etc.
 */
async function handleVisionTask(currentData, imageBase64, prompt) {
  console.log("Starting Gemini Vision Task with native multimodal support");

  // Initialize Gemini
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

  // Clean base64 string - remove data URI header
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // Construct the multimodal parts correctly
  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: "image/jpeg"
    }
  };

  const textPart = {
    text: "Extract receipt data (Date, Merchant, Amount, Items) into strict JSON. No markdown."
  };

  try {
    console.log("Calling Gemini with native multimodal input...");
    const result = await model.generateContent([textPart, imagePart]);
    const responseText = result.response.text();
    console.log("Gemini Vision Result:", responseText);

    // Parse the JSON response
    const parsedData = parseVisionResponse(responseText);

    // Validate and normalize transaction structure
    const extractedTransaction = {
      id: Date.now().toString(), // Generate unique ID
      date: parsedData.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(parsedData.amount) || 0,
      description: parsedData.description || parsedData.merchant || 'Receipt',
      category: parsedData.category || 'expense'
    };

    // Append to existing data array
    const updatedData = [...currentData, extractedTransaction];

    // Return in expected format
    return {
      filename: 'transactions_updated.json',
      content: updatedData,
      explanation: `Berhasil menambahkan transaksi dari gambar: ${extractedTransaction.description || 'Receipt'} - Rp ${extractedTransaction.amount || 0}`,
    };
  } catch (error) {
    // Log specific error for debugging
    console.error('Gemini Vision error:', {
      error: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack
    });

    // Re-throw with clear message
    throw new Error(`Gemini Vision processing failed: ${error.message}`);
  }
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
 * Compress and optimize base64 image for vision processing
 */
function compressImageBase64(imageBase64) {
  // Extract the base64 data (remove data:image/...;base64, prefix)
  const base64Data = imageBase64.split(',')[1] || imageBase64;

  // For now, return as-is but in production we could resize/compress
  // TODO: Add actual image compression if needed
  return imageBase64;
}

/**
 * Construct watsonx API payload for OCR tasks (Step 1 of 2-step chain)
 * Uses Llama 3.2 11B Vision for pure text extraction
 */
function constructOCRPayload(imageBase64) {
  // Compress image to reduce token count
  const optimizedImage = compressImageBase64(imageBase64);

  // Remove "data:image/png;base64," header if present
  const cleanBase64 = optimizedImage.replace(/^data:image\/\w+;base64,/, "");

  // OCR-focused prompt - no JSON requirement
  const ocrPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>

${cleanBase64}

Describe the visible content of this receipt image. Ignore any technical headers or file encoding text. Transcribe the date, total amount, and merchant name.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

  return {
    model_id: 'meta-llama/llama-3-2-11b-vision-instruct',
    input: ocrPrompt,
    parameters: {
      decoding_method: "greedy",
      max_new_tokens: 500,
      min_new_tokens: 10,
      stop_sequences: ["<|eot_id|>"],
      repetition_penalty: 1.1
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
 * Parse OCR text to JSON using Gemini 2.5 Flash-Lite (Step 2 of 2-step chain)
 * Takes raw text from IBM Watsonx and formats into structured JSON
 */
async function parseTextToJSON(rawText) {
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

  const systemPrompt = `Parse this receipt text into a valid JSON object with keys: "date", "merchant", "amount", "items" (array), "description". 
Use today's date if not found. Extract total amount. Create reasonable item names and prices if unclear.

Raw text from OCR:
${rawText}

Return ONLY valid JSON. No markdown. No explanation.`;

  try {
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const responseText = response.response.text();
    console.log("Gemini JSON Result:", responseText);

    // Parse the JSON response
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(responseText);
    } catch (e) {
      // If direct parse fails, try to extract JSON from the text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }
      parsedJSON = JSON.parse(jsonMatch[0]);
    }

    // Validate and normalize transaction structure
    return {
      id: Date.now().toString(), // Generate unique ID
      date: parsedJSON.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(parsedJSON.amount) || 0,
      description: parsedJSON.description || parsedJSON.merchant || 'Receipt',
      category: parsedJSON.category || 'expense',
      merchant: parsedJSON.merchant || 'Unknown',
      items: parsedJSON.items || []
    };
  } catch (error) {
    // Log specific error for debugging
    console.error('Gemini JSON parsing error:', {
      error: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack
    });

    // Re-throw with clear message
    throw new Error(`Gemini JSON parsing failed: ${error.message}`);
  }
}

/**
 * Parse and validate watsonx API response (legacy for text tasks)
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

function parseVisionResponse(text) {
  console.log("RAW_VISION_RESPONSE:", text);
  try {
    // 1. Remove Markdown code blocks if present
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "");

    // 2. Find the first '{' and last '}' to isolate the JSON object
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1) {
      cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    // 3. Parse
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parse Failed:", error);
    throw new Error(`Failed to parse JSON from vision response. Raw text: ${text.substring(0, 100)}...`);
  }
}
