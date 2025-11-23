@echo off
echo ==========================================
echo      Numeri Agent Import Script
echo ==========================================
echo.
echo [STEP 1] Activating Environment
echo You will be asked for the API Key.
echo Please copy and paste this key:
echo mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO
echo.
d:\Numeri\venv\Scripts\orchestrate env activate numeri-env

echo.
echo [STEP 2] Importing Agent
echo.
d:\Numeri\venv\Scripts\orchestrate agents import -f d:\Numeri\adk-project\agents\numeri-financial-agent.yaml

echo.
echo Done! Please copy the Agent ID from the output above.
pause
