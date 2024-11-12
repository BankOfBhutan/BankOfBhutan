import { fetchTellerDetails } from './tellerService.js';

const fetchTotalTokenCount = async () => {
    try {
        const tellerDetails = await fetchTellerDetails();

        // Check if tellerDetails or service is missing
        if (!tellerDetails || !tellerDetails.service) {
            document.getElementById('service').innerText = 'Service not found';
            return;
        }

        const serviceName = tellerDetails.service;
        document.getElementById('counter').innerText = `COUNTER ${tellerDetails.counter}`;
        document.getElementById('service').innerText = serviceName;

        const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/queue/total-token?serviceName=${encodeURIComponent(serviceName)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });

        if (!response.ok) {
            document.getElementById('total-token-count').innerText = '0';
            return;
        }

        const data = await response.json();

        // Check if data contains tokenCount
        if (data && typeof data.tokenCount === 'number') {
            document.getElementById('total-token-count').innerText = data.tokenCount;
        } else {
            document.getElementById('total-token-count').innerText = '0';
        }

    } catch (error) {
        document.getElementById('total-token-count').innerText = '0';
    }
};



// Fetch initial token count when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTotalTokenCount();
    setInterval(fetchTotalTokenCount, 10000);

});
