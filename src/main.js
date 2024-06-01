const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { processPhotos } = require('./photoBooth');

const { loadTemplateConfig } = require('./templateHandler');
const { loadPrinterConfig } = require('./printerHandler');
const { sendImage } = require('./sendImages');

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

let globalPhoneNumber;

ipcMain.on('process-photos', async (event, { photoDataArray }) => {
  const templateConfig = loadTemplateConfig();
  const { printerFinalImagePath, instagramFinalImagePath } = await processPhotos(photoDataArray, templateConfig);
  event.reply('photo-session-complete', printerFinalImagePath);

  const printerConfig = loadPrinterConfig();
  const win = BrowserWindow.fromWebContents(event.sender);
  win.webContents.print({
    silent: true,
    printBackground: true,
    deviceName: printerConfig.printerName
  }, (success, errorType) => {
    if (!success) console.log(errorType);
  });

  console.log('globalPhoneNumber', globalPhoneNumber)
  if (globalPhoneNumber) {
    const inputImagePath = path.join(__dirname, 'path_to_your_image.jpg');
    sendImage(globalPhoneNumber, instagramFinalImagePath);
  }
});

ipcMain.on('send-phone-number', (event, phoneNumber) => {
  console.log('send-phone-number', phoneNumber)
  globalPhoneNumber = phoneNumber;
});
