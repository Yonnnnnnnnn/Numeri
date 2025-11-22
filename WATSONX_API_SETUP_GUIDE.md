# 🔑 Panduan Lengkap: Mendapatkan API Key dan URL untuk IBM watsonx

**Untuk Integrasi Numeri dengan IBM watsonx Orchestrate**

---

## 📋 **Yang Anda Butuhkan**

Untuk mengintegrasikan IBM watsonx dengan aplikasi Numeri, Anda memerlukan **3 kredensial utama**:

1. **IBM Cloud API Key** 🔑
2. **Project ID** 📁  
3. **Endpoint URL** 🌐

---

## 🚀 **LANGKAH 1: Akses IBM Cloud Account**

### **1.1 Request IBM Cloud Account (Untuk Hackathon)**

Jika Anda peserta hackathon:

1. Buka: https://www.ibm.com/account/reg/us-en/signup?formid=urx-54162
2. Buat IBMid dengan email yang sama dengan registrasi hackathon
3. Verifikasi email (kode 7 digit)
4. Request account
5. Tunggu email invite dari IBM Cloud

### **1.2 Join IBM Cloud Account**

1. Cek email inbox Anda
2. Cari email dari "IBM Cloud" (cek spam/junk juga)
3. Klik tombol **"Join Now"**
4. Review informasi akun
5. Accept terms → Klik **"Join Account"**
6. Complete authentication
7. Anda akan masuk ke IBM Cloud dashboard

### **1.3 Switch ke Hackathon Account**

Jika Anda punya personal IBM Cloud account:

1. Klik dropdown account di pojok kanan atas
2. Pilih account dengan nama: **"xxxxxxx - watsonx"**
3. Pastikan region: **Dallas**

---

## 🔑 **LANGKAH 2: Mendapatkan API Key**

### **Metode 1: Via watsonx.ai Dashboard (RECOMMENDED)**

1. **Login ke watsonx.ai**
   ```
   URL: https://dataplatform.cloud.ibm.com/wx/home
   ```

2. **Buka Developer Access Section**
   - Scroll ke bawah di homepage
   - Cari section **"Developer access"**

3. **Pilih Project**
   - Klik dropdown **"Project or deployment space"**
   - Pilih **"watsonx Challenge Sandbox"** (untuk hackathon)
   - Project ID akan muncul otomatis ✅

4. **Create API Key**
   - Klik tombol **"Create API key"**
   - Isi form:
     - **Name**: `numeri-api-key`
     - **Description**: `API key for Numeri application`
     - **Option**: ✅ Pilih **"Disable the leaked key"**
   - Klik **"Create"**

5. **Simpan API Key**
   - ⚠️ **PENTING**: Copy API key yang muncul
   - Simpan di tempat aman (tidak bisa dilihat lagi!)
   - Atau download file JSON yang disediakan

**Format API Key:**
```
ApiKey-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### **Metode 2: Via IBM Cloud Dashboard**

1. Buka IBM Cloud dashboard
2. Go to **Manage** → **Access (IAM)**
3. Pilih **API keys** di sidebar kiri
4. Klik **"Create"**
5. Isi nama dan deskripsi
6. Klik **"Create"**
7. **Copy dan simpan** API key

---

## 📁 **LANGKAH 3: Mendapatkan Project ID**

Project ID sudah muncul di LANGKAH 2 (Metode 1), tapi jika perlu cek lagi:

### **Cara 1: Via Developer Access**

1. Buka watsonx.ai homepage
2. Scroll ke **"Developer access"** section
3. Pilih dropdown **"Project or deployment space"**
4. Pilih **"watsonx Challenge Sandbox"**
5. **Project ID** ditampilkan di bawahnya

### **Cara 2: Via Project Settings**

1. Buka watsonx.ai
2. Go to **Projects** → **View all projects**
3. Klik project **"watsonx Challenge Sandbox"**
4. Go to **Manage** tab
5. Klik **"General"**
6. Copy **Project ID**

**Format Project ID:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 🌐 **LANGKAH 4: Mendapatkan Endpoint URL**

### **Default Endpoint untuk Region Dallas:**

Untuk hackathon, region default adalah **Dallas (us-south)**.

**Base URL:**
```
https://us-south.ml.cloud.ibm.com
```

**Full Endpoint untuk Text Generation:**
```
https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29
```

### **Verifikasi Region:**

1. Buka watsonx.ai homepage
2. Cek pojok kanan atas dashboard
3. Pastikan region: **"Dallas"**

### **Endpoint untuk Region Lain (Jika Berbeda):**

| Region | Endpoint |
|--------|----------|
| Dallas (us-south) | `https://us-south.ml.cloud.ibm.com` |
| Frankfurt (eu-de) | `https://eu-de.ml.cloud.ibm.com` |
| Tokyo (jp-tok) | `https://jp-tok.ml.cloud.ibm.com` |
| London (eu-gb) | `https://eu-gb.ml.cloud.ibm.com` |

