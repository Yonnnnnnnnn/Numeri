const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('numeriAPI', {
    sendToAI: (data) => ipcRenderer.invoke('send-to-ai', data),
    selectFolder: () => ipcRenderer.invoke('dialog:openFile'),
    readFile: (filename) => ipcRenderer.invoke('file:read', filename),
    createFile: (filename) => ipcRenderer.invoke('file:create', filename)
});
