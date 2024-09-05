const fs = require('fs');
const path = require('path');
const axios = require('axios');

const capturesPath = path.join(__dirname, 'src', 'captures');

function aletatoryTime() {
    return Math.random() * 10000
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

const listFolders = (dir) => {
    return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
};

const convertImageToBase64 = (imagePath) => {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
};

const sendImageBase64 = async (base64Image, whatsappNumber) => {
    try {
        const response = await axios.post('https://api.whatsapp.aviait.com.br/send-image', {
            sessionName: "semadpb",
            phoneNumber: whatsappNumber,
            imageBase64: base64Image,
            message: `Olá`
        });

        console.log(`Imagem enviada para ${whatsappNumber}:`, response.data);
        return response
    } catch (error) {
        console.error(`Erro ao enviar imagem para ${whatsappNumber}:`, error.message);
        console.log({
            data: error.response.data,
            status: error.response.status,
        });
    }
};

const main = async () => {
    const folders = listFolders(capturesPath);

    for (const folder of folders) {
        const parts = folder.split('-');
        const whatsappNumber = parts[parts.length - 1];

        const imagePath = path.join(capturesPath, folder, 'printer-final-image.jpg');

        if (fs.existsSync(imagePath) && whatsappNumber && whatsappNumber.length > 0) {
            const base64Image = convertImageToBase64(imagePath);
            await sendImageBase64(base64Image, whatsappNumber);
            await sleep(aletatoryTime());
        } else {
            console.warn(`Imagem não encontrada para a pasta ${folder}`);
        }
    }
};

main();
