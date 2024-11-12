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
const swift_submit = async (
    service,
    Reference,
    approval,
    cid,
    customerName,
    customerAddress,
    BIC,
    remit,
    product,
    issueDate,
    expiryDate,
    valueDate,
    currency,
    amount,
    bankName,
    bankAddress,
    swiftCode,
    name,
    accountNumber,
    address,
    purpose,
    declarationNo,
    charge,
    education,
    swiftDate,
    swiftTime,
    institutionName,
    institutionAddress,
    course,
    DateofCommencement,
    duration,
    DateofTravel,
    travelTime,
    TuitionFeesCurrency,
    TuitionFeesAmount,
    TuitionFees,
    StipendCurrency,
    StipendAmount,
    Stipendpayment,
    allowanceCurrency,
    allowanceAmount,
    allowance,
    TotalAmount,
    Accountno,
    Contact,
    Place,
    email
) => {
    try {
        const conflictCheck = await axios.post('http://localhost:4001/api/v1/swift/check_Conflict',{email,swiftDateDate,swiftTime});

        if (conflictCheck.data.conflict) {
            errorshowModal(conflictCheck.data.message);
            return;
        }
        // Send OTP to the user's email
        await axios.post('http://localhost:4001/api/v1/swift/send-otp', { email });
        const otp = await showOtpModal();
        if (!otp) {
            errorshowModal('OTP is required to submit the form.');
            return;
        }
        const res = await axios.post('http://localhost:4001/api/v1/swift/swift', {
            service,
            Reference,
            approval,
            cid,
            customerName,
            customerAddress,
            BIC,
            remit,
            product,
            issueDate,
            expiryDate,
            valueDate,
            currency,
            amount,
            bankName,
            bankAddress,
            swiftCode,
            name,
            accountNumber,
            address,
            purpose,
            declarationNo,
            charge,
            education,
            swiftDate,
            swiftTime,
            institutionName,
            institutionAddress,
            course,
            DateofCommencement,
            duration,
            DateofTravel,
            travelTime,
            TuitionFeesCurrency,
            TuitionFeesAmount,
            TuitionFees,
            StipendCurrency,
            StipendAmount,
            Stipendpayment,
            allowanceCurrency,
            allowanceAmount,
            allowance,
            TotalAmount,
            Accountno,
            Contact,
            Place,
            email,
            otp
            
            
        });
        console.log(res);

        if (res.data.message === 'Swift transaction submitted successfully') {
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
        } else {
            errorshowModal('Submission failed. Please try again.');
        }
    } catch (error) {
        console.error("Error submitting Swift data: ", error);
        errorshowModal('Failed to submit Swift data, please try again later.');
    }
};
document.querySelector('form').addEventListener('submit',(e)=>{
    e.preventDefault();

    const service = 'Swift';
    const Reference =document.getElementById('Reference').value;
    const approval = document.getElementById('approval').value;
    const cid = document.getElementById('cid').value;
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const BIC = document.getElementById('BIC').value;
    const remit = document.getElementById('remit').value;
    const product = document.getElementById('product').value;
    const issueDate = document.getElementById('issueDate').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const valueDate = document.getElementById('valueDate').value;
    const currency = document.getElementById('currency').value;
    const amount = document.getElementById('amount').value;
    const bankName = document.getElementById('bankName').value;
    const bankAddress = document.getElementById('bankAddress').value;
    const swiftCode = document.getElementById('swiftCode').value;
    const name = document.getElementById('name').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const address = document.getElementById('address').value;
    const purpose = document.querySelector('input[name="payment"]:checked').value;
    console.log(purpose)
   
    let declarationNo = null;
    if (purpose === 'Advance Payment/Final Payment'){
        declarationNo = document.getElementById('declarationNo').value;
    }
   
    const charge = document.querySelector('input[name="charges"]:checked').value;
    const education =  document.querySelector('input[name="education"]:checked').value;
    const swiftDate = document.getElementById('date-input').value;
    const swiftTime = document.getElementById('time-input').value;

    let institutionName = null;
    let institutionAddress = null;
    let course = null;
    let DateofCommencement = null;
    let duration = null;
    let DateofTravel = null;
    let travelTime = null;
    let TuitionFeesCurrency = null;
    let TuitionFeesAmount = null;
    let TuitionFees = null;
    let StipendCurrency = null;
    let StipendAmount = null;
    let Stipendpayment = null;
    let allowanceCurrency = null;
    let allowanceAmount = null;
    let allowance = null;
    let TotalAmount = null;
    let Accountno = null;
    let Contact = null;
    let Place = null;

    if(education === 'Yes'){
         institutionName = document.getElementById('institutionName').value;
         institutionAddress = document.getElementById('institutionAddress').value;
         course = document.getElementById('course').value;
         DateofCommencement = document.getElementById('DateofCommencement').value;
         duration = document.getElementById('duration').value;
         DateofTravel = document.getElementById('DateofTravel').value;
         travelTime = document.getElementById('travelTime').value;
         TuitionFeesCurrency = document.getElementById('TuitionFeesCurrency').value=currency;
         TuitionFeesAmount = document.getElementById('TuitionFeesAmount').value;
         TuitionFees = document.querySelector('input[name="TuitionFees"]:checked').value;
       
      

         StipendCurrency = document.getElementById('StipendCurrency').value=TuitionFeesCurrency;
         StipendAmount = document.getElementById('StipendAmount');
         Stipendpayment =  document.querySelector('input[name="Stipendpayment"]:checked').value;
        //  let Stipendpayment = null;
        //  if(StipendpaymentInput){
        //     Stipendpayment = StipendpaymentInput.value;

        //  }
         allowanceCurrency = document.getElementById('allowanceCurrency').value=StipendCurrency;
         allowanceAmount = document.getElementById('allowanceAmount').value;
         allowance = document.querySelector('input[name="allowance"]:checked').value;
        //  let allowance = null;
        //  if (allowanceInput){
        //     allowance = allowanceInput.value;
        //  }

         TuitionFeesAmount = parseFloat(document.getElementById('TuitionFeesAmount').value) || 0; 
         StipendAmount = parseFloat(document.getElementById('StipendAmount').value) || 0; 
         allowanceAmount = parseFloat(document.getElementById('allowanceAmount').value) || 0;          
         const total = TuitionFeesAmount + StipendAmount + allowanceAmount;

         TotalAmount = document.getElementById('TotalAmount').value = total ;
         Accountno = document.getElementById('Accountno').value =accountNumber;
         Contact = document.getElementById('Contact').value;
         Place = document.getElementById('Place').value;

    }
    const email = document.getElementById('email').value;

    const today = new Date().toISOString().split('T')[0];
    const timeParts = swiftTime.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const regex = /^[A-Za-z\s]+$/;
    const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex2 = /^[0-9]+$/;
    const regex3 = /^[A-Za-z0-9]+$/;
    const regex00 = /^[a-zA-Z0-9]*$/; 

    // Validating time of deposit
    const minutes = swiftTime.split(":")[1];
    const isValidTime = (hour >= 9 && hour < 13) || (hour >= 14 && hour < 17);
    if(!bankName || !bankAddress || !swiftCode || !customerName || !accountNumber || !address || !purpose || !charge || !education){
        errorshowModal("Please enter all the required field");
        return;
    }
    if (minutes % 10 !== 0) {
        errorshowModal("Please select a valid time in 10-minute intervals. Eg 9:10,9:20,10:40 etc.");
        return;
    }
    if (!regex.test(customerName) || !regex.test(name) || !regex.test(bankName)) {
        console.log("Name")
        return;
    }
    if (purpose === 'Advance Payment/Final Payment'){
        declarationNo = document.getElementById('declarationNo').value;
        if(!declarationNo){
            errorshowModal("Please enter all the required field");
            return;
        }
    }
    if (!regex.test(customerName) || !regex.test(name) || !regex.test(bankName)) {
        console.log("Name")
        return;
    }
    if (!regex1.test(email)) {
        console.log("email")
        return;
    }
    if (!regex00.test(swiftCode)) {
        console.log("Code")
        return;
    }
    if (!regex2.test(accountNumber)) {
        console.log("account")
        return;
    }
    if (!regex2.test(cid)) {
        console.log("cid")
        return;
    }
    if (!isValidTime) {
        errorshowModal('SWIFT transactions are not allowed during lunch hours (1:00 PM - 2:00 PM) and outside working hours (9:00 AM - 5:00 PM).'); 
        return;
    }
    if (swiftDate === today || swiftDate < today) {
        errorshowModal('swift appointments cannot be created for today or a past date.');
        return;
    }
    const swiftDay = new Date(swiftDate).getDay();
    if (swiftDay === 0 || swiftDay === 6) {
        errorshowModal('swift appointments are not allowed on weekends (Saturday and Sunday).');
        return;
    }
    swift_submit(
        service,
            Reference,
            approval,
            cid,
            customerName,
            customerAddress,
            BIC,
            remit,
            product,
            issueDate,
            expiryDate,
            valueDate,
            currency,
            amount,
            bankName,
            bankAddress,
            swiftCode,
            name,
            accountNumber,
            address,
            purpose,
            declarationNo,
            charge,
            education,
            swiftDate,
            swiftTime,
            institutionName,
            institutionAddress,
            course,
            DateofCommencement,
            duration,
            DateofTravel,
            travelTime,
            TuitionFeesCurrency,
            TuitionFeesAmount,
            TuitionFees,
            StipendCurrency,
            StipendAmount,
            Stipendpayment,
            allowanceCurrency,
            allowanceAmount,
            allowance,
            TotalAmount,
            Accountno,
            Contact,
            Place,
            email,
          
    );

})
