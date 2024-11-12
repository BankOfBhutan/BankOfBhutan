


import { fetchTellerDetails } from './tellerService.js';
import { checkDepositData, checkWithdrawData } from './forms.js';
import { customAlert, customConfirm } from './alert.js';

// Function to open the modal
function openModal() {
    const modal = document.getElementById('callTokenModal');
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('callTokenModal');
    modal.style.display = 'none';
}

// Set up the modal functionality and form handling
function setupModalAndForm() {
    const modal = document.getElementById('callTokenModal');
    const openButton = document.getElementById('openCallTokenModal');
    const closeButton = document.querySelector('.close');

    // Open modal on button click
    openButton.addEventListener('click', openModal);

    // Close modal on 'X' button click
    closeButton.addEventListener('click', closeModal);

    // Close modal if user clicks outside of it
    window.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    // Handle form submission within the modal
    document.getElementById('callTokenForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const token = document.getElementById('token').value;
        if (!token) {
            customAlert('Please enter a token number.');
            return;
        }

        try {
            // Fetch teller details
            const tellerDetails = await fetchTellerDetails();
            const counterNo = tellerDetails.counter;
            const serviceName = tellerDetails.service;
            const operatorId = tellerDetails.operationID;

            // Make API request to call specific token
            const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/queue/specific-token', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'token-number': token,
                    'counter-number': counterNo,
                    'operatorId': operatorId,
                },
            });

            const result = await response.json();

            if (response.ok) {
                // Successfully called token, close modal and show success alert
                closeModal();
                customAlert(`Token ${result.token.token} called successfully at Counter ${counterNo}.`);
                // window.location.reload();

            } else {
                customAlert(`${result.message || 'Unable to call the token. Please try again.'}`);
            }
        } catch (error) {
            customAlert('Failed to call the token. Please try again later.');
        }
    });
}

document.addEventListener('DOMContentLoaded', setupModalAndForm);
