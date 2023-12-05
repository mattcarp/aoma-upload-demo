let dragDropArea;
let fileInfoDisplay;
let speedChart; // Declare speedChart globally

async function getSignedUrl(filename, contentType) {
  try {
    const response = await fetch(
      `http://localhost:3000/generate-signed-url?filename=${encodeURIComponent(
        filename
      )}&contentType=${encodeURIComponent(contentType)}`
    );
    if (response.ok) {
      const data = await response.json();
      console.log("signed url, from within getSignedUrl: ", data.signedUrl);
      return data.signedUrl;
    } else {
      console.error(
        "Server responded with an error:",
        response.status,
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Failed to get signed URL:", error.message);
    return null;
  }
}

fetch("/api/speedtest")
  .then((response) => response.json())
  .then((data) => {
    displaySpeed(data.speed);
  })
  .catch((error) => console.error("Error fetching the speed:", error));

  function displaySpeed(speed) {
    const speedElement = document.getElementById("internet-speed-value"); // Updated ID
    speedElement.textContent = `${speed.toFixed(4)} Mbps`;
  }

function updateSpeedChart(chart, speed) {
  const currentTime = new Date().toLocaleTimeString();
  chart.data.labels.push(currentTime);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(speed);
  });
  chart.update();
}

function calculateSpeed(bytesUploaded, startTime) {
  const duration = (new Date().getTime() - startTime) / 1000;
  return bytesUploaded / duration / 1024;
}

async function uploadFile(file) {
  console.log("called uploadFile:", file.name, file.type);

  const url = await getSignedUrl(file.name, file.type);
  if (!url) {
    console.error("No signed URL returned.");
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-Type", file.type);

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      document.getElementById("percent-complete-value").innerText = percentComplete.toFixed(2) + "%"; // Updated ID

      const speed = calculateSpeed(e.loaded, new Date().getTime());
      document.getElementById("internet-speed-value").innerText = speed.toFixed(2) + " KB/s"; // Updated ID
      updateSpeedChart(speedChart, speed);
    }
  };

  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log("File uploaded successfully");
    } else {
      console.error("Upload failed:", xhr.responseText);
    }
  };

  xhr.onerror = function () {
    console.error("Error during the upload process.");
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log("Upload complete");
      resetUploadButton();
    }
  };

  console.log("about to send file");
  xhr.send(file);
}

function handleDragOver(e) {
  e.preventDefault();
  dragDropArea.classList.add("active");
}

function handleFileDrop(e) {
  e.preventDefault();
  const files = e.dataTransfer.files;
  displayFileInfo(files[0]);
  resetDragDropArea();
}

function resetDragDropArea() {
  dragDropArea.classList.remove("active");
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  displayFileInfo(file);
  document.getElementById("upload-button").disabled = !file;
  resetUploadDisplay();
}

function displayFileInfo(file) {
  const selectedFileDisplay = document.getElementById("selected-file-value");
  if (file) {
    selectedFileDisplay.textContent = file.name;
  } else {
    selectedFileDisplay.textContent = "No file chosen";
  }
}

function triggerFileSelect() {
  document.getElementById("file-input").click();
}

function resetUploadDisplay() {
  const uploadPercentage = document.getElementById("percent-complete-value");
  const uploadSpeed = document.getElementById("internet-speed-value");

  // temp comment while bug fixing
  // uploadPercentage.style.opacity = "0";
  // uploadSpeed.style.opacity = "0";

  setTimeout(() => {
    uploadPercentage.style.opacity = "1";
    uploadSpeed.style.opacity = "1";
  }, 3000);
}

function resetUploadButton() {
  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = true;
  fileInfoDisplay.textContent = "";
  document.getElementById("file-input").value = "";
  resetUploadDisplay();
}

window.onload = function () {
  dragDropArea = document.getElementById("drag-drop-area");
  dragDropArea.addEventListener("click", triggerFileSelect);
  dragDropArea.addEventListener("dragover", handleDragOver);
  dragDropArea.addEventListener("drop", handleFileDrop);
  dragDropArea.addEventListener("dragleave", resetDragDropArea);

  fileInfoDisplay = document.getElementById("selected-file-value"); // Ensure this ID is correct.

  const fileInput = document.getElementById("file-input");
  fileInput.addEventListener("change", handleFileSelect);

  const uploadButton = document.getElementById("upload-button");
  uploadButton.addEventListener("click", function () {
      console.log("Upload button clicked", fileInput.files[0]);
      uploadFile(fileInput.files[0]);
  });

  // Speed Chart Initialization with Static Data
  const speedCtx = document.getElementById("speedChart").getContext("2d");
  speedChart = new Chart(speedCtx, {
      type: 'line',
      data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], // Static labels for testing
          datasets: [{
              label: 'Upload Speed (KB/s)',
              data: [12, 19, 3, 5, 2, 3], // Static data for testing
              backgroundColor: 'rgba(0, 123, 255, 0.2)',
              borderColor: 'rgba(0, 123, 255, 1)',
              fill: false,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
              }
          },
          plugins: {
              legend: {
                  display: true,
              }
          },
          responsive: true,
          maintainAspectRatio: true,
      }
  });

  // Donut Chart Initializations with Static Data
  const completionCtx = document.getElementById('completionDonut').getContext('2d');
  const completionChart = new Chart(completionCtx, {
      type: 'doughnut',
      data: {
          labels: ['Complete', 'Incomplete'], // Example labels
          datasets: [{
              data: [70, 30], // Static data for testing
              backgroundColor: [
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(192, 75, 75, 0.2)'
              ],
              borderColor: [
                  'rgba(75, 192, 192, 1)',
                  'rgba(192, 75, 75, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  display: true,
              }
          }
      }
  });

  const speedDonutCtx = document.getElementById('speedDonut').getContext('2d');
  const speedDonutChart = new Chart(speedDonutCtx, {
      type: 'doughnut',
      data: {
          labels: ['Fast', 'Slow'], // Example labels
          datasets: [{
              data: [65, 35], // Static data for testing
              backgroundColor: [
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)'
              ],
              borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  display: true,
              }
          }
      }
  });
};




document.getElementById('chunkSizeSlider').addEventListener('input', function() {
  const chunkSize = this.value * 1024 * 1024;
  document.getElementById('chunkSizeDisplay').textContent = this.value + ' MB';
  console.log('Chunk size set to:', chunkSize, 'bytes');
});

let isPaused = false;
let lastUploadedChunkIndex = 0;

document.getElementById('pause-button').addEventListener('click', function() {
  isPaused = true;
});

document.getElementById('resume-button').addEventListener('click', function() {
  isPaused = false;
  if (fileInput.files.length > 0) {
    continueUploading(fileInput.files[0], lastUploadedChunkIndex);
  }
});

function continueUploading(file, startIndex) {
  const chunkSize = 5 * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSize);
  for (let i = startIndex; i < totalChunks; i++) {
    if (isPaused) {
      lastUploadedChunkIndex = i;
      break;
    }
  }
}
