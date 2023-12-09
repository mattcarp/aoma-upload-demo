# File Upload and Real-time Monitoring System

This application provides a user-friendly interface for uploading files and monitoring the upload process in real-time.

## Features

- **Drag-and-Drop Upload**: Easily upload files by dragging and dropping them into the designated area.
- **AWS S3 Integration**: Securely upload files directly to an S3 bucket using pre-signed URLs for enhanced security.
- **Real-time Speed Monitoring**: View the upload speed dynamically displayed as the file is being uploaded.
- **Progress Visualization**: Track the progress of your file upload with an updating donut chart.
- **Responsive Design**: The interface is fully responsive, providing a seamless experience across all devices.

## Functionality

- `getSignedUrl`: Communicates with a local server endpoint to retrieve AWS S3 pre-signed URLs for secure uploads.
- `updateSpeedChart`: Pushes new data points to the speed chart for real-time visualization of the upload speed.
- `calculateSpeed`: Calculates the upload speed based on the bytes uploaded and the time elapsed.
- `displaySpeed`: Updates the DOM with the current upload speed.
- `uploadFile`: Handles the file upload process, updating the UI with the upload status and progress.
- `updateUploadStatus`: Displays messages to the user regarding the status of the file upload.

## UI Components

- **Speed Chart**: A line chart displaying upload speed over time, utilizing Chart.js for dynamic updates.
- **Completion Donut**: A doughnut chart showing the percentage of the file uploaded.
- **Info Cards**: Cards that display various upload metrics and status messages to the user.

## Usage

To use this application:

1. Drag and drop a file into the upload area or click to select a file manually.
2. Monitor the upload progress through the speed chart and completion donut.
3. Check detailed metrics updated in real-time on the info cards.

Enjoy the streamlined file upload experience with real-time insights!

