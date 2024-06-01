const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  capturePhoto: async (photoNumber) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    await videoElement.play();

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach(track => track.stop());

    const dataUrl = canvas.toDataURL('image/jpeg');
    return dataUrl;
  },
  sendPhotos: (photoDataArray) => ipcRenderer.send('process-photos', { photoDataArray }),
  onPhotoSessionComplete: (callback) => ipcRenderer.on('photo-session-complete', (event, finalImagePath) => callback(finalImagePath)),
  sendPhoneNumber: () => {
    const phoneNumber = document.getElementById('phone-number').value;
    ipcRenderer.send('send-phone-number', phoneNumber);
  }
});
