function showOtpModal() {
    return new Promise((resolve, reject) => {
        var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
        otpModal.show();

        // When the user clicks the "Submit OTP" button
        document.getElementById('submitOtpButton').addEventListener('click', function () {
            const otp = document.getElementById('otpInput').value;

            if (!otp) {
                alert('OTP is required to submit the form.');
                return;
            }

            otpModal.hide();  // Close the modal
            resolve(otp);      // Resolve the promise with the entered OTP
        });
    });
}
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
const DS = async (service, Name , email,accountNumber,contact,dsDate,dsTime)=>{
    try {
        const conflictCheck = await axios.post('https://bankofbhutan-w3qb.onrender.com/api/v1/ds/check_Conflict',{email,dsDate,dsTime});

        if (conflictCheck.data.conflict) {
            errorshowModal(conflictCheck.data.message);
            return;
        }
        
        await axios.post('https://bankofbhutan-w3qb.onrender.com/api/v1/ds/send-otp', { email });
        
        const otp = await showOtpModal();
        if (!otp) {
            errorshowModal('OTP is required to submit the form.');
            return;
        }

        const res = await axios({
            method:'POST',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/ds/dollarSelling',
            data:{
                service,
                Name,
                email,
                accountNumber,
                contact,
                dsDate,
                dsTime,
                otp
            },
        })
        console.log(res);
        if (res.data.message === 'Dollar Selling/FC Transfer/ Travel Agent/ CBC Token successfully booked!'){
            showModal('Successfully created appointment check your email');

            const successModal = document.getElementById('successModal');

            successModal.addEventListener('hidden.bs.modal', function () {
                // Show the rating modal after the first modal is closed
                const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
                ratingModal.show();

                const ratingModalElement = document.getElementById('ratingModal');
                ratingModalElement.addEventListener('hidden.bs.modal', function () {
                    window.location.href = '/';
                });
            });
        }

    } catch (error) {
        errorshowModal("Please enter the right OTP");
        
    }
}

document.querySelector('form').addEventListener('submit',(e)=>{
    e.preventDefault()
    const service = 'Dollar Selling/FC Transfer/ Travel Agent/ CBC'
    const Name = document.getElementById('name').value
    const email = document.getElementById('email').value 
    const accountNumber = document.getElementById('Acccountnumber').value 
    const contact = document.getElementById('contact').value
    const dsDate = document.getElementById('Date').value 
    const dsTime = document.getElementById('time-input').value

    const today = new Date().toISOString().split('T')[0];

    const timeParts = dsTime.split(':');
    const hour = parseInt(timeParts[0], 10);  
    const minute = parseInt(timeParts[1], 10);  
    const regex = /^[A-Za-z\s]+$/;
    const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex2 = /^\d{9}$/;
    const regex3 = /^(17|77)\d{6}$/;
 
    const isValidTime = (hour >= 9 && hour < 13) || (hour >= 14 && hour < 17); 
    const minutes = dsTime.split(":")[1];
    if (!Name || !email || !accountNumber || !contact || !dsDate || !dsTime) {
        errorshowModal('Please fill out all fields');
        return;
    }
    if (minutes % 10 !== 0) {
        errorshowModal("Please select a valid time in 10-minute intervals. Eg 9:10,9:20,10:40 etc.");
        return;
    }
    if (!regex.test(Name)) {
        return;
    }
    if (!regex1.test(email)) {
        return;
    }
    if (!regex2.test(accountNumber)) {
        return;
    }
    if (!regex3.test(contact)) {
        return;
    }
    if (!isValidTime) {
        errorshowModal('Dollar Selling/FC Transfer/ Travel Agent/ CBC are not allowed during lunch hours (1:00 PM - 2:00 PM) and off-hours (5:00 PM - 8:59 AM).');
        return;
    }
    if(dsDate === today || dsDate<today ){
        errorshowModal('Dollar Selling/FC Transfer/ Travel Agent/ CBC appointments cannot be created for today and Past.');
        return;
    }
    const dsDay = new Date(dsDate).getDay();

    if (dsDay === 0 || dsDay === 6) {
        errorshowModal('Dollar Selling/FC Transfer/ Travel Agent/ CBCs are not allowed on weekends (Saturday and Sunday).');
        return;
    }   
    DS(service,Name,email,accountNumber,contact,dsDate,dsTime)

})
function validateField(field,errorField, isValid) {
    if (!isValid) {
        field.classList.add('invalid');
        errorField.style.display = 'block';
    } else {
        field.classList.remove('invalid');
        errorField.style.display = 'none';
    }
}
const alphabeticRegex = /^[A-Za-z\s]+$/;
const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regex2 = /^\d{9}$/;
const regex3 = /^(17|77)\d{6}$/;

document.getElementById('name').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = alphabeticRegex.test(referralNumber);
    validateField(this,document.getElementById('name_Error'), isValid);
});
document.getElementById('email').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = regex1.test(referralNumber);
    validateField(this,document.getElementById('error_email'), isValid);
});
document.getElementById('Acccountnumber').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = regex2.test(referralNumber);
    validateField(this,document.getElementById('error_account'), isValid);
});
document.getElementById('contact').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = regex3.test(referralNumber);
    validateField(this,document.getElementById('contact_error'), isValid);
});