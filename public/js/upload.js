async function getSignedUrl(filename, contentType) {
	const response = await fetch(`http://localhost:3000/generate-signed-url?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`);
	if (response.ok) {
			const data = await response.json();
			return data.signedUrl; // This is the signed URL
	} else {
			throw new Error('Failed to get signed URL');
	}
}

async function uploadFile() {
	const fileInput = document.getElementById('file-input');
	const file = fileInput.files[0];
	if (!file) {
			console.error('No file selected');
			return;
	}

	const signedUrl = await getSignedUrl(file.name, file.type);
	showAndUpdateChart();
	fetch(signedUrl, {
			method: 'PUT',
			body: file,
			headers: {
					'Content-Type': file.type
			}
	})
	.then(response => {
			if (response.ok) {
					console.log('File uploaded successfully');
					resetUploadButton();
			} else {
					throw new Error(`Server responded with status: ${response.status}`);
			}
	})
	.catch(error => {
			console.error('Error uploading file:', error);
	});
}

let dragDropArea;
let fileInfoDisplay;

function handleDragOver(e) {
	e.preventDefault();
	dragDropArea.classList.add("active");
}

function handleFileDrop(e) {
	e.preventDefault();
	const files = e.dataTransfer.files;
	displayFileInfo(files[0]);
	resetDragDropArea();
}

function resetDragDropArea() {
	dragDropArea.classList.remove("active");
}

function showAndUpdateChart() {
	const speedChartElement = document.getElementById("speedChart");
	speedChartElement.style.display = 'block'; // Make the chart visible

	// Code to update the chart with real values goes here
	// For example, you can update the chart data and then call `speedChart.update()`
}

function handleFileSelect(e) {
	const file = e.target.files[0];
	displayFileInfo(file);
	document.getElementById('upload-button').disabled = !file; // Enable button only if file is selected
}

function displayFileInfo(file) {
	if (file) {
			fileInfoDisplay.textContent = `Selected file: ${file.name}`;
	} else {
			fileInfoDisplay.textContent = ''; // Clear the text if no file is selected
	}
}

function triggerFileSelect() {
	document.getElementById("file-input").click();
}

function resetUploadButton() {
	const uploadButton = document.getElementById('upload-button');
	uploadButton.disabled = true; // Disable the button after upload or if no file is selected
	fileInfoDisplay.textContent = ''; // Clear the file info text
	document.getElementById('file-input').value = ''; // Clear the file input
}

window.onload = function () {
	dragDropArea = document.getElementById("drag-drop-area");
	const fileInput = document.getElementById("file-input");
	fileInfoDisplay = document.getElementById("file-info");
	const uploadButton = document.getElementById("upload-button");
	document.getElementById("speedChart").style.display = 'none';


	dragDropArea.addEventListener("dragover", handleDragOver);
	dragDropArea.addEventListener("drop", handleFileDrop);
	dragDropArea.addEventListener("dragleave", resetDragDropArea);
	dragDropArea.addEventListener("click", triggerFileSelect);
	fileInput.addEventListener("change", handleFileSelect);

	// Initialize the upload button as disabled
	uploadButton.disabled = true;
	uploadButton.addEventListener("click", uploadFile);

	// Chart Initialization
	var ctx = document.getElementById("speedChart").getContext("2d");
	var speedChart = new Chart(ctx, {
			type: "line",
			data: {
					labels: [],
					datasets: [{
							label: "Upload Speed",
							backgroundColor: "rgba(255, 99, 132, 0.2)",
							borderColor: "rgba(255, 99, 132, 1)",
							data: [],
					}],
			},
			options: {
					scales: {
							y: {
									beginAtZero: true,
							},
					},
			},
	});
};
