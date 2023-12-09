import {
  getSignedUrl,
  calculateSpeed,
  updateUploadStatus,
} from "./s3UtilityFunctions.js";

export function uploadFile(file) {
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
