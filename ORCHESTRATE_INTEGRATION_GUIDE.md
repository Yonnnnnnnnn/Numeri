# 🔧 IBM watsonx Orchestrate Integration Guide

## 📋 Overview

Modifikasi `api/agent.js` sekarang mendukung **3-way routing architecture**:

1. **Vision Tasks** → Gemini 2.5 Flash-Lite (Multimodal)
2. **Cross-File Tasks** → IBM watsonx Orchestrate (NumeriCrossFileAgent)
3. **Single Logic Tasks** → Gemini 2.5 Flash-Lite

## 🚀 Setup Environment Variables

### Vercel Dashboard Configuration
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **Numeri**
3. Go to **Settings** → **Environment Variables**
4. Tambahkan variabel berikut:

```bash
# IBM watsonx Orchestrate Configuration
ORCHESTRATE_BASE_URL=https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c
ORCHESTRATE_API_KEY=ESRzgf0DpLSDvVioScg9eXgre-BkceDuddjfDiA0Nt48
ORCHESTRATE_AGENT_NAME=NumeriCrossFileAgent

# Gemini Configuration (Existing)
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🔄 Routing Logic

### Vision Tasks (Image Processing)
**Trigger**: `imageBase64` present in request
```javascript
if (imageBase64) {
  result = await handleVisionTask(currentData, imageBase64, processedPrompt);
}
```

### Cross-File Tasks (Multiple Datasets)
**Trigger**: 2+ data keys in request body
```javascript
const dataKeys = Object.keys(req.body).filter(key => 
    key.toLowerCase().includes('data') && !key.toLowerCase().includes('base64')
);

if (dataKeys.length >= 2) {
  // Route to IBM watsonx Orchestrate
  const orchestrateResponse = await fetch(ORCHESTRATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ORCHESTRATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body)
  });
}
```

### Single Logic Tasks (Text Processing)
**Trigger**: Single data key + prompt
```javascript
result = await handleLogicTask(currentData, processedPrompt);
```

## 📡 API Endpoints

### Vercel Proxy (Current Implementation)
```
POST https://numeri-dusky.vercel.app/api/agent
```

### IBM watsonx Orchestrate (New Integration)
```
POST https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c/agent/v1/invoke/NumeriCrossFileAgent
Authorization: Bearer ESRzgf0DpLSDvVioScg9eXgre-BkceDuddjfDiA0Nt48
```

## 🎯 Request Examples

### Vision Task Request
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "currentData": [...],
  "prompt": "Extract receipt data"
}
```

### Cross-File Task Request
```json
{
  "currentData": [...],
  "budgetData": [...],
  "prompt": "Compare transactions with budget"
}
```

### Single Logic Task Request
```json
{
  "currentData": [...],
  "prompt": "Change category to 'Office'"
}
```

## 🛠️ Error Handling

### IBM watsonx Orchestrate Errors
```javascript
if (!orchestrateResponse.ok) {
  const errorText = await orchestrateResponse.text();
  console.error('Orchestrate API Error:', orchestrateResponse.status, errorText);
  throw new Error(`Orchestrate API failed with status ${orchestrateResponse.status}. Detail: ${errorText.substring(0, 100)}...`);
}
```

### Common Error Scenarios
- **401 Unauthorized**: Check ORCHESTRATE_API_KEY
- **404 Not Found**: Verify ORCHESTRATE_BASE_URL and ORCHESTRATE_AGENT_NAME
- **500 Server Error**: Check IBM watsonx Orchestrate service status

## 🧪 Testing

### 1. Test Vision Task
```bash
curl -X POST https://numeri-dusky.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"base64_data","currentData":[],"prompt":"Extract receipt"}'
```

### 2. Test Cross-File Task
```bash
curl -X POST https://numeri-dusky.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"currentData":[],"budgetData":[],"prompt":"Compare with budget"}'
```

### 3. Test Single Logic Task
```bash
curl -X POST https://numeri-dusky.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"currentData":[],"prompt":"Change category"}'
```

## 📊 Monitoring

### Console Logs
- Vision Task: `"Routing to Gemini 2.5 Flash-Lite for vision task..."`
- Cross-File Task: `"Routing request to Orchestrate Agent: [URL]"`
- Single Logic Task: `"Routing to Gemini 2.5 Flash-Lite for single logic task..."`

### Error Logs
- Orchestrate API errors dengan status code dan detail
- Gemini API errors dengan model dan prompt context

## 🚀 Deployment

1. **Commit Changes**:
```bash
git add api/agent.js
git commit -m "feat: Add IBM watsonx Orchestrate 3-way routing"
git push origin main
```

2. **Verify Environment Variables** di Vercel Dashboard

3. **Test All Three Routes** dengan examples di atas

## 🎯 Success Criteria

- ✅ Vision tasks route to Gemini
- ✅ Cross-file tasks route to IBM watsonx Orchestrate
- ✅ Single logic tasks route to Gemini
- ✅ Proper error handling for all routes
- ✅ Environment variables correctly configured
- ✅ Console logging for debugging

**Integration ready for production!** 🚀
