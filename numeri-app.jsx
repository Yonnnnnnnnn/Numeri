import React, { useState, useRef } from 'react';
import { Upload, Download, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Mock API function simulating IBM watsonx Orchestrate
const mockProcessAI = async (currentData, imageBase64, prompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let updatedContent = [...currentData];

      if (imageBase64) {
        // Vision task: Add new transaction from receipt image
        const newTransaction = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString().split('T')[0],
          description: 'Receipt from Image',
          amount: Math.floor(Math.random() * 500000) + 10000,
          category: 'Expense',
          type: 'expense',
        };
        updatedContent.push(newTransaction);
      } else if (prompt && updatedContent.length > 0) {
        // Text task: Modify last item or parse command
        const lastIndex = updatedContent.length - 1;

        // Check if prompt contains "add" command
        const addMatch = prompt.match(/add\s+(\d+)/i);
        if (addMatch) {
          const amount = parseInt(addMatch[1], 10);
          updatedContent[lastIndex].amount = amount;
        } else if (prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('update')) {
          // Generic update to description
          updatedContent[lastIndex].description = prompt.replace(/change|update|to|jadi/gi, '').trim() || 'Updated Item';
        }
      }

      const response = {
        filename: 'transactions_updated.json',
        content: updatedContent,
        explanation: imageBase64
          ? `Added 1 receipt from image. Total items: ${updatedContent.length}`
          : prompt
          ? `Modified dataset based on command: "${prompt}". Total items: ${updatedContent.length}`
          : `Processed dataset. Total items: ${updatedContent.length}`,
      };

      resolve(response);
    }, 1500);
  });
};

export default function NumeriApp() {
  const [transactions, setTransactions] = useState([]);
  const [imageBase64, setImageBase64] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Handle JSON file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const parsed = JSON.parse(content);

        // Validate structure
        if (!Array.isArray(parsed)) {
          throw new Error('JSON must be an array of transactions');
        }

        setTransactions(parsed);
        setError('');
        setStatus('File loaded successfully');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setError(`Invalid JSON Format: ${err.message}`);
        setTransactions([]);
      }
    };
    reader.readAsText(file);
  };

  // Handle image upload and convert to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const base64String = event.target?.result;
        setImageBase64(base64String);
        setError('');
        setStatus('Image loaded. Ready to process.');
        setTimeout(() => setStatus(''), 3000);
      } catch (err) {
        setError('Failed to load image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Process with mock AI
  const handleProcessAI = async () => {
    if (!imageBase64 && !prompt && transactions.length === 0) {
      setError('Please upload an image, enter a prompt, or load existing data first');
      return;
    }

    setLoading(true);
    setStatus('Analyzing Document...');
    setError('');

    try {
      const result = await mockProcessAI(transactions, imageBase64, prompt);

      setTransactions(result.content);
      setExplanation(result.explanation);
      setStatus('Processing complete!');
      setImageBase64(null);
      setPrompt('');

      // Clear image input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }

      setTimeout(() => setStatus(''), 4000);
    } catch (err) {
      setError('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download JSON file
  const handleDownload = () => {
    if (transactions.length === 0) {
      setError('No data to download. Upload or process data first.');
      return;
    }

    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions_updated.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatus('Download Ready');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Numeri
          </h1>
          <p className="text-slate-400 text-lg">Data Architect • Upload → Process → Download</p>
        </div>

        {/* Status/Error Messages */}
        <div className="mb-6 space-y-3">
          {error && (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-200">{error}</span>
            </div>
          )}
          {status && !error && (
            <div className="flex items-center gap-3 bg-green-900/30 border border-green-500/50 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-green-200">{status}</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <Loader className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
              <span className="text-blue-200">Analyzing Document...</span>
            </div>
          )}
          {explanation && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-300 text-sm"><strong>AI Response:</strong> {explanation}</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 text-blue-300">Control Panel</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Upload JSON */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload JSON File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload JSON
              </button>
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Receipt Image</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
            </div>
          </div>

          {/* Chat Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Chat Prompt (Optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'add 100' or 'change last description to Lunch'"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleProcessAI}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Process with AI
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={transactions.length === 0}
              className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download JSON
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Transaction Data Grid</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No transactions loaded. Upload a JSON file or process an image to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 font-semibold text-blue-300">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-300">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-blue-300">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-300">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-300">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 text-slate-300 font-mono text-xs">{tx.id?.substring(0, 12)}...</td>
                      <td className="py-3 px-4 text-slate-300">{tx.date}</td>
                      <td className="py-3 px-4 text-slate-300">{tx.description}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-400">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(tx.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            tx.type === 'income'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {transactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-600 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-green-400">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0))}
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Last Updated</p>
                <p className="text-2xl font-bold text-cyan-400">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Numeri • IBM Agentic AI Hackathon • Stateless Data Processing</p>
        </div>
      </div>
    </div>
  );
}