---

## 🔐 **LANGKAH 5: Generate IAM Access Token**

API Key perlu dikonversi menjadi **IAM Access Token** untuk authentication.

### **Menggunakan cURL:**

```bash
curl -X POST 'https://iam.cloud.ibm.com/identity/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_API_KEY_HERE'
```

**Ganti `YOUR_API_KEY_HERE` dengan API key Anda!**

### **Menggunakan Python:**

```python
import requests

api_key = "YOUR_API_KEY_HERE"

response = requests.post(
    'https://iam.cloud.ibm.com/identity/token',
    headers={'Content-Type': 'application/x-www-form-urlencoded'},
    data={
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': api_key
    }
)

token = response.json()['access_token']
print(f"IAM Token: {token}")
```

### **Response:**

```json
{
  "access_token": "eyJhbGciOiJIUz......sgrKIi8hdFs",
  "refresh_token": "not_supported",
  "token_type": "Bearer",
  "expires_in": 3600,
  "expiration": 1473188353,
  "scope": "ibm openid"
}
```

**⚠️ PENTING:**
- Token berlaku **60 menit** (3600 detik)
- Setelah expire, generate token baru
- Gunakan field `expires_in` untuk tracking expiration
- Implementasi caching token di production!

---

## ⚙️ **LANGKAH 6: Setup Environment Variables**

### **Untuk Vercel Deployment:**

1. **Login ke Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Pilih project **Numeri**

2. **Tambahkan Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Klik **"Add New"**

3. **Masukkan Variabel Berikut:**

```bash
# IBM Cloud API Key
IBM_CLOUD_API_KEY=ApiKey-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Project ID
IBM_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Region (Dallas)
IBM_REGION=us-south

# watsonx Host
IBM_WATSONX_HOST=ml.cloud.ibm.com
```

4. **Pilih Environment:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Save dan Redeploy**
   - Klik **"Save"**
   - Go to **Deployments** tab
   - Klik **"Redeploy"** pada deployment terbaru

### **Untuk Local Development:**

Buat file `.env` di root project:

```bash
# .env
IBM_CLOUD_API_KEY=ApiKey-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
IBM_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
IBM_REGION=us-south
IBM_WATSONX_HOST=ml.cloud.ibm.com
```

**⚠️ JANGAN commit file `.env` ke Git!**

Pastikan `.gitignore` sudah include:
```
.env
.env.local
.env.*.local
```

---

## 🧪 **LANGKAH 7: Test API Connection**

### **Menggunakan Test Script:**

1. **Install dependencies:**
   ```bash
   pip install requests
   ```

2. **Edit file `test_watsonx_api.py`:**
   - Ganti `YOUR_API_KEY_HERE` dengan API key Anda
   - Ganti `YOUR_PROJECT_ID_HERE` dengan Project ID Anda

3. **Run test:**
   ```bash
   python test_watsonx_api.py
   ```

### **Expected Output:**

```
🔑 Generating IAM Token...
✅ IAM Token generated successfully!
   Token expires in: 3600 seconds

🤖 Testing watsonx.ai API...
✅ watsonx API test successful!

📝 Response from Granite model:
   IBM watsonx is an AI and data platform...

📊 Token usage:
   Input tokens: 6
   Generated tokens: 95

🎉 All tests passed! Your credentials are working correctly.

📋 Summary:
   API Key: ApiKey-xxxxxxxx...
   Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Region: us-south
   Endpoint: https://us-south.ml.cloud.ibm.com
```

### **Menggunakan cURL (Quick Test):**

```bash
# 1. Generate IAM Token
TOKEN=$(curl -X POST 'https://iam.cloud.ibm.com/identity/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_API_KEY' \
  | jq -r '.access_token')

# 2. Test watsonx API
curl -X POST 'https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "model_id": "ibm/granite-3-8b-instruct",
    "input": "Hello, what is IBM watsonx?",
    "parameters": {
      "max_new_tokens": 100
    },
    "project_id": "YOUR_PROJECT_ID"
  }'
```

---

## 📊 **LANGKAH 8: Verifikasi Integrasi Numeri**

### **1. Update Vercel Function**

File `/api/agent.js` sudah siap, pastikan environment variables sudah di-set.

### **2. Test dari Frontend**

1. Buka aplikasi Numeri
2. Upload file JSON
3. Klik **"Process with AI"**
4. Periksa console browser (F12) untuk log

### **3. Monitor Usage**

- **Token Usage**: 1,000 tokens = 1 RU = $0.0001 USD
- **Hackathon Credit**: $100 (cukup untuk development)
- **Email Alerts**: Anda akan dapat notifikasi di 25%, 50%, 80% usage

---

## 🔒 **KEAMANAN: PENTING!**

### **❌ JANGAN PERNAH:**

1. ❌ Commit API key ke Git/GitHub
2. ❌ Share API key di public forum
3. ❌ Hardcode API key di frontend code
4. ❌ Expose API key di browser console

### **✅ LAKUKAN:**

1. ✅ Gunakan environment variables
2. ✅ Simpan API key di Vercel settings
3. ✅ Gunakan serverless function sebagai proxy
4. ✅ Enable "Disable the leaked key" option
5. ✅ Rotate API key secara berkala

### **⚠️ Jika API Key Terexpose:**

1. Segera **delete** API key di IBM Cloud
2. **Remove** dari semua public repositories
3. **Create** API key baru
4. **Update** environment variables
5. **Redeploy** aplikasi

---

## 📚 **Referensi Tambahan**

### **Dokumentasi Resmi:**

- [IBM watsonx.ai Documentation](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/welcome-main.html)
- [watsonx.ai API Reference](https://cloud.ibm.com/apidocs/watsonx-ai)
- [IBM Cloud IAM](https://cloud.ibm.com/docs/account?topic=account-iamoverview)

### **Model yang Tersedia:**

- **Text Generation**: `ibm/granite-3-8b-instruct`, `ibm/granite-3-2b-instruct`
- **Vision**: `meta-llama/llama-3-2-90b-instruct-vision-001`
- **Embeddings**: `ibm/slate-125m-english-rtrvr`

### **API Endpoints:**

| Capability | Endpoint |
|------------|----------|
| Text Generation | `/ml/v1/text/generation` |
| Chat | `/ml/v1/text/chat` |
| Embeddings | `/ml/v1/text/embeddings` |
| Rerank | `/ml/v1/text/rerank` |

---

## 🆘 **Troubleshooting**

### **Error: "Invalid API Key"**

- ✅ Pastikan API key benar (copy-paste dengan hati-hati)
- ✅ Cek tidak ada spasi di awal/akhir
- ✅ Verifikasi API key belum di-delete

### **Error: "Project not found"**

- ✅ Pastikan Project ID benar
- ✅ Verifikasi Anda menggunakan "watsonx Challenge Sandbox"
- ✅ Cek region sudah sesuai (Dallas)

### **Error: "Token expired"**

- ✅ Generate IAM token baru (berlaku 60 menit)
- ✅ Implementasi token caching di production

### **Error: "Insufficient credits"**

- ✅ Cek usage di watsonx.ai dashboard
- ✅ Gunakan model lebih kecil (granite-3-2b vs granite-3-8b)
- ✅ Kurangi `max_new_tokens` parameter

---

## ✅ **Checklist Lengkap**

- [ ] IBM Cloud account sudah di-join
- [ ] API Key sudah di-create dan disimpan
- [ ] Project ID sudah dicatat
- [ ] Endpoint URL sudah diverifikasi
- [ ] Environment variables sudah di-set di Vercel
- [ ] Test script berhasil dijalankan
- [ ] API key TIDAK di-commit ke Git
- [ ] `.gitignore` sudah include `.env`
- [ ] Numeri app sudah di-redeploy
- [ ] Integration test berhasil

---

## 🎉 **Selesai!**

Anda sekarang sudah memiliki semua kredensial yang diperlukan untuk mengintegrasikan IBM watsonx dengan aplikasi Numeri!

**Next Steps:**
1. Set environment variables di Vercel
2. Redeploy aplikasi
3. Test dengan data real
4. Monitor token usage

**Need Help?**
- Cek file `test_watsonx_api.py` untuk testing
- Lihat file `api/agent.js` untuk implementasi
- Baca `OPENAPI_INTEGRATION_GUIDE.md` untuk detail API

---

**Last Updated**: 2025-11-22  
**Version**: 1.0  
**Status**: ✅ READY FOR INTEGRATION
