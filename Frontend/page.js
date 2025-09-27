const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capture");
const deleteBtn = document.getElementById("deleteBtn") || document.getElementById("retake");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const form = document.getElementById("userForm");
const submitBtn = document.getElementById("submitBtn");
const imagesContainer = document.getElementById("imagesContainer");
const previewOverlay = document.getElementById("imagePreviewOverlay");
const previewImage = document.getElementById("previewImage");


let imagesArray = [];
let stream;


// Utility: Show/hide status message
function showStatusMessage(msg, isError = false) {
  let statusMsg = document.getElementById('statusMessage');
  if (!statusMsg) {
    statusMsg = document.createElement('div');
    statusMsg.id = 'statusMessage';
    canvas.parentNode.insertBefore(statusMsg, canvas.nextSibling);
  }
  statusMsg.textContent = msg;
  statusMsg.className = isError ? 'error' : '';
  statusMsg.style.display = 'block';
}
function hideStatusMessage() {
  const statusMsg = document.getElementById('statusMessage');
  if (statusMsg) statusMsg.style.display = 'none';
}

// Enable submit only if all fields are filled and at least 1 image
function checkFormReady() {
  const name = form.elements['name'].value.trim();
  const id = form.elements['id'].value.trim();
  const bed = form.elements['bed'].value.trim();
  const hasImage = imagesArray.length > 0;
  submitBtn.disabled = !(name && id && bed && hasImage);
}
['name','id','bed'].forEach(field => form.elements[field].addEventListener('input', checkFormReady));

// Camera start
startCameraBtn.onclick = async () => {
  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
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

// Controls below video/canvas
const controlsDiv = document.createElement('div');
controlsDiv.className = 'video-controls';
controlsDiv.appendChild(deleteBtn);
let saveBtn = document.getElementById('saveBtn');
if (!saveBtn) {
  saveBtn = document.createElement('button');
  saveBtn.id = 'saveBtn';
  saveBtn.textContent = 'Save';
  saveBtn.type = 'button';
}
controlsDiv.appendChild(saveBtn);
video.parentNode.insertBefore(controlsDiv, video.nextSibling);
canvas.parentNode.insertBefore(controlsDiv, canvas.nextSibling);
controlsDiv.style.display = 'none';

// Capture photo
captureBtn.onclick = () => {
  hideStatusMessage();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
  previewImg.src = imageData;
  previewImg.style.display = 'block';
  video.style.display = 'none';
  canvas.style.display = 'none';
  controlsDiv.style.display = 'flex';
  deleteBtn.style.display = 'inline-block';
  saveBtn.style.display = 'inline-block';
  captureBtn.style.display = 'none';

  saveBtn.onclick = () => {
    imagesArray.push(imageData);
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    const img = document.createElement('img');
    img.src = imageData;
    img.title = "Click to preview";
    img.onclick = () => {
      previewImage.src = img.src;
      previewOverlay.style.display = "flex";
    };
    const galleryDeleteBtn = document.createElement('span');
    galleryDeleteBtn.className = 'delete-icon';
    galleryDeleteBtn.innerHTML = '&times;';
    galleryDeleteBtn.title = 'Delete Image';
    galleryDeleteBtn.onclick = () => {
      const index = imagesArray.indexOf(imageData);
      if (index > -1) imagesArray.splice(index, 1);
      imagesContainer.removeChild(wrapper);
      checkFormReady();
    };
    wrapper.appendChild(img);
    wrapper.appendChild(galleryDeleteBtn);
    imagesContainer.appendChild(wrapper);
    canvas.style.display = 'none';
    video.style.display = 'block';
    controlsDiv.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    previewImg.style.display = 'none';
    showStatusMessage('Photo saved! Capture next or close camera.');
    checkFormReady();
  };

  deleteBtn.onclick = () => {
    canvas.style.display = 'none';
    video.style.display = 'block';
    controlsDiv.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    previewImg.style.display = 'none';
    hideStatusMessage();
  };
};

previewOverlay.onclick = () => {
  previewOverlay.style.display = "none";
};

form.onsubmit = function(e) {
  const name = form.elements['name'].value.trim();
  const id = form.elements['id'].value.trim();
  const bed = form.elements['bed'].value.trim();
  if (!name) {
    alert('Please enter your name.');
    e.preventDefault();
    return false;
  }
  if (isNaN(Number(id))) {
    alert('Please enter a valid number for ID.');
    e.preventDefault();
    return false;
  }
  if (bed === '') {
    alert('Please enter your bed info.');
    e.preventDefault();
    return false;
  }
  if (!isNaN(Number(name))) {
    alert('Name should not be a number. Please enter your real name.');
    e.preventDefault();
    return false;
  }
  // Log all info to console
  console.log({
    name,
    id: Number(id),
    bed,
    images: imagesArray
  });
  // Prevent actual form submission for demo
  e.preventDefault();
  return false;
};
