"""
Test script untuk verifikasi IBM watsonx API connection
"""
import requests
import json

# ===== GANTI DENGAN KREDENSIAL ANDA =====
IBM_CLOUD_API_KEY = "YOUR_API_KEY_HERE"  # Ganti dengan API key Anda
IBM_PROJECT_ID = "YOUR_PROJECT_ID_HERE"   # Ganti dengan Project ID Anda
IBM_REGION = "us-south"
IBM_WATSONX_HOST = "ml.cloud.ibm.com"

# ===== STEP 1: Generate IAM Token =====
print("🔑 Generating IAM Token...")

iam_url = "https://iam.cloud.ibm.com/identity/token"
iam_headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json"
}
iam_data = {
    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
    "apikey": IBM_CLOUD_API_KEY
}

try:
    iam_response = requests.post(iam_url, headers=iam_headers, data=iam_data)
    iam_response.raise_for_status()
    
    iam_token = iam_response.json()["access_token"]
    print("✅ IAM Token generated successfully!")
    print(f"   Token expires in: {iam_response.json()['expires_in']} seconds")
    
except Exception as e:
    print(f"❌ Error generating IAM token: {e}")
    exit(1)

# ===== STEP 2: Test watsonx API =====
print("\n🤖 Testing watsonx.ai API...")

watsonx_url = f"https://{IBM_REGION}.{IBM_WATSONX_HOST}/ml/v1/text/generation?version=2023-05-29"

watsonx_headers = {
    "Authorization": f"Bearer {iam_token}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

watsonx_payload = {
    "model_id": "ibm/granite-3-8b-instruct",
    "input": "What is IBM watsonx?",
    "parameters": {
        "decoding_method": "greedy",
        "max_new_tokens": 100,
        "min_new_tokens": 10
    },
    "project_id": IBM_PROJECT_ID
}

try:
    watsonx_response = requests.post(
        watsonx_url, 
        headers=watsonx_headers, 
        json=watsonx_payload
    )
    watsonx_response.raise_for_status()
    
    result = watsonx_response.json()
    generated_text = result["results"][0]["generated_text"]
    
    print("✅ watsonx API test successful!")
    print(f"\n📝 Response from Granite model:")
    print(f"   {generated_text}")
    
    print(f"\n📊 Token usage:")
    print(f"   Input tokens: {result['results'][0]['input_token_count']}")
    print(f"   Generated tokens: {result['results'][0]['generated_token_count']}")
    
except Exception as e:
    print(f"❌ Error calling watsonx API: {e}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response.text}")
    exit(1)

print("\n🎉 All tests passed! Your credentials are working correctly.")
print("\n📋 Summary:")
print(f"   API Key: {IBM_CLOUD_API_KEY[:20]}...")
print(f"   Project ID: {IBM_PROJECT_ID}")
print(f"   Region: {IBM_REGION}")
print(f"   Endpoint: https://{IBM_REGION}.{IBM_WATSONX_HOST}")
