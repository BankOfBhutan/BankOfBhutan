// // import { json } from 'express/lib/response.js'
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

const login = async(email,password)=>{
    try{
        const res = await axios({
            method:'POST',
            url:'http://localhost:4001/api/v1/users/login',
            data:{
                email,
                password,
            },
        })
        if(res.data.status==='success'){
        var obj = res.data.data.user
        console.log(obj);


        document.cookie =' token = '+JSON.stringify(obj) 
            showModal("logged in successfully");
            if(obj.role === 'admin'){
                window.setTimeout(()=>{
                    location.assign('/dashboard')
                },1500)
            }else{
                window.setTimeout(()=>{
                    location.assign('/Teller')
                },1500)
            }
           
        }
        

    }catch(err){
        // console.log(err)
        errorshowModal("Incorrect email or password");

    }
}


document.getElementById('subbtn').addEventListener('click',(e)=>{
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email,password)

})

