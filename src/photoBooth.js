const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function processPhotos(photoDataArray, templateConfig) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const captureDir = path.join(__dirname, 'captures', timestamp);
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
  }

  const images = await Promise.all(photoDataArray.map(async (dataUrl, index) => {
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');
    const image = await Jimp.read(buffer);
    const photoPath = path.join(captureDir, `photo${index + 1}.jpg`);
    await image.writeAsync(photoPath);
    return image;
  }));

  let finalImage;
  if (templateConfig.templateImage) {
    finalImage = await Jimp.read(templateConfig.templateImage);
  } else {
    finalImage = new Jimp(1500, 1000, 'white');
  }

  images.forEach((image, index) => {
    const { width, height, x, y } = templateConfig.photos[index];
    image.resize(width, height);
    finalImage.composite(image, x, y);
  });

  const finalImagePath = path.join(captureDir, 'final-image.jpg');
  await finalImage.writeAsync(finalImagePath);
  return finalImagePath;
}

module.exports = { processPhotos };
