
google.charts.load('current', { packages: ['corechart'] });


// Populate the year dropdown with dynamic range
function populateYearDropdown() {
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; // Define the range, e.g., last 10 years

    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

// Fetch and draw data based on user input
window.fetchAndDrawData = async function fetchAndDrawData() {
    const personId = document.getElementById('person-select').value;
    const viewType = document.getElementById('data-type').value;
    const year = document.getElementById('year').value;
    const month = viewType === 'daily' ? document.getElementById('month').value : null;

    const endpoint = viewType === 'daily' 
        ? 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getDailyTokenDataBySingleOperator' 
        : 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getMonthlyTokenDataBySingleOperator';
    const params = { operatorId: personId, year };
    if (viewType === 'daily') params.month = month;

    try {
        const res = await axios.get(endpoint, { params });
        if (res.data.status === 'success') {
            const data = res.data.data;
            console.log(data)
            if (viewType === 'daily' && data.dailyData.length === 0 || viewType === 'monthly' && data.monthlyData.length === 0) {
                displayNoDataMessage();
                return;
            }
            google.charts.setOnLoadCallback(drawChart(formatDataForChart(data, viewType)));
        }
    } catch (error) {
        console.log("Error fetching data:", error.message);
    }
}

function formatDataForChart(data, viewType) {
    const headers = [viewType === 'daily' ? 'Date' : 'Month', 'Tokens'];
    const rows = viewType === 'daily' ? data.dailyData : data.monthlyData;
    const formattedData = [headers];

    // Define month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // If it's daily data, use selectedMonth for the month name
    const selectedMonthName = monthNames[data.selectedMonth - 1];

    rows.forEach(item => {
        const label = viewType === 'daily'
            ? `${selectedMonthName} ${item.day}`  // Format as "Nov 1", "Nov 2", etc.
            : monthNames[item.month - 1];         // For monthly, just the month name
        formattedData.push([label, item.totalTokens]);
    });

    return formattedData;
}




// Draw the chart
function drawChart(dataset) {
    const data = google.visualization.arrayToDataTable(dataset);
    const options = {
        title: `Token Statistics`,
        curveType: 'function',
        legend: { position: 'bottom' },
        hAxis: { title: dataset[0][0] },
        vAxis: { title: 'Tokens' },
        fontName: 'Open Sans'
    };
    const chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

// Display "No Data Found" message
function displayNoDataMessage() {
    const chartContainer = document.getElementById('curve_chart');
    chartContainer.innerHTML = '<p style="text-align: center; font-size: 18px;">No data found within the selected range.</p>';
}

// Show or hide month dropdown based on data type
window.toggleMonthVisibility = function toggleMonthVisibility() {
    const viewType = document.getElementById("data-type").value;
    document.getElementById("month").style.display = viewType === "daily" ? "inline" : "none";
}

// Populate year dropdown on page load
window.addEventListener('DOMContentLoaded', () => {
    populateYearDropdown();
});


const populateTellerTable = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getTellerForGraph',  // Use the new tellers endpoint
            withCredentials: true  // Ensure cookies are sent
        });

        if (res.data.status === 'success') {
            const tellers = res.data.data;
            // Assuming you have a <select> dropdown with id "person-select" in your HTML
            const personSelect = document.getElementById('person-select');
            personSelect.innerHTML = ''; // Clear existing options

            // Iterate over tellers to populate dropdown options
            tellers.forEach((teller, index) => {
                const option = document.createElement('option');
                option.value = teller._id;  // Set _id as the option value
                option.textContent = `${teller.operatorId}`;  // Display operatorId as the option text

                // Append each option to the select dropdown
                personSelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch tellers');
        }
    } catch (err) {
        console.error('Error fetching tellers:', err);
    }
};
populateTellerTable()