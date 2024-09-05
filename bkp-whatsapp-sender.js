const fs = require('fs');
const path = require('path');
const axios = require('axios');

const capturesPath = path.join(__dirname, 'src', 'captures');

const phonesNotSend = []

const text = `Olá, a paz do Senhor! 🙏 Espero que você tenha sido abençoado por nossos dias de conferência. Estamos te encaminhando a foto que tiramos na cabine fotográfica. Espero que tenha gostado!

Se precisar de mais informações sobre a cabine fotográfica ou desejar algo mais, fique à vontade para entrar em contato com o Enoque pelo telefone/whatsapp (83) 98676-6112.

Deus abençoe e até a próxima!

*Conferência Missionária 2024*
`

function aletatoryTime() {
    return Math.random() * 10000
}

const invalidNumbers = []; // Array para armazenar números inválidos

function processNumber(input) {
    const cleanedInput = input.replace(/\D/g, '');

    if(!phonesNotSend.includes(cleanedInput)) return ''

    if (cleanedInput.length === 13) {
        const correctedNumber = cleanedInput.slice(0, 4) + cleanedInput.slice(5);
        console.log(`Número ajustado para 12 dígitos: ${correctedNumber}`);
        return correctedNumber
    } else if (cleanedInput.length === 12) {
        console.log(`Número de 12 dígitos: ${cleanedInput}`);
        console.log(cleanedInput)
    } else {
        invalidNumbers.push(input);
        return '';
    }
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
            message: text
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

        if (fs.existsSync(imagePath) && whatsappNumber && whatsappNumber.length > 0 && !!processNumber(whatsappNumber)) {
            const base64Image = convertImageToBase64(imagePath);
            await sendImageBase64(base64Image, whatsappNumber);
            await sleep(aletatoryTime());
            await sendImageBase64(base64Image, processNumber(whatsappNumber));
            await sleep(aletatoryTime());
        } else {
            console.warn(`Imagem não encontrada para a pasta ${folder}`);
        }
    }

    console.log(invalidNumbers)
};

main();
