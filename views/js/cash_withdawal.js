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
const cash_withdrawal = async (service, Name,email, accountNumber, amount,contact, withdrawalDate ,WithdrawalTime)=>{
    try {
        const conflictCheck = await axios.post('https://bankofbhutan-w3qb.onrender.com/api/v1/withdrawals/check_Conflict',{email,withdrawalDate,WithdrawalTime});

        if (conflictCheck.data.conflict) {
            errorshowModal(conflictCheck.data.message);
            return;
        }
        await axios.post('https://bankofbhutan-w3qb.onrender.com/api/v1/withdrawals/send-otp', { email });
        
        const otp = await showOtpModal();
        if (!otp) {
            errorshowModal('OTP is required to submit the form.');
            return;
        }
        const res = await axios({
            method:'POST',
            url : 'https://bankofbhutan-w3qb.onrender.com/api/v1/withdrawals/withdrawal',
            data:{
                service,
                Name,
                email, 
                accountNumber, 
                amount, 
                contact, 
                withdrawalDate ,
                WithdrawalTime,
                otp

            },
        })
        console.log(res)

        if (res.data.message === 'Withdrawal successfully submitted!'){
            showModal('Successfully created appointment check your email');

            // Get the modal element
            const successModal = document.getElementById('successModal');

            // Listen for the modal close event (when it's fully hidden)
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
    const service = 'Cash Withdrawal'
    const Name = document.getElementById('name').value
    const email = document.getElementById('email').value 
    const accountNumber = document.getElementById('Acccountnumber').value 
    const amount = document.getElementById('amount').value
    const contact = document.getElementById('Contact').value
    const withdrawalDate = document.getElementById('Date').value 
    const withdrawalTime = document.getElementById('time-input').value
    
    const today = new Date().toISOString().split('T')[0];

    const timeParts = withdrawalTime.split(':');
    const hour = parseInt(timeParts[0], 10);  
    const minute = parseInt(timeParts[1], 10);  
    const regex = /^[A-Za-z\s]+$/;
    const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex2 = /^\d{9}$/;
    const regex3 = /^(17|77)\d{6}$/;

    const isValidTime = (hour >= 9 && hour < 13) || (hour >= 14 && hour < 17);
    
    const minutes = withdrawalTime.split(":")[1];
    
    if (!isValidTime) {
        errorshowModal('withdrawal appointments are not allowed during lunch hours (1:00 PM - 2:00 PM) and off-hours (5:00 PM - 8:59 AM).');
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
    if(withdrawalDate === today || withdrawalDate<today ){
        errorshowModal('Withdrawal appointments cannot be created for today and Past.');
        return;
    }
    const withdrawalDay = new Date(withdrawalDate).getDay();

    if (withdrawalDay === 0 || withdrawalDay === 6) {
        errorshowModal('withdrawal appointments are not allowed on weekends (Saturday and Sunday).');
        return;
    }

    cash_withdrawal( service,
        Name,
        email, 
        accountNumber, 
        amount, 
        contact,  
        withdrawalDate ,
        withdrawalTime)

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
const regex4 = /^[0-9]*$/;
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
document.getElementById('Contact').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = regex3.test(referralNumber);
    validateField(this,document.getElementById('contact_error'), isValid);
});
document.getElementById('amount').addEventListener('input', function () {
    const referralNumber = this.value.trim();
    const isValid = regex4.test(referralNumber);
    validateField(this,document.getElementById('error_amt'), isValid);
});