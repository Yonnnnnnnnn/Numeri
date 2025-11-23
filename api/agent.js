import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Vercel Serverless Function: Hybrid AI System (IBM watsonx Orchestrate + Google Gemini)
 * 
 * This function implements a 3-way routing architecture:
 * - Vision Tasks (Image Processing): Google Gemini 2.5 Flash-Lite (Multimodal)
 * - Cross-File Tasks (Multiple Datasets): IBM watsonx Orchestrate NumeriCrossFileAgent
 * - Single Logic Tasks: Google Gemini 2.5 Flash-Lite
 * 
 * Environment Variables Required:
 * - ORCHESTRATE_BASE_URL: IBM watsonx Orchestrate instance URL
 * - ORCHESTRATE_API_KEY: IBM watsonx Orchestrate API Key (Bearer Token)
 * - ORCHESTRATE_AGENT_NAME: IBM watsonx Orchestrate agent name
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

// AI IDE Prompt: Modifikasi sementara api/agent.js untuk menguji pembacaan ENV vars

/*
Tugas: Ganti seluruh logika handler() (di dalam module.exports.handler = async (req, res) => { ... })
dengan kode sederhana ini untuk memverifikasi apakah Vercel dapat membaca ENV vars.
*/

export default async function handler(req, res) {
    // === Logic Tes Sederhana: Hapus ini setelah debugging ===
    return res.status(200).json({
        status: "Testing ENV Vars",
        orchestrate_base_url: process.env.ORCHESTRATE_BASE_URL,
        orchestrate_api_key_status: ORCHESTRATE_API_KEY ? "Loaded" : "FAILED (null/undefined)",
        orchestrate_agent_name: process.env.ORCHESTRATE_AGENT_NAME,
        orchestrate_invoke_path: ORCHESTRATE_INVOKE_PATH,
        gemini_api_key_status: process.env.GEMINI_API_KEY ? "Loaded" : "FAILED (null/undefined)",
        vercel_proxy_url: process.env.VITE_VERCEL_PROXY_URL,
        all_env_keys: Object.keys(process.env).filter(key => 
            key.includes('ORCHESTRATE') || 
            key.includes('GEMINI') || 
            key.includes('VITE_')
        )
    });
    // =======================================================
    
    // ... (Lanjutkan dengan logika yang ada sebelumnya, yang sekarang diabaikan)
};

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
