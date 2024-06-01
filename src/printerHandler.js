const fs = require('fs');
const path = require('path');

function loadPrinterConfig() {
  const configPath = path.join(__dirname, '../config/printerConfig.json');
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath);
    return JSON.parse(configData);
  } else {
    throw new Error('Printer configuration file not found');
  }
}

module.exports = { loadPrinterConfig };
