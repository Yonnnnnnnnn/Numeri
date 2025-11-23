@echo off
REM ADK Agent Import Script for Windows
REM This script imports the Numeri Financial Agent without interactive prompts

echo.
echo ========================================
echo ADK Agent Import Script
echo ========================================
echo.

REM Activate virtual environment
call adk-env\Scripts\activate.bat

REM Set API Key
set IBM_API_KEY=mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO

echo [INFO] Virtual environment activated
echo [INFO] API Key set in environment

REM Try to import agent
echo.
echo [INFO] Importing Numeri Financial Agent...
echo.

cd adk-project\agents

REM Use echo to pipe the API key to the orchestrate command
echo %IBM_API_KEY% | orchestrate agents import -f numeri-financial-agent.yaml

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Agent imported successfully
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Log in to watsonx Orchestrate
    echo 2. Go to Agent Builder
    echo 3. Find "Numeri_Financial_Agent"
    echo 4. Test the agent
) else (
    echo.
    echo ========================================
    echo FAILED! Agent import unsuccessful
    echo ========================================
    echo.
    echo Troubleshooting:
    echo 1. Check API key is correct
    echo 2. Verify internet connection
    echo 3. Check watsonx Orchestrate is accessible
)

pause
