# ADK Setup and Agent Import Script
# This script sets up the ADK environment and imports the Numeri Financial Agent

# Set API Key as environment variable
$env:IBM_API_KEY = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"

# Verify environment is active
Write-Host "Checking active environment..." -ForegroundColor Cyan
orchestrate env list

# Import the agent from agents folder
Write-Host "`nImporting Numeri Financial Agent..." -ForegroundColor Cyan
$agentPath = Join-Path $PSScriptRoot "agents\numeri-financial-agent.yaml"
orchestrate agents import -f $agentPath

Write-Host "`nAgent import complete!" -ForegroundColor Green
