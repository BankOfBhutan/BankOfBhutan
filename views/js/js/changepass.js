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

document.getElementById('confirm').addEventListener('click',(e)=>{
    e.preventDefault()
    const password = document.getElementById('pass1').value
    const passwordConfirm = document.getElementById('pass2').value
    resetPassword(email, password, passwordConfirm)

})


const resetPassword = async (email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:4001/api/v1/users/reset-password',
            data: {
                email,  // This should come from the previous step
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            showModal("Password changed successfully!");
            // showAlert('success', 'Password changed successfully!');
            window.setTimeout(() => {
                location.assign('/');  // Redirect to login page
            }, 1500);
        }
    } catch (err) {
        errorshowModal("Error resetting password");
        // showAlert('error', err.response.data.message || 'Error resetting password');
    }
};