document.addEventListener('DOMContentLoaded', function() {
    const billDiv = document.getElementById('billDiv');

    billDiv.style.display = 'none';

    document.querySelectorAll('input[name="purpose"]').forEach((radio) => {
        radio.addEventListener('change', function() {
            if (this.value === 'Bill Payment' && this.checked) {
                billDiv.style.display = 'block'; // Show the div
            } else {
                billDiv.style.display = 'none';  // Hide the div
            }
        });
    });
});
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
const regex = /^[A-Za-z\s]+$/;
const regex44 = /^[A-Za-z0-9]+$/;
const regex5 = /^[0-9]+$/;

// page1
document.getElementById('DebitToAccountNumber').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex2.test(referralNumber);
  validateField(this,document.getElementById('error_account'), isValid);
});
document.getElementById('RemitSum').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex4.test(referralNumber);
  validateField(this,document.getElementById('error_amt'), isValid);
});
document.getElementById('Charge').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex4.test(referralNumber);
  validateField(this,document.getElementById('error_charge'), isValid);
});

// page2
document.getElementById('DepositorName').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex.test(referralNumber);
  validateField(this,document.getElementById('name_of_depositor_error'), isValid);
});
document.getElementById('DepositorCID').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex5.test(referralNumber);
  validateField(this,document.getElementById('depositor_cid_error'), isValid);
});
document.getElementById('DepositorContact').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex4.test(referralNumber);
  validateField(this,document.getElementById('contact_depositor_error'), isValid);
});
document.getElementById('EmailAddress').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex1.test(referralNumber);
  validateField(this,document.getElementById('email'), isValid);
});
// page3
document.getElementById('ReceiverName').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex.test(referralNumber);
  validateField(this,document.getElementById('receivername_error'), isValid);
});
document.getElementById('IFSCCode').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex44.test(referralNumber);
  validateField(this,document.getElementById('ifsccode_error'), isValid);
});
document.getElementById('ReceiverCID').addEventListener('input', function () {
  const referralNumber = this.value.trim();
  const isValid = regex5.test(referralNumber);
  validateField(this,document.getElementById('receiverid_error'), isValid);
});