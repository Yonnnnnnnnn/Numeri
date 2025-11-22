# 🚀 QUICK START: Mendapatkan API Key & URL IBM watsonx

## 📋 **3 Kredensial yang Dibutuhkan:**

```
1. IBM_CLOUD_API_KEY  = ApiKey-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
2. IBM_PROJECT_ID     = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  
3. IBM_REGION         = us-south
```

---

## ⚡ **Langkah Cepat (5 Menit)**

### **STEP 1: Login ke watsonx.ai**
```
URL: https://dataplatform.cloud.ibm.com/wx/home
```

### **STEP 2: Buka Developer Access**
1. Scroll ke bawah homepage
2. Cari section **"Developer access"**

### **STEP 3: Pilih Project**
1. Klik dropdown **"Project or deployment space"**
2. Pilih **"watsonx Challenge Sandbox"**
3. ✅ **Project ID** muncul → COPY!

### **STEP 4: Create API Key**
1. Klik **"Create API key"**
2. Name: `numeri-api-key`
3. ✅ Pilih "Disable the leaked key"
4. Klik **"Create"**
5. ⚠️ **COPY API KEY** (tidak bisa dilihat lagi!)

### **STEP 5: Catat Endpoint URL**
```
https://us-south.ml.cloud.ibm.com
```

---

## ⚙️ **Setup di Vercel (2 Menit)**

1. **Buka Vercel Dashboard**
   - Login: https://vercel.com/dashboard
   - Pilih project **Numeri**

2. **Tambahkan Environment Variables**
   - Settings → Environment Variables → Add New

3. **Masukkan 4 Variabel:**

```bash
IBM_CLOUD_API_KEY = [paste API key Anda]
IBM_PROJECT_ID    = [paste Project ID Anda]
IBM_REGION        = us-south
IBM_WATSONX_HOST  = ml.cloud.ibm.com
```

4. **Save & Redeploy**
   - Klik Save
   - Go to Deployments → Redeploy

---

## 🧪 **Test Connection (1 Menit)**

### **Option 1: Menggunakan Test Script**

```bash
# Edit file test_watsonx_api.py
# Ganti YOUR_API_KEY_HERE dan YOUR_PROJECT_ID_HERE

python test_watsonx_api.py
```

### **Option 2: Test dari Numeri App**

1. Buka aplikasi Numeri
2. Upload JSON file
3. Klik "Process with AI"
4. Cek response!

---

## 📊 **Ringkasan Kredensial**

| Item | Lokasi | Format |
|------|--------|--------|
| **API Key** | watsonx.ai → Developer access → Create API key | `ApiKey-xxx...` |
| **Project ID** | watsonx.ai → Developer access → Select project | `xxxxxxxx-xxxx-...` |
| **Region** | Fixed untuk hackathon | `us-south` |
| **Endpoint** | Fixed untuk region Dallas | `https://us-south.ml.cloud.ibm.com` |

---

## 🔒 **KEAMANAN - PENTING!**

### ❌ **JANGAN:**
- Commit API key ke Git
- Share API key di public
- Hardcode di frontend

### ✅ **LAKUKAN:**
- Simpan di Vercel environment variables
- Gunakan serverless proxy (`/api/agent.js`)
- Enable "Disable the leaked key"

---

## 🆘 **Troubleshooting Cepat**

| Error | Solusi |
|-------|--------|
| "Invalid API Key" | Cek copy-paste, pastikan tidak ada spasi |
| "Project not found" | Verifikasi Project ID, pastikan region Dallas |
| "Token expired" | Normal, token berlaku 60 menit, akan auto-refresh |
| "Insufficient credits" | Cek usage di dashboard, gunakan model lebih kecil |

---

## 📚 **File Referensi**

- **Panduan Lengkap**: `WATSONX_API_SETUP_GUIDE.md` (baca ini untuk detail)
- **Test Script**: `test_watsonx_api.py` (untuk testing koneksi)
- **API Implementation**: `api/agent.js` (sudah siap pakai!)
- **OpenAPI Spec**: `numeri-openapi.json` (untuk Watson Orchestrate)

---

## ✅ **Checklist**

- [ ] API Key sudah di-create ✅
- [ ] Project ID sudah dicatat ✅
- [ ] Environment variables sudah di-set di Vercel ✅
- [ ] App sudah di-redeploy ✅
- [ ] Test connection berhasil ✅

---

## 🎯 **Next Steps**

1. ✅ Dapatkan kredensial (sudah!)
2. ⚙️ Setup environment variables di Vercel
3. 🚀 Redeploy aplikasi
4. 🧪 Test dengan data real
5. 📊 Monitor token usage

---

**Total Time: ~10 menit**  
**Difficulty: ⭐⭐ (Easy)**  

**Need detailed guide?** → Baca `WATSONX_API_SETUP_GUIDE.md`
