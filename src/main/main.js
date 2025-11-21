const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let mainWindow;
let currentProjectDir = null; // State untuk menyimpan folder aktif

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../renderer/preload.js'), // Adjusted path
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load index.html from renderer folder
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- HANDLER 1: AI (Native Fetch) ---
ipcMain.handle('send-to-ai', async (event, payload) => {
    const { prompt, currentData } = payload;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return { success: false, error: "API Key missing in .env" };

    const systemInstruction = `
    You are Numeri, an AI Accountant & Data Architect.
    Current Folder Context: User has opened a project folder.
    Current Data: ${JSON.stringify(currentData).substring(0, 5000)} // Limit context

    MODES:
    1. **Modification Mode:** If user wants to edit current data, return the NEW JSON array/object directly.
    2. **Creation Mode:** If user asks to CREATE a NEW file (e.g., "Buat CoA", "Create Income Statement"), return this EXACT JSON structure:
       {
         "_numeri_action": "create_file",
         "filename": "desired_filename.json", 
         "content": [ ... the structured data ... ]
       }

    CONSTRAINT:
    - Filenames must end in .json.
    - Content must be valid JSON.
    - Do NOT return markdown.
  `;

    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + "\nUser Prompt: " + prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API Error");

        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        let aiResult = JSON.parse(cleanJson);

        // Cek apakah AI meminta pembuatan file baru
        if (aiResult._numeri_action === "create_file") {
            if (!currentProjectDir) return { success: false, error: "Buka folder proyek dulu!" };

            const targetPath = path.join(currentProjectDir, aiResult.filename);
            fs.writeFileSync(targetPath, JSON.stringify(aiResult.content, null, 2));

            // Refresh list file
            const files = fs.readdirSync(currentProjectDir).filter(f => f.endsWith('.json'));

            return {
                success: true,
                action: "file_created",
                filename: aiResult.filename,
                data: aiResult.content,
                files: files
            };
        }

        // Jika mode biasa (modifikasi data)
        return { success: true, data: aiResult };

    } catch (error) {
        console.error("AI Error:", error);
        return { success: false, error: error.message };
    }
});

// --- HANDLER 2: FILE SYSTEM ---

// Buka Folder
ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (canceled) return { canceled: true };

    currentProjectDir = filePaths[0]; // SIMPAN STATE FOLDER

    // Baca file .json di folder tsb
    const files = fs.readdirSync(currentProjectDir).filter(file => file.endsWith('.json'));
    return { canceled: false, path: currentProjectDir, files };
});

// Baca Isi File
ipcMain.handle('file:read', async (event, filename) => {
    if (!currentProjectDir) return { error: "No folder open" };
    const filePath = path.join(currentProjectDir, filename);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content: JSON.parse(content) };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Buat File Baru
ipcMain.handle('file:create', async (event, filename) => {
    if (!currentProjectDir) return { success: false, error: "Silakan Buka Folder Proyek Terlebih Dahulu!" };

    // Pastikan ada ekstensi .json
    if (!filename.endsWith('.json')) filename += '.json';

    const filePath = path.join(currentProjectDir, filename);

    try {
        // Tulis file dengan array kosong []
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));

        // Return list file terbaru agar sidebar update
        const files = fs.readdirSync(currentProjectDir).filter(file => file.endsWith('.json'));
        return { success: true, filepath: filePath, files };
    } catch (e) {
        return { success: false, error: e.message };
    }
});
