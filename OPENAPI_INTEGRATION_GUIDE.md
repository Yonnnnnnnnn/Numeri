# Numeri OpenAPI Specification - Integration Guide

## Overview
File `numeri-openapi.json` adalah OpenAPI 3.0 specification untuk IBM watsonx Agent integration dengan Numeri AI Spreadsheet application.

## Purpose
Spec ini mendefinisikan API contract antara:
- **IBM watsonx Agent** (AI processor)
- **Numeri Vercel Backend** (serverless proxy)
- **Numeri React Frontend** (user interface)

## Main Endpoint: POST /api/agent

### Functionality
Endpoint ini memproses spreadsheet data dengan dua mode:
1. **Text Mode**: Natural language commands untuk manipulasi data
2. **Vision Mode**: Extract data dari gambar receipt/invoice

### Request Schema

```json
{
  "currentData": [
    {
      "col_0": "2023-11-22",
      "col_1": "IBM Cloud Credits",
      "col_2": 1500000,
      "col_3": "Software",
      "col_4": "expense"
    }
  ],
  "prompt": "Add a new expense for office supplies with amount 250000",
  "imageBase64": "data:image/jpeg;base64,...",  // Optional
  "isVisionTask": false,
  "columnNames": ["Date", "Description", "Amount", "Category", "Type"]  // Optional
}
```

### Response Schema

```json
{
  "filename": "transactions_updated.json",
  "content": [
    {
      "col_0": "2023-11-22",
      "col_1": "IBM Cloud Credits",
      "col_2": 1500000,
      "col_3": "Software",
      "col_4": "expense"
    },
    {
      "col_0": "2023-11-24",
      "col_1": "Office Supplies",
      "col_2": 250000,
      "col_3": "Office",
      "col_4": "expense"
    }
  ],
  "explanation": "Added 1 new expense row for office supplies",
  "rowsAdded": 1,
  "rowsModified": 0
}
```

## Data Structure

### Spreadsheet Row Format
Setiap row adalah object dengan keys:
- `col_0`, `col_1`, `col_2`, ... (column indices)
- Values bisa: `string`, `number`, atau `boolean`

### Column Naming
- Frontend menampilkan: **A, B, C, D, ...** (Excel-style)
- Backend menyimpan: **col_0, col_1, col_2, ...** (zero-indexed)
- Optional `columnNames` array untuk semantic context

## Use Cases

### 1. Text Command - Add Row
**Request:**
```json
{
  "currentData": [...],
  "prompt": "Add new transaction: Coffee Shop, 45000, Food, expense",
  "isVisionTask": false
}
```

**Expected AI Behavior:**
- Parse natural language command
- Extract: description="Coffee Shop", amount=45000, category="Food", type="expense"
- Generate new row with appropriate col_* keys
- Return FULL updated array (not diff)

### 2. Text Command - Modify Row
**Request:**
```json
{
  "currentData": [...],
  "prompt": "Change amount in row 3 to 150000",
  "isVisionTask": false
}
```

**Expected AI Behavior:**
- Identify row 3 (zero-indexed: index 2)
- Update col_2 (amount column) to 150000
- Return FULL updated array

### 3. Vision Task - Receipt Processing
**Request:**
```json
{
  "currentData": [...],
  "prompt": "Process this receipt and add to spreadsheet",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "isVisionTask": true,
  "columnNames": ["Date", "Description", "Amount", "Category", "Type"]
}
```

**Expected AI Behavior:**
- Use Llama 3.2 Vision to extract:
  - Date from receipt
  - Merchant name (description)
  - Total amount
- Infer category based on merchant
- Set type to "expense"
- Add new row to array
- Return FULL updated array

## Important Rules for AI Agent

### 1. Always Return FULL Array
❌ **WRONG** (returning diff):
```json
{
  "content": {
    "added": [{ "col_0": "new row" }]
  }
}
```

✅ **CORRECT** (returning full array):
```json
{
  "content": [
    { "col_0": "existing row 1" },
    { "col_0": "existing row 2" },
    { "col_0": "new row" }
  ]
}
```

### 2. Preserve Column Structure
- Jika input punya col_0 sampai col_4, output juga harus punya col_0 sampai col_4
- Jangan ubah column keys kecuali diminta explicit

