# 🚀 ADK Setup Guide for Numeri Financial Agent

## ✅ Completed Steps

### 1. ADK Installation
- ✅ Installed `ibm-watsonx-orchestrate` v1.15.0 in virtual environment
- ✅ Virtual environment: `adk-env`
- ✅ Command: `adk-env\Scripts\activate`

### 2. Project Structure Created
```
adk-project/
├── agents/
│   └── numeri-financial-agent.yaml  ✅ Created
├── tools/
├── knowledge/
└── flows/
```

### 3. Agent Specification Created
- ✅ File: `adk-project/agents/numeri-financial-agent.yaml`
- ✅ Agent Name: `Numeri_Financial_Agent`
- ✅ LLM: `watsonx/meta-llama/llama-3-2-90b-vision-instruct`
- ✅ Type: Native Agent

### 4. IBM Cloud Environment Configured
- ✅ Environment Name: `ibm-cloud`
- ✅ URL: `https://api.us-south.watson-orchestrate.cloud.ibm.com`
- ✅ Auth Type: `ibm_iam`
- ✅ API Key: Configured in `~/.config/orchestrate/config.yaml`

---

## 📋 Next Steps - Manual Authentication Required

The ADK requires interactive authentication with IBM Cloud. Follow these steps:

### Step 1: Activate Virtual Environment
```powershell
adk-env\Scripts\activate
```

### Step 2: Authenticate with IBM Cloud
```powershell
orchestrate env activate ibm-cloud
```

When prompted, enter your **IBM Cloud API Key**:
```
mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO
```

### Step 3: Import the Agent
Navigate to the agents folder and import:
```powershell
cd adk-project\agents
orchestrate agents import -f numeri-financial-agent.yaml
```

**Expected Output:**
```
[INFO] - Agent 'Numeri_Financial_Agent' imported successfully
```

### Step 4: Verify Agent in watsonx Orchestrate
1. Log in to: https://api.us-south.watson-orchestrate.cloud.ibm.com
2. Go to **Agent Builder**
3. Look for **Numeri_Financial_Agent** in the agents list
4. Click to open and test the agent

---

## 🧪 Testing the Agent

Once imported, you can test it in the Agent Builder:

### Test Prompt 1: Financial Analysis
```
Analyze this transaction data and provide insights:
- Date: 2025-11-23
- Amount: Rp 500,000
- Description: Office supplies purchase
- Category: Expense
```

### Test Prompt 2: Double-Entry Accounting
```
Create a journal entry for:
Debit: Office Supplies Expense - Rp 500,000
Credit: Cash - Rp 500,000
```

### Test Prompt 3: Receipt Processing
```
I have a receipt for a restaurant meal:
- Date: 2025-11-23
- Merchant: Warung Makan Jaya
- Total: Rp 125,000
- Items: Nasi Goreng (Rp 50k), Teh Manis (Rp 5k), Dessert (Rp 70k)

Please create a transaction entry for this.
```

---

## 🔧 Troubleshooting

### Issue: "No credentials found"
**Solution:** Run `orchestrate env activate ibm-cloud` and enter your API key when prompted.

### Issue: "Agent import failed"
**Solution:** 
1. Verify you're in the correct directory: `adk-project/agents`
2. Check file exists: `numeri-financial-agent.yaml`
3. Verify credentials: `orchestrate env list` (should show `ibm-cloud` as active)

### Issue: "Connection refused to localhost:4321"
**Solution:** This means the local developer edition isn't running. Use IBM Cloud environment instead.

---

## 📁 Project Files

- **Agent YAML:** `adk-project/agents/numeri-financial-agent.yaml`
- **Setup Script:** `adk-project/setup-and-import.ps1`
- **Config File:** `~/.config/orchestrate/config.yaml`

---

## 🎯 Next Phase: Integration with Numeri App

Once the agent is successfully imported and tested:

1. **Get Agent ID** from watsonx Orchestrate
2. **Update `api/agent.js`** to use ADK agent instead of `/invoke` endpoint
3. **Test with Numeri App** using the new agent

---

## 📚 References

- ADK Documentation: https://cloud.ibm.com/docs/watsonx-orchestrate?topic=watsonx-orchestrate-adk
- Agent Development Kit: https://github.com/IBM/watsonx-orchestrate-adk
- watsonx Orchestrate: https://cloud.ibm.com/docs/watsonx-orchestrate

---

**Status:** ⏳ Awaiting manual authentication to complete agent import

**Last Updated:** 2025-11-23 18:26 UTC+07:00
