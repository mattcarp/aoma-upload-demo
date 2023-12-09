let speedChart;
let completionDonut;
let speedDonut;



// Speed Chart Initialization: The code for initializing the speed chart, which includes the Chart constructor call for speedChart and its configuration. This is found in the DOMContentLoaded event listener.

// Completion Donut Chart Initialization: Similarly, the initialization of the completion donut chart (completionDonut) should be included. It's also in the DOMContentLoaded event listener section.

// Speed Donut Chart Initialization: The initialization of the speed donut chart (speedDonut).


export function initSpeedChart() {
//   console.log(document.getElementById('speedChart'));
  const speedCtx = document.getElementById('speedChart').getContext("2d");
  speedChart = new Chart(speedCtx, {
    type: "line",
    data: {
      labels: [], // Start with an empty array for timestamps
      datasets: [
        {
          label: "Upload Speed (KB/s)",
          data: [], // Start with an empty array for speed data
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderColor: "rgba(0, 123, 255, 1)",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines on x-axis
            borderColor: "transparent", // Hide the x-axis border
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for the x-axis ticks
          },
        },
        y: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines on y-axis
            borderColor: "transparent", // Hide the y-axis border
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for the y-axis ticks
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.7)", // Light color for legend labels
          },
        },
      },
      elements: {
        line: {
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Light background color for the line&#8203;``【oaicite:2】``&#8203;
          borderColor: "rgba(0, 0, 0, 0.1)", // Light line color&#8203;``【oaicite:1】``&#8203;
          borderWidth: 2, // or any value that suits your design
          tension: 0.4, // Adjust the bezier curve tension&#8203;``【oaicite:0】``&#8203;
          fill: true, // Determine if the area under the line should be filled
        },
        point: {
          backgroundColor: "#3498db", // Points color matching line color
          borderColor: "#3498db",
          radius: 5, // Point radius
        },
      },
      maintainAspectRatio: true, // To maintain the aspect ratio you set in the canvas style
      responsive: true, // This will make sure the chart is responsive to its container's size
      aspectRatio: 1,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 20,
          bottom: 10,
        },
      },
    },
  });
  // Set the background color of the canvas container to match the sampled color
  speedCtx.canvas.parentNode.style.backgroundColor = `rgb(60, 135, 236)`;
}

export function initCompletionDonut() {
  const ctx = document.getElementById("completionDonut").getContext("2d");
  const completionDonut = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Remaining"],
      datasets: [
        {
          data: [0, 100], // This will be dynamically updated as the upload progresses
          backgroundColor: ["rgb(95, 189, 222)", "rgb(175, 82, 226)"],
          hoverOffset: 4,
          borderWidth: 0, // This will remove the border from the donut segments
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "75%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)", // White color for the legend text
            boxWidth: 20, // Width of the legend color box
            padding: 20, // Padding between the legend items
          },
        },
        title: {
          display: false,
        },
      },
      // Additional configuration to ensure the donut chart is not cut off
      layout: {
        maintainAspectRatio: true,
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 100, // Adjust the right padding to ensure space for the legend
        },
      },
    },
  });
}

export function initSpeedDonut() {
  const ctxSpeed = document.getElementById("speedDonut").getContext("2d");
  const speedDonut = new Chart(ctxSpeed, {
    type: "doughnut",
    data: {
      labels: ["Speed (MBps)", ""],
      datasets: [
        {
          data: [0, 100], // This will be dynamically updated as the upload progresses
          backgroundColor: ["rgb(95, 189, 222)", "rgb(175, 82, 226)"],
          hoverOffset: 4,
          borderWidth: 0, // This will remove the border from the donut segments
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "75%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)", // White color for the legend text
            boxWidth: 20, // Width of the legend color box
            padding: 20, // Padding between the legend items
          },
        },
        title: {
          display: false,
        },
      },
      // Additional configuration to ensure the donut chart is not cut off
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 100, // Adjust the right padding to ensure space for the legend
        },
      },
    },
  });
}

export { speedChart, completionDonut, speedDonut };

