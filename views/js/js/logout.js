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

document.getElementById('logout').addEventListener('click',(e)=>{
    e.preventDefault()
    logout()
})

const logout = async () => {
    try {
        // Send a GET request to the logout endpoint on the server
        const res = await axios({
            method: 'GET', 
            url: 'http://localhost:4001/api/v1/users/logout', // Adjust the URL if needed
        });

        // If the logout is successful, redirect to the homepage or login page
        if (res.data.status === 'success') {
            // showAlert('success', 'Logged out successfully');
            showModal("Logged out successfully");
            window.setTimeout(() => {
                location.assign('/');  // Redirect to the homepage or login page
            }, 1500);
        }
    } catch (err) {
        // showAlert('error', 'Error logging out, please try again');
        errorshowModal("Error logging out, please try again");
    }
};