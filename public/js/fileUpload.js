import { getSignedUrlForChunk } from './s3UtilityFunctions.js';
import * as DomUtils from './domInteraction.js';
import { showUploadComplete } from './domInteraction.js'; // Adjust the path if needed


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

// Main upload function
// export async function uploadFile(file, completionDonut) {
//   DomUtils.resetUploadDisplay();
//   console.log(`Uploading file: ${file.name}`);

//   // Initiate multipart upload and get uploadId
//   const uploadIdResponse = await fetch(`/start-multipart-upload`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ filename: file.name, contentType: file.type })
//   });
//   const uploadIdData = await uploadIdResponse.json();
//   const uploadId = uploadIdData.uploadId;

//   // Split file into chunks
//   const chunks = splitFileIntoChunks(file, CHUNK_SIZE);

//   // Upload each chunk
//   for (const [index, chunk] of chunks.entries()) {
//     const partNumber = index + 1;
//     try {
//       const signedUrl = await getSignedUrlForChunk(file.name, partNumber, uploadId);
//       const response = await fetch(signedUrl, {
//         method: 'PUT',
//         body: chunk,
//       });
//       if (!response.ok) {
//         throw new Error(`Chunk ${partNumber} upload failed`);
//       }
//       // Update UI for successful chunk upload
//       // (Update progress, completionDonut, etc.)
//     } catch (error) {
//       console.error('Error uploading chunk:', error);
//       // Handle chunk upload error (e.g., retry, skip, abort)
//       // Update UI to reflect the error
//     }
//   }

//   // Complete the multipart upload
//   try {
//     await fetch(`/complete-multipart-upload`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ filename: file.name, uploadId })
//     });
//     // Handle successful completion (e.g., update UI)
//   } catch (error) {
//     console.error('Error completing upload:', error);
//     // Update UI to reflect the error
//   }
// }

// Assuming you have other necessary imports and utility functions like getSignedUrlForChunk

export async function uploadFile(file, completionDonut) {
  DomUtils.resetUploadDisplay();
  console.log(`Uploading file: ${file.name}`);

  // Step 1: Initiate multipart upload and get uploadId
  const initiateResponse = await fetch('/start-multipart-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type })
  });
  const { uploadId } = await initiateResponse.json();

  // Split the file into chunks
  const chunks = splitFileIntoChunks(file, CHUNK_SIZE);

  // Initialize an array to store the part numbers and ETags
  const parts = [];

  // Upload each chunk
  // ...

// Upload each chunk
for (const [index, chunk] of chunks.entries()) {
  const partNumber = index + 1;
  try {
    // Get the signed URL for each chunk
    const signedUrlResponse = await fetch('/get-signed-url-for-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, partNumber, uploadId })
    });
    const { signedUrl } = await signedUrlResponse.json();

    // Upload the chunk to S3
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: chunk
    });

    if (!uploadResponse.ok) {
      throw new Error(`HTTP error! status: ${uploadResponse.status}`);
    } else {
      const etag = uploadResponse.headers.get('ETag');
      if (!etag) {
        throw new Error('ETag not found in the response');
      }
      parts.push({ ETag: etag, PartNumber: partNumber });
      // Update the UI or completionDonut with the progress
      DomUtils.updateUploadProgress(partNumber, chunks.length);
    }
  } catch (error) {
    console.error(`Error uploading chunk number ${partNumber}:`, error);
    // Handle the chunk upload error
    DomUtils.showUploadError(error);
    return;
  }
}

// ...



  // Complete the multipart upload
  try {
    const completionResponse = await fetch('/complete-multipart-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, uploadId, parts }) // Send the parts array
    });
    const completionData = await completionResponse.json();
    console.log('Multipart upload completed:', completionData);
    // Update the UI or completionDonut for completion
    DomUtils.showUploadComplete(completionData);
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    // Handle the completion error
    DomUtils.showUploadError(error);
  }
}


