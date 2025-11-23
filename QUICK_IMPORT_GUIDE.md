# 🚀 Quick Agent Import - Web UI Method (Recommended)

Since the CLI is having authentication issues, use the **Web UI** method which is more reliable.

## Step 1: Log in to watsonx Orchestrate

1. Open browser and go to: https://api.us-south.watson-orchestrate.cloud.ibm.com
2. Click "Sign in"
3. Select **IBM Cloud** (or your auth provider)
4. Enter your IBM Cloud credentials:
   - Email: yonfullbert@gmail.com
   - Password: (your IBM Cloud password)

## Step 2: Navigate to Agent Builder

1. Once logged in, look for the **Build** menu
2. Click **Agent Builder** or **Build agents and tools**
3. You should see a button like "Create Agent" or "Import Agent"

## Step 3: Import Agent from YAML

### Option A: Direct YAML Upload
1. Click **"Import Agent"** or **"Create from YAML"**
2. Click **"Upload YAML file"**
3. Select: `d:\Numeri\adk-project\agents\numeri-financial-agent.yaml`
4. Click **Import**

### Option B: Copy-Paste YAML
1. Click **"Import Agent"** or **"Create from YAML"**
2. Click **"Paste YAML"**
3. Open `adk-project\agents\numeri-financial-agent.yaml` in text editor
4. Copy all contents
5. Paste into the web form
6. Click **Import**

## Step 4: Verify Agent

After import, you should see:
- Agent Name: **Numeri_Financial_Agent**
- Status: **Active**
- LLM: **watsonx/meta-llama/llama-3-2-90b-vision-instruct**

## Step 5: Test Agent

1. Click on the agent to open it
2. Click **"Test"** or **"Chat"**
3. Try a test prompt:
   ```
   Hello, I have a transaction to record:
   Date: 2025-11-23
   Amount: Rp 500,000
   Description: Office supplies
   Category: Expense
   
   Please help me create a journal entry.
   ```

4. Verify the agent responds correctly

## Step 6: Get Agent ID

Once the agent is imported:
1. Click on the agent
2. Look for **Agent ID** in the details panel
3. Copy it (format: `1a344f72-a086-49b5-b763-107f6a98e2b3`)
4. Save for later use in the API

---

## Troubleshooting

### Issue: "Cannot access watsonx Orchestrate"
- **Solution:** Check internet connection, verify URL is correct

### Issue: "Authentication failed"
- **Solution:** Use your IBM Cloud credentials, not API key

### Issue: "YAML format error"
- **Solution:** Verify the YAML file is valid, check indentation

### Issue: "Agent not appearing after import"
- **Solution:** Refresh the page, check if import completed successfully

---

## Agent YAML Content

Your agent specification:
```yaml
spec_version: v1
kind: native
name: Numeri_Financial_Agent
description: A financial analysis and accounting agent for Numeri application
instructions: |
  You are Numeri, an Expert AI Accountant and Financial Analyst.
  
  Your responsibilities:
  1. Analyze financial transactions and provide insights
  2. Help with double-entry bookkeeping and journal entries
  3. Answer questions about financial data
  4. Process receipts and invoices
  
  Always:
  - Be precise with numbers and calculations
  - Follow double-entry accounting principles
  - Provide clear explanations in Indonesian or English
  - Ask clarifying questions when needed
  - Suggest improvements to financial processes

llm: watsonx/meta-llama/llama-3-2-90b-vision-instruct
style: default
```

---

## Next Steps After Import

1. ✅ Agent imported via Web UI
2. ✅ Agent tested in Agent Builder
3. ⏳ Get Agent ID
4. ⏳ Update `api/agent.js` to use new agent
5. ⏳ Deploy to Vercel
6. ⏳ Test with Numeri app

---

**Status:** Ready for Web UI import
**Last Updated:** 2025-11-23 18:33 UTC+07:00
