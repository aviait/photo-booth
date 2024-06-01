document.addEventListener('DOMContentLoaded', async () => {
  const startButton = document.getElementById('start-button');
  const status = document.getElementById('status');
  const finalImage = document.getElementById('final-image');
  const carousel = document.getElementById('carousel');
  const videoContainer = document.getElementById('video-container');
  const videoElement = document.getElementById('video');
  const countdown = document.getElementById('countdown');
  const sessionPhotos = document.getElementById('session-photos');
  const steps = document.querySelectorAll('.step');

  let currentStep = 0;


  function sendPhoneNumberToMain() {
    const phoneNumber = document.getElementById('phone-number').value;
    ipcRenderer.send('send-phone-number', phoneNumber);
  }

  function showStep(step) {
    steps.forEach((el, index) => {
      el.style.display = index === step ? 'block' : 'none';
    });
    currentStep = step;
  }

  async function startCountdown(seconds) {
    countdown.style.display = 'block';
    countdown.innerText = 'Sorria';
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = seconds; i > 0; i--) {
      countdown.innerText = i;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    countdown.style.display = 'none';
  }

  function resetPhotos() {
    while (carousel.firstChild) {
      carousel.removeChild(carousel.firstChild);
    }
    while (sessionPhotos.firstChild) {
      sessionPhotos.removeChild(sessionPhotos.firstChild);
    }
    finalImage.src = '';
  }

  async function startPhotoSession() {
    // sendPhoneNumberToMain();
    resetPhotos();
    console.log('Start button clicked');
    status.innerText = 'Starting photo session...';
    showStep(1);

    const photoDataArray = [];
    for (let i = 1; i <= 3; i++) {
      status.innerText = `Capturing photo ${i}...`;
      await startCountdown(3);

      console.log(`Capturing photo ${i}`);
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL('image/jpeg');
      photoDataArray.push(photoData);

      status.innerText = `Photo ${i} captured`;

      const imgElement = document.createElement('img');
      imgElement.src = photoData;
      imgElement.setAttribute("class", "photo-captured");
      sessionPhotos.appendChild(imgElement);

      // Exibe a foto capturada no lugar da webcam por 1 segundo
      videoElement.style.display = 'none';
      const capturedImage = document.createElement('img');
      capturedImage.src = photoData;
      videoContainer.appendChild(capturedImage);
      await new Promise(resolve => setTimeout(resolve, 1000));
      videoContainer.removeChild(capturedImage);
      videoElement.style.display = 'block';

      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s display time
    }

    window.electron.sendPhotos(photoDataArray);
  }

  async function initWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  }

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      startPhotoSession();
    }
  });

  startButton.addEventListener('click', startPhotoSession);

  window.electron.onPhotoSessionComplete((finalImagePath) => {
    const status = document.getElementById('status');
    const finalImage = document.getElementById('final-image');
    status.innerText = 'Photo session complete';
    finalImage.src = finalImagePath;
    showStep(3);
  });

  showStep(0);
  await initWebcam();
});
