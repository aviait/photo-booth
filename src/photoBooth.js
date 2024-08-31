const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

async function processPhotos(photoDataArray, templateConfig, phone) {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const captureDir = path.join(__dirname, "captures", `${timestamp}-${phone}`);
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
  }

  const images = await Promise.all(
    photoDataArray.map(async (dataUrl, index) => {
      const buffer = Buffer.from(dataUrl.split(",")[1], "base64");
      const image = await Jimp.read(buffer);
      const photoPath = path.join(captureDir, `photo${index + 1}.jpg`);
      await image.writeAsync(photoPath);
      return image;
    })
  );

  let printerFinalImage;
  let instagramFinalImage;
  if (templateConfig.instagram.templateImage) {
    printerFinalImage = await Jimp.read(templateConfig.print.templateImage);
    instagramFinalImage = await Jimp.read(
      templateConfig.instagram.templateImage
    );
  } else {
    printerFinalImage = new Jimp(1500, 1000, "white");
    instagramFinalImage = new Jimp(1500, 1000, "white");
  }

  images.forEach((image, index) => {
    const { width, height, x, y } = templateConfig.print.photos[index];
    image.resize(width, height);
    printerFinalImage.composite(image, x, y);
  });

  images.forEach((image, index) => {
    const { width, height, x, y } = templateConfig.instagram.photos[index];
    image.resize(width, height);
    instagramFinalImage.composite(image, x, y);
  });

  const printerFinalImagePath = path.join(
    captureDir,
    "printer-final-image.jpg"
  );
  await printerFinalImage.writeAsync(printerFinalImagePath);

  const instagramFinalImagePath = path.join(
    captureDir,
    "printer-instagram-image.jpg"
  );
  await instagramFinalImage.writeAsync(instagramFinalImagePath);

  return { printerFinalImagePath, instagramFinalImagePath };
}

module.exports = { processPhotos };
