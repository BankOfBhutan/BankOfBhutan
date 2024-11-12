import { fetchTellerDetails } from './tellerService.js';
import { checkDepositData, checkWithdrawData} from './forms.js';
import { fetchServingCurrentToken } from './token.js';
import { customAlert, customConfirm } from './alert.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forwardTokenBtn').addEventListener('click', async function() {
        const token = await fetchServingCurrentToken();
        const currentToken = token.token;
        if (!currentToken) {
            return;
        }

        if (currentToken.startsWith("O")) {
            customAlert("Online tokens cannot be sent back to the queue.");
        } else {
            customConfirm("Are you sure you want to send this token back to the queue?", async function(userConfirmed) {
                if (!userConfirmed) return;

                try {
                    const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/queue/other-counter', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'token-number': currentToken
                        }
                    });

                    if (response.ok) {
                        customAlert('Token successfully sent back to the queue!');
                        document.getElementById('form-container').innerHTML = '<p>Currently, form not available for this token.</p>';
                        // window.location.reload();
                    } else {
                        const result = await response.json();
                        customAlert(`Error: ${result.error}`);
                    }
                } catch (error) {
                    customAlert('An error occurred while sending the token back to the queue.');
                }
            });
        }
    });
});

