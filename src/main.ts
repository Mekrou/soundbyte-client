import { app, BrowserWindow, globalShortcut, Tray, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { ipcMain } from 'electron';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let overlayWindow: BrowserWindow

ipcMain.on('resize-window', (event, { width, height }) => {
  if (overlayWindow) overlayWindow.setContentSize(500, Math.max(100, Math.ceil(height)));
});

let tray

const createWindow = () => {
  // // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.hide();

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  overlayWindow = new BrowserWindow({
    width: 500,
    height: 500,
    frame: false,          // Removes window borders
    transparent: false,     // Makes window background transparent
    alwaysOnTop: true,     // Keeps window above other apps
    skipTaskbar: true,     // Don’t show in taskbar
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + '?route=search');
  } else {
    overlayWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      {
        query: { route: 'search' }
      }
    );
  }

  overlayWindow.hide();

  // Register hot-key to launch search
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide()
    } else {
      overlayWindow.show();
      overlayWindow.focus();
      overlayWindow.webContents.send('focus-input');
    }
  })

  // TRAY SETUP:
  const iconName = 'logo.png';
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', iconName)
    : path.join(__dirname, '../../assets', iconName);

  tray = new Tray(iconPath);
  tray.setToolTip('Soundbyte Client')

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])
  tray.setContextMenu(trayMenu);

  tray.on('click', () => {
    mainWindow.show();
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});