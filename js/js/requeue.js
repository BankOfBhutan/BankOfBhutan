
import { fetchServingCurrentToken } from './token.js';
import { customAlert, customConfirm } from './alert.js';
import { fetchTellerDetails } from './tellerService.js';

// Event listener for the requeue button
document.getElementById('requeueTokenBtn').addEventListener('click', async function() {
    const token = await fetchServingCurrentToken();
    const tellerDetails = await fetchTellerDetails();
    const currentToken = token.token;
    const serviceName = tellerDetails.service;
    if (!currentToken) {
      
        customAlert('No token number found to requeue.');
        return;
    }
    if (!serviceName) {
      
        customAlert('Service name not found.');
        return;
    }
   

    // Check if the token starts with "O" (indicating an online token)
    if (currentToken.startsWith('O')) {
        
        customAlert("Online tokens cannot be requeued.");
    } else {
        // Display confirmation dialog
        customConfirm("Are you sure you want to requeue this token?", async function(userConfirmed) {
            if (!userConfirmed) return;

            try {
                const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/queue/requeue', {
                    method: 'GET', // Change this method to 'POST' or 'PUT' if appropriate
                    headers: {
                        'token-number': currentToken,
                        'service-name': serviceName
                    }
                });

                const result = await response.json();
           

                if (response.ok) {
                    customAlert('Token requeued successfully!');
                    window.location.reload();
                    document.getElementById('form-container').innerHTML = '<p>Currently, form not available for this token.</p>';
                } else {
                    customAlert(`Error: ${result.error}`);
                }
            } catch (error) {
            
                customAlert('An error occurred while requeuing the token.');
            }
        });
    }
});
