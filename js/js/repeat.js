import { customAlert } from './alert.js';
import { fetchTellerDetails } from './tellerService.js';
import { startCountdown } from './countDown.js';

// Function to handle repeat token request
const repeatToken = async () => {
    try {
        // Fetch the service name and counter number dynamically
        const tellerDetails = await fetchTellerDetails();

        // Validate teller details
        if (!tellerDetails || !tellerDetails.service || !tellerDetails.counter) {
            customAlert("Service or counter details are missing.");
            return;
        }

        // Send a PATCH request to repeat the token for the specified service and counter
        const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/queue/repeat-token?serviceName=${encodeURIComponent(tellerDetails.service)}&counterNo=${tellerDetails.counter}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Display a success message and start the countdown
            customAlert(`Token ${data.token} has been repeated.`);
            startCountdown();
        } else {
            // Handle case where token is not found
            customAlert("No token found to repeat.");
        }
    } catch (error) {
        console.error("Error repeating token:", error);
        customAlert("An error occurred while repeating the token.");
    }
};

// Event listener to set up the repeat button after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const repeatButton = document.getElementById('repeat-button');
    if (repeatButton) {
        repeatButton.addEventListener('click', repeatToken);
    }
});
