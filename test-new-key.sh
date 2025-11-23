# Quick test template - update dengan API Key baru
# Simpan sebagai test-new-key.sh lalu jalankan dengan: bash test-new-key.sh

API_KEY="MASUKKAN_API_KEY_BARU_DISINI"

echo "🔍 Testing new API Key..."
echo "🔑 Key: ${API_KEY:0:20}..."

curl -X POST "https://iam.cloud.ibm.com/identity/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=$API_KEY" \
  -w "\nHTTP Code: %{http_code}\n"

echo ""
echo "✅ Test completed"
