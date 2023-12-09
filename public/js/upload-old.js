let dragDropArea;
let fileInfoDisplay;
let speedChart; // Declare speedChart globally
let startTime;
let chunkSize; // Global variable to store chunk size
let totalChunks; // Global variable to store total number of chunks

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

// Function to update speed chart
function updateSpeedChart(chart, speed) {
  const elapsedTime = new Date().getTime() - startTime;
  const minutes = Math.floor(elapsedTime / 60000);
  const seconds = ((elapsedTime % 60000) / 1000).toFixed(0);

  // Format the elapsed time as mm:ss
  const timeLabel = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  chart.data.labels.push(timeLabel);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(speed);
  });
  chart.update();
}

// Function to calculate speed
function calculateSpeed(bytesUploaded, startTime) {
  const duration = (new Date().getTime() - startTime) / 1000;
  return bytesUploaded / duration / 1024;
}

// Function to display speed
function displaySpeed(speed) {
  const speedElement = document.getElementById("internet-speed-value"); // Updated ID
  speedElement.textContent = `${speed.toFixed(4)} Mbps`;
}

document.addEventListener("DOMContentLoaded", function () {
  dragDropArea = document.getElementById("drag-drop-area");
  fileInfoDisplay = document.getElementById("selected-file-name");

  dragDropArea.addEventListener("dragover", handleDragOver);
  dragDropArea.addEventListener("drop", handleFileDrop);
  dragDropArea.addEventListener("dragleave", resetDragDropArea);
  dragDropArea.addEventListener("dragend", resetDragDropArea);

  dragDropArea.addEventListener("click", function (event) {
    event.stopPropagation();
    const fileInput = document.getElementById("file-input");
    fileInput.click();
  });

  document
    .getElementById("file-input")
    .addEventListener("change", handleFileSelect);

  const speedCtx = document.getElementById("speedChart").getContext("2d");
  speedChart = new Chart(speedCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Upload Speed (KB/s)",
          data: [],
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderColor: "rgba(0, 123, 255, 1)",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderColor: "transparent",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderColor: "transparent",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
      elements: {
        line: {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        point: {
          backgroundColor: "#3498db",
          borderColor: "#3498db",
          radius: 5,
        },
      },
      maintainAspectRatio: true,
      responsive: true,
      aspectRatio: 1,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 20,
          bottom: 10,
        },
      },
    },
  });

  speedCtx.canvas.parentNode.style.backgroundColor = `rgb(60, 135, 236)`;

  const ctx = document.getElementById("completionDonut").getContext("2d");
  const completionDonut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ["rgb(95, 189, 222)", "rgb(175, 82, 226)"],
          hoverOffset: 4,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "75%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)",
            boxWidth: 20,
            padding: 20,
          },
        },
        title: {
          display: false,
        },
      },
      layout: {
        maintainAspectRatio: true,
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 100,
        },
      },
    },
  });

  document
    .getElementById("chunkSizeSlider")
    .addEventListener("change", function (event) {
      chunkSize = event.target.value * 1024 * 1024;
    });

  document
    .getElementById("upload-button")
    .addEventListener("click", function () {
      const fileInput = document.getElementById("file-input");
      if (fileInput.files.length > 0) {
        resetUploadDisplay();
        uploadFile(fileInput.files[0], completionDonut, speedChart);
      }
    });

  fetch("/api/speedtest")
    .then((response) => response.json())
    .then((data) => {
      displaySpeed(data.speed);
    })
    .catch((error) => console.error("Error fetching the speed:", error));
});

function getChunkInfo(file) {
  totalChunks = Math.ceil(file.size / chunkSize); // Calculate total chunks
  console.log("Total Chunks:", totalChunks);
  // This function will now log the total number of chunks based on the file size and chunk size
}

function uploadFile(file) {
  console.log(`Uploading file: ${file.name}`); // Log the name of the file being uploaded

  // Declare startTime at the beginning of the function
  const startTime = new Date().getTime();
  getChunkInfo(file); // Call getChunkInfo function to calculate and log total chunks

  getSignedUrl(file.name, file.type).then((url) => {
    if (!url) {
      console.error("Failed to get a signed URL for the file upload.");
      updateUploadStatus("Failed to start the upload. Please try again."); // Update the upload status
      return;
    }

    startTime = new Date().getTime();
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        const uploadedChunks = Math.ceil(e.loaded / chunkSize); // Calculate uploaded chunks
        console.log("Uploaded Chunks:", uploadedChunks); // Log the number of uploaded chunks

        // Update the doughnut chart
        console.log("completionDonut:", completionDonut);
        console.log("completionDonut.data:", completionDonut?.data);
        console.log(
          "completionDonut.data.datasets:",
          completionDonut?.data?.datasets
        );

        completionDonut.data.datasets[0].data = [
          percentComplete,
          100 - percentComplete,
        ];
        completionDonut.update();
        const speed = calculateSpeed(e.loaded, startTime);
        updateSpeedChart(speedChart, speed);
      }
    });

    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        console.log("Upload complete!");
      } else {
        console.error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
      }
    });

    xhr.addEventListener("error", function () {
      console.error(`Upload failed: ${xhr.status} ${xhr.statusText}`);
    });

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

function updateUploadStatus(message) {
  const statusElement = document.getElementById("upload-status");
  statusElement.textContent = message;
}

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.add("dragging");
  }
}

function handleFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  if (dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.remove("dragging");
  }
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    displayFileInfo(files[0]); // Display the file info instead of starting the upload
  }
}

function resetDragDropArea() {
  if (dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.remove("dragging");
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    displayFileInfo(files[0]); // Display the file info instead of starting the upload
  }
}

function displayFileInfo(file) {
  fileInfoDisplay.textContent = `Selected file: ${file.name}, ${file.size} bytes`;
  console.log(`File selected: ${file.name}, ${file.size} bytes`); // Log the selected file info

  // Enable the upload button
  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = false;
}

function triggerFileSelect() {
  document.getElementById("file-input").click();
}

function resetUploadDisplay() {
  document.getElementById("percent-complete-value").textContent = "0%";
  // this seems to no longer be in the html:
  // document.getElementById("upload-status").textContent = "";
  speedChart.data.labels = [];
  speedChart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  speedChart.update();
}
