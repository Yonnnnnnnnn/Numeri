# Numeri - Data Architect Web Application

**IBM Agentic AI Hackathon • Final Release v4.0**

A stateless, browser-based data processing application that transforms raw data (JSON files and receipt images) into structured transaction records using AI-powered analysis.

## 🎯 Overview

Numeri is a proof-of-concept (PoC) web application designed for the IBM Agentic AI Hackathon. It demonstrates a complete **Upload → Process → Download** workflow without any server-side storage, ensuring user privacy and simplicity.

### Key Features

- **📤 File Upload**: Load existing transaction data from JSON files
- **📸 Image Processing**: Convert receipt images to structured data (mock AI)
- **💬 Chat Interface**: Send natural language prompts to modify data
- **📊 Data Grid**: View and manage transaction records in real-time
- **⬇️ Download**: Export updated data as JSON files
- **🎨 Modern UI**: Dark theme with responsive design using Tailwind CSS
- **⚡ Stateless**: All processing happens in-memory; no database or local storage

## 🏗️ Architecture

```
User Device (Browser)
    ↓
React App (Vite + Tailwind CSS)
    ↓
Mock API (Simulates IBM watsonx)
    ↓
In-Memory State Management
    ↓
JSON Download
```

### Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks (useState, useRef)
- **File Handling**: HTML5 File API

## 📋 Data Schema

### Transaction Object

```json
{
  "id": "uuid-string",
  "date": "YYYY-MM-DD",
  "description": "string",
  "amount": number,
  "category": "string",
  "type": "income|expense"
}
```

### Example Input File (sample_data.json)

```json
[
  {
    "id": "a1b2-c3d4-e5f6-g7h8",
    "date": "2023-11-22",
    "description": "IBM Cloud Credits",
    "amount": 1500000,
    "category": "Software",
    "type": "expense"
  }
]
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd d:\Numeri
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

## 🌐 Vercel Deployment

### Environment Variables Required

Set these in your Vercel project settings:

```bash
# IBM watsonx Orchestrate Configuration
ORCHESTRATE_BASE_URL=https://api.us-south.watson-orchestrate.cloud.ibm.com
ORCHESTRATE_API_KEY=mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO
ORCHESTRATE_AGENT_NAME=ce4cbf44-4736-4648-b6cf-5ed2c31791eb
ORCHESTRATE_INVOKE_PATH=/orchestrate/api/v1/invoke/agents/

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### Deploy to Vercel

1. **Push to GitHub** (already done):
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables above
   - Deploy

3. **Test the deployment**:
   - Visit your Vercel URL
   - Test agent integration with prompts

### Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory, ready for deployment to Vercel or any static hosting.

## 📖 Usage Guide

### 1. Upload JSON Data

- Click **"Upload JSON"** button
- Select a `.json` file containing transaction records
- The data will load into the grid immediately

### 2. Upload Receipt Image

- Click **"Upload Image"** button
- Select a receipt/invoice image (JPG, PNG, etc.)
- The image is converted to Base64 (no server upload)

### 3. Enter Chat Prompt (Optional)

- Type a command in the text area:
  - `"add 100"` - Modify the last transaction amount
  - `"change description to Lunch"` - Update the description
  - Any other natural language instruction

### 4. Process with AI

- Click **"Process with AI"** button
- The mock API simulates a 1.5-second delay (network latency)
- Results appear in the data grid
- An explanation message shows what was changed

### 5. Download Updated File

- Click **"Download JSON"** button
- A file named `transactions_updated.json` is saved to your computer
- The file can be re-uploaded for further processing

## 🔧 Mock API Implementation

The `mockProcessAI()` function simulates the IBM watsonx Orchestrate API:

### Vision Task (Image Upload)

```javascript
// Input: Base64 image + existing data
// Output: New transaction added to array
{
  "id": "generated-uuid",
  "date": "2025-11-22",
  "description": "Receipt from Image",
  "amount": 45000,
  "category": "Expense",
  "type": "expense"
}
```

### Text Task (Chat Prompt)

```javascript
// Input: Text prompt + existing data
// Output: Last transaction modified
// Example: "add 100" → updates amount to 100
```

### Response Format

```json
{
  "filename": "transactions_updated.json",
  "content": [ /* updated array */ ],
  "explanation": "Added 1 receipt from image. Total items: 4"
}
```

