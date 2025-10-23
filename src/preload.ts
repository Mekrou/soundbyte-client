// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    onFocusInput: (callback: () => void) => ipcRenderer.on('focus-input', callback),
    sendResize: (size: { width: number, height: number }) => ipcRenderer.send('resize-window', size)
});
