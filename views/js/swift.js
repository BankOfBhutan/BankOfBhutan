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
document.addEventListener('DOMContentLoaded', function() {
    const billDiv = document.getElementById('delcare_num');

    billDiv.style.display = 'none';

    document.querySelectorAll('input[name="payment"]').forEach((radio) => {
        radio.addEventListener('change', function() {
            if (this.value === 'Advance Payment/Final Payment' && this.checked) {
                billDiv.style.display = 'block'; // Show the div
            } else {
                billDiv.style.display = 'none';  // Hide the div
            }
        });
    });
});
function changeName() {
    const edu = document.querySelector('input[name="education"]:checked').value;
    
    // Get the reference to the button
    const button = document.querySelector('.subedu');

    // Check if edu is "YES" and change the button text accordingly
    if (edu === "Yes") {
      button.setAttribute('type', 'button');  // Set type to 'button'
      button.textContent = "Next";  
    }else{
      button.setAttribute('type', 'submit');  // Set type to 'button'

        button.textContent = "Submit"; 
    }
}
document.querySelectorAll('input[name="education"]').forEach(radio => {
    radio.addEventListener('change', changeName);
});
document.addEventListener("DOMContentLoaded", function() {
    const info1 = document.querySelector(".info1");
    const info2 = document.querySelector(".info2");
    const info3 = document.querySelector(".info3");
    const info4 = document.querySelector(".info4");
    const info5 = document.querySelector(".info5");
    const info6 = document.querySelector(".info6");
    const info7 = document.querySelector(".info7");
    const info8 = document.querySelector(".info8");
  
    const btnNext1 = document.querySelector(".info1 .btn-next");
    const btnNext2 = document.querySelector(".info2 .btn-next");
    const btnPrev2 = document.querySelector(".info2 .btn-prev");
    const btnNext3 = document.querySelector(".info3 .btn-next");
    const btnPrev3 = document.querySelector(".info3 .btn-prev");
    const btnNext4 = document.querySelector(".info4 .btn-next");
    const btnPrev4 = document.querySelector(".info4 .btn-prev");
    const btnNext5 = document.querySelector(".info5 .btn-next");
    const btnPrev5 = document.querySelector(".info5 .btn-prev");
    const btnNext6 = document.querySelector(".info6 .btn-next");
    const btnPrev6 = document.querySelector(".info6 .btn-prev");
    const btnPrev7 = document.querySelector(".info7 .btn-prev");
    const btnNext7 = document.querySelector(".info7 .btn-next");
    const btnPrev8 = document.querySelector(".info8 .btn-prev");
  
    // Show info2 and hide info1 when Next is clicked in info1
    btnNext1.addEventListener("click", function() {
      const approval = document.getElementById('approval').value;
      const cid = document.getElementById('cid').value;
      const customerName = document.getElementById('customerName').value;
      const customerAddress = document.getElementById('customerAddress').value;
      const BIC = document.getElementById('BIC').value;
      const email = document.getElementById('email').value;
      const regex = /^[a-zA-Z0-9]*$/;   ///varchar
      const regex1 = /^[a-zA-Z\s]*$/;  //name
      const regex2 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  //email

      if (!approval || !cid || !customerName || !customerAddress || !BIC || !email) {
          errorshowModal("Please enter the required field");
          return;
      }
      if ((!regex.test(approval)) || (!regex.test(cid)) || (!regex1.test(customerName)) || (!regex2.test(email)))  {
        console.log("next1");
          return;
      } else{
        info1.classList.add("hidden");
        info2.classList.remove("hidden");
      }

    });
  
    // Show info3 and hide info2 when Next is clicked in info2
    btnNext2.addEventListener("click", function() {
      const remit = document.getElementById('remit').value;
      const issueDate = document.getElementById('issueDate').value;
      const expiryDate = document.getElementById('expiryDate').value;
      const valueDate = document.getElementById('valueDate').value;
      const currency = document.getElementById('currency').value;
      const amount = document.getElementById('amount').value;
      const regex1 = /^[a-zA-Z\s]*$/;  //name

      if (!remit || !issueDate || !expiryDate || !valueDate || !currency || !amount) {
          errorshowModal("Please enter all the required field");
          return;
      }
      if ((!regex1.test(currency)))  {
          console.log("next1");
          return;
      } else{
        info2.classList.add("hidden");
        info3.classList.remove("hidden");
      }
      
    });
  
    btnPrev2.addEventListener("click", function() {
      info2.classList.add("hidden");
      info1.classList.remove("hidden");
    });
    btnNext3.addEventListener("click", function() {
    const edu = document.querySelector('input[name="education"]:checked').value;
        console.log(edu)
        if (edu ==="Yes"){
          const bankName = document.getElementById('bankName').value;
          const bankAddress = document.getElementById('bankAddress').value;
          const swiftCode = document.getElementById('swiftCode').value;
          const name = document.getElementById('name').value;
          const accountNumber = document.getElementById('accountNumber').value;
          const address = document.getElementById('address').value;
          const payment= document.querySelector('input[name="payment"]:checked').value;
          const charges = document.querySelector('input[name="charges"]:checked').value;
          const edu = document.querySelector('input[name="education"]:checked').value;
          const date_input = document.getElementById('date-input').value;
          const time_input = document.getElementById('time-input').value;
          const declarationNo = document.getElementById('declarationNo').value;
          const regex1 = /^[a-zA-Z\s]*$/;  //name
          const regex = /^[a-zA-Z0-9\s]*$/;   ///varchar
          console.log(payment)
          if (payment === "Advance Payment/Final Payment") {
            if(!declarationNo){
              errorshowModal("Please enter all the required field");
              return;
            }
          }
          if (!bankName || !bankAddress || !swiftCode || !name || !accountNumber || !address || !payment || !charges || !edu || !date_input || !time_input) {
              errorshowModal("Please enter all the required field");
              return;
          }
          if ((!regex1.test(name)))  {
              console.log("next1");
              return;
          }
          if ((!regex1.test(bankName)))  {
            console.log("next1");
            return;
          }
          else{
            info3.classList.add("hidden");
            info4.classList.remove("hidden");
          }   
        } 
      });
      btnPrev3.addEventListener("click", function() {
        info3.classList.add("hidden");
        info2.classList.remove("hidden");
      });
      btnNext4.addEventListener("click", function() {
          const institutionName = document.getElementById('institutionName').value;
          const institutionAddress = document.getElementById('institutionAddress').value;
          const course = document.getElementById('course').value;
          const DateofCommencement = document.getElementById('DateofCommencement').value;
          const duration = document.getElementById('duration').value;
          const DateofTravel = document.getElementById('DateofTravel').value;
          const travelTime = document.getElementById('travelTime').value;
          
          console.log(institutionName);
          console.log(institutionAddress);
          console.log(course);
          console.log(DateofCommencement);
          console.log(duration);
          console.log(DateofTravel);
          console.log(travelTime);
          const regex = /^[a-zA-Z0-9\s]*$/;   ///varchar
          const regex1 = /^[a-zA-Z\s]*$/;  //name
          if (!institutionName || !institutionAddress || !course || !DateofCommencement || !duration|| !DateofTravel ||  !travelTime) {
              errorshowModal("Please enter all the required field");
              console.log("next1");
              return;
          }
          if ((!regex1.test(institutionName)))  {
              console.log("next1");
              return;
          }
          else{
            info4.classList.add("hidden");
            info5.classList.remove("hidden");
          }
        
      });
      btnPrev4.addEventListener("click", function() {
        info4.classList.add("hidden");
        info3.classList.remove("hidden");
      });
      btnNext5.addEventListener("click", function() {
        const TuitionFeesCurrency = document.getElementById('TuitionFeesCurrency').value;
        const TuitionFeesAmount = document.getElementById('TuitionFeesAmount').value;
        const Stipendpayment= document.querySelector('input[name="TuitionFees"]:checked');
        if (!TuitionFeesCurrency || !TuitionFeesAmount || Stipendpayment== null)  {
          errorshowModal("Please enter all the required field");
          return;
        }
        else{
          info5.classList.add("hidden");
          info6.classList.remove("hidden");
        }
      });

      btnPrev5.addEventListener("click", function() {
        info5.classList.add("hidden");
        info4.classList.remove("hidden");
      });
      btnNext6.addEventListener("click", function() {
        const StipendCurrency = document.getElementById('StipendCurrency').value;
        const StipendAmount = document.getElementById('StipendAmount').value;
        const Stipendpayment= document.querySelector('input[name="Stipendpayment"]:checked');
        console.log(StipendAmount);
        if (!StipendCurrency || !StipendAmount || Stipendpayment== null)  {
          errorshowModal("Please enter all the required field");
          return;
        }
        else{
          info6.classList.add("hidden");
          info7.classList.remove("hidden");
        }
        
      });
      btnPrev6.addEventListener("click", function() {
        info6.classList.add("hidden");
        info5.classList.remove("hidden");
      });
      btnNext7.addEventListener("click", function() {
        const allowanceCurrency = document.getElementById('allowanceCurrency').value;
        const allowanceAmount = document.getElementById('allowanceAmount').value;
        const allowance = document.querySelector('input[name="allowance"]:checked');
        if (!allowanceCurrency || !allowanceAmount || allowance== null)  {
          errorshowModal("Please enter all the required field");
          return;
        }
        else{
          info7.classList.add("hidden");
          info8.classList.remove("hidden");
        }
      });
    btnPrev7.addEventListener("click", function() {
      info7.classList.add("hidden");
      info6.classList.remove("hidden");
    });
    btnPrev8.addEventListener("click", function() {
        info8.classList.add("hidden");
        info7.classList.remove("hidden");
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
function validateField(field,errorField, isValid) {
  if (!isValid) {
      field.classList.add('invalid');
      errorField.style.display = 'block';
  } else {
      field.classList.remove('invalid');
      errorField.style.display = 'none';
  }
}

const regex = /^[a-zA-Z0-9]*$/;   ///varchar
const regex1 = /^[a-zA-Z\s]*$/;  //name
const regex2 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  //email
// page1
document.getElementById('approval').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex.test(referralNumber);
  validateField(this,document.getElementById('approval_error'), isValid);
});
document.getElementById('cid').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex.test(referralNumber);
  validateField(this,document.getElementById('Passport_error'), isValid);
});
document.getElementById('customerName').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('customerName_error'), isValid);
});
document.getElementById('email').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex2.test(referralNumber);
  validateField(this,document.getElementById('email_error'), isValid);
});
// page2
document.getElementById('currency').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('currency_error'), isValid);
});
// page3
document.getElementById('bankName').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('cbankName_error'), isValid);
});
document.getElementById('name').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('naming_error'), isValid);
});
// // page4
document.getElementById('institutionName').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('institutionName_error'), isValid);
});



