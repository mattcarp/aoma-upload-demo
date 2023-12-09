import { speedChart, completionDonut, speedDonut } from './chartSetup.js';
// Other import statements if any...


export async function getSignedUrl(filename, contentType) {
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

export function calculateSpeed(bytesUploaded, startTime) {
  const duration = (new Date().getTime() - startTime) / 1000;
  return bytesUploaded / duration / 1024;
}

export function updateSpeedChart(chart, speed) {
  console.log('Updating chart with speed:', speed);
  console.log('Chart instance:', chart);

  if (chart && chart.data && chart.data.labels) {
      chart.data.labels.push(new Date().toLocaleTimeString());
      chart.data.datasets.forEach((dataset) => {
          dataset.data.push(speed);
      });
      chart.update();
  } else {
      console.error('Chart or chart data is not properly initialized');
  }
}


export function displaySpeed(speed) {
  const speedElement = document.getElementById("internet-speed-value"); // Updated ID
  speedElement.textContent = `${speed.toFixed(4)} Mbps`;
}

export function updateUploadStatus(message) {
  const statusElement = document.getElementById("upload-status");
  statusElement.textContent = message;
}

export async function fetchAndDisplaySpeed() {
    console.log('called fetchAndDisplaySpeed');
  try {
    const response = await fetch("/api/speedtest");
    const data = await response.json();
    displaySpeed(data.speed);
  } catch (error) {
    console.error("Error fetching internet speed:", error);
  }
}
// Other functions would follow similar patterns.
// x getSignedUrl: A function to get a signed URL for AWS S3 uploads.
// x updateSpeedChart: A function to update a speed chart with new data.
// x calculateSpeed: A function to calculate the upload speed based on bytes uploaded and time.
// x displaySpeed: A function to display the calculated speed in the DOM.
// x updateUploadStatus: A function to update the upload status message in the DOM.
