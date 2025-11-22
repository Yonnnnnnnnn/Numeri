# 🔐 IBM watsonx Credentials Setup

## Kredensial Anda:

```
API Key:     RKHbxw32Eg67677A5F7Amf7Cz9dbbIl3vvBqUbmj49g1
Project ID:  2a52416c-656a-427e-b424-7dc7445f89c4
Region:      us-south
Host:        ml.cloud.ibm.com
Endpoint:    https://us-south.ml.cloud.ibm.com
```

## Setup untuk Local Development:

Buat file `.env` di root project dengan isi:

```bash
IBM_CLOUD_API_KEY=RKHbxw32Eg67677A5F7Amf7Cz9dbbIl3vvBqUbmj49g1
IBM_PROJECT_ID=2a52416c-656a-427e-b424-7dc7445f89c4
IBM_REGION=us-south
IBM_WATSONX_HOST=ml.cloud.ibm.com
```

## Setup untuk Vercel Production:

1. Login ke Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project **Numeri**
3. Go to **Settings** → **Environment Variables**
4. Tambahkan 4 variabel berikut:

```
Name: IBM_CLOUD_API_KEY
Value: RKHbxw32Eg67677A5F7Amf7Cz9dbbIl3vvBqUbmj49g1
Environment: Production, Preview, Development

Name: IBM_PROJECT_ID
Value: 2a52416c-656a-427e-b424-7dc7445f89c4
Environment: Production, Preview, Development

Name: IBM_REGION
Value: us-south
Environment: Production, Preview, Development

Name: IBM_WATSONX_HOST
Value: ml.cloud.ibm.com
Environment: Production, Preview, Development
```

5. Save dan Redeploy

## ⚠️ SECURITY WARNING:

File ini berisi kredensial sensitif!
- JANGAN commit ke Git
- JANGAN share di public
- DELETE file ini setelah setup selesai
