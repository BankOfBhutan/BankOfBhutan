import { showAlert } from './alert.js';
google.charts.load('current', { packages: ['corechart'] });
var tokenCounts;

function formatDateString(dateString) {
    // Create a date object from the input string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
    }

    const year = date.getFullYear(); // Get the full year (YYYY)
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed, so add 1) and pad with 0
    const day = String(date.getDate()).padStart(2, '0'); // Get the date and pad with 0

    return `${year}-${month}-${day}`; // Return the formatted string in YYYY-MM-DD
}

// Load Google Charts and set the callback to draw the chart initially
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(() => getTokenTypeCounts());  // Load today’s data initially

// Function to draw the first pie chart based on `tokenCounts`
function drawFirstChart(tokenCounts) {
    let data1;

    // Determine if data is available for "online" and "walk-in" tokens
    const onlineToken = tokenCounts.find(token => token.tokenType === 'online');
    const walkInToken = tokenCounts.find(token => token.tokenType === 'walk-in');

    // Setup data for the chart based on availability
    data1 = google.visualization.arrayToDataTable([
        ['Service', 'Total Tokens'],
        ['Walk In', walkInToken ? walkInToken.count : 0],
        ['Appointment', onlineToken ? onlineToken.count : 0]
    ]);

    const options1 = {
        title: 'Token (First Pie Chart)',
        is3D: true,
        fontName: 'Open Sans',
    };

    const chart1 = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart1.draw(data1, options1);
}

// Function to draw the chart
function drawChart(chartData) {
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: 'Token Taken by Service for Appointment',
        chartArea: { width: '48%' },
        hAxis: { title: 'Service' },
        vAxis: { title: 'Total Tokens', minValue: 0 },
        isStacked: true,
        is3D: true,
        bars: 'vertical',
        height: 280,
        fontName: 'Open Sans',
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('piechart_3dbar'));
    chart.draw(data, options);
}

google.charts.setOnLoadCallback(() => drawChart())
// Function to fetch token type counts and update charts and tables
const getTokenTypeCounts = async (startDate, endDate) => {
    try {
        // Set parameters based on dates provided
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        // Fetch data from API
        const res = await axios.get('https://bankofbhutan-w3qb.onrender.com/api/v1/data/getTokenTypeCounts', { params });

        if (res.data.status === 'success') {
            tokenCounts = res.data.data;
            google.charts.setOnLoadCallback(() => drawFirstChart(tokenCounts));  // Update pie chart
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

const getAppointmentInfo = async (startDate, endDate) => {
    try {
        // Set parameters based on dates provided
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        // Fetch data from API
        const res = await axios.get('https://bankofbhutan-w3qb.onrender.com/api/v1/data/getAppointmentInfo', { params });

        if (res.data.status === 'success') {
            const appointmentInfo = res.data.data.appointments;
            populateAppointmentTables(appointmentInfo);  // Populate tables with fetched data
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

const getFeedbackInfo = async (startDate, endDate) => {
    try {
        // Set parameters based on dates provided
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        // Fetch data from API
        const res = await axios.get('https://bankofbhutan-w3qb.onrender.com/api/v1/data/getFeedbackInfo', { params });

        if (res.data.status === 'success') {
            const feedback = res.data.data.feedbackToday;
            populateFeedbackTable(feedback);  // Populate tables with fetched data
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

const getTokensForAppointmentsByService = async (startDate, endDate) => {
    try {
        // Set parameters based on dates provided
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        // Fetch data from API
        const res = await axios.get('https://bankofbhutan-w3qb.onrender.com/api/v1/data/getTokensForAppointmentsByService', { params });

        if (res.data.status === 'success') {
            const data = res.data.data.result;

            // Define all possible services
            const allServices = [
                'RTGS',
                'ATS/DSA',
                'Cash (Deposit/Withdraw)',
                'Dollar Selling/FC Transfer/Travel Agent/CBC',
                'SWIFT'
            ];

            // Initialize chart data
            const chartData = [['Service', 'Tokens']];
            const serviceCounts = {};

            // Initialize counts to zero for all services
            allServices.forEach(service => {
                serviceCounts[service] = 0; // Start all counts at zero
            });

            // Update counts based on API response
            data.forEach(item => {
                serviceCounts[item.service] = item.count; // Set the count for the returned service
            });

            // Prepare chart data
            allServices.forEach(service => {
                chartData.push([service, serviceCounts[service]]); // Push the service and its count
            });

            // Call drawChart with the dynamic data
            drawChart(chartData);
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

// Function to populate the tables with new data
function populateAppointmentTables(data) {
    const serviceTableBody = document.querySelector('#tableforappoint tbody');
    // Clear existing rows
    serviceTableBody.innerHTML = '';
    // Populate Service Table
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        var formattedDate = formatDateString(item.date);
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.token || 'N/A'}</td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.accountNumber || 'N/A'}</td>
            <td>${item.email || 'N/A'}</td>
            <td>${formattedDate || 'N/A'}</td>
            <td>${item.issueTime || 'N/A'}</td>
        `;
        serviceTableBody.appendChild(row);
    });
}

function populateFeedbackTable(feedbackData) {
    const feedbackTableBody = document.querySelector('#feedbacktable tbody');
    // Clear existing rows
    feedbackTableBody.innerHTML = '';

    // Check if feedbackData is an array and has data
    if (Array.isArray(feedbackData) && feedbackData.length > 0) {
        feedbackData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td> <!-- SL.NO -->
                <td>${item.rating || 'N/A'}</td> <!-- Rating -->
                <td>${item.comment || 'N/A'}</td> <!-- Comment -->
            `;
            feedbackTableBody.appendChild(row);
        });
    } else {
        // If no data, display a message or handle it as needed
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" style="text-align:center;">No feedback available</td>
        `;
        feedbackTableBody.appendChild(row);
    }
}


// Event listener for the date input and search button
document.querySelector('#searchdateappointment').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        showAlert('error', 'Start date cannot be after end date.');
        return;
    }

    getTokenTypeCounts(startDate, endDate);  // Fetch data for selected date range
    getAppointmentInfo(startDate, endDate);
    getFeedbackInfo(startDate, endDate);
    getTokensForAppointmentsByService(startDate, endDate)
});

// Initial call to load today’s data
getTokenTypeCounts();
getAppointmentInfo();
getFeedbackInfo();
getTokensForAppointmentsByService();