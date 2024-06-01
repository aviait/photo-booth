const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { ipcRenderer } = require('electron');

// Function to convert image to base64
function convertImageToBase64(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

async function sendImage(phoneNumber, imagePath) {
    try {
        const imageBase64 = await convertImageToBase64(imagePath);
        const payload = {
            phoneNumber: phoneNumber,
            imageBase64: `data:image/jpeg;base64,${imageBase64}`
        };
        const response = await axios.post('http://localhost:3000/send-image', payload);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error);
    }
}


module.exports = { sendImage };