## 🎨 UI Components

### Control Panel
- **Upload JSON**: File input for transaction data
- **Upload Image**: File input for receipt images
- **Chat Prompt**: Text area for natural language commands
- **Process with AI**: Trigger the mock API
- **Download JSON**: Export current state

### Data Grid
- Responsive table showing all transactions
- Columns: ID, Date, Description, Amount, Category, Type
- Summary statistics (total count, total amount, last updated)
- Hover effects for better UX

### Status Messages
- **Success**: Green banner with checkmark
- **Error**: Red banner with alert icon
- **Loading**: Blue banner with spinner
- **AI Response**: Explanation of changes made

## 🔐 Security & Privacy

- ✅ **Zero-State Architecture**: No data stored on server
- ✅ **Client-Side Processing**: All operations happen in the browser
- ✅ **No API Keys**: Mock API requires no authentication
- ✅ **No Local Disk Access**: Uses HTML5 File API only
- ✅ **Session-Based**: Data cleared on page refresh (unless downloaded)

## 📊 Acceptance Criteria (MVP)

- ✅ File Upload: Load transactions.json and display in table
- ✅ Vision-to-Data: Upload image → Add new transaction row
- ✅ Chat Modification: Text prompt → Modify existing data
- ✅ Download Integrity: Downloaded JSON is valid and re-uploadable
- ✅ No Local Artifacts: No permission prompts or file system access

## 🧪 Testing

### Test Scenario 1: Upload and Download
1. Click "Upload JSON"
2. Select `sample_data.json`
3. Verify 3 transactions appear in the grid
4. Click "Download JSON"
5. Verify the file is valid JSON

### Test Scenario 2: Image Processing
1. Click "Upload Image"
2. Select any image file
3. Click "Process with AI"
4. Verify a new transaction is added
5. Check the AI response message

### Test Scenario 3: Chat Modification
1. Upload `sample_data.json`
2. Enter prompt: `"add 500"`
3. Click "Process with AI"
4. Verify the last transaction amount changed to 500

### Test Scenario 4: Responsive Design
1. Open app on desktop, tablet, and mobile
2. Verify all buttons and tables are accessible
3. Check that grid scrolls horizontally on small screens

## 📦 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

### Environment Variables

No environment variables required for the mock version. When integrating with real IBM watsonx:

```
VITE_IBM_API_KEY=your-api-key
VITE_IBM_PROJECT_ID=your-project-id
VITE_VERCEL_PROXY_URL=https://your-vercel-function.vercel.app/api/agent
```

## 🔄 Integration with Real IBM watsonx

To replace the mock API with real IBM watsonx:

1. Create a Vercel Serverless Function at `/api/agent`
2. Implement IAM token management
3. Call IBM watsonx `/v2/text/generate` endpoint
4. Replace `mockProcessAI()` with actual API call:

```javascript
const response = await fetch(process.env.VITE_VERCEL_PROXY_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_id: imageBase64 ? 'meta-llama/llama-3.2-90b-instruct-vision-001' : 'ibm/granite-3.0-8b-instruct',
    input: imageBase64 ? `data:image/jpeg;base64,${imageBase64}\n\n...` : `Current JSON Dataset:\n\n...`,
    parameters: { /* ... */ }
  })
});
```

## 📝 File Structure

```
d:\Numeri\
├── index.html              # HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main application component
│   └── index.css           # Global styles
├── sample_data.json        # Example transaction data
├── numeri-app.jsx          # Standalone single-file version
└── README.md               # This file
```

## 🐛 Known Limitations

- Mock API returns random amounts (10,000 - 510,000 IDR)
- Image processing is simulated; actual vision analysis requires IBM watsonx
- No data persistence; refresh clears state
- No user authentication or multi-user support
- File size limited by browser memory (typically < 100MB)

## 🚀 Future Enhancements

- Real IBM watsonx integration
- Database persistence (Firebase/PostgreSQL)
- User authentication (Auth0/Cognito)
- Batch processing for multiple files
- Custom field support
- Export to CSV/Excel
- Dark/Light theme toggle
- Keyboard shortcuts
- Undo/Redo functionality

## 📄 License

This project is part of the IBM Agentic AI Hackathon. All rights reserved.

## 👥 Support

For issues or questions, please refer to the PRD document or contact the development team.

---

**Built with ❤️ for the IBM Agentic AI Hackathon**
