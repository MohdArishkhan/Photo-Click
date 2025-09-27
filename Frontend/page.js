const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capture");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");
const imagesContainer = document.getElementById("imagesContainer");
const previewOverlay = document.getElementById("imagePreviewOverlay");
const previewImage = document.getElementById("previewImage");

let imagesArray = [];
let stream;

// Start camera stream
startCameraBtn.onclick = async () => {
  try {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      stream = null;
    }
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    captureBtn.disabled = false;
    video.style.display = "block";
  } catch (err) {
    alert("Failed to access camera: " + err.message);
  }
};

// Capture photo
captureBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png");
  imagesArray.push(imageData);

  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.className = 'image-wrapper';

  // Create img element
  const img = document.createElement('img');
  img.src = imageData;
  img.title = "Click to preview";

  // Click image to preview large
  img.onclick = () => {
    previewImage.src = img.src;
    previewOverlay.style.display = "flex";
  };

  // Create delete button
  const deleteBtn = document.createElement('span');
  deleteBtn.className = 'delete-icon';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.title = 'Delete Image';
  deleteBtn.onclick = () => {
    const index = imagesArray.indexOf(imageData);
    if (index > -1) {
      imagesArray.splice(index, 1);
    }
    imagesContainer.removeChild(wrapper);
  };

  wrapper.appendChild(img);
  wrapper.appendChild(deleteBtn);
  imagesContainer.appendChild(wrapper);

  submitBtn.disabled = false;
};

// Close image preview overlay on click
previewOverlay.onclick = () => {
  previewOverlay.style.display = "none";
};

// Optionally add your form submit logic here
