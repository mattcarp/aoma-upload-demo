import { speedChart, completionDonut, speedDonut } from "./chartSetup.js";

export function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.add("dragging");
  }
}

export function handleFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  if (dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.remove("dragging");
  }
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    displayFileInfo(files[0]); // Display the file info instead of starting the upload
    resetUploadDisplay();
  }
}

export function resetDragDropArea() {
  if (dragDropArea.classList.contains("dragging")) {
    dragDropArea.classList.remove("dragging");
  }
}

export function displayFileInfo(file) {
  console.log("displayFileInfo is being called");
  const fileInfoDisplay = document.getElementById("selected-file-name"); // Ensure this ID matches your HTML element's ID
  fileInfoDisplay.textContent = `${file.name}, ${file.size} bytes`;
  console.log(`File selected: ${file.name}, ${file.size} bytes`); // Log the selected file info

  // Enable the upload button
  const uploadButton = document.getElementById("upload-button");
  uploadButton.disabled = false;
}

export function handleFileSelect(e) {
  console.log("handleFileSelect is being called");
  const files = e.target.files;
  if (files.length > 0) {
    resetUploadDisplay();
    displayFileInfo(files[0]); // Display the file info instead of starting the upload
  }
}

export function triggerFileSelect() {
  console.log("ok your triggerFileSelct is being called");
  document.getElementById("file-input").click();
}

export function resetUploadDisplay() {
  document.getElementById("percent-complete-value").textContent = "0%";
  // Reset the upload speed info-card
  updateUploadSpeed(0);
  console.log("resetUploadDisplay is being called");
  if (typeof speedChart !== "undefined" && speedChart !== null) {
    speedChart.data.labels = [];
    speedChart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });
    speedChart.update();
  } else {
    console.error("speedChart is not defined or not initialized");
  }
}

// Update the upload progress in the UI
export function updateUploadProgress(partNumber, totalParts) {
  // Assuming you have a progress display element in your HTML
  const progressElement = document.getElementById("uploaded-chunks-value");
  if (progressElement) {
    progressElement.textContent = `Uploading part ${partNumber} of ${totalParts}`;
    // You can also update a visual progress bar here, if you have one
  }
}


export function showUploadComplete(completionData) {
  console.log('Upload Completed:', completionData);
  // Assuming you have a completion display element in your HTML
  const completionElement = document.getElementById("upload-complete-text");
  if (completionElement) {
      completionElement.textContent = "Upload completed successfully!";
      completionElement.style.display = "block"; // Make the completion element visible
  }
  // Optionally, you can also reset the progress display or navigate the user to another page
  // resetUploadDisplay(); // Call this if you want to reset the upload progress UI
}


// Show an upload error in the UI
export function showUploadError(error) {
  console.error("Upload Error:", error);
  // Assuming you have an error display element in your HTML
  const errorElement = document.getElementById("error-text");
  if (errorElement) {
    errorElement.textContent = `Error: ${error.message}`;
    errorElement.style.display = "block"; // Make the error element visible
  }
}

// export function updateUploadSpeed(speed) {
//   const uploadSpeedElement = document.getElementById("uploadSpeed");
//   uploadSpeedElement.textContent = `${speed} KB/s`;
// }

export function updatePercentComplete(percentage) {
  const percentCompleteElement = document.getElementById("percent-complete-value");
  if (percentCompleteElement) {
      percentCompleteElement.textContent = `${percentage}%`;
  }
}

export function updateUploadSpeed(speed) {
  const uploadSpeedElement = document.getElementById("uploadSpeed");
  if (uploadSpeedElement) {
      uploadSpeedElement.textContent = `${speed} KB/s`;
  }
}

export function updateUploadedChunks(chunksUploaded) {
  const uploadedChunksElement = document.getElementById("uploaded-chunks-value");
  if (uploadedChunksElement) {
      uploadedChunksElement.textContent = chunksUploaded;
  }
}



