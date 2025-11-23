# ✅ Agent Import Checklist

## Status: ⏳ PENDING - Awaiting Manual Web UI Import

---

## 📋 Step-by-Step Import Process

### Step 1: Access watsonx Orchestrate
- [ ] Open browser
- [ ] Go to: https://api.us-south.watson-orchestrate.cloud.ibm.com
- [ ] Log in with IBM Cloud credentials

### Step 2: Navigate to Agent Builder
- [ ] Click "Build" menu
- [ ] Select "Agent Builder" or "Build agents and tools"
- [ ] Look for "Create Agent" or "Import Agent" button

### Step 3: Import Agent YAML
- [ ] Click "Import Agent"
- [ ] Choose upload method:
  - **Option A:** Upload file `adk-project/agents/numeri-financial-agent.yaml`
  - **Option B:** Paste YAML content from file
- [ ] Click "Import"

### Step 4: Verify Success
- [ ] Look for notification: **"Agent 'Numeri_Financial_Agent' imported successfully"**
- [ ] Agent should appear in the agents list
- [ ] Status should show as "Active"

### Step 5: Get Agent ID
- [ ] Click on the imported agent
- [ ] Look for "Agent ID" in details panel
- [ ] Copy the ID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- [ ] Save it for API integration

### Step 6: Test Agent
- [ ] Click "Test" or "Chat" button
- [ ] Send test prompt:
  ```
  Hello! I'm testing the Numeri Financial Agent.
  Can you help me with a transaction entry?
  ```
- [ ] Verify agent responds correctly

---

## 📊 Expected Success Indicators

When import is successful, you should see:

✅ **Notification Message:**
```
[INFO] - Agent 'Numeri_Financial_Agent' imported successfully
```

✅ **Agent appears in list:**
- Name: `Numeri_Financial_Agent`
- Status: `Active`
- Type: `Native`

✅ **Agent details show:**
- LLM: `watsonx/meta-llama/llama-3-2-90b-vision-instruct`
- Description: "A financial analysis and accounting agent for Numeri application"

✅ **Agent ID visible:**
- Format: `1a344f72-a086-49b5-b763-107f6a98e2b3` (example)

---

## 🎯 After Successful Import

Once you see the success notification:

1. **Record Agent ID**
   - Copy from watsonx Orchestrate
   - Update: `ORCHESTRATE_AGENT_ID` in environment variables

2. **Update API Integration**
   - Modify `api/agent.js` to use new agent
   - Test with Numeri app

3. **Deploy to Production**
   - Deploy to Vercel
   - Test end-to-end

---

## 🔍 Troubleshooting

### Issue: "YAML format error"
- **Solution:** Verify YAML indentation is correct
- **File:** `adk-project/agents/numeri-financial-agent.yaml`

### Issue: "Agent name already exists"
- **Solution:** Use unique name or delete existing agent first

### Issue: "Import button not visible"
- **Solution:** Check permissions, may need admin access

### Issue: "Agent imported but not showing"
- **Solution:** Refresh page, check filters

---

## 📝 Agent Specification

**File:** `adk-project/agents/numeri-financial-agent.yaml`

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

## ⏱️ Timeline

- **2025-11-23 18:00** - ADK installed and configured
- **2025-11-23 18:15** - Agent YAML created
- **2025-11-23 18:30** - Import tools and guides created
- **2025-11-23 20:36** - ⏳ Awaiting manual Web UI import
- **[PENDING]** - Agent successfully imported to IBM Cloud
- **[PENDING]** - Agent tested and verified
- **[PENDING]** - API integration updated
- **[PENDING]** - Deployed to Vercel

---

**Status:** ⏳ WAITING FOR MANUAL IMPORT
**Last Updated:** 2025-11-23 20:36 UTC+07:00
**Action Required:** Complete Web UI import process
