const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { processPhotos } = require("./photoBooth");

const { loadTemplateConfig } = require("./templateHandler");
const { loadPrinterConfig } = require("./printerHandler");
const { sendImage } = require("./sendImages");

function processPhoneNumber(phoneNumber) {
  phoneNumber = phoneNumber.toString();
  let modifiedPhoneNumber = phoneNumber;

  // Remove the 4th digit (index 3)
  if (phoneNumber.length > 3) {
    modifiedPhoneNumber = phoneNumber.slice(0, 4) + phoneNumber.slice(5);
  }

  return [phoneNumber, modifiedPhoneNumber];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let globalPhoneNumber;

ipcMain.on("process-photos", async (event, { photoDataArray }) => {
  const templateConfig = loadTemplateConfig();
  const { printerFinalImagePath, instagramFinalImagePath } =
    await processPhotos(photoDataArray, templateConfig);
  event.reply("photo-session-complete", printerFinalImagePath);

  // const printerConfig = loadPrinterConfig();

  // const printWindow = new BrowserWindow({
  //   width: 1080, // 6 inches at 300 DPI
  //   height: 720, // 4 inches at 300 DPI
  //   show: false,
  //   webPreferences: {
  //     offscreen: false,
  //   },
  // });

  // const htmlContent = `
  //   <!DOCTYPE html>
  //   <html>
  //     <head>
  //       <style>
  //         body, html {
  //           margin: 0;
  //           padding: 0;
  //           width: 100%;
  //           height: 100%;
  //           display: flex;
  //           justify-content: center;
  //           align-items: center;
  //           background-color: white; /* Evita bordas pretas */
  //         }
  //         img {
  //           width: 100%;
  //           height: 100%;
  //           object-fit: contain; /* Garante que a imagem seja ajustada corretamente */
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <img src="file://${printerFinalImagePath}" />
  //     </body>
  //   </html>
  // `;

  // const tempHtmlPath = path.join(__dirname, "temp.html");
  // require("fs").writeFileSync(tempHtmlPath, htmlContent);

  // printWindow.loadFile(tempHtmlPath).then(() => {
  //   printWindow.webContents.print(
  //     {
  //       silent: true,
  //       printBackground: true,
  //       deviceName: printerConfig.printerName,
  //       margins: {
  //         marginType: "none", // No margins
  //       },
  //       landscape: false,
  //       pagesPerSheet: 1,
  //       scale: 100, // Scale to 100% to maintain the original size
  //     },
  //     (success, errorType) => {
  //       if (!success) console.log(errorType);
  //       printWindow.close();
  //     }
  //   );
  // });

  // printWindow.loadURL(`file://${printerFinalImagePath}`).then(() => {
  //   printWindow.webContents.print(
  //     {
  //       silent: true,
  //       printBackground: true,
  //       deviceName: printerConfig.printerName,
  //       margins: {
  //         marginType: "none", // No margins
  //       },
  //       landscape: false,
  //       pagesPerSheet: 1,
  //       scale: 100, // Scale to 100% to maintain the original size
  //     },
  //     (success, errorType) => {
  //       if (!success) console.log(errorType);
  //       printWindow.close();
  //     }
  //   );
  // });

  console.log("globalPhoneNumber", globalPhoneNumber);
  if (globalPhoneNumber) {
    const inputImagePath = path.join(__dirname, "path_to_your_image.jpg");
    const phones = processPhoneNumber(globalPhoneNumber);

    for (const phone of phones) {
      console.log({ phone });
      sendImage(phone, instagramFinalImagePath);
      await sleep(1000);
      sendImage(phone, printerFinalImagePath);
      await sleep(1000);
    }
  }
});

ipcMain.on("send-phone-number", (event, phoneNumber) => {
  console.log("send-phone-number", phoneNumber);
  globalPhoneNumber = phoneNumber;
});
