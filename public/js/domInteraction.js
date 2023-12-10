// x handleDragOver: Handles the drag-over event on the drag-drop area.
// x handleFileDrop: Handles the file drop event, including removing the drag-drop area's
//'dragging' class and handling the dropped files.
// x resetDragDropArea: Resets the drag-drop area by removing the 'dragging' class.
// x handleFileSelect: Handles file selection from the file input.
// x displayFileInfo: Displays information about the selected file.
// x triggerFileSelect: Triggers the file selection dialog.
// x resetUploadDisplay: Resets the display elements related to the upload process,
// including the percent-complete value and the speed chart data.

import { speedChart, completionDonut, speedDonut } from './chartSetup.js';


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
  fileInfoDisplay.textContent = `Selected file: ${file.name}, ${file.size} bytes`;
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
    console.log("resetUploadDisplay is being called");
    if (typeof speedChart !== 'undefined' && speedChart !== null) {
        speedChart.data.labels = [];
        speedChart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
        speedChart.update();
    } else {
        console.error('speedChart is not defined or not initialized');
    }
}


