import {
  initSpeedChart,
  initCompletionDonut,
  initSpeedDonut,
} from "./chartSetup.js";
import * as DomUtils from "./domInteraction.js";
import * as S3Utils from "./s3UtilityFunctions.js";
import { uploadFile } from "./fileUpload.js";

document.addEventListener("DOMContentLoaded", function () {
  initSpeedChart();
  initCompletionDonut();
  initSpeedDonut();
  // Other initializations that require DOM to be fully loaded
});

document.addEventListener("DOMContentLoaded", function () {
console.log('in the event listender just before calling   S3Utils.fetchAndDisplaySpeed()');

  S3Utils.fetchAndDisplaySpeed();
});

const dropArea = document.getElementById("drag-drop-area");
console.log(document.getElementById("drag-drop-area"));

dropArea.addEventListener("drop", DomUtils.handleFileDrop);
dropArea.addEventListener("dragover", DomUtils.handleDragOver);
dropArea.addEventListener('click', DomUtils.triggerFileSelect);

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', DomUtils.handleFileSelect);

// Add more listeners as needed

const uploadButton = document.getElementById("upload-button");
uploadButton.addEventListener("click", () => {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];
  if (file) {
    uploadFile(file);
  } else {
    console.log("No file selected");
  }
});
