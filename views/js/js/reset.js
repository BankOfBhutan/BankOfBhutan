import { customAlert, customConfirm } from './alert.js';

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

// Asynchronous function to handle password reset API call
const resetPassword = async (email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/users/reset-password',
            data: {
                email,
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            customAlert("Password changed successfully!");
           
        }
    } catch (err) {
        customAlert("Error resetting password");
    }
};

// Set up the modal functionality and form handling
function setupModalAndForm() {
    const modal = document.getElementById('passwordReset');
    const openButton = document.getElementById('accountBtn');
    const closeButton = document.querySelector('.close');

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
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from submitting

        const email = document.getElementById('email').value;
        const newPassword = document.getElementById('newpassword').value;
        const confirmPassword = document.getElementById('confirmpassword').value;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            showModal('New password and confirm password do not match!');
            return;
        }

        // Call resetPassword function with form data
        resetPassword(email, newPassword, confirmPassword);
    });
}

// Initialize modal setup after the DOM is loaded
document.addEventListener('DOMContentLoaded', setupModalAndForm);
