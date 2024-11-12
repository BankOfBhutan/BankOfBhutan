// import {showAlert} from './alert.js'

function showModal(message) {
    document.getElementById('wording_for_modal').textContent = message;
    
    var errorModal = new bootstrap.Modal(document.getElementById('successModal'));
    
    errorModal.show();
}
function errorshowModal(message) {
    document.getElementById('wording_for_modal_un').textContent = message;
    
    var errorModal = new bootstrap.Modal(document.getElementById('unsuccessModal'));
    
    errorModal.show();
}
// Function to retrieve a cookie by name
const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';'); // Split the cookies string into individual cookies
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1); // Trim leading spaces
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length); // Return cookie value
    }
    return null; // Return null if the cookie is not found
};

// Example: Retrieve the email from the cookie
const email = getCookie('email');
if (email) {
    console.log('Email from cookie:', email); // Use the retrieved email
} else {
    console.log('Cookie expired or not set');
}


document.getElementById('verifyotp').addEventListener('click',(e)=>{
    e.preventDefault()
    const otp = document.getElementById('otp').value
    verifyOtp(otp)

})

// Submit OTP verification request with the email
const verifyOtp = async (otp) => {
    console.log(email, otp)
    try {
        const res = await axios({
            method: 'POST',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/users/verify-otp',
            data: { email, otp }  // Use email from cookie
        });

        if (res.data.status === 'success') {
            // showAlert('success', 'OTP verified! Redirecting to reset password...');
            showModal("OTP verified! Redirecting to reset password...");
            window.setTimeout(() => {
                location.assign('/forgotpass2');  // Navigate to reset password page
            }, 1500);
        }
    } catch (err) {
        errorshowModal("Error verifying OTP");
        // showAlert('error', err.response.data.message || 'Error verifying OTP');
    }
};

