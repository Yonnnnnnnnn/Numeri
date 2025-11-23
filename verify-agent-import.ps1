#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verify if Numeri Financial Agent was successfully imported to watsonx Orchestrate
    
.DESCRIPTION
    This script checks the import status by attempting to list agents
#>

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "Agent Import Verification Script" -ForegroundColor Cyan
Write-Host "="*60 + "`n" -ForegroundColor Cyan

# Configuration
$ApiKey = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"
$WxoUrl = "https://api.us-south.watson-orchestrate.cloud.ibm.com"
$AgentName = "Numeri_Financial_Agent"

Write-Host "[1/3] Activating virtual environment..." -ForegroundColor Yellow
& "adk-env\Scripts\Activate.ps1" 2>&1 | Out-Null

Write-Host "[2/3] Checking agent list..." -ForegroundColor Yellow

try {
    # Try to list agents
    $result = orchestrate agents list 2>&1
    
    if ($result -like "*$AgentName*") {
        Write-Host "`n" + "="*60 -ForegroundColor Green
        Write-Host "✅ SUCCESS! Agent is imported!" -ForegroundColor Green
        Write-Host "="*60 + "`n" -ForegroundColor Green
        
        Write-Host "Agent Details:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
        
        Write-Host "`nNext Steps:" -ForegroundColor Yellow
        Write-Host "1. Get the Agent ID from watsonx Orchestrate" -ForegroundColor White
        Write-Host "2. Update ORCHESTRATE_AGENT_ID in environment variables" -ForegroundColor White
        Write-Host "3. Update api/agent.js to use the new agent" -ForegroundColor White
        Write-Host "4. Deploy to Vercel" -ForegroundColor White
        
    } elseif ($result -like "*ERROR*" -or $result -like "*No credentials*") {
        Write-Host "`n" + "="*60 -ForegroundColor Yellow
        Write-Host "⚠️  Authentication Issue" -ForegroundColor Yellow
        Write-Host "="*60 + "`n" -ForegroundColor Yellow
        
        Write-Host "The ADK CLI couldn't authenticate." -ForegroundColor White
        Write-Host "This is expected - use the Web UI method instead:" -ForegroundColor White
        Write-Host ""
        Write-Host "1. Go to: https://api.us-south.watson-orchestrate.cloud.ibm.com" -ForegroundColor Cyan
        Write-Host "2. Log in with IBM Cloud credentials" -ForegroundColor Cyan
        Write-Host "3. Go to Agent Builder" -ForegroundColor Cyan
        Write-Host "4. Import: adk-project/agents/numeri-financial-agent.yaml" -ForegroundColor Cyan
        Write-Host "5. Look for success notification" -ForegroundColor Cyan
        
    } else {
        Write-Host "`n" + "="*60 -ForegroundColor Red
        Write-Host "❌ Agent NOT found in list" -ForegroundColor Red
        Write-Host "="*60 + "`n" -ForegroundColor Red
        
        Write-Host "Agent list output:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
        
        Write-Host "`nAction Required:" -ForegroundColor Yellow
        Write-Host "Import the agent using Web UI method" -ForegroundColor White
    }
    
} catch {
    Write-Host "`n" + "="*60 -ForegroundColor Red
    Write-Host "❌ Error checking agent status" -ForegroundColor Red
    Write-Host "="*60 + "`n" -ForegroundColor Red
    
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nPlease use Web UI method to import agent" -ForegroundColor Yellow
}

Write-Host ""
