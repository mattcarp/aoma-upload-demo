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
  const speedElement = document.getElementById("speedDisplay");
  speedElement.textContent = `${speed} Mbps`;
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

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      document.getElementById("uploadPercentage").innerText =
        percentComplete.toFixed(2) + "%";

      const speed = calculateSpeed(e.loaded, startTime);
      document.getElementById("uploadSpeed").innerText =
        speed.toFixed(2) + " KB/s";
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
  uploadButton.addEventListener("click", function () {
    uploadFile(fileInput.files[0]);
    document.getElementById("speedChart").style.display = "block"; // Show the chart when upload starts
  });

  // Chart Initialization
  const data = {
    datasets: [{
      label: 'Dataset 1',
      data: [/* Your data points */],
      borderColor: '#2a41a1', // Graph Line Color 1
      backgroundColor: 'rgba(42, 65, 161, 0.5)', // Translucent version of Graph Line Color 1
      fill: false,
      lineTension: 0.1, // Adjust line tension to your preference (0 for no bezier curves)
      pointBackgroundColor: '#fff', // Color for the points
      pointBorderColor: '#2a41a1', // Border color for the points
      pointHoverBackgroundColor: '#2a41a1', // Hover color for the points
      pointHoverBorderColor: '#fff', // Hover border color for the points
    }, {
      label: 'Dataset 2',
      data: [/* Your data points */],
      borderColor: '#2b3e9c', // Graph Line Color 2
      backgroundColor: 'rgba(43, 62, 156, 0.5)', // Translucent version of Graph Line Color 2
      fill: false,
      lineTension: 0.1,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#2b3e9c',
      pointHoverBackgroundColor: '#2b3e9c',
      pointHoverBorderColor: '#fff',
    }]
  };
  
  const options = {
    scales: {
      yAxes: [{
        type: 'linear',
        display: true,
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'Speed (Mbps)'
        },
        gridLines: {
          color: '#372d31', // Grid Line Color
          lineWidth: 1,
          zeroLineColor: '#372d31',
          zeroLineWidth: 1,
          drawBorder: true,
        },
        ticks: {
          min: 450, // Start at 450 Mbps
          stepSize: 50, // Adjust this value as needed for your scale steps
          fontColor: 'white' // Assuming a light font color for visibility against the dark background
        }
      }],
      xAxes: [{
        gridLines: {
          color: '#372d31', // Grid Line Color
          lineWidth: 1,
          zeroLineColor: '#372d31',
          zeroLineWidth: 1,
          drawBorder: true,
        },
        ticks: {
          fontColor: 'white' // Assuming a light font color for visibility against the dark background
        },
        scaleLabel: {
          display: true,
          labelString: 'Time',
          fontColor: 'white'
        }
      }]
    },
    legend: {
      display: true,
      position: 'top',
      labels: {
        fontColor: 'white', // Assuming a light font color for visibility against the dark background
        boxWidth: 20,
      }
    },
    responsive: true,
    maintainAspectRatio: false, // Ensures the chart size is responsive
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // Animation duration in milliseconds
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4 // Smoothes out the line
      }
    }
  };
  
  // Then you would initialize your chart with these options
  // For example:
  // new Chart(ctx, { type: 'line', data: data, options: options });
  


  var ctx = document.getElementById("speedChart").getContext("2d");
  speedChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Upload Speed (KB/s)",
          backgroundColor: "rgba(0, 123, 255, 0.2)", // Example new background color
          borderColor: "rgba(0, 123, 255, 1)", // Example new border color
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

document.getElementById('chunkSizeSlider').addEventListener('input', function() {
    const chunkSize = this.value * 1024 * 1024; // Convert MB to bytes
    document.getElementById('chunkSizeDisplay').textContent = this.value + ' MB';
    console.log('Chunk size set to:', chunkSize, 'bytes');
    // Store chunkSize in a global variable or use it directly in the upload function
});

async function uploadFile(file) {
    const chunkSize = 5; // placehoder value to avoid errors
    const totalChunks = Math.ceil(file.size / chunkSize);
    document.getElementById('totalChunks').textContent = totalChunks;

    for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
        await uploadChunk(chunk, i, totalChunks); // Call the chunk upload function
    }
}

async function uploadChunk(chunk, chunkNumber, totalChunks) {
    // Implement the logic to upload the chunk
    // Update the UI based on success or failure of each chunk upload
    // If a chunk upload fails, add it to the failed chunks list and provide a retry option
}

function updateChunkInfo(uploadedChunks, totalChunks) {
    document.getElementById('uploadedChunks').textContent = uploadedChunks;
}

function updateFailedChunksList(failedChunks) {
    // Update the list of failed chunks with retry options
}

function updateProgressBar(progressPercentage) {
    // Update the progress bar based on the current upload status
}