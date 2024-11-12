const checkDepositData = async (tokenNumber) => {
    try {
        const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/v1/walkindeposit/transactions/${encodeURIComponent(tokenNumber)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });

        console.log('Server Response:', response); // Log entire response
        const depositData = await response.json();
        console.log('Deposit Data:', depositData); // Log fetched data structure

        // Check if deposit data is structured as expected
        if (depositData && depositData.data && depositData.data.transaction) {
            console.log('Deposit Form Data Fetched:', depositData);
            createDepositForm(); // Render the deposit form
            populateUIDeposit(depositData); // Populate the form with fetched data
        } else {
            console.warn('No deposit data found, checking withdraw data...');
            await checkWithdrawData(tokenNumber);
        }
    } catch (error) {
        console.error('Error fetching deposit data:', error);
        await checkWithdrawData(tokenNumber);
    }
};


// Check for withdraw form data using the token number
const checkWithdrawData = async (tokenNumber) => {
    try {
        const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/v1/walkinwithdrawal/transactions/${encodeURIComponent(tokenNumber)}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authentication
        });

        const withdrawData = await response.json();

        // If withdraw data is found, display the withdraw form
        if (withdrawData && withdrawData.data && withdrawData.data.transaction) {
            console.log('Withdraw Form Data Fetched:', withdrawData);
            createWithdrawalForm(); // Create the withdraw form dynamically
            populateUIWithdraw(withdrawData); // Populate the form with data
        } else {
            // If neither deposit nor withdraw data is found, show message
            document.getElementById('form-container').innerHTML = '<p>No available data.</p>';
        }
    } catch (error) {
        console.error('Error fetching withdraw data:', error);
        document.getElementById('form-container').innerHTML = '<p>No available data.</p>';
    }
};



// // Function to populate the form with data
const populateUIWithdraw = (data) => {
    const data1 = data.data.transaction;
    console.log('Populating Form with the following withdraw data1:', data1);

    // Set the transaction ID in the hidden input
    const transactionIdElement = document.getElementById('transaction-id');
    if (transactionIdElement) transactionIdElement.value = data1._id;

    // Populate other fields as before
    const dateElement = document.getElementById('date');
    const accountNumberElement = document.getElementById('accnumber');
    const amountElement = document.getElementById('amount');
    const accountNameElement = document.getElementById('name');
    const contactNumberElement = document.getElementById('contact-number');
    const wordAmountElement = document.getElementById('word-amount');
    const tokenNumberElement = document.getElementById('token-number');

    const amount = data1.amount;
    const amountInWords = numberToWords(amount);
    console.log("word amount", amountInWords);

    if (dateElement) dateElement.innerHTML = data1.date;
    if (accountNumberElement) accountNumberElement.innerText = data1.accountNumber;
    if (amountElement) amountElement.innerText = amount;
    if (accountNameElement) accountNameElement.innerText = data1.name;
    if (contactNumberElement) contactNumberElement.innerText = data1.phoneNumber;
    if (wordAmountElement) wordAmountElement.innerText = amountInWords;
    if (tokenNumberElement) tokenNumberElement.innerText = data1.TokenNumber;
};


function createWithdrawalForm() {
    const formHTML = `
        <form id="form" action="" class="withdrawal-form mt-1">
            <!-- Hidden field for transaction ID -->
            <input type="hidden" id="transaction-id" value="">
            
            <div class="header">
                <div class="bank-logo">
                    <img src="img/BOB.png" alt="Bank of Bhutan Logo" style="width:100px;">
                    <p><strong>Branch:</strong> Thimphu Main Branch</p>
                </div>
                <div class="branch-info">
                    <p><strong>Withdrawal Form</strong></p>
                    <p><strong>B.B. 212</strong></p>
                    <p><strong>Date:</strong> <span id="date">23/08/2024</span></p> <!-- Date Element -->
                </div>
            </div>

            <!-- Withdrawal Information -->
            <div class="withdrawal-info">
                <p>Please pay me a sum of Nu. <strong id="word-amount">Ten Thousands</strong> by debiting my SB/CD account</p>
                <table class="withdrawal-table">
                    <tr>
                        <td>SAVING A/C NO / CURRENT A/C NO.</td>
                        <td><strong id="accnumber">201077260</strong></td> <!-- Account Number Element -->
                        <td>Nu.</td>
                        <td><strong id="amount">10000</strong>/-</td> <!-- Amount Element -->
                    </tr>
                    <tr>
                        <td>ACCOUNT NAME</td>
                        <td colspan="3"><strong id="name">YONTEN</strong></td> <!-- Name Element -->
                    </tr>
                </table>
            </div>

            <!-- Signatures and Contact Information -->
            <div class="signature-section">
                <table class="signature-table">
                    <tr>
                        <td>Checked by/Cashier (Signature)</td>
                        <td>Customer's Signature/Thumbprint & Seal if any</td>
                    </tr>
                    <tr>
                        <td>Authorized by (Signature)</td>
                        <td>Contact Number: <strong id="contact-number">17956381</strong></td> <!-- Contact Number Element -->
                    </tr>
                </table>
            </div>
            
            <!-- Edit and Save Button -->
            <button type="button" id="editButton" class="btn btn-secondary mt-3">Edit</button>
            <button type="button" id="saveButton" class="btn btn-primary mt-3" style="display: none;">Save</button>
        </form>
    `;

    document.getElementById('form-container').innerHTML = formHTML;

    // Adding event listeners for edit and save functionality
    document.getElementById('editButton').addEventListener('click', enableEditing);
    document.getElementById('saveButton').addEventListener('click', saveUpdates);
}


// Function to enable editing
function enableEditing() {
    const editableFields = ['accnumber', 'amount', 'name', 'contact-number'];

    editableFields.forEach(field => {
        const element = document.getElementById(field);
        const value = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.id = `${field}-input`;
        element.replaceWith(input);
    });

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('saveButton').style.display = 'inline-block';
}




function saveUpdates() {
    const fieldsToSave = ['accnumber', 'amount', 'name', 'contact-number'];
    
    const updatedData = {};
    fieldsToSave.forEach(field => {
        const input = document.getElementById(`${field}-input`);
        const span = document.createElement('span');
        span.id = field;
        span.textContent = input.value;
        updatedData[field] = input.value;
        input.replaceWith(span);
    });

    document.getElementById('editButton').style.display = 'inline-block';
    document.getElementById('saveButton').style.display = 'none';

    const dataToSave = {
        accountNumber: updatedData['accnumber'],
        amount: updatedData['amount'],
        name: updatedData['name'],
        phoneNumber: updatedData['contact-number']
    };

    // Convert amount to words
    const amountInWords = numberToWords(dataToSave.amount);
    console.log("word amount", amountInWords);

    const wordAmountElement = document.getElementById('word-amount');
    if (wordAmountElement) wordAmountElement.innerText = amountInWords;

    // Retrieve the transaction ID from the hidden field
    const transactionId = document.getElementById('transaction-id').value;

    fetch(`https://bankofbhutan-w3qb.onrender.com/api/v1/walkinwithdrawal/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Transaction updated successfully:', data);
        } else {
            console.error('Error updating transaction:', data.message);
        }
    })
    .catch(error => console.error('Error updating transaction:', error));
}


// Function to populate the deposit form with data
const populateUIDeposit = (data) => {
    const data1 = data.data.transaction;
    console.log('Populating Form with the following deposit data:', data1);

    // Set the transaction ID in the hidden input
    const transactionIdElement = document.getElementById('transaction-id');
    if (transactionIdElement) transactionIdElement.value = data1._id;

    // Populate other fields as before
    const dateElement = document.getElementById('date');
    const accountNumberElement = document.getElementById('accnumber');
    const amountElement = document.getElementById('amount');
    const accountNameElement = document.getElementById('name');
    const contactNumberElement = document.getElementById('contact-number');
    const wordAmountElement = document.getElementById('word-amount');
    const cidNumberElement = document.getElementById('cidnumber');
    const depositorNameElement = document.getElementById('depositor-name');

    const amount = data1.amount;
    const amountInWords = numberToWords(amount);
    console.log("Word amount:", amountInWords);

    // Populate the elements with data
    if (dateElement) dateElement.innerHTML = data1.date;
    if (accountNumberElement) accountNumberElement.innerText = data1.accountNumber;
    if (amountElement) amountElement.innerText = amount;
    if (accountNameElement) accountNameElement.innerText = data1.name;
    if (contactNumberElement) contactNumberElement.innerText = data1.phoneNumber;
    if (wordAmountElement) wordAmountElement.innerText = amountInWords;
    if (cidNumberElement) cidNumberElement.innerText = data1.cidNumber;
    if (depositorNameElement) depositorNameElement.innerText = data1.depositorName;
};

// Function to create and insert the deposit form in the DOM
function createDepositForm() {
    const formHTML = `
        <form id="form" action="" class="withdrawal-form mt-1">
            <input type="hidden" id="transaction-id" value="">

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <img src="image/BoB-Logo.svg" alt="Bank of Bhutan Logo" style="width: 100px;">
                    <p><strong>Branch:</strong> <span id="branch-name" style="text-decoration: underline;">Thimphu</span></p>
                </div>
                <div>
                    <p style="text-align: center; font-weight: bold;">DEPOSIT FORM</p>
                    <p style="text-align: center;">B.B. 61</p>
                    <p style="text-align: center;">Date: <span id="date">23/08/2024</span></p>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <p>Please deposit this cash/cheque to Savings/Current/Recurring/Loan A/c/Others:
                   <strong> <span id="accnumber">201077260</span></strong>
                </p>
                <p>of Mr/Mrs: <strong><span id="name">YONTEN</span></p></strong>
                <p>Ngultrums/Rupees (in words): 
                    <strong><span id="word-amount">Ten Thousands</span></strong>
                </p>
                <p>Source of Funds (Only for deposit above Nu. 500,000): 
                    <strong><span id="amount">10000</span></strong>
                </p>
            </div>

            <div style="margin-top: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 5px;">Cheque/Draft No.</th>
                            <th style="border: 1px solid #000; padding: 5px;">Denominations</th>
                            <th style="border: 1px solid #000; padding: 5px;">Total Amount Nu./INR</th>
                            <th style="border: 1px solid #000; padding: 5px;">Ch.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #000; padding: 5px;">1000 x</td>
                            <td style="border: 1px solid #000; padding: 5px;"><span id="denom-1000">0</span></td>
                            <td style="border: 1px solid #000; padding: 5px;"><span id="total-1000">0</span></td>
                            <td style="border: 1px solid #000; padding: 5px;"></td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 5px;">500 x</td>
                            <td style="border: 1px solid #000; padding: 5px;"><span id="denom-500">0</span></td>
                            <td style="border: 1px solid #000; padding: 5px;"><span id="total-500">0</span></td>
                            <td style="border: 1px solid #000; padding: 5px;"></td>
                        </tr>
                        <!-- Add more denomination rows as needed -->
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 20px;">
                <p>Depositor's Name: 
                    <strong><span id="depositor-name">John Doe</span></strong>
                </p>
                <p>Depositor's Signature: 
                    <span style="border-bottom: 1px solid #000; width: 200px; display: inline-block;"></span>
                </p>
                <p>Contact No: 
                    <strong><span id="contact-number">17956381</span></strong>
                </p>
                <p>CID No: 
                      <strong><span id="cidnumber">123456789</span></strong>
                </p>
                <p>TPN No: 
                    <span id="tpnnumber"></span>
                </p>
            </div>

            <!-- Edit and Save Buttons -->
            <button type="button" id="editButton" class="btn btn-secondary mt-3">Edit</button>
            <button type="button" id="saveButton" class="btn btn-primary mt-3" style="display: none;">Save</button>
        </form>
    `;

    document.getElementById('form-container').innerHTML = formHTML;

    // Adding event listeners for edit and save functionality
    document.getElementById('editButton').addEventListener('click', enableDepositEditing);
    document.getElementById('saveButton').addEventListener('click', saveDepositUpdates);
}

function enableDepositEditing() {
    const editableFields = ['accnumber', 'amount', 'name', 'contact-number', 'cidnumber', 'depositor-name', 'denom-1000', 'total-1000', 'denom-500', 'total-500'];

    editableFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            const value = element.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.id = `${field}-input`;
            element.replaceWith(input);
        }
    });

    document.getElementById('editButton').style.display = 'none';
    document.getElementById('saveButton').style.display = 'inline-block';
}

function saveDepositUpdates() {
    const fieldsToSave = ['accnumber', 'amount', 'name', 'contact-number', 'cidnumber', 'depositor-name'];

    const updatedData = {};
    fieldsToSave.forEach(field => {
        const input = document.getElementById(`${field}-input`);
        const span = document.createElement('span');
        span.id = field;
        span.textContent = input.value;
        updatedData[field] = input.value;
        input.replaceWith(span);
    });

    document.getElementById('editButton').style.display = 'inline-block';
    document.getElementById('saveButton').style.display = 'none';

    const dataToSave = {
        accountNumber: updatedData['accnumber'],
        amount: updatedData['amount'],
        name: updatedData['name'],
        phoneNumber: updatedData['contact-number'],
        cidNumber: updatedData['cidnumber'],
        depositorName: updatedData['depositor-name']
    };

    // Convert amount to words
    const amountInWords = numberToWords(dataToSave.amount);
    const wordAmountElement = document.getElementById('word-amount');
    if (wordAmountElement) wordAmountElement.innerText = amountInWords;

    const transactionId = document.getElementById('transaction-id').value;

    fetch(`https://bankofbhutan-w3qb.onrender.com/api/v1/walkindeposit/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Transaction updated successfully:', data);
        } else {
            console.error('Error updating transaction:', data.message);
        }
    })
    .catch(error => console.error('Error updating transaction:', error));
}


// Function to convert amount into words
function numberToWords(num) {
    const belowTwenty = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                         'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
                         'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    if (num === 0) return 'Zero';

    // Helper function to convert a number below 1000 into words
    function helper(n) {
        if (n < 20) return belowTwenty[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + belowTwenty[n % 10] : '');
        if (n < 1000) return belowTwenty[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + helper(n % 100) : '');
        return '';
    }

    let result = '';
    let thousandIndex = 0;

    // Split the number into chunks of 1000 and convert each chunk
    while (num > 0) {
        const chunk = num % 1000;
        if (chunk > 0) {
            result = helper(chunk) + (thousands[thousandIndex] ? ' ' + thousands[thousandIndex] : '') + (result ? ' ' + result : '');
        }
        num = Math.floor(num / 1000);
        thousandIndex++;
    }

    return result.trim();
}

export { checkDepositData, checkWithdrawData, createDepositForm, createWithdrawalForm, populateUIDeposit, populateUIWithdraw };
