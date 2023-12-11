import { getSignedUrlForChunk } from "./s3UtilityFunctions.js";
import {
  resetUploadDisplay,
  updateUploadProgress,
  showUploadError,
  showUploadComplete,
  updatePercentComplete,
  updateUploadSpeed,
  updateUploadedChunks,
  updateTotalChunks,
  updateElapsedTime
} from "./domInteraction.js";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 megabytes in bytes

function calculateSpeed(sizeBytes, timeMs) {
  const timeSeconds = timeMs / 1000;
  const sizeMegabytes = sizeBytes / (1024 * 1024);
  return sizeMegabytes / timeSeconds; // Speed in MB/s
}

// Define splitFileIntoChunks function
function splitFileIntoChunks(file, chunkSize) {
  let chunks = [];
  let startPos = 0;
  while (startPos < file.size) {
    let endPos = Math.min(file.size, startPos + chunkSize);
    chunks.push(file.slice(startPos, endPos));
    startPos = endPos;
  }
  return chunks;
}

// Assuming you have other necessary imports and utility functions like getSignedUrlForChunk

export async function uploadFile(file, completionDonut) {
  let uploadStartTime = Date.now(); // Start the timer for the entire upload process

  resetUploadDisplay();
  console.log(`Uploading file: ${file.name}`);

  // Step 1: Initiate multipart upload and get uploadId
  const initiateResponse = await fetch("/start-multipart-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  const initiateData = await initiateResponse.json();
  const uploadId = initiateData.uploadId;

  // Split the file into chunks
  const chunks = splitFileIntoChunks(file, CHUNK_SIZE);
  const parts = []; // Initialize the parts array to store upload details for each chunk

  // After splitting the file into chunks
  const totalChunks = chunks.length;
  updateTotalChunks(totalChunks); // This function needs to be defined in domInteraction.js

  // Upload each chunk
  // Start of the chunk upload loop
  for (const [index, chunk] of chunks.entries()) {
    const partNumber = index + 1;
    try {
      let chunkStartTime = Date.now(); // Start timing the chunk upload

      // Replace 'YOUR_SIGNED_URL_ENDPOINT' with your actual endpoint
      // and make sure to send the necessary data to get the signed URL for the chunk
      const response = await fetch('/get-signed-url-for-chunk', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: file.name, partNumber, uploadId }),
      });

      const { signedUrl } = await response.json();

      // Upload the chunk to S3
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const etag = uploadResponse.headers.get("ETag");
      if (!etag) {
        throw new Error("ETag not found in the response");
      }

      // Push the part information into the parts array for completion
      parts.push({ ETag: etag.replace(/"/g, ""), PartNumber: partNumber });

      // Update the UI with the progress
      const progress = (partNumber / chunks.length) * 100;
      updateUploadProgress(partNumber, chunks.length);
      updatePercentComplete(progress);

      let chunkEndTime = Date.now(); // End timing the chunk upload
      let chunkTime = chunkEndTime - chunkStartTime;
      let speed = calculateSpeed(chunk.size, chunkTime); // Calculate the speed
      updateUploadSpeed(speed); // Update the UI with the current speed
    } catch (error) {
      console.error(`Error uploading chunk number ${partNumber}:`, error);
      showUploadError(error);
      return;
    }
  }

  // Complete the multipart upload
  try {
    let uploadEndTime = Date.now();
    let totalUploadTime = uploadEndTime - uploadStartTime;
    updateElapsedTime(totalUploadTime);
    const completionResponse = await fetch("/complete-multipart-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, uploadId, parts }), // Send the parts array
    });
    const completionData = await completionResponse.json();
    console.log("Multipart upload completed:", completionData);
    // Update the UI or completionDonut for completion
    showUploadComplete(completionData);
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    // Handle the completion error
    showUploadError(error);
  }
}
