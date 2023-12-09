import {
  getSignedUrl,
  calculateSpeed,
  updateSpeedChart,
  updateUploadStatus,
} from "./s3UtilityFunctions.js";
import { speedChart } from './chartSetup.js';



export function uploadFile(file, completionDonut) {
  console.log(`Uploading file: ${file.name}`); // Log the name of the file being uploaded

  // Declare startTime at the beginning of the function
  let startTime = new Date().getTime();

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
    
            // Update the completionDonut chart
            if (completionDonut && completionDonut.data && completionDonut.data.datasets) {
                completionDonut.data.datasets[0].data = [percentComplete, 100 - percentComplete];
                completionDonut.update();
            }
    
            // Calculate and update speedChart
            const speed = calculateSpeed(e.loaded, startTime);
            console.log('speedChart before update:', speedChart);
            if (speedChart) {
                updateSpeedChart(speedChart, speed);
            } else {
                console.error('speedChart is not defined');
            }
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


