# Numeri Deployment Guide

This guide covers deploying Numeri to Vercel with optional IBM watsonx integration.

## 🚀 Quick Start (Mock Version)

### 1. Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### 2. Deploy to Vercel (Frontend Only)

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Option B: GitHub Integration**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click "Deploy"

**Result**: Your app is live at `https://your-project.vercel.app`

---

## 🔌 Integration with IBM watsonx (Production)

### Prerequisites

- IBM Cloud account with watsonx access
- IBM Cloud API Key
- IBM Project ID
- watsonx region and host information

### Step 1: Set Up IBM Cloud Resources

1. **Create IBM Cloud API Key**:
   - Go to [IBM Cloud Console](https://cloud.ibm.com)
   - Navigate to "Manage" → "Access (IAM)"
   - Click "Users" → Your name
   - Click "API keys" → "Create Classic infrastructure API key"
   - Save the key securely

2. **Get Project ID**:
   - In IBM Cloud Console, navigate to your watsonx project
   - Copy the Project ID from the project details

3. **Determine Region and Host**:
   - Example: `us-south.ml.cloud.ibm.com`
   - Check IBM Cloud documentation for your region

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
IBM_CLOUD_API_KEY = your-api-key-here
IBM_PROJECT_ID = your-project-id-here
IBM_REGION = us-south
IBM_WATSONX_HOST = ml.cloud.ibm.com
```

**⚠️ IMPORTANT**: Never commit these values to GitHub. Use Vercel's environment variable system.

### Step 3: Update Frontend Configuration

Create a `.env.local` file (for local testing only):

```env
VITE_VERCEL_PROXY_URL=https://your-project.vercel.app/api/agent
```

Or set it in Vercel dashboard under "Environment Variables" with `VITE_` prefix.

### Step 4: Deploy Serverless Function

The `api/agent.js` file is automatically deployed as a Vercel Serverless Function.

Verify deployment:
```bash
curl -X POST https://your-project.vercel.app/api/agent \
  -H "Content-Type: application/json" \
  -d '{"currentData": [], "prompt": "test"}'
```

### Step 5: Update Frontend to Use Real API

In `src/App.jsx`, replace the mock API call:

```javascript
// OLD (Mock)
const result = await mockProcessAI(transactions, imageBase64, prompt);

// NEW (Real API)
const response = await fetch(process.env.VITE_VERCEL_PROXY_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currentData: transactions,
    imageBase64,
    prompt,
    isVisionTask: !!imageBase64,
  }),
});

if (!response.ok) {
  throw new Error('API request failed');
}

const result = await response.json();
```

### Step 6: Deploy

```bash
git add .
git commit -m "Integrate real IBM watsonx API"
git push origin main
```

Vercel will automatically redeploy with the new code and environment variables.

---

## 📊 Monitoring & Debugging

### View Vercel Logs

```bash
vercel logs
```

### Monitor watsonx API Usage

1. Go to IBM Cloud Console
2. Navigate to your project
3. Check "Usage" tab for API calls and token consumption

### Common Issues

**Issue**: "401 Unauthorized"
- **Cause**: Invalid or expired IBM Cloud API Key
- **Solution**: Regenerate API key and update Vercel environment variables

**Issue**: "413 Payload Too Large"
- **Cause**: Image or JSON file exceeds 4.5MB
- **Solution**: Compress image or split large JSON files

**Issue**: "30s Timeout"
- **Cause**: watsonx API taking too long
- **Solution**: Reduce image resolution or simplify prompts

**Issue**: "Invalid JSON in response"
- **Cause**: Model output not in expected format
- **Solution**: Check system prompt in watsonx Agent configuration

---

## 🔒 Security Best Practices

1. **Never commit API keys** to GitHub
2. **Use Vercel environment variables** for sensitive data
3. **Implement rate limiting** on serverless function
4. **Validate all inputs** before sending to watsonx
5. **Log errors securely** without exposing sensitive data
6. **Use HTTPS only** for all API calls
7. **Implement CORS** if frontend and backend are on different domains

### Example CORS Configuration (api/agent.js)

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.vercel.app');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## 📈 Performance Optimization

### Frontend Optimization

```javascript
// Lazy load heavy components
const DataGrid = React.lazy(() => import('./DataGrid'));

// Memoize expensive calculations
const memoizedTotal = useMemo(() => 
  transactions.reduce((sum, tx) => sum + tx.amount, 0),
  [transactions]
);
```

### Serverless Function Optimization

```javascript
// Cache IAM tokens (valid for ~1 hour)
let cachedToken = null;
let tokenExpiry = null;

async function getIAMToken(apiKey) {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }
  // Generate new token...
}
```

### Image Optimization

```javascript
// Compress images before Base64 encoding
async function compressImage(file) {
  const canvas = await new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 800, 600); // Resize to 800x600
      resolve(canvas);
    };
    img.src = URL.createObjectURL(file);
  });
  return canvas.toDataURL('image/jpeg', 0.7); // 70% quality
}
```

---

## 🧪 Testing in Production

### Test Checklist

- [ ] File upload works
- [ ] Image upload works
- [ ] Chat prompt processing works
- [ ] Download generates valid JSON
- [ ] Error messages display correctly
- [ ] Loading spinner shows during processing
- [ ] App works on mobile devices
- [ ] API calls complete within 30 seconds
- [ ] Large files (>1MB) are handled gracefully

### Load Testing

```bash
# Using Apache Bench
ab -n 100 -c 10 https://your-project.vercel.app

# Using wrk
wrk -t4 -c100 -d30s https://your-project.vercel.app
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [IBM watsonx API Reference](https://cloud.ibm.com/apidocs/watsonx)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## 🆘 Support

For deployment issues:

1. Check Vercel logs: `vercel logs`
2. Review IBM Cloud error messages
3. Verify environment variables are set correctly
4. Test API endpoint with curl
5. Check browser console for frontend errors

---

**Last Updated**: November 2025
