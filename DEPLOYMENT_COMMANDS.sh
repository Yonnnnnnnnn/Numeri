# Numeri - Quick Deployment Commands

# ===== LOCAL TESTING =====

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Test API connection (Python)
python test_numeri_watsonx.py

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview

# ===== VERCEL DEPLOYMENT =====

# Option 1: Deploy via Vercel CLI
vercel --prod

# Option 2: Deploy to preview
vercel

# Option 3: Check deployment status
vercel ls

# Option 4: View logs
vercel logs

# ===== GIT COMMANDS =====

# Stage all changes
git add .

# Commit changes
git commit -m "Integrate IBM watsonx API - Production Ready"

# Push to GitHub (triggers auto-deploy if connected to Vercel)
git push origin main

# ===== ENVIRONMENT SETUP =====

# Create .env file for local testing
# (Copy credentials from CREDENTIALS_SETUP.md)

# For Vercel, set environment variables via dashboard:
# https://vercel.com/dashboard → Project → Settings → Environment Variables

# ===== TESTING COMMANDS =====

# Test local API endpoint (if running dev server)
# curl -X POST http://localhost:3000/api/agent \
#   -H "Content-Type: application/json" \
#   -d '{"currentData":[],"prompt":"test","isVisionTask":false}'

# ===== MONITORING =====

# Check Vercel deployment status
# https://vercel.com/dashboard

# Check watsonx.ai usage
# https://dataplatform.cloud.ibm.com/wx/home

# ===== QUICK LINKS =====

# Vercel Dashboard: https://vercel.com/dashboard
# watsonx.ai: https://dataplatform.cloud.ibm.com/wx/home
# IBM Cloud: https://cloud.ibm.com/
