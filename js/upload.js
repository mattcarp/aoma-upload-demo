let dragDropArea;
let fileInfoDisplay; // Declare fileInfoDisplay in global scope

function calculateSpeed(bytes, seconds) {
    return bytes / seconds;
}

function handleDragOver(e) {
    e.preventDefault();
    dragDropArea.classList.add('active');
}

function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    displayFileInfo(files[0]);
    resetDragDropArea();
}

function resetDragDropArea() {
    dragDropArea.classList.remove('active');
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

window.onload = function() {
    dragDropArea = document.getElementById('drag-drop-area');
    const fileInput = document.getElementById('file-input');
    fileInfoDisplay = document.getElementById('file-info'); // Initialize fileInfoDisplay

    dragDropArea.addEventListener('dragover', handleDragOver);
    dragDropArea.addEventListener('drop', handleFileDrop);
    dragDropArea.addEventListener('dragleave', resetDragDropArea);
    fileInput.addEventListener('change', handleFileSelect);

    // Chart Initialization
    var ctx = document.getElementById('speedChart').getContext('2d');
    var speedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Upload Speed',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                data: []
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};
