import { fetchTellerDetails } from './tellerService.js'; // Import the shared function

// Fetch total token count for today's service
const fetchTotalServedTokenCount = async () => {
    try {
        // Fetch teller details to get the service name
        const tellerDetails = await fetchTellerDetails();
        
        // Check if tellerDetails or service is missing
        if (!tellerDetails || !tellerDetails.service) {

            document.getElementById('serve-token').innerText = '0';
            return;
        }

        // Get the service name from teller details
        const serviceName = tellerDetails.service;

        // Make a request to the backend API to fetch the total token count
        const response = await fetch(`http://localhost:4001/api/queue/served-token?serviceName=${encodeURIComponent(serviceName)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });

        const data = await response.json();

        // Check if the request was successful
        if (response.ok) {
            // Update the span with the fetched total token count
            document.getElementById('serve-token').innerText = data.tokenCount;
        } else {
            // Handle errors by setting the token count to 0 or a default value
            document.getElementById('serve-token').innerText = '0';
        }
    } catch (error) {
   
        // Set to 0 in case of error
        document.getElementById('serve-token').innerText = '0';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchTotalServedTokenCount();
    setInterval(fetchTotalServedTokenCount, 10000);
});