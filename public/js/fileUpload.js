import { getSignedUrlForChunk } from "./s3UtilityFunctions.js";
import {
  resetUploadDisplay,
  updateUploadProgress,
  showUploadError,
  showUploadComplete,
  updatePercentComplete,
  updateUploadSpeed,
  updateUploadedChunks,
} from "./domInteraction.js";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 megabytes in bytes

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
  DomUtils.resetUploadDisplay();
  console.log(`Uploading file: ${file.name}`);

  // Step 1: Initiate multipart upload and get uploadId
  const initiateResponse = await fetch("/start-multipart-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });

  const chunks = splitFileIntoChunks(file); // Split the file into chunks
  const uploadId = await startMultipartUpload(file); // Start the multipart upload to get the uploadId
  const parts = []; // Initialize the parts array to store upload details for each chunk

  // Upload each chunk
  for (const [index, chunk] of chunks.entries()) for (const [index, chunk] of chunks.entries()) {
    const partNumber = index + 1;
    try {
      const signedUrl = await getSignedUrlForChunk(file.name, partNumber, uploadId); // Get signed URL for the chunk

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': 'binary/octet-stream', // or your specific content type
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const etag = uploadResponse.headers.get('ETag');
      if (!etag) {
        throw new Error('ETag not found in the response');
      }

      parts.push({ ETag: etag, PartNumber: partNumber }); // Store the ETag and part number for each uploaded chunk

      const percentComplete = Math.round((partNumber / chunks.length) * 100);
      updatePercentComplete(percentComplete); // Update the UI with the percent complete

      updateUploadProgress(partNumber, chunks.length); // Update the UI with the upload progress
      updateUploadedChunks(`Uploaded part ${partNumber} of ${chunks.length}`);

    } catch (error) {
      console.error(`Error uploading chunk number ${partNumber}:`, error);
      showUploadError(error); // Show error in the UI
      return; // Exit the upload process
    }
  }
 

  // Complete the multipart upload
  try {
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
