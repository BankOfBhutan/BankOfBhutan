import { fetchTellerDetails } from './tellerService.js'; // Import the shared function

// Fetch serving tokens based on the service name and display them in the UI
const fetchServingTokens = async () => {
    try {
        // Fetch teller details to get the service name
        const tellerDetails = await fetchTellerDetails();

        // Check if tellerDetails or service is missing
        if (!tellerDetails || !tellerDetails.service) {
            console.error('Service name not found in teller details');
            return;
        }

        // Get the service name from teller details
        const serviceName = tellerDetails.service;
        console.log('Fetching serving tokens for Service Name:', serviceName);

        // Make a request to the backend API to fetch serving tokens
        const response = await fetch(`http://localhost:4001/api/queue/token-in`, {
            method: 'GET',
            headers: {
                'service-name': serviceName,
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies for authentication
        });

        const data = await response.json();
        console.log("serving data",data)
        // Check if the request was successful
        if (response.ok) {
            // Clear the existing table rows
            const tbody = document.querySelector('table.table-bordered tbody');
            tbody.innerHTML = '';

            // Populate the table with new data
            data.servingTokens.forEach(token => {
                const row = document.createElement('tr');
                row.classList.add('clickable-row');
                row.dataset.href = `COUNTER${token.counter}.html`;

                row.innerHTML = `
                    <td>${token.token}</td>
                    <td>Counter ${token.counter}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error('Error fetching serving tokens:', data.error);
        }
    } catch (error) {
        console.error('Error fetching serving tokens:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchServingTokens();
    // setInterval(fetchServingTokens, 1000);
});