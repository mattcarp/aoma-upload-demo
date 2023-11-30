let dragDropArea;
let fileInfoDisplay;
let speedChart; // Declare speedChart globally

async function getSignedUrl(filename, contentType) {
  try {
    const response = await fetch(`http://localhost:3000/generate-signed-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`);
    if (response.ok) {
      const data = await response.json();
      return data.signedUrl;
    } else {
      console.error('Server responded with an error:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Failed to get signed URL:', error.message);
    return null;
  }
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
  const url = await getSignedUrl(file.name, file.type);

  if (!url) {
    console.error("No signed URL returned.");
    return;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);

  const startTime = new Date().getTime();

  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      document.getElementById("uploadPercentage").innerText = percentComplete.toFixed(2) + "%";

      const speed = calculateSpeed(e.loaded, startTime);
      document.getElementById("uploadSpeed").innerText = speed.toFixed(2) + " KB/s";
      updateSpeedChart(speedChart, speed);
    }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log("File uploaded successfully");
    } else {
      console.error("Upload failed:", xhr.responseText);
    }
  };

  xhr.onerror = function() {
    console.error("Error during the upload process.");
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log("Upload complete");
      resetUploadButton();
    }
  };

  xhr.setRequestHeader("Content-Type", file.type);
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
  if (file) {
    fileInfoDisplay.textContent = `Selected file: ${file.name}`;
  } else {
    fileInfoDisplay.textContent = "";
  }
}

function triggerFileSelect() {
  document.getElementById("file-input").click();
}

function resetUploadDisplay() {
  const uploadPercentage = document.getElementById("uploadPercentage");
  const uploadSpeed = document.getElementById("uploadSpeed");

  uploadPercentage.style.opacity = "0";
  uploadSpeed.style.opacity = "0";

  setTimeout(() => {
    uploadPercentage.innerText = "0%";
    uploadSpeed.innerText = "0 KB/s";

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

  fileInfoDisplay = document.getElementById("file-info");
  
  const fileInput = document.getElementById("file-input");
  fileInput.addEventListener("change", handleFileSelect);

  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = true;
  uploadButton.addEventListener("click", function() {
    uploadFile(fileInput.files[0]);
    document.getElementById("speedChart").style.display = "block"; // Show the chart when upload starts
  });

  // Chart Initialization
  var ctx = document.getElementById("speedChart").getContext("2d");
  speedChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Upload Speed (KB/s)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          data: [],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Initially hide the speed chart
  document.getElementById("speedChart").style.display = "none";
};