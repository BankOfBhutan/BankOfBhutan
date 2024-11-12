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

function generateRandomPassword(length = 12) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()_+[]{}|;:,.<>?';
    
    // Combine all characters
    const allCharacters = uppercase + lowercase + numbers + specialCharacters;
    
    let password = '';
    
    for (let i = 0; i < length; i++) {
        // Pick a random character from the combined string
        const randomIndex = Math.floor(Math.random() * allCharacters.length);
        password += allCharacters[randomIndex];
    }
    
    return password;
}

document.getElementById('addoperator').addEventListener('click',(e)=>{
    e.preventDefault()
    const email = document.getElementById('email').value
    const name = document.getElementById("opname").value
    const service = document.getElementById("serviceDropdown").value
    const counter = document.getElementById("opcnumber").value
    const password = generateRandomPassword(16); 
    console.log(password)
    signup(name,email,password,service,counter)

})


export const signup = async(name,email,password,service,counter)=>{
    try{
        const res = await axios({
            method:'POST',
            url:'http://localhost:4001/api/v1/users/signup',
            data:{
                name,
                email,
                password,
                service,
                counter,
            },
        })
        if(res.data.status==='success'){
            showModal("Account created successfully");
            window.setTimeout(()=>{
                location.reload();
            },1500)
        }

    }catch(err){
        errorshowModal("Error: Password are not the same!")
    }
}