import { fetchTellerDetails } from './tellerService.js'; // Import the shared function

// Fetch active counter count based on service
const fetchActiveCounterCount = async () => {
    try {
        // Fetch teller details to get the service name
        const tellerDetails = await fetchTellerDetails();
        
        // Check if tellerDetails or service is missing
        if (!tellerDetails || !tellerDetails.service) {
       
            document.getElementById('active').innerText = '0';
            return;
        }

        // Get the service name from teller details
        const serviceName = tellerDetails.service;

        // Make a request to the backend API to fetch the active counter count
        const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/teller/teller-count`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'service': serviceName, // Pass the service in the header
            },
            credentials: 'include', // Include cookies for authentication
        });

        const data = await response.json();

        // Check if the request was successful
        if (response.ok && data.status === 'success') {
            // Update the span with the fetched active counter count
            document.getElementById('active').innerText = data.activeTellerCount;
        } else {
            // Handle errors by setting the counter count to 0 or a default value
            document.getElementById('active').innerText = '0';
        }
    } catch (error) {
      
        // Set to 0 in case of error
        document.getElementById('active').innerText = '0';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchActiveCounterCount();
    setInterval(fetchActiveCounterCount, 10000);
});