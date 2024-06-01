const express = require('express');
const bodyParser = require('body-parser');
const venom = require('venom-bot');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

venom
    .create({
        session: 'teste' //name of session
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

function start(client) {
    app.post('/send-image', async (req, res) => {
        const { imageBase64, phoneNumber } = req.body;

        if (!imageBase64 || !phoneNumber) {
            return res.status(400).send({ message: 'Image base64 and phone number are required.' });
        }

        try {
            await client.sendFileFromBase64(
                `${phoneNumber}@c.us`,
                imageBase64,
                'foto-congresso-umad-setor15.png',
                ''
            )

            res.send({ message: 'Image sent successfully.' });
        } catch (error) {
            console.error('Send image error:', error);
            res.status(500).send({ message: 'Failed to send image.' });
        }
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
