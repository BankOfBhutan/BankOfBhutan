const getServiceStats = async () => {
    const selectedService = document.getElementById('serviceSelect').value;
    console.log(selectedService);
    try {
        // Make a request to the backend with the selected service type
        const res = await axios.get(`https://bankofbhutan-w3qb.onrender.com/api/v1/data/getServiceStatsToday`, {
            params: { serviceName: selectedService }  // Ensure you pass 'serviceName' as defined in the controller
        });

        if (res.data.status === 'success') {
            const tableBody = document.querySelector('.table_for_service tbody');
            const noDataMessage = document.getElementById('noDataMessage');

            // Clear existing rows
            tableBody.innerHTML = '';

            // Check if there is data to display
            if (res.data.data.counterStats.length === 0) {
                // Show "No tokens served today" message if no data
                noDataMessage.style.display = 'block';
                noDataMessage.innerText = "No tokens served today"
            } else {
                // Hide the no-data message if data is available
                noDataMessage.style.display = 'none';

                // Populate the table with service stats data
                res.data.data.counterStats.forEach((counterStats) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${counterStats.counter}</td>
                        <td>${counterStats.averageWaitingTime} mins</td>
                        <td>${counterStats.totalTokensCompleted}</td>
                        <td>${counterStats.averageServingTime} mins</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error("Error fetching service data:", error.message);
    }
};

// Example: Attach getServiceStats to a search button
document.getElementById('searchButton').addEventListener('click', getServiceStats);

const getDetailedServiceCountsToday = async () => {
    try {
        // Make a request to the backend for detailed service counts
        const res = await axios.get(`https://bankofbhutan-w3qb.onrender.com/api/v1/data/getDetailedServiceCountsToday`);

        if (res.data.status === 'success') {
            const tableBody = document.querySelector('.table_for_operator tbody');
            const noDataMessage = document.getElementById('noDataMessage1');

            // Clear existing rows
            tableBody.innerHTML = '';

            // Get the max counter number from another source if necessary
            const maxCounter = await getMaxCounterNumber(); // Ensure this function is implemented to return maxCounter
            
            const counterStats = res.data.data.detailedServiceCounts;
            if (counterStats.length === 0) {
                // Show "No tokens served today" message if no data
                noDataMessage.style.display = 'block';
            } else {
                // Hide the no-data message if data is available
                noDataMessage.style.display = 'none';

                // Populate table with rows from 1 to maxCounter
                for (let i = 1; i <= maxCounter; i++) {
                    // Find data for the current counter if it exists
                    const dataForCounter = counterStats.find(item => item.counter === i.toString());

                    const row = document.createElement('tr');
                    if (dataForCounter) {
                        // If data exists for this counter, display it
                        row.innerHTML = `
                            <td>${dataForCounter.counter}</td>
                            <td>${dataForCounter.totalTokens || 0}</td>
                            <td>${dataForCounter.skippedTokens || 0}</td>
                            <td>${dataForCounter.completedTokens || 0}</td>
                            <td>${dataForCounter.forwardedTokens || 0}</td>
                        `;
                    } else {
                        // Otherwise, set all other fields to 0
                        row.innerHTML = `
                            <td>${i}</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                        `;
                    }
                    tableBody.appendChild(row);
                }
            }
        }
    } catch (error) {
        const noDataMessage = document.getElementById('noDataMessage1');
        // Show "No tokens served today" message if there's an error or no data
        noDataMessage.style.display = 'block';
        console.error("Error fetching detailed service counts:", error.message);
    }
};

const getMaxCounterNumber = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getMaxCounterNumber' // Update to match your API endpoint
        });
  
        if (res.data.status === 'success') {
            const maxCounter = res.data.data.maxCounter;
            return maxCounter;
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};
getDetailedServiceCountsToday()