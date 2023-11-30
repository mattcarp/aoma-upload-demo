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

	fetch(signedUrl, {
			method: 'PUT',
			body: file,
			headers: {
					'Content-Type': file.type
			}
	})
	.then(response => {
			if (response.ok) {
					return response.text();
			} else {
					throw new Error(`Server responded with status: ${response.status}`);
			}
	})
	.then(data => {
			console.log('File uploaded successfully:', data);
	})
	.catch(error => {
			console.error('Error uploading file:', error);
	});
}

let dragDropArea;
let fileInfoDisplay; // Declare fileInfoDisplay in global scope

function calculateSpeed(bytes, seconds) {
return bytes / seconds;
}

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

function handleFileSelect(e) {
const file = e.target.files[0];
displayFileInfo(file);
}

function displayFileInfo(file) {
if (file) {
	fileInfoDisplay.textContent = `Selected file: ${file.name}`;
}
}

function triggerFileSelect() {
document.getElementById("file-input").click();
}

window.onload = function () {
dragDropArea = document.getElementById("drag-drop-area");
const fileInput = document.getElementById("file-input");
fileInfoDisplay = document.getElementById("file-info"); // Initialize fileInfoDisplay
const uploadButton = document.getElementById("upload-button");
uploadButton.addEventListener("click", uploadFile);

dragDropArea.addEventListener("dragover", handleDragOver);
dragDropArea.addEventListener("drop", handleFileDrop);
dragDropArea.addEventListener("dragleave", resetDragDropArea);
dragDropArea.addEventListener("click", triggerFileSelect); // Corrected
fileInput.addEventListener("change", handleFileSelect);

// Chart Initialization
var ctx = document.getElementById("speedChart").getContext("2d");
var speedChart = new Chart(ctx, {
	type: "line",
	data: {
		labels: [],
		datasets: [
			{
				label: "Upload Speed",
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				data: [],
			},
		],
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
