# 🎯 Manual Agent Import Guide

## Problem
The ADK CLI requires interactive authentication, but the terminal doesn't allow pasting the API key.

## Solution
Use a workaround to provide the API key non-interactively.

---

## Method 1: Using Input Redirection (Recommended)

### Step 1: Create a text file with your API key
Create a file named `api_key.txt` in `d:\Numeri`:
```
mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO
```

### Step 2: Run the import command with input redirection
```powershell
# Activate virtual environment
adk-env\Scripts\activate

# Navigate to agents folder
cd adk-project\agents

# Import with input redirection
Get-Content ..\..\api_key.txt | orchestrate agents import -f numeri-financial-agent.yaml
```

---

## Method 2: Using Environment Variable + Config File

### Step 1: Update ADK Config
Edit: `C:\Users\ASUS\.config\orchestrate\config.yaml`

Replace the `ibm-cloud` section with:
```yaml
ibm-cloud:
  auth_type: ibm_iam
  wxo_url: https://api.us-south.watson-orchestrate.cloud.ibm.com
  api_key: mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO
  cached_token: null
```

### Step 2: Run import
```powershell
adk-env\Scripts\activate
cd adk-project\agents
orchestrate agents import -f numeri-financial-agent.yaml
```

---

## Method 3: Using PowerShell Automation

Create a file: `d:\Numeri\import-agent-auto.ps1`

```powershell
# Activate environment
& "adk-env\Scripts\Activate.ps1"

# Set API key
$apiKey = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"

# Navigate to agents
cd adk-project\agents

# Use echo to pipe API key
$apiKey | orchestrate agents import -f numeri-financial-agent.yaml
```

Run it:
```powershell
powershell -ExecutionPolicy Bypass -File import-agent-auto.ps1
```

---

## Method 4: Direct Web UI Import (Alternative)

If CLI import continues to fail:

1. **Log in to watsonx Orchestrate**
   - URL: https://api.us-south.watson-orchestrate.cloud.ibm.com
   - Use your IBM Cloud credentials

2. **Go to Agent Builder**
   - Click "Build" menu
   - Select "Agent Builder"

3. **Create New Agent**
   - Click "Create Agent"
   - Choose "Import from YAML"
   - Copy-paste the contents of `adk-project/agents/numeri-financial-agent.yaml`

4. **Configure Agent**
   - Set name: `Numeri_Financial_Agent`
   - Set LLM: `watsonx/meta-llama/llama-3-2-90b-vision-instruct`
   - Set instructions from the YAML file

5. **Save and Test**
   - Click "Save"
   - Use test chat to verify

---

## Expected Success Output

When import succeeds, you should see:
```
[INFO] - Agent 'Numeri_Financial_Agent' imported successfully
```

---

## Troubleshooting

### Issue: "No credentials found"
- **Solution:** The config file needs the API key. Update `C:\Users\ASUS\.config\orchestrate\config.yaml`

### Issue: "Command not found: orchestrate"
- **Solution:** Make sure virtual environment is activated: `adk-env\Scripts\activate`

### Issue: "Invalid API key"
- **Solution:** Verify the API key is correct: `mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO`

### Issue: "Connection refused"
- **Solution:** Check internet connection and verify watsonx Orchestrate URL is accessible

---

## Files Involved

- **Agent YAML:** `adk-project/agents/numeri-financial-agent.yaml`
- **Config File:** `C:\Users\ASUS\.config\orchestrate\config.yaml`
- **Virtual Env:** `adk-env\Scripts\activate`

---

## Next Steps After Import

1. ✅ Agent imported to watsonx Orchestrate
2. ⏳ Test agent in Agent Builder
3. ⏳ Get agent ID from watsonx Orchestrate
4. ⏳ Update `api/agent.js` to use new agent
5. ⏳ Deploy to Vercel
6. ⏳ Test with Numeri app

---

**Status:** Awaiting manual import completion
**Last Updated:** 2025-11-23 18:30 UTC+07:00
