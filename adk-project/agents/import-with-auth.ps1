#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import Numeri Financial Agent with proper authentication
#>

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Numeri Financial Agent - Terminal Import" -ForegroundColor Cyan
Write-Host "="*60 + "`n" -ForegroundColor Cyan

# Step 1: Activate virtual environment
Write-Host "[1/4] Activating virtual environment..." -ForegroundColor Yellow
& "..\..\adk-env\Scripts\Activate.ps1" 2>&1 | Out-Null
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Step 2: Set credentials
Write-Host "`n[2/4] Setting up credentials..." -ForegroundColor Yellow
$env:IBM_API_KEY = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"
Write-Host "✅ API Key configured" -ForegroundColor Green

# Step 3: Refresh environment credentials
Write-Host "`n[3/4] Refreshing ADK environment credentials..." -ForegroundColor Yellow
Write-Host "Please wait for authentication..." -ForegroundColor Gray

# Try to activate environment with credentials
try {
    # This will prompt for credentials if needed
    $output = orchestrate env activate ibm-cloud 2>&1
    
    if ($output -like "*ERROR*") {
        Write-Host "⚠️  Authentication prompt may appear - please enter your API key when asked" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Environment activated" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Environment activation note: $_" -ForegroundColor Yellow
}

# Step 4: Import agent
Write-Host "`n[4/4] Importing Numeri Financial Agent..." -ForegroundColor Yellow
Write-Host "Command: orchestrate agents import -f numeri-financial-agent.yaml" -ForegroundColor Gray

try {
    $importOutput = orchestrate agents import -f numeri-financial-agent.yaml 2>&1
    
    Write-Host "`nImport Output:" -ForegroundColor Cyan
    Write-Host $importOutput -ForegroundColor White
    
    if ($importOutput -like "*imported successfully*") {
        Write-Host "`n" + "="*60 -ForegroundColor Green
        Write-Host "✅ SUCCESS! Agent imported successfully!" -ForegroundColor Green
        Write-Host "="*60 + "`n" -ForegroundColor Green
        
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Go to Agent Builder in watsonx Orchestrate" -ForegroundColor White
        Write-Host "2. Find 'Numeri_Financial_Agent'" -ForegroundColor White
        Write-Host "3. Copy the Agent ID" -ForegroundColor White
        Write-Host "4. Update ORCHESTRATE_AGENT_ID in environment variables" -ForegroundColor White
        Write-Host "5. Update api/agent.js to use the new agent" -ForegroundColor White
        
    } else {
        Write-Host "`n" + "="*60 -ForegroundColor Yellow
        Write-Host "⚠️  Import Status Unclear" -ForegroundColor Yellow
        Write-Host "="*60 + "`n" -ForegroundColor Yellow
        
        Write-Host "Check the output above for details." -ForegroundColor White
        Write-Host "If you see '[INFO] - Agent imported successfully', the import worked!" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "`n" + "="*60 -ForegroundColor Red
    Write-Host "❌ Import failed" -ForegroundColor Red
    Write-Host "="*60 + "`n" -ForegroundColor Red
    
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verify API key is correct" -ForegroundColor White
    Write-Host "2. Check internet connection" -ForegroundColor White
    Write-Host "3. Verify watsonx Orchestrate is accessible" -ForegroundColor White
}

Write-Host ""
