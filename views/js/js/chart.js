import { fetchTellerDetails } from './tellerService.js'; // Import the shared function
// Fetch served token counts and render the pie chart
const fetchServedCountsAndRenderChart = async () => {
    try {
        // Fetch teller details to get the service name
        const tellerDetails = await fetchTellerDetails();

        if (!tellerDetails || !tellerDetails.service) {
            return;
        }

        const serviceName = tellerDetails.service;

        // Make a request to the backend to get served token counts
        const response = await fetch(`http://localhost:4001/api/queue/token-count`, {
            method: 'GET',
            headers: {
                'service-name': serviceName,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const result = await response.json();
        
        if (!response.ok) {
            return;
        }


        // Ensure result.servedCounts is an array and has data
        if (!Array.isArray(result.servedCounts) || result.servedCounts.length === 0) {
            return;
        }

        // Map servedCounts data to format expected by chart code
        const data = result.servedCounts.map((item, index) => ({
            label: `Counter ${item._id}`,
            value: item.servedCount,
            color: getRandomColor(index)
        }));

      

        // Call the function to render the chart with fetched data
        renderPieChart(data);
    } catch (error) {
    }
};


// Function to render the pie chart and legend
const renderPieChart = (data) => {
    const canvas = document.getElementById('pieChart');
    const context = canvas.getContext('2d');
    const totalValue = data.reduce((acc, item) => acc + item.value, 0);

    let startAngle = 0;
    data.forEach(item => {
        const sliceAngle = (item.value / totalValue) * 2 * Math.PI;
        const slicePercentage = ((item.value / totalValue) * 100).toFixed(1);

        // Draw each slice
        context.beginPath();
        context.moveTo(canvas.width / 2, canvas.height / 2);
        context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, startAngle, startAngle + sliceAngle);
        context.closePath();
        context.fillStyle = item.color;
        context.fill();

        // Calculate label position and add percentage text
        const textX = canvas.width / 2 + (canvas.height / 2.5) * Math.cos(startAngle + sliceAngle / 2);
        const textY = canvas.height / 2 + (canvas.height / 2.5) * Math.sin(startAngle + sliceAngle / 2);
        context.fillStyle = "#ffffff";
        context.font = "16px Arial";
        context.fillText(`${slicePercentage}%`, textX - 15, textY + 5);

        startAngle += sliceAngle;
    });

    // Generate the legend with only counter number and color
    const legend = document.getElementById('legend');
    legend.innerHTML = ''; // Clear previous legend items
    data.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const colorBox = document.createElement('div');
        colorBox.classList.add('legend-color-box');
        colorBox.style.backgroundColor = item.color;

        const labelText = document.createElement('span');
        labelText.textContent = item.label;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        legend.appendChild(legendItem);
    });
};

// Helper function to generate random colors for the pie chart
const getRandomColor = (index) => {
    const colors = ['#ff6384', '#36a2eb', '#cc65fe', '#ffce57', '#4bc0c0'];
    return colors[index % colors.length];
};

document.addEventListener('DOMContentLoaded', () => {
    fetchServedCountsAndRenderChart();
    setInterval(fetchServedCountsAndRenderChart, 10000);
});