### 3. Handle Missing Data
- Jika vision task tidak bisa extract field tertentu, gunakan placeholder:
  - Date: current date
  - Category: "Uncategorized"
  - Amount: 0

### 4. Explanation Field
- Harus human-readable dalam Bahasa Indonesia
- Format: "Ditambahkan X baris baru" atau "Diubah nilai di baris Y"

## Error Handling

### 400 Bad Request
- Invalid JSON in currentData
- Missing required fields

### 413 Payload Too Large
- Image > 4MB after Base64 encoding
- Total request > 4.5MB

### 500 Internal Server Error
- watsonx API failure
- IAM token generation failed

### 504 Gateway Timeout
- Processing took > 30 seconds (Vercel limit)

## Testing the API

### Using cURL (Text Command)
```bash
curl -X POST https://numeri.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "currentData": [{"col_0": "test"}],
    "prompt": "Add new row with value hello",
    "isVisionTask": false
  }'
```

### Using cURL (Vision Task)
```bash
# First, encode image to base64
base64 receipt.jpg > receipt.b64

curl -X POST https://numeri.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "currentData": [],
    "prompt": "Extract data from this receipt",
    "imageBase64": "data:image/jpeg;base64,'$(cat receipt.b64)'",
    "isVisionTask": true
  }'
```

## Integration with IBM watsonx

### Step 1: Import OpenAPI Spec
1. Login ke IBM watsonx Orchestrate
2. Go to **Agent Builder**
3. Click **Import OpenAPI Specification**
4. Upload `numeri-openapi.json`

### Step 2: Configure Tool
- **Tool Name**: `processSpreadsheetData`
- **Description**: "Process spreadsheet data with AI - supports text commands and vision tasks"
- **Authentication**: Bearer token (auto-managed by Vercel proxy)

### Step 3: Create Agent Instructions
```
You are Numeri AI Architect, an expert at processing spreadsheet data.

CAPABILITIES:
1. Add new rows based on natural language commands
2. Modify existing rows (update values, delete rows)
3. Extract data from receipt/invoice images using vision

DATA FORMAT:
- Input: Array of objects with col_0, col_1, col_2, etc.
- Output: FULL updated array (not diff/patch)

RULES:
1. ALWAYS return the complete array, not just changes
2. Preserve column structure (col_0, col_1, etc.)
3. Provide clear explanation in Bahasa Indonesia
4. For vision tasks, extract: date, description, amount, category

EXAMPLE:
User: "Add new expense: Coffee 45000"
You call: processSpreadsheetData with prompt="Add new expense: Coffee 45000"
Response: Full array with new row added
```

### Step 4: Test Agent
Test dengan sample prompts:
- "Tambahkan transaksi baru: Makan siang 75000"
- "Ubah amount di baris 2 jadi 100000"
- [Paste receipt image]

## Architecture Diagram

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │ 1. User action (chat/paste image)
       ▼
┌─────────────────────┐
│  Numeri Frontend    │
│  (React + Vite)     │
└──────┬──────────────┘
       │ 2. POST /api/agent
       │    {currentData, prompt, imageBase64}
       ▼
┌─────────────────────┐
│ Vercel Serverless   │
│  (/api/agent.js)    │
│  - Generate IAM     │
│  - Call watsonx     │
└──────┬──────────────┘
       │ 3. POST to watsonx
       │    with IAM token
       ▼
┌─────────────────────┐
│  IBM watsonx Agent  │
│  - Granite 3.0 (text)│
│  - Llama 3.2 (vision)│
└──────┬──────────────┘
       │ 4. Return processed data
       ▼
┌─────────────────────┐
│  Numeri Frontend    │
│  Update spreadsheet │
└─────────────────────┘
```

## Environment Variables

Vercel deployment requires:
```
IBM_CLOUD_API_KEY=ApiKey-7e441bd4-95fd-420c-85ba-887cb8c576bc
IBM_PROJECT_ID=<your_project_id>
IBM_REGION=us-south
IBM_WATSONX_HOST=ml.cloud.ibm.com
```

## Support

For issues or questions:
- GitHub: https://github.com/Yonnnnnnnnn/Numeri
- PRD: See `PRD_Numeri_v5_Interactive_Spreadsheet.txt`

---

**Version**: 1.0.0
**Last Updated**: 2025-11-22
**Status**: Ready for IBM watsonx Integration
