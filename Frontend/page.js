const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capture");
const retakeBtn = document.getElementById("retake");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");
const imagesContainer = document.getElementById("imagesContainer");
const previewOverlay = document.getElementById("imagePreviewOverlay");
const previewImage = document.getElementById("previewImage");
const faceStatus = document.getElementById("faceStatus");


let imagesArray = [];
let stream;
let lastImageData = null;


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
    retakeBtn.style.display = "none";
    faceStatus.textContent = '';
  } catch (err) {
    alert("Failed to access camera: " + err.message);
  }
};


// Place Save and Retake buttons below the video/canvas
const controlsDiv = document.createElement('div');
controlsDiv.className = 'video-controls';
controlsDiv.appendChild(retakeBtn);
let saveBtn = document.getElementById('saveBtn');
if (!saveBtn) {
  saveBtn = document.createElement('button');
  saveBtn.id = 'saveBtn';
  saveBtn.textContent = 'Save';
  saveBtn.type = 'button';
}
controlsDiv.appendChild(saveBtn);

// Insert controlsDiv after video and canvas
video.parentNode.insertBefore(controlsDiv, video.nextSibling);
canvas.parentNode.insertBefore(controlsDiv, canvas.nextSibling);

// Hide controls initially
controlsDiv.style.display = 'none';

// Ensure status message is always after both video and canvas
let statusMsg = document.getElementById('statusMessage');
if (!statusMsg) {
  statusMsg = document.createElement('div');
  statusMsg.id = 'statusMessage';
}
// Always insert after canvas (so it's below both video and canvas)
canvas.parentNode.insertBefore(statusMsg, canvas.nextSibling);

function showStatusMessage(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className = isError ? 'error' : '';
  statusMsg.style.display = 'block';
}
function hideStatusMessage() {
  statusMsg.style.display = 'none';
}

// Simple capture photo (no blur/face check)
captureBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show preview of captured image using a real <img> for clarity
  let previewImg = document.getElementById('capturePreviewImg');
  if (!previewImg) {
    previewImg = document.createElement('img');
    previewImg.id = 'capturePreviewImg';
    previewImg.style.display = 'block';
    previewImg.style.maxWidth = '100%';
    previewImg.style.margin = '0 auto 12px auto';
    canvas.parentNode.insertBefore(previewImg, canvas.nextSibling);
  }
  const imageData = canvas.toDataURL("image/png");
  lastImageData = imageData;
  previewImg.src = imageData;
  previewImg.style.display = 'block';
  video.style.display = 'none';
  canvas.style.display = 'none';

  // Show Delete and Save buttons below
  controlsDiv.style.display = 'flex';
  deleteBtn.style.display = 'inline-block';
  saveBtn.style.display = 'inline-block';
  captureBtn.style.display = 'none';

  // Save handler
  saveBtn.onclick = () => {
    imagesArray.push(imageData);
    // Add to gallery
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    const img = document.createElement('img');
    img.src = imageData;
    img.title = "Click to preview";
    img.onclick = () => {
      previewImage.src = img.src;
      previewOverlay.style.display = "flex";
    };
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
      checkFormReady();
    };
    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);
    imagesContainer.appendChild(wrapper);
    // Reset UI for next capture
    canvas.style.display = 'none';
    video.style.display = 'block';
    controlsDiv.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    previewImg.style.display = 'none';
    showStatusMessage('Photo saved! Capture next or close camera.');
    checkFormReady();
  };

  // Retake handler
  retakeBtn.onclick = () => {
    canvas.style.display = 'none';
    video.style.display = 'block';
    controlsDiv.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    previewImg.style.display = 'none';
    hideStatusMessage();
  };

  // Hide the status message when starting a new capture
  hideStatusMessage();
};

// Close image preview overlay on click
previewOverlay.onclick = () => {
  previewOverlay.style.display = "none";
};

// Change Retake button to Delete and make it red
retakeBtn.textContent = 'Delete';
retakeBtn.id = 'deleteBtn';
retakeBtn.style.background = '#dc3545';
retakeBtn.style.color = '#fff';

function checkFormReady() {
  const name = form.elements['name'].value.trim();
  const id = form.elements['id'].value.trim();
  const bed = form.elements['bed'].value.trim();
  const hasImage = imagesArray.length > 0;
  if (name && id && bed && hasImage) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// Listen for input changes
form.elements['name'].addEventListener('input', checkFormReady);
form.elements['id'].addEventListener('input', checkFormReady);
form.elements['bed'].addEventListener('input', checkFormReady);
