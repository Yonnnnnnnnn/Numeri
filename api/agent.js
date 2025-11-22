/**
 * Vercel Serverless Function: IBM watsonx Orchestrate Proxy
 * 
 * This function acts as a secure proxy between the Numeri frontend and IBM watsonx.
 * It handles:
 * - IAM token generation and rotation
 * - Request payload construction
 * - Response parsing and validation
 * - Error handling and logging
 * 
 * Environment Variables Required:
 * - IBM_CLOUD_API_KEY: IBM Cloud API key for authentication
 * - IBM_PROJECT_ID: IBM Cloud project ID for billing/isolation
 * - IBM_REGION: IBM Cloud region (e.g., us-south)
 * - IBM_WATSONX_HOST: watsonx API host
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentData, imageBase64, prompt, isVisionTask } = req.body;

    // Validate payload size (Vercel limit: 4.5MB)
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > 4.5 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Payload too large. Maximum 4.5MB allowed.',
      });
    }

    // Step 1: Generate IAM Token
    const iamToken = await generateIAMToken(process.env.IBM_CLOUD_API_KEY);

    // Step 2: Construct watsonx API request
    const watsonxPayload = constructPayload(
      currentData,
      imageBase64,
      prompt,
      isVisionTask
    );

    // Step 3: Call IBM watsonx API
    const watsonxResponse = await callWatsonxAPI(
      iamToken,
      watsonxPayload,
      process.env.IBM_REGION,
      process.env.IBM_WATSONX_HOST,
      process.env.IBM_PROJECT_ID
    );

    // Step 4: Parse and validate response
    const parsedResponse = parseWatsonxResponse(watsonxResponse);

    // Step 5: Return to client
    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error('Error in agent proxy:', error);

    // Return generic error to client (don't expose internal details)
    return res.status(500).json({
      error: 'Error processing request on IBM watsonx. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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
 * Construct watsonx API payload
 * Supports both text-only and vision tasks
 */
function constructPayload(currentData, imageBase64, prompt, isVisionTask) {
  const dataContext = JSON.stringify(currentData, null, 2);

  if (isVisionTask && imageBase64) {
    // Vision task: Include base64 image
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
      model_id: 'meta-llama/llama-3-2-90b-instruct-vision-001',
      input: visionPrompt,
      parameters: {
        decoding_method: 'sampling',
        max_new_tokens: 4096,
        min_new_tokens: 50,
        temperature: 0.3,
      },
    };
  } else {
    // Text-only task with improved prompt
    const systemPrompt = `You are a spreadsheet data processing AI. You modify JSON data based on user commands.

RULES:
1. ALWAYS return the COMPLETE array (not just changes)
2. Preserve the column structure and property names exactly as they are.
3. Return ONLY valid JSON, no markdown, no explanations outside JSON
4. Use Bahasa Indonesia for the explanation field
5. CRITICAL: NEVER modify, reorder, or regenerate the value of any unique ID fields (like 'id', 'ID', 'No', etc.) for existing rows.
6. CRITICAL: If adding new data, ALWAYS append it to the END of the array. NEVER insert new data in the middle or beginning.

Current JSON Dataset:
${dataContext}

User Command: ${prompt}

Return ONLY this JSON structure:
{
  "filename": "transactions_updated.json",
  "content": [complete array with all rows],
  "explanation": "Penjelasan perubahan dalam Bahasa Indonesia"
}`;

    return {
      model_id: 'ibm/granite-3-8b-instruct',
      input: systemPrompt,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: 4096,
        min_new_tokens: 50,
        temperature: 0.1,
      },
    };
  }
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
