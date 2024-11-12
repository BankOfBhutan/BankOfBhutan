import { fetchTellerDetails } from './tellerService.js'; // Import the shared function
import { customAlert} from './alert.js';

// Function to open the modal
function openModal() {
    const modal = document.getElementById('passwordReset');
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('passwordReset');
    modal.style.display = 'none';
}

// Function to show alert message in the modal
function showModal(message) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.style.display = 'block';
}

// Function to reset the alert message
function resetAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.style.display = 'none';
    alertBox.textContent = '';
}




// Set up the modal functionality and form handling
async function setupModalAndForm() {
    const modal = document.getElementById('passwordReset');
    const openButton = document.getElementById('accountBtn');
    const closeButton = document.querySelector('.close');

    // Fetch operator ID and email when setting up the modal
    let operatorId;
    try {
        const tellerDetails = await fetchTellerDetails();
        console.log(tellerDetails);
        operatorId = tellerDetails.operatorId;
        
        // Populate the email field with the teller's email
        document.getElementById('email').value = tellerDetails.email;
    } catch (error) {
        showModal("Error fetching teller details");
        return;
    }

    // Open modal on "Account" button click
    openButton.addEventListener('click', function(event) {
        event.preventDefault();
        openModal();
    });

    // Close modal on "X" button click
    closeButton.addEventListener('click', closeModal);

    // Close modal if user clicks outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) closeModal();
    });

    // Handle form submission with password validation
    const form = modal.querySelector('form');
    form.addEventListener('submit', async function(event) { // Mark the handler as async
        event.preventDefault(); // Prevent form from submitting

        const oldPassword = document.getElementById('oldpassword').value;
        const newPassword = document.getElementById('newpassword').value;
        const confirmPassword = document.getElementById('confirmpassword').value;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            showModal('New password and confirm password do not match!');
            return;
        }

        // Call resetPassword function with operatorId and form data
        try {
            const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/teller/reset', {
                method: 'PATCH',
                headers: {
                    'operator-id': operatorId,
                    'current-password': oldPassword,
                    'new-password': newPassword,
                },
            });
            
            const result = await response.json();
    
            if (result.message) {
                customAlert(result.message);
                closeModal(); // Close the modal on success
            } else {
                customAlert(result.error || "An error occurred.");
            }
        } catch (err) {
            customAlert("Error resetting password");
        }
    });
}

// Initialize modal setup after the DOM is loaded
document.addEventListener('DOMContentLoaded', setupModalAndForm);
