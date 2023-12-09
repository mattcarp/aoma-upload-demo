let dragDropArea;
let fileInfoDisplay;
let speedChart; // Declare speedChart globally
let startTime;

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

// KEEP this one, delete the other two DOMContentLoaded funcs
document.addEventListener("DOMContentLoaded", function () {
  // Initialize dragDropArea and fileInfoDisplay
  dragDropArea = document.getElementById("drag-drop-area");
  fileInfoDisplay = document.getElementById("selected-file-name");

  // Add event listeners for drag and drop events
  dragDropArea.addEventListener("dragover", handleDragOver);
  dragDropArea.addEventListener("drop", handleFileDrop);
  dragDropArea.addEventListener("dragleave", resetDragDropArea);
  dragDropArea.addEventListener("dragend", resetDragDropArea);

  // Add event listener for click event
  console.log("Adding click event listener to drag and drop area.");
  dragDropArea.addEventListener("click", function () {
    event.stopPropagation();
    const fileInput = document.getElementById("file-input");
    console.log("File input element:", fileInput); // Log the file input element
    fileInput.click();
  });

  // Add event listener for file input change event
  document
    .getElementById("file-input")
    .addEventListener("change", handleFileSelect);

  // Speed Chart Initialization with an Empty Dataset
  const speedCtx = document.getElementById("speedChart").getContext("2d");
  speedChart = new Chart(speedCtx, {
    type: "line",
    data: {
      labels: [], // Start with an empty array for timestamps
      datasets: [
        {
          label: "Upload Speed (KB/s)",
          data: [], // Start with an empty array for speed data
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
            color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines on x-axis
            borderColor: "transparent", // Hide the x-axis border
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for the x-axis ticks
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines on y-axis
            borderColor: "transparent", // Hide the y-axis border
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for the y-axis ticks
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for legend labels
          },
        },
      },
      elements: {
        line: {
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Light background color for the line&#8203;``【oaicite:2】``&#8203;
          borderColor: "rgba(0, 0, 0, 0.1)", // Light line color&#8203;``【oaicite:1】``&#8203;
          borderWidth: 2, // or any value that suits your design
          tension: 0.4, // Adjust the bezier curve tension&#8203;``【oaicite:0】``&#8203;
          fill: true, // Determine if the area under the line should be filled
        },
        point: {
          backgroundColor: "#3498db", // Points color matching line color
          borderColor: "#3498db",
          radius: 5, // Point radius
        },
      },
      maintainAspectRatio: true, // To maintain the aspect ratio you set in the canvas style
      responsive: true, // This will make sure the chart is responsive to its container's size
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
  // Set the background color of the canvas container to match the sampled color
  speedCtx.canvas.parentNode.style.backgroundColor = `rgb(60, 135, 236)`
  });
  // Fetch speed test data
  fetch("/api/speedtest")
    .then((response) => response.json())
    .then((data) => {
      displaySpeed(data.speed);
    })
    .catch((error) => console.error("Error fetching the speed:", error));

  // const ctx = document.getElementById('completionDonut').getContext('2d');

  const ctx = document.getElementById("completionDonut").getContext("2d");
  const completionDonut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [0, 100], // This will be dynamically updated as the upload progresses
          backgroundColor: ["rgb(95, 189, 222)", "rgb(175, 82, 226)"],
          hoverOffset: 4,
          borderWidth: 0, // This will remove the border from the donut segments
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)", // White color for the legend text
            boxWidth: 20, // Width of the legend color box
            padding: 20, // Padding between the legend items
          },
        },
        title: {
          display: false,
        },
      },
      // Additional configuration to ensure the donut chart is not cut off
      layout: {
        maintainAspectRatio: true,
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 100, // Adjust the right padding to ensure space for the legend
        },
      },
    },
  });

  const ctxSpeed = document.getElementById("speedDonut").getContext("2d");
  const speedDonut = new Chart(ctxSpeed, {
    type: "doughnut",
    data: {
      labels: ["Speed (MBps", ""],
      datasets: [
        {
          data: [0, 100], // This will be dynamically updated as the upload progresses
          backgroundColor: ["rgb(95, 189, 222)", "rgb(175, 82, 226)"],
          hoverOffset: 4,
          borderWidth: 0, // This will remove the border from the donut segments
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)", // White color for the legend text
            boxWidth: 20, // Width of the legend color box
            padding: 20, // Padding between the legend items
          },
        },
        title: {
          display: false,
        },
      },
      // Additional configuration to ensure the donut chart is not cut off
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 100, // Adjust the right padding to ensure space for the legend
        },
      },
    },
  });

  document
    .getElementById("upload-button")
    .addEventListener("click", function () {
      const fileInput = document.getElementById("file-input");
      if (fileInput.files.length > 0) {
        console.log("Upload button clicked. Starting upload..."); // Log when the upload button is clicked
        resetUploadDisplay();
        uploadFile(fileInput.files[0]); // Start the upload when the upload button is clicked
      } else {
        console.log("No file selected. Please select a file to upload."); // Log when no file is selected
      }
    });
});

function uploadFile(file) {
  console.log(`Uploading file: ${file.name}`); // Log the name of the file being uploaded
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
  // TODO
  // this seems to no longer be in the html:
  // document.getElementById("upload-status").textContent = "";
  speedChart.data.labels = [];
  speedChart.data.datasets.forEach((dataset) => {
    dataset.data = [];
  });
  speedChart.update();
}
