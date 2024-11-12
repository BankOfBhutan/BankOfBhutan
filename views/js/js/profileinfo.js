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


document.getElementById('update-password-btn').addEventListener('click', async (e) => {
    e.preventDefault();
  
    // Get input values from form
    const passwordCurrent = document.getElementById('passwordCurrent').value;
    const passwordNew = document.getElementById('passwordNew').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    console.log(passwordConfirm , passwordNew , passwordCurrent)
    // Ensure new passwords match
    if (passwordNew !== passwordConfirm) {
    errorshowModal("New password and confirmation do not match!");
      return;
    }
  
    // Call the updatePassword function to send the request
    await updatePassword(passwordCurrent, passwordNew, passwordConfirm);
  });


  const updatePassword = async (currentPassword, newPassword, newPasswordConfirm) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:4001/api/v1/users/updateMyPassword',  // Adjust the URL as needed
            data: {
                passwordCurrent: currentPassword,   // Current password to validate
                password: newPassword,             // New password
                passwordConfirm: newPasswordConfirm // Confirm new password
            }
        });

        if (res.data.status === 'success') {
            showModal("Password updated successfully");
            window.setTimeout(()=>{
                location.reload();
            },1500)
        }
    } catch (err) {
        errorshowModal("Error chaanging password");
    }
};

const getUserData = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:4001/api/v1/users/getauser',  // Update to match your API endpoint
        });

        if (res.data.status === 'success') {
            // Handle the response data (e.g., display user data on the frontend)
            const userData = res.data.data.user;
            // Display the user data in the UI
            document.getElementById('userName').value = userData.name;
            document.getElementById('userEmail').value = userData.email;
        }
    } catch (err) {
        // Handle error and display it to the user
        const message = err.response && err.response.data.message ? err.response.data.message : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

getUserData();