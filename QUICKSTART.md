# Numeri Quick Start Guide

Get Numeri running in 5 minutes.

## ⚡ Installation

```bash
# 1. Navigate to project directory
cd d:\Numeri

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app opens automatically at `http://localhost:3000`

---

## 🎮 First Steps

### 1. Load Sample Data

1. Click **"Upload JSON"** button
2. Select `sample_data.json` from the project folder
3. You should see 3 transactions in the grid

### 2. Process an Image

1. Click **"Upload Image"** button
2. Select any image file (JPG, PNG, etc.)
3. Click **"Process with AI"**
4. A new transaction appears in the grid

### 3. Modify with Chat

1. Type in the prompt box: `add 500`
2. Click **"Process with AI"**
3. The last transaction amount changes to 500

### 4. Download Results

1. Click **"Download JSON"** button
2. File `transactions_updated.json` is saved
3. You can re-upload it to continue working

---

## 📦 Build for Production

```bash
npm run build
```

Output files are in the `dist/` folder, ready to deploy.

---

## 🚀 Deploy to Vercel

### Option 1: CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Click "Deploy"

---

## 📊 Project Structure

```
d:\Numeri\
├── src/
│   ├── App.jsx          ← Main component
│   ├── main.jsx         ← React entry
│   └── index.css        ← Tailwind styles
├── api/
│   └── agent.js         ← Serverless function (for IBM watsonx)
├── index.html           ← HTML template
├── package.json         ← Dependencies
├── vite.config.js       ← Build config
├── tailwind.config.js   ← Tailwind config
├── sample_data.json     ← Example data
└── README.md            ← Full documentation
```

---

## 🔧 Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- --port 3001
```

**Dependencies not installing?**
```bash
rm -r node_modules package-lock.json
npm install
```

**Tailwind styles not showing?**
```bash
npm run build
npm run preview
```

---

## 📖 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review [PRD](./PRD%20Numeri%20Hackathon%20and%20MVP%20scope.txt) for requirements

---

## 💡 Tips

- Use `sample_data.json` to test quickly
- Try different prompts: "add 1000", "change description to Lunch"
- Download and re-upload to test round-trip integrity
- Open browser DevTools (F12) to see console messages
- Check mobile responsiveness by resizing the window

---

**Happy coding! 🎉**
