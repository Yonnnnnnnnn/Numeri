#!/bin/bash

# Test langsung dengan API Key (tanpa IAM token)
# Untuk testing sementara

API_KEY="mvZYa2cToxl9jWb2BgfnoRNVOxqbBCFT89YeUoftmGWO"
ORCHESTRATE_URL="https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/99a74687-1709-44f8-acd2-48b9fc95930c/orchestrate/api/v1/invoke/agents/AskOrchestrate"

echo "🚀 Testing direct API Key access..."
echo "🔑 Key: ${API_KEY:0:20}..."
echo "🎯 URL: $ORCHESTRATE_URL"

curl -X POST "$ORCHESTRATE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, can you help me?"}' \
  -w "\n⏱️  Response Time: %{time_total}s\nHTTP Code: %{http_code}\n"

echo ""
echo "✅ Direct API Key test completed"
