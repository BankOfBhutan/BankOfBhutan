google.charts.load('current', { packages: ['corechart'] });


window.fetchAndDrawData = async function fetchAndDrawData() {
    const viewType = document.getElementById('view-type').value;
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const params = { viewType, year };

    // Include month only if viewType is daily
    if (viewType === 'daily') params.month = month;

    try {
        const res = await axios.get('http://localhost:4001/api/v1/data/getTokenStatsGroupedByService', { params });
        
        if (res.data.status === 'success') {
            const tokenStats = res.data.data.tokenStats;
            // Check if tokenStats is empty
            if (tokenStats.length === 0) {
                displayNoDataMessage();
                return;
            }

            const formattedData = formatDataForChart(tokenStats, viewType);
            drawChart(formattedData);
        }
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}


// Function to display "No Data Found" message
function displayNoDataMessage() {
  const chartContainer = document.getElementById('curve_chart');
  chartContainer.innerHTML = '<p style="text-align: center; font-size: 18px;">No data found within the selected range.</p>';
}

function formatDataForChart(tokenStats, viewType) {
  const headers = [viewType === 'daily' ? 'Date' : 'Month', 'Cash (Deposit/Withdraw)', 'RTGS', 'SWIFT', 'ATS/DSA', 'Dollar Selling/FC Transfer/Travel Agent/CBC'];
  const serviceNames = headers.slice(1);

  // Initialize data with headers
  const formattedData = [headers];

  tokenStats.forEach(entry => {
      const row = [entry.period]; // Start with the period (date or month)
      // Add token counts for each service, filling with 0 if data is missing
      serviceNames.forEach(serviceName => {
          
          const serviceData = entry.services.find(s => s.serviceName === serviceName);

          row.push(serviceData ? serviceData.totalTokens : 0);
      });

      formattedData.push(row);
  });
  return formattedData;
}

// Function to draw the chart
function drawChart(dataset) {
  const data = google.visualization.arrayToDataTable(dataset);
  const options = {
      title: 'Total Token by each Services',
      curveType: 'function',
      legend: { position: 'bottom' },
      hAxis: { title: dataset[0][0] }, // 'Date' or 'Month' based on dataset
      vAxis: { title: 'Tokens' },
      fontName: 'Open Sans'
  };

  const chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
  chart.draw(data, options);
}

// Function to handle view-type selection changes
window.changeData = function changeData() {
  const viewType = document.getElementById("view-type").value;
  const monthDropdown = document.getElementById("month");

  // Show month dropdown only if viewType is daily
  monthDropdown.style.display = viewType === "daily" ? "inline" : "none";
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('year');
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10; // Set the range of years you want

  // Clear any existing options
  yearSelect.innerHTML = '';

  // Add options for each year
  for (let year = currentYear; year >= startYear; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
  }

  // Set the default selected year to the current year
  yearSelect.value = currentYear;
}

// Call populateYearDropdown once on page load to populate the dropdown
window.addEventListener('DOMContentLoaded', () => {
  populateYearDropdown();
});
