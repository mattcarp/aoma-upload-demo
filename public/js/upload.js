let dragDropArea;
let fileInfoDisplay;
let speedChart; // Declare speedChart globally

async function getSignedUrl(filename, contentType) {
  const response = await fetch(
    `http://localhost:3000/generate-signed-url?filename=${encodeURIComponent(
      filename
    )}&contentType=${encodeURIComponent(contentType)}`
  );
  if (response.ok) {
    const data = await response.json();
    return data.signedUrl; // This is the signed URL
  } else {
    throw new Error("Failed to get signed URL");
  }
}

function updateSpeedChart(chart, speed) {
  chart.data.labels.push(""); // Add empty label for each data point
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(speed);
  });
  chart.update();
}

function calculateSpeed(bytesUploaded, startTime) {
  const duration = (new Date().getTime() - startTime) / 1000; // Time in seconds
  return bytesUploaded / duration / 1024; // Speed in KB/s
}

async function uploadFile() {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (!file) {
    console.error("No file selected");
    return;
  }

  const signedUrl = await getSignedUrl(file.name, file.type);
  const xhr = new XMLHttpRequest();
  const startTime = new Date().getTime();
  document.getElementById("uploadPercentage").style.opacity = "1";
  document.getElementById("uploadSpeed").style.opacity = "1";
  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      document.getElementById(
        "uploadPercentage"
      ).innerText = `${percentComplete.toFixed(2)}%`;

      const speed = calculateSpeed(event.loaded, startTime);
      document.getElementById("uploadSpeed").innerText = `${speed.toFixed(
        2
      )} KB/s`;
      updateSpeedChart(speedChart, speed);
    }
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log("Upload complete");
      resetUploadButton();
    }
  };

  xhr.open("PUT", signedUrl, true);
  xhr.setRequestHeader("Content-Type", file.type);
  xhr.send(file);
  document.getElementById("speedChart").style.display = "block"; // Show the chart
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
  document.getElementById("upload-button").disabled = !file; // Enable button only if file is selected
  resetUploadDisplay();
}

function displayFileInfo(file) {
  if (file) {
    fileInfoDisplay.textContent = `Selected file: ${file.name}`;
  } else {
    fileInfoDisplay.textContent = ""; // Clear the text if no file is selected
  }
}

function triggerFileSelect() {
  document.getElementById("file-input").click();
}

function resetUploadDisplay() {
  const uploadPercentage = document.getElementById("uploadPercentage");
  const uploadSpeed = document.getElementById("uploadSpeed");

  // Start fading out
  uploadPercentage.style.opacity = "0";
  uploadSpeed.style.opacity = "0";

  // Wait for the fade-out transition to finish
  setTimeout(() => {
    uploadPercentage.innerText = "0%";
    uploadSpeed.innerText = "0 KB/s";

    // Reset opacity for the next upload
    uploadPercentage.style.opacity = "1";
    uploadSpeed.style.opacity = "1";
  }, 10000); // 3000ms = 3 seconds
}
function resetUploadButton() {
  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = true; // Disable the button after upload or if no file is selected
  fileInfoDisplay.textContent = ""; // Clear the file info text
  document.getElementById("file-input").value = ""; // Clear the file input
  resetUploadDisplay();
}

window.onload = function () {
  dragDropArea = document.getElementById("drag-drop-area");
  const fileInput = document.getElementById("file-input");
  fileInfoDisplay = document.getElementById("file-info");
  const uploadButton = document.getElementById("upload-button");
  document.getElementById("speedChart").style.display = "none";

  dragDropArea.addEventListener("dragover", handleDragOver);
  dragDropArea.addEventListener("drop", handleFileDrop);
  dragDropArea.addEventListener("dragleave", resetDragDropArea);
  dragDropArea.addEventListener("click", triggerFileSelect);
  fileInput.addEventListener("change", handleFileSelect);

  uploadButton.disabled = true;
  uploadButton.addEventListener("click", uploadFile);

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
};
