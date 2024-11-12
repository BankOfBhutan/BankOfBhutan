import { fetchServingCurrentToken } from './token.js';
import { customAlert, customConfirm } from './alert.js';

// forward to other service
document.addEventListener("DOMContentLoaded", async function() {
    const modal = document.getElementById("forwardModal");
    const btn = document.getElementById("openModalButton");
    const span = document.getElementsByClassName("close")[0];
    const forwardBtn = document.querySelector(".forward-btn");
    const tokenInput = document.getElementById("currenttoken");

    let currentToken = "N/A"
    try {
        const token = await fetchServingCurrentToken();
        currentToken = token.token;
      
    } catch (error) {
        
    }

    if (!btn) {
        return;
    }

    btn.onclick = function() {
        tokenInput.value = currentToken;
        modal.style.display = "block";
    };

    span.onclick = function() {
      
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
        
            modal.style.display = "none";
        }
    };

    forwardBtn.onclick = async function() {
        const serviceSelect = document.querySelector("select");
        if (!serviceSelect) {
            customAlert("Service dropdown is missing. Please check the form.");
            return;
        }

        const tokenNumber = tokenInput.value;
        if (tokenNumber.startsWith("O")) {
            customAlert("Online tokens cannot be forwarded.");
            return;
        }

        const newServiceName = serviceSelect.selectedIndex > 0 ? serviceSelect.options[serviceSelect.selectedIndex].value : null;
        if (!newServiceName) {
            customAlert("Please select a service.");
            return;
        }

        try {
            const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/queue/other-service', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'token-number': tokenNumber,
                    'new-service-name': newServiceName
                }
            });

            const result = await response.json();
            if (result.message) {
                customAlert(result.message);
                modal.style.display = "none";
                // window.location.reload();

            } else {
                customAlert(result.error || "An error occurred.");
            }
        } catch (error) {
            customAlert("An error occurred while forwarding the token.");
        }
    };
});
