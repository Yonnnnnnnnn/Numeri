#!/bin/bash

# Script untuk testing IAM Access Token
# Ganti TOKEN_ANDA dengan token yang Anda dapatkan

TOKEN="TOKEN_ANDA_DI_SINI"

if [ "$TOKEN" = "TOKEN_ANDA_DI_SINI" ]; then
    echo "❌ Please edit this script and replace TOKEN_ANDA_DI_SINI with your actual token"
    echo "💡 Generate token first with: node get-token.js"
    exit 1
fi

echo "🔍 Testing IAM Access Token..."
echo "Token: ${TOKEN:0:20}..." # Show first 20 chars only

# Test dengan IBM watsonx Orchestrate (menggunakan data Anda)
ORCHESTRATE_URL="https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c/orchestrate/api/v1/invoke/agents/AskOrchestrate"

echo "🚀 Testing endpoint: $ORCHESTRATE_URL"

curl -X POST "$ORCHESTRATE_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, can you help me?"}' \
  -w "\n⏱️  Response Time: %{time_total}s\nHTTP Code: %{http_code}\n"

echo ""
echo "✅ Test completed"
