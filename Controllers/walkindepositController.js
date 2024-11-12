const Transaction = require('../models/walkindepositModel');

/// Helper function to get time in Bhutan timezone
const getBhutanTime = (offsetMinutes = 0) => {
  const bhutanTimeZone = 'Asia/Thimphu'; // Bhutan's timezone
  const currentTime = new Date(Date.now() + offsetMinutes * 60 * 1000); // Apply any offset in minutes
  
  // Format the date as 'YYYY-MM-DD' in Bhutan Time
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: bhutanTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(currentTime);

  // Format the time in 12-hour format with AM/PM in Bhutan Time
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: bhutanTimeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(currentTime);

  return { date, time };
};
// Submit Cash Deposit Form (store only in deposit model)
exports.submitCashDeposit = async (req, res) => {
  const {
    TokenNumber,
    accountNumber,
    name,
    amount,
    depositorName,
    cidNumber,
    phoneNumber,
  } = req.body;

  // Input validation
  if (!TokenNumber || !accountNumber || !name || !amount || !depositorName || !cidNumber || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a transaction entry in the deposit model (Transaction)
    const transactionEntry = await Transaction.create({
      TokenNumber,
      accountNumber,
      name,
      amount,
      depositorName,
      cidNumber,
      phoneNumber,
    });

    console.log("Transaction entry created:", transactionEntry);

    // Send a success response
    res.status(200).json({
      status: 'success',
      message: 'Cash deposit form submitted successfully.',
      data: { transactionEntry },
    });
  } catch (err) {
    console.error('Error during form submission:', err);
    res.status(500).json({ message: err.message || 'Error occurred while submitting the form.' });
  }
};

// Get all transactions function
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions },
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Error occurred while fetching transactions.' });
  }
};


// Get a specific transaction by TokenNumber and current date in Bhutan
// exports.getTransactionByTokenNumber = async (req, res) => {
//   const { tokenNumber } = req.params;
//   console.log(tokenNumber);
//   // Get current date in Bhutan in the specific format
//   const bhutanCurrentDate = getBhutanTime().date;
//   const dateOnline = new Date();
//   dateOnline.setUTCHours(0, 0, 0, 0)
//   // Format it to match "YYYY-MM-DDTHH:mm:ss.sss+00:00" format
//   const formattedDate = dateOnline.toISOString().replace('Z', '+00:00');;
//   console.log(dateOnline);
//   console.log(formattedDate)
//   try {
//     // Find transaction by TokenNumber and Date
   
//     console.log(bhutanCurrentDate);
   


//     const transaction = await Transaction.findOne({ 
//       TokenNumber: tokenNumber,
//       // date : bhutanCurrentDate
    
//         date: formattedDate , // Match any time within the day
     
//        // Match transactions with today's date in Bhutan
//     });
//     console.log('transaction',transaction);

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found for today' });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: { transaction },
//     });
//   } catch (err) {
//     console.error('Error fetching transaction:', err);
//     res.status(500).json({ message: 'Error occurred while fetching the transaction.' });
//   }
// };
// Get a specific transaction by TokenNumber and current date in Bhutan
exports.getTransactionByTokenNumber = async (req, res) => {
  const { tokenNumber } = req.params;
  // Get the current date in Bhutan's timezone and set time to midnight
  const bhutanCurrentDate = new Date();
  bhutanCurrentDate.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00 UTC
  
  // Calculate the range for the entire day
  const startOfDay = new Date(bhutanCurrentDate);
  const endOfDay = new Date(bhutanCurrentDate);
  endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of day

  try {
    // Query to match TokenNumber and a date within the current day
    const transaction = await Transaction.findOne({
      TokenNumber: tokenNumber,
      date: { $gte: startOfDay, $lt: endOfDay } // Matches the entire day in UTC
    });

    console.log('Transaction:', transaction);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found for today' });
    }

    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ message: 'Error occurred while fetching the transaction.' });
  }
};




// Update a transaction by ID
exports.updateTransactionById = async (req, res) => {
  const { id } = req.params;  // Get the ID from request parameters
  try {
    // Find and update the transaction in the database
    const transaction = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,           // Return the updated document
      runValidators: true,  // Ensure the data adheres to the schema validators
    });

    // If transaction is not found, return a 404 response
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Send a success response with the updated transaction data
    res.status(200).json({
      status: 'success',
      data: { transaction },
    });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ message: 'Error occurred while updating the transaction.' });
  }
};


// Delete a transaction by ID
exports.deleteTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: 'Error occurred while deleting the transaction.' });
  }
};
