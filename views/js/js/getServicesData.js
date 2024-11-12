import {showAlert} from './alert.js'

const allServices = [
    'ATS/DSA',
    'Dollar Selling/FC Transfer/Travel Agent/CBC',
    'Cash (Deposit/Withdraw)',
    'RTGS',
    'SWIFT'
];

// Function to populate the service table with all five services, filling in 'No Data' where data is missing
function populateServiceTable(serviceStats) {
    const tableBody = document.querySelector('#servicesdatatable tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';

    // Create a map of service data by service name
    const serviceDataMap = {};
    serviceStats.forEach(stat => {
        serviceDataMap[stat.serviceName] = stat;
    });

    // Iterate over allServices to ensure each one has a row in the table
    allServices.forEach(serviceName => {
        const row = document.createElement('tr');
        
        // Retrieve the data for the current service, if available; otherwise, use 'No Data'
        const stat = serviceDataMap[serviceName];
        const averageWaitingTime = stat ? `${stat.averageWaitingTime} mins` : 'No Data';
        const averageServingTime = stat ? `${stat.averageServingTime} mins` : 'No Data';
        const totalTokensIssued = stat ? stat.totalTokensIssued : 'No Data';
        const averageCustomersPerDay = stat ? stat.averageCustomersPerDay.toFixed(2) : 'No Data';

        // Create row with data or 'No Data' placeholders
        row.innerHTML = `
            <td>${serviceName}</td>
            <td>${averageWaitingTime}</td>
            <td>${totalTokensIssued}</td>
            <td>${averageCustomersPerDay}</td>
        `;

        tableBody.appendChild(row);
    });
}


const getServiceStatsInRange = async (startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await axios.get('https://bankofbhutan-w3qb.onrender.com/api/v1/data/getServiceStatsInRange', { params });

        if (res.data.status === 'success') {
            const serviceStats = res.data.data.serviceStats;

            populateServiceTable(serviceStats);
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};


document.querySelector('#searchdateservices').addEventListener('click', () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        showAlert('error', 'Start date cannot be after end date.');
        return;
    }

    getServiceStatsInRange(startDate, endDate);  // Fetch data for selected date range

});

getServiceStatsInRange()