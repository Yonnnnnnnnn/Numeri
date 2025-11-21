// Spreadsheet state
let spreadsheetData = {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]
};

// DOM Elements
const headerRow = document.getElementById('header-row');
const sheetBody = document.getElementById('sheet-body');
const addColBtn = document.getElementById('add-col');
const addRowBtn = document.getElementById('add-row');
const promptInput = document.getElementById('prompt-input');
const sendPromptBtn = document.getElementById('send-prompt');
const chatMessages = document.getElementById('chat-messages');
const openFolderBtn = document.getElementById('open-folder-btn');
const newFileBtn = document.getElementById('new-file-btn'); // Using ID from HTML
const fileListContainer = document.getElementById('file-list');
const currentFileNameEl = document.getElementById('current-file-name');

// Initialize the spreadsheet
function initSpreadsheet() {
    renderHeaders();
    renderRows();
}

// Render header row
function renderHeaders() {
    headerRow.innerHTML = '';
    spreadsheetData.headers.forEach((header, colIndex) => {
        const th = document.createElement('th');
        th.className = 'editable header-cell p-2 border';
        th.contentEditable = true;
        th.textContent = header;
        th.dataset.col = colIndex;

        th.addEventListener('blur', (e) => {
            spreadsheetData.headers[colIndex] = e.target.textContent;
        });

        headerRow.appendChild(th);
    });
}

// Render data rows
function renderRows() {
    sheetBody.innerHTML = '';

    spreadsheetData.rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            td.className = 'editable p-2 border';
            td.contentEditable = true;
            td.textContent = cell;

            td.addEventListener('blur', (e) => {
                spreadsheetData.rows[rowIndex][colIndex] = e.target.textContent;
            });

            tr.appendChild(td);
        });

        sheetBody.appendChild(tr);
    });
}

// Helper to load data
function loadJsonData(data) {
    if (Array.isArray(data) && data.length === 0) {
        // Default empty structure
        spreadsheetData = {
            headers: ['Column 1', 'Column 2', 'Column 3'],
            rows: [['', '', ''], ['', '', ''], ['', '', '']]
        };
    } else if (data && data.headers && data.rows) {
        spreadsheetData = data;
    } else {
        // Fallback for raw array or unknown structure
        spreadsheetData = {
            headers: ['Column 1', 'Column 2', 'Column 3'],
            rows: [['', '', ''], ['', '', ''], ['', '', '']]
        };
    }
    renderHeaders();
    renderRows();
}

// Add a new column
function addColumn() {
    spreadsheetData.headers.push(`Column ${spreadsheetData.headers.length + 1}`);
    spreadsheetData.rows.forEach(row => row.push(''));
    renderHeaders();
    renderRows();
}

// Add a new row
function addRow() {
    const newRow = new Array(spreadsheetData.headers.length).fill('');
    spreadsheetData.rows.push(newRow);
    renderRows();
}

// Send prompt to AI
async function sendPrompt() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Add user message to chat
    addMessage('user', prompt);
    promptInput.value = '';

    try {
        // Show loading message
        const loadingId = `loading-${Date.now()}`;
        addMessage('ai', 'Processing your request...', loadingId);

        // Send data to main process for AI processing
        // Using invoke as per new preload
        const result = await window.numeriAPI.sendToAI({
            currentData: spreadsheetData, // Changed to match main.js payload
            prompt: prompt
        });

        // Remove loading message (simple way since we await)
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (result.success) {
            if (result.action === "file_created") {
                alert(`🎉 File Baru Dibuat: ${result.filename}`);
                renderSidebar(result.files); // Update sidebar
                loadJsonData(result.data);   // Tampilkan data baru
                currentFileNameEl.textContent = result.filename; // Update label
                addMessage('ai', `I've created a new file for you: ${result.filename}`);
            } else {
                // Mode modifikasi biasa (tampilkan diff/data)
                loadJsonData(result.data);
                addMessage('ai', 'I\'ve updated your spreadsheet based on your request.');
            }
        } else {
            addMessage('ai', `Error: ${result.error}`, null, 'text-red-600');
        }

    } catch (error) {
        console.error('Error processing AI request:', error);
        addMessage('ai', `Error: ${error.message}`, null, 'text-red-600');
    }
}

// Add message to chat
function addMessage(role, content, id = null, customClass = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-2 p-2 rounded ${role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'} ${customClass}`;
    messageDiv.textContent = content;

    if (id) {
        messageDiv.id = id;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- File System Logic ---

// Render Sidebar
function renderSidebar(files) {
    fileListContainer.innerHTML = '';
    if (!files || files.length === 0) {
        fileListContainer.innerHTML = '<div class="text-gray-500 text-sm italic px-2">No JSON files found</div>';
        return;
    }

    files.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded cursor-pointer text-sm text-gray-300 hover:text-white transition-colors';
        fileDiv.innerHTML = '<span>📄</span> ' + file;
        fileDiv.addEventListener('click', async () => {
            const res = await window.numeriAPI.readFile(file);
            if (res.success) {
                loadJsonData(res.content);
                currentFileNameEl.textContent = file;
                addMessage('ai', `Loaded file: ${file}`);
            } else {
                addMessage('ai', `Error loading file: ${res.error}`, null, 'text-red-600');
            }
        });
        fileListContainer.appendChild(fileDiv);
    });
}

// Open Folder
openFolderBtn.addEventListener('click', async () => {
    const result = await window.numeriAPI.selectFolder();
    if (!result.canceled) {
        renderSidebar(result.files);
        addMessage('ai', `Opened folder: ${result.path}`);
    }
});

// New File
if (newFileBtn) {
    newFileBtn.addEventListener('click', async () => {
        const filename = prompt("Masukkan nama file baru (contoh: stok.json):");
        if (!filename) return;

        try {
            const result = await window.numeriAPI.createFile(filename);

            if (result.success) {
                // Refresh Sidebar
                renderSidebar(result.files);
                // Load file baru
                loadJsonData([]); // Reset grid ke kosong
                currentFileNameEl.textContent = filename;
                addMessage('ai', `Created and loaded file: ${filename}`);
            } else {
                alert("Gagal: " + result.error);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    });
}

// Event Listeners
addColBtn.addEventListener('click', addColumn);
addRowBtn.addEventListener('click', addRow);
sendPromptBtn.addEventListener('click', sendPrompt);
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendPrompt();
    }
});

// Initialize the spreadsheet when the DOM is loaded
document.addEventListener('DOMContentLoaded', initSpreadsheet);
