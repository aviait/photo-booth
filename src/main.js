const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { processPhotos } = require('./photoBooth');
const { loadTemplateConfig } = require('./templateHandler');
const { loadPrinterConfig } = require('./printerHandler');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('process-photos', async (event, { photoDataArray }) => {
  const templateConfig = loadTemplateConfig();
  const finalImagePath = await processPhotos(photoDataArray, templateConfig);
  event.reply('photo-session-complete', finalImagePath);

  const printerConfig = loadPrinterConfig();
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.print({
    silent: true,
    printBackground: true,
    deviceName: printerConfig.printerName
  }, (success, errorType) => {
    if (!success) console.log(errorType);
  });
});
