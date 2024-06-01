const fs = require('fs');
const path = require('path');

function loadTemplateConfig() {
  const configPath = path.join(__dirname, '../config/template-umad.json');
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath);
    return JSON.parse(configData);
  } else {
    throw new Error('Template configuration file not found');
  }
}

module.exports = { loadTemplateConfig };
