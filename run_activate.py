import subprocess
import time
import os

# Path to orchestrate executable
orch_exe = r'd:\Numeri\venv\Scripts\orchestrate.exe'
api_key = "mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"

print(f"Running: {orch_exe} env activate numeri-env")

process = subprocess.Popen(
    [orch_exe, 'env', 'activate', 'numeri-env'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    cwd=r'd:\Numeri',
    bufsize=0  # Unbuffered
)

try:
    # Send key immediately + newline
    print("Sending API key...")
    out, err = process.communicate(input=f"{api_key}\n", timeout=15)
    
    print("STDOUT:", out)
    print("STDERR:", err)
    print("Return Code:", process.returncode)

except subprocess.TimeoutExpired:
    process.kill()
    print("Timed out!")
