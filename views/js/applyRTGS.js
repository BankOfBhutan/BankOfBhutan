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
const rtgs_submit = async (
    service,
    referralNumber,
    remitSum,
    charge,
    accountNumber,
    depositorName,
    depositorCID,
    depositorContact,
    depositorAddress,
    email,
    purpose,
    paymentTerms,
    declarationNumber,
    receiverName,
    receiverAccountNumber,
    receiverBankName,
    receiverBranchName,
    IFSCCode,
    
    receiverCID,
    rtgsDate,
    rtgsTime
) => {
    try {
        const conflictCheck = await axios.post('http://localhost:4001/api/v1/rtgs/check_Conflict',{email,rtgsDate,rtgsTime});

        if (conflictCheck.data.conflict) {
            errorshowModal(conflictCheck.data.message);
            return;
        }
        await axios.post('http://localhost:4001/api/v1/rtgs/send-otp', { email });
        
        // Prompt the user to enter the OTP
        const otp = await showOtpModal();
        if (!otp) {
            errorshowModal('OTP is required to submit the form.');
            return;
        }
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:4001/api/v1/rtgs/rtgs',
            data: {
                service,
                referralNumber,
                remitSum,
                charge,
                accountNumber,
                depositorName,
                depositorCID,
                depositorContact,
                depositorAddress,
                email,
                purpose,
                paymentTerms,
                declarationNumber,
                receiverName,
                receiverAccountNumber,
                receiverBankName,
                receiverBranchName,
                IFSCCode,
                receiverCID,
                rtgsDate,
                rtgsTime,
                otp
            },
        });
        console.log(res);

        if (res.data.message === 'RTGS request successfully submitted!') {
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
        console.log("Error submitting RTGS: ", error);
        errorshowModal("Please enter the right OTP");
    }
};

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetching the form values
    const service = 'RTGS';
    const referralNumber = document.getElementById('ReferralNumber').value;
    const remitSum = document.getElementById('RemitSum').value;
    const charge = document.getElementById('Charge').value;
    const accountNumber = document.getElementById('DebitToAccountNumber').value;
    const depositorName = document.getElementById('DepositorName').value;
    const depositorCID = document.getElementById('DepositorCID').value;
    const depositorContact = document.getElementById('DepositorContact').value;
    const depositorAddress = document.getElementById('DepositorAddress').value;
    const email = document.getElementById('EmailAddress').value;
    const purpose = document.querySelector('input[name="purpose"]:checked').value;
    let paymentTerms = null;
    if (purpose === 'Bill Payment') {
         paymentTerms = document.querySelector('input[name="flexRadioDefault"]:checked')?.value; // Optional chaining to prevent errors
    }
    const declarationNumber = document.getElementById('DeclarationNumber').value;
    const receiverName = document.getElementById('ReceiverName').value;
    const receiverAccountNumber = document.getElementById('ReceiverAccountNumber').value;
    const receiverBankName = document.getElementById('ReceiverBankName').value;
    const receiverBranchName = document.getElementById('ReceiverBranchName').value;
    const IFSCCode = document.getElementById('IFSCCode').value;
    const receiverCID = document.getElementById('ReceiverCID').value;
    const rtgsDate = document.getElementById('rtgsDate').value;
    const rtgsTime = document.getElementById('time-input').value;

    const today = new Date().toISOString().split('T')[0];
    const timeParts = rtgsTime.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const regex = /^[A-Za-z\s]+$/;
    const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const regex2 = /^\d{9}$/;
    const regex3 = /^(17|77)\d{6}$/;
    const regex4 = /^[A-Za-z0-9]+$/;
    const regex5 = /^[0-9]+$/;

    // Validating time of deposit
    const minutes = rtgsTime.split(":")[1];
    const isValidTime = (hour >= 9 && hour < 13) || (hour >= 14 && hour < 17);
    if (
        !referralNumber || !remitSum || !charge || !accountNumber || !depositorName ||
        !depositorCID || !depositorContact || !depositorAddress || !email || !purpose ||
        !declarationNumber || !receiverName || !receiverAccountNumber || !receiverBankName ||
        !receiverBranchName || !IFSCCode || !receiverCID || !rtgsDate || !rtgsTime
    ) {
        errorshowModal('Please fill out all fields.');
        return;
    }
    if (minutes % 10 !== 0) {
        errorshowModal("Please select a valid time in 10-minute intervals. Eg 9:10,9:20,10:40 etc.");
        return;
    }
    if (!isValidTime) {
        errorshowModal('RTGS transactions are not allowed during lunch hours (1:00 PM - 2:00 PM) and outside working hours (9:00 AM - 5:00 PM).');
        return;
    }
    if (!regex.test(depositorName) || !regex.test(receiverName)) {
        return;
    }
    if (!regex1.test(email)) {
        return;
    }
    if (!regex2.test(accountNumber)) {
        return;
    }
    if (!regex3.test(depositorContact)) {
        return;
    }
    if (!regex4.test(IFSCCode)) {
        return;
    }
    if (!regex5.test(depositorCID) || !regex5.test(receiverCID)) {
        return;
    }
    if (rtgsDate === today || rtgsDate < today) {
        errorshowModal('RTGS appointments cannot be created for today or a past date.');
        return;
    }

    const depositDay = new Date(rtgsDate).getDay();
    if (depositDay === 0 || depositDay === 6) {
        errorshowModal('RTGS appointments are not allowed on weekends (Saturday and Sunday).');
        return;
    }
    
    rtgs_submit(
        service,
        referralNumber,
        remitSum,
        charge,
        accountNumber,
        depositorName,
        depositorCID,
        depositorContact,
        depositorAddress,
        email,
        purpose,
        paymentTerms,
        declarationNumber,
        receiverName,
        receiverAccountNumber,
        receiverBankName,
        receiverBranchName,
        IFSCCode,
        receiverCID,
        rtgsDate,
        rtgsTime
    );
    console.log(service,
        referralNumber,
        remitSum,
        charge,
        accountNumber,
        depositorName,
        depositorCID,
        depositorContact,
        depositorAddress,
        email,
        purpose,
        paymentTerms,
        declarationNumber,
        receiverName,
        receiverAccountNumber,
        receiverBankName,
        receiverBranchName,
        IFSCCode,
        receiverCID,
        rtgsDate,
        rtgsTime);
});
document.addEventListener("DOMContentLoaded", function() {


    const info1 = document.querySelector(".info1");
    const info2 = document.querySelector(".info2");
    const info3 = document.querySelector(".info3");
  
    const btnNext1 = document.querySelector(".info1 .btn-next");
    const btnNext2 = document.querySelector(".info2 .btn-next");
    const btnPrev2 = document.querySelector(".info2 .btn-prev");
    const btnPrev3 = document.querySelector(".info3 .btn-prev");
  
    // Show info2 and hide info1 when Next is clicked in info1
    btnNext1.addEventListener("click", function() {
      const referralNumber = document.getElementById('ReferralNumber').value;
      const remitSum = document.getElementById('RemitSum').value;
      const charge = document.getElementById('Charge').value;
      const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const regex2 = /^\d{9}$/;
      const regex3 = /^(17|77)\d{6}$/;
      const regex4 = /^[0-9]*$/;
      const accountNumber = document.getElementById('DebitToAccountNumber').value;

        if (!remitSum || !referralNumber || !accountNumber || !charge) {
            errorshowModal("Please enter all field");
            return;
        }
        if ((!regex2.test(accountNumber)) || (!regex4.test(remitSum)) || (!regex4.test(charge)))  {
          console.log("next1");
            return;
        } 
        else {
            info1.classList.add("hidden");
            info2.classList.remove("hidden");
        }
      
    });
  
    // Show info3 and hide info2 when Next is clicked in info2
    btnNext2.addEventListener("click", function() {
      const depositorName = document.getElementById('DepositorName').value;
      const cid_licence = document.getElementById('DepositorCID').value;
      const depositorNumber = document.getElementById('DepositorContact').value;
      const EmailAddress = document.getElementById('EmailAddress').value;


      const DepositorAddress = document.getElementById('DepositorAddress').value;
      const purpose = document.querySelector('input[name="purpose"]:checked').value;
      const declarationNumber = document.getElementById('DeclarationNumber').value;
        const regex = /^[A-Za-z\s]+$/;
        const regex1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const regex2 = /^\d{9}$/;
        const regex3 = /^(17|77)\d{6}$/;
        const regex4 = /^[A-Za-z0-9]+$/;
        const regex5 = /^[0-9]+$/;
        if (!depositorName || !cid_licence || !depositorNumber || !DepositorAddress || !declarationNumber || !purpose) {
            errorshowModal("Please enter all field");
            return;
        }
        if ((!regex.test(depositorName)) || (!regex5.test(cid_licence)) || (!regex3.test(depositorNumber)) || (!regex1.test(EmailAddress)))  {
          console.log("next1");
            return;
        } 
        else {
            info2.classList.add("hidden");
            info3.classList.remove("hidden");
        }
      
    });
    // Show info1 and hide info2 when Previous is clicked in info2
    btnPrev2.addEventListener("click", function() {
      info2.classList.add("hidden");
      info1.classList.remove("hidden");
    });
  
    // Show info2 and hide info3 when Previous is clicked in info3
    btnPrev3.addEventListener("click", function() {
      info3.classList.add("hidden");
      info2.classList.remove("hidden");
    });
  });
  function checkOthers() {
    const radioButtons = document.querySelectorAll('input[name="purpose"]');
    const otherPurposeDiv = document.getElementById('otherPurpose');

    for (const radioButton of radioButtons) {
        if (radioButton.checked && radioButton.value === 'others') {
            otherPurposeDiv.style.display = 'block'; // Show the div
            return;
        }
    }
    otherPurposeDiv.style.display = 'none';
}