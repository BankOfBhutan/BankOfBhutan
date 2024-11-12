import {showAlert} from './alert.js'


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
// Function to set a cookie with expiration time in minutes
const setCookie = (name, value, minutes) => {
    const date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000)); // Set expiration time
    const expires = "expires=" + date.toUTCString(); // Format the expiration date
    document.cookie = `${name}=${value}; ${expires}; path=/;`; // Set the cookie
};


document.getElementById('searchemail').addEventListener('click',(e)=>{
    e.preventDefault()
    const email = document.getElementById('email').value
    sendOtp(email)

})

const sendOtp = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:4001/api/v1/users/send-otp',  // Assuming your route for sending OTP is defined like this
            data: {
                email,
            },
        });

        if (res.data.status === 'success') {
            // Example: Store the email in the cookie for 10 minutes
            const storeEmail = (email) => {
                setCookie('email', email, 10); // Store the email for 10 minutes
            };
            storeEmail(email)
            showModal("OTP sent to your email successfully check your email");
            // showAlert('success', 'OTP sent to your email successfully');
            window.setTimeout(()=>{
                location.assign('/forgotpass1')
            },1500)
        }
    } catch (err) {
        errorshowModal("Your email does not exist")
        // showAlert('error', err.response ? err.response.data.message : 'Error sending OTP');
    }
};