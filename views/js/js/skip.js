import { fetchServingCurrentToken } from './token.js';
import { customAlert, customConfirm } from './alert.js';


// //skip function
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skipTokenBtn').addEventListener('click', async function() {
        const token = await fetchServingCurrentToken();
        const currentToken = token.token;

        if (!currentToken) {
          
            customAlert('No token number found to skip.');
            return;
        }

        customConfirm("Are you sure you want to skip this token?", async function(userConfirmed) {
            if (!userConfirmed) return;

            try {
                const response = await fetch('http://localhost:4001/api/queue/skip-token', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'token-number': currentToken
                    }
                });

                if (response.ok) {
                    customAlert('Token skipped successfully!');
                    // window.location.reload();

                    // await fetchTotalCurrentToken();
                } else {
                    customAlert('Token not found!');
                }
            } catch (error) {
                customAlert('An error occurred while skipping the token.');
            }
        });
    });
});
