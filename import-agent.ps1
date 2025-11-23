#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import Numeri Financial Agent to watsonx Orchestrate
    
.DESCRIPTION
    This script imports the Numeri Financial Agent without requiring interactive input
    
.EXAMPLE
    .\import-agent.ps1
#>

# Configuration
$ApiKey = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"
$WxoUrl = "https://api.us-south.watson-orchestrate.cloud.ibm.com"
$AgentFile = "adk-project\agents\numeri-financial-agent.yaml"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ADK Agent Import Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Activate virtual environment
Write-Host "[1/4] Activating virtual environment..." -ForegroundColor Yellow
& "adk-env\Scripts\Activate.ps1"

# Step 2: Set environment variables
Write-Host "[2/4] Setting environment variables..." -ForegroundColor Yellow
$env:IBM_API_KEY = $ApiKey
$env:WXO_URL = $WxoUrl
Write-Host "✅ API Key and URL configured" -ForegroundColor Green

# Step 3: Check if agent file exists
Write-Host "[3/4] Verifying agent file..." -ForegroundColor Yellow
if (-not (Test-Path $AgentFile)) {
    Write-Host "❌ Agent file not found: $AgentFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Agent file found: $AgentFile" -ForegroundColor Green

# Step 4: Import agent using orchestrate CLI
Write-Host "[4/4] Importing agent to watsonx Orchestrate..." -ForegroundColor Yellow
Write-Host "URL: $WxoUrl" -ForegroundColor Gray

try {
    # Create a temporary script to handle the input
    $tempScript = @"
`$apiKey = '$ApiKey'
`$apiKey | orchestrate agents import -f '$AgentFile'
"@
    
    # Run the import
    $result = Invoke-Expression $tempScript 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -like "*imported successfully*") {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "✅ SUCCESS! Agent imported successfully" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Log in to watsonx Orchestrate" -ForegroundColor White
        Write-Host "   URL: $WxoUrl" -ForegroundColor Gray
        Write-Host "2. Go to Agent Builder" -ForegroundColor White
        Write-Host "3. Find 'Numeri_Financial_Agent'" -ForegroundColor White
        Write-Host "4. Test the agent with sample prompts" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "`n========================================" -ForegroundColor Red
        Write-Host "⚠️  Import may have failed or requires authentication" -ForegroundColor Red
        Write-Host "========================================`n" -ForegroundColor Red
        
        Write-Host "Output:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
        
        Write-Host "`nTroubleshooting:" -ForegroundColor Cyan
        Write-Host "1. Verify API key is correct" -ForegroundColor White
        Write-Host "2. Check internet connection" -ForegroundColor White
        Write-Host "3. Verify watsonx Orchestrate is accessible" -ForegroundColor White
        Write-Host "4. Try manual import:" -ForegroundColor White
        Write-Host "   orchestrate env activate ibm-cloud" -ForegroundColor Gray
        Write-Host "   orchestrate agents import -f $AgentFile" -ForegroundColor Gray
    }
} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "❌ ERROR: Import failed" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
