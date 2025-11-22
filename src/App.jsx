import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileJson, Save, Send, Image as ImageIcon, Settings, Menu, RotateCcw, Trash2, Plus, X, Server, History } from 'lucide-react';

// --- MOCK DATA & UTILS ---

const MOCK_INITIAL_FILES = [];

// --- COMPONENTS ---

const FileSidebar = ({ files, activeFile, onSelectFile, onCreateFile, onUploadFile }) => (
  <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-full shadow-2xl">
    <div className="p-4 border-b border-slate-800 flex items-center gap-2 font-extrabold text-lg text-white">
      <div className="w-6 h-6 bg-cyan-500 rounded-sm flex items-center justify-center">
        <Server size={14} className="text-slate-900" />
      </div>
      <span className="text-white tracking-wider">Numeri</span>
      <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400 font-mono">.json</span>
    </div>

    <div className="p-3 space-y-2">
      <button
        onClick={onCreateFile}
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 px-3 py-2 rounded-lg text-sm transition-colors text-cyan-400 font-semibold border border-cyan-500/30 shadow-md shadow-cyan-900/50"
      >
        <Plus size={16} /> New Data File
      </button>

      <label className="w-full flex items-center justify-center gap-2 bg-green-800/30 hover:bg-green-700/40 active:bg-green-600/50 px-3 py-2 rounded-lg text-sm transition-colors text-green-400 font-semibold border border-green-500/30 shadow-md shadow-green-900/50 cursor-pointer">
        <FileJson size={16} /> Upload JSON
        <input
          type="file"
          accept=".json,application/json"
          onChange={onUploadFile}
          className="hidden"
        />
      </label>
    </div>

    <div className="flex-1 overflow-y-auto px-2 pb-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 pl-2">
        Project Files
      </div>
      {files.length === 0 ? (
        <div className="text-center py-8 px-4">
          <FileJson size={32} className="mx-auto mb-3 text-slate-600 opacity-50" />
          <p className="text-xs text-slate-500 leading-relaxed">
            No files yet. Click "New Data File" or "Upload JSON" to get started.
          </p>
        </div>
      ) : (
        files.map((file) => (
          <button
            key={file.name}
            onClick={() => onSelectFile(file.name)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors text-left ${activeFile === file.name
              ? 'bg-cyan-600/30 text-cyan-400 font-semibold border border-cyan-600'
              : 'hover:bg-slate-800 text-slate-400'
              }`}
          >
            <FileJson size={16} className={activeFile === file.name ? 'text-cyan-400' : 'text-slate-500'} />
            <span className="truncate">{file.name}</span>
          </button>
        ))
      )}
    </div>
  </div>
);

import JsonGridEditor from './components/JsonGridEditor';

const ChatInterface = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const ChatBubble = ({ role, content, image }) => {
    const isUser = role === 'user';
    const bubbleClass = isUser
      ? 'bg-blue-600 text-white rounded-br-none'
      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-lg ${bubbleClass}`}>
          {content}
          {image && (
            <div className="mt-3 rounded-lg overflow-hidden border-2 border-slate-700">
              <img src={image} alt="uploaded" className="max-w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-10">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          AI Architect Agent
        </h3>
        <Settings size={18} className="text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} {...msg} />
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse-slow"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse-slow delay-100"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse-slow delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis instruksi atau paste gambar (Ctrl+V)..."
            className="w-full pl-4 pr-12 py-3 bg-slate-700 placeholder-slate-400 text-white focus:bg-slate-600 focus:border-cyan-500 border border-slate-700 rounded-xl text-sm outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="absolute right-2 top-2 p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1 cursor-default">
            <ImageIcon size={12} className='text-cyan-400' /> Multimodal Input Ready (Ctrl+V)
          </span>
          <span className='font-mono'>Gemini 2.5 Flash</span>
        </div>
      </form>
    </div>
  );
};

// Custom keyframes for slower bounce (used in ChatInterface)
const CustomStyles = () => (
  <style>
    {`
            @keyframes pulse-slow {
                0%, 100% { opacity: 1; }
                50% { opacity: .4; }
            }
            .animate-pulse-slow {
                animation: pulse-slow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .delay-100 { animation-delay: 0.1s; }
            .delay-200 { animation-delay: 0.2s; }
        `}
  </style>
);


export default function App() {
  // State
  const [files, setFiles] = useState(MOCK_INITIAL_FILES);
  const [activeFileName, setActiveFileName] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya AI Architect. Silakan paste gambar laporan atau beri instruksi untuk mengubah data.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileHistory, setFileHistory] = useState([]); // Array of { fileName, content, description, timestamp }
  const [showHistory, setShowHistory] = useState(false);

  // Derived State
  const activeFile = files.find(f => f.name === activeFileName);

  // Handlers
  // Handlers
  const handleUpdateFileContent = (newContent, description = "Update data") => {
    const currentFile = files.find(f => f.name === activeFileName);
    if (currentFile) {
      // Add to history
      setFileHistory(prev => {
        const newHistory = [
          {
            fileName: activeFileName,
            content: currentFile.content,
            description: description,
            timestamp: Date.now()
          },
          ...prev
        ].slice(0, 8); // Keep max 8
        return newHistory;
      });
    }

    const updatedFiles = files.map(f =>
      f.name === activeFileName ? { ...f, content: newContent } : f
    );
    setFiles(updatedFiles);
  };

  const handleRollback = (historyItem) => {
    if (window.confirm(`Rollback ke versi: ${historyItem.description}?`)) {
      const updatedFiles = files.map(f =>
        f.name === historyItem.fileName ? { ...f, content: historyItem.content } : f
      );
      setFiles(updatedFiles);
      setShowHistory(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Berhasil rollback ke versi: ${historyItem.description}`
      }]);
    }
  };

  const handleSendMessage = async (text) => {
    const newMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setIsProcessing(true);

    try {
      // Check if there's an active file
      if (!activeFile) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ Tidak ada file yang aktif. Silakan buat file baru atau upload file JSON terlebih dahulu.'
        }]);
        setIsProcessing(false);
        return;
      }

      // Parse current data
      let currentData;
      try {
        currentData = JSON.parse(activeFile.content);
      } catch (e) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Error: File aktif memiliki format JSON yang tidak valid.'
        }]);
        setIsProcessing(false);
        return;
      }

      if (!Array.isArray(currentData)) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Error: Data harus berupa array.'
        }]);
        setIsProcessing(false);
        return;
      }

      // Call watsonx API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentData: currentData,
          prompt: text,
          isVisionTask: false
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      // Update file content with AI result
      if (result.content && Array.isArray(result.content)) {
        const updatedContent = JSON.stringify(result.content, null, 2);
        handleUpdateFileContent(updatedContent, result.explanation || "AI Update");

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ ${result.explanation || 'Data berhasil diproses!'}\n\n📊 File '${activeFileName}' telah diupdate.`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.explanation || 'Instruksi diterima dan diproses.'
        }]);
      }

    } catch (error) {
      console.error('Chat AI Error:', error);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error memproses instruksi: ${error.message}\n\n💡 Pastikan environment variables sudah di-set di Vercel dan API endpoint tersedia.`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateFile = () => {
    const name = prompt("Masukkan nama file data baru (contoh: data_bulanan.json):", `new_data_${Date.now()}.json`);
    if (name) {
      if (files.some(f => f.name === name)) {
        alert(`File bernama ${name} sudah ada.`);
        return;
      }
      setFiles(prev => [...prev, { name, content: "[]" }]);
      setActiveFileName(name);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `File kosong '${name}' berhasil dibuat dan dibuka. Silakan gunakan tombol "+ Add Column" dan "+ Add Row" untuk mulai mengisi data.`
      }]);
    }
  };

  const handleDeleteFile = (fileName) => {
    if (window.confirm(`Yakin ingin menghapus file ${fileName}? Tindakan ini tidak dapat dibatalkan.`)) {
      const updatedFiles = files.filter(f => f.name !== fileName);
      setFiles(updatedFiles);

      if (activeFileName === fileName) {
        setActiveFileName(updatedFiles.length > 0 ? updatedFiles[0].name : null);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `File '${fileName}' berhasil dihapus.`
      }]);
    }
  };

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: File harus berformat .json'
      }]);
      return;
    }

    try {
      // Read file content
      const fileContent = await file.text();

      // Validate and parse JSON
      let parsedData;
      try {
        parsedData = JSON.parse(fileContent);
      } catch (e) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Error: File JSON tidak valid. ${e.message}`
        }]);
        return;
      }

      // Convert to array format if needed
      let convertedContent = fileContent;

      if (!Array.isArray(parsedData) && parsedData.rows && Array.isArray(parsedData.rows)) {
        // Object with rows property - extract rows array directly
        const convertedRows = parsedData.rows;

        convertedContent = JSON.stringify(convertedRows, null, 2);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `🔄 File format object (columns/rows) terdeteksi. Mengambil ${parsedData.rows.length} baris data.`
        }]);
      } else if (!Array.isArray(parsedData)) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '❌ Error: Format JSON tidak didukung. File harus berupa array atau object dengan property "rows".'
        }]);
        return;
      }

      // Check if file already exists
      if (files.some(f => f.name === file.name)) {
        const overwrite = window.confirm(`File '${file.name}' sudah ada. Timpa file yang ada?`);
        if (!overwrite) {
          event.target.value = ''; // Reset input
          return;
        }
        // Remove existing file
        setFiles(prev => prev.filter(f => f.name !== file.name));
      }

      // Add file to list with converted content
      const newFile = {
        name: file.name,
        content: convertedContent
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFileName(file.name);

      // Add success message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ File '${file.name}' berhasil di-upload! File ini sekarang aktif dan siap diproses dengan AI.`
      }]);

      // Trigger AI analysis
      setTimeout(() => {
        handleProcessWithAI(convertedContent, file.name);
      }, 500);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error membaca file: ${error.message}`
      }]);
    }

    // Reset input
    event.target.value = '';
  };

  const handleProcessWithAI = async (content, fileName) => {
    setIsProcessing(true);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `🤖 Menganalisis file '${fileName}' dengan IBM watsonx AI...`
    }]);

    try {
      // Parse current data
      const currentData = JSON.parse(content);

      if (!Array.isArray(currentData)) {
        throw new Error('Data harus berupa array');
      }

      // Call watsonx API via serverless proxy
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentData: currentData,
          prompt: `Analisis data ini dan berikan ringkasan: jumlah baris, struktur kolom, dan insight penting.`,
          isVisionTask: false
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Analisis selesai!\n\n${result.explanation || 'Data berhasil diproses.'}\n\n📊 File memiliki ${currentData.length} baris data.`
      }]);

    } catch (error) {
      console.error('AI Processing Error:', error);

      // Fallback to basic analysis if API fails
      try {
        const data = JSON.parse(content);
        const rowCount = Array.isArray(data) ? data.length : 0;
        const columns = rowCount > 0 ? Object.keys(data[0]).length : 0;

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `📊 Analisis lokal:\n\n✅ File berhasil di-load\n📝 Jumlah baris: ${rowCount}\n📋 Jumlah kolom: ${columns}\n\n💡 Anda dapat mengedit data di spreadsheet editor atau gunakan chat untuk memberikan instruksi.`
        }]);
      } catch (e) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ File di-load tetapi analisis AI gagal. Anda tetap dapat mengedit data secara manual.`
        }]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Paste Event Listener for Images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setMessages(prev => [...prev, {
              role: 'user',
              content: 'Menganalisis gambar ini...',
              image: event.target.result
            }]);

            setIsProcessing(true);
            setTimeout(() => {
              setIsProcessing(false);
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Saya telah menganalisis gambar laporan tersebut. Saya siap mengubahnya menjadi data JSON. Apakah Anda ingin menyimpannya ke file yang sedang aktif atau membuat file baru?'
              }]);
            }, 2000);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 font-inter text-white overflow-hidden">
      <CustomStyles />
      <FileSidebar
        files={files}
        activeFile={activeFileName}
        onSelectFile={setActiveFileName}
        onCreateFile={handleCreateFile}
        onUploadFile={handleUploadFile}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shadow-xl z-20">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-cyan-400 font-mono tracking-wider">{activeFile?.name || "NO_FILE_OPENED"}</h2>
            <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-slate-400 border border-slate-600">
              Data Grid View
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg transition-colors ${fileHistory.filter(h => h.fileName === activeFileName).length > 0 ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`}
                title="Rollback History"
                disabled={fileHistory.filter(h => h.fileName === activeFileName).length === 0}
              >
                <RotateCcw size={18} />
              </button>
              {showHistory && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    <span>History (Max 8)</span>
                    <button onClick={() => setShowHistory(false)}><X size={12} /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {fileHistory.filter(h => h.fileName === activeFileName).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRollback(item)}
                        className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 transition-colors group"
                      >
                        <div className="text-xs text-cyan-400 font-mono mb-1">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-slate-300 group-hover:text-white line-clamp-2">
                          {item.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => activeFile && handleDeleteFile(activeFileName)}
              className={`p-2 rounded-lg transition-colors ${activeFile ? 'text-red-400 hover:text-white hover:bg-red-800/50' : 'text-slate-600 cursor-not-allowed'}`}
              title="Delete Active File"
            >
              <Trash2 size={18} />
            </button>
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-md shadow-green-900/50 transition-colors">
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        {activeFile ? (
          <JsonGridEditor
            content={activeFile.content}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-900/50">
            <p className="text-xl font-light">
              <span className='text-cyan-500'>Select</span> atau <span className='text-cyan-500'>Buat</span> File Baru
            </p>
          </div>
        )}
      </div>

      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />
    </div>
  );
}
