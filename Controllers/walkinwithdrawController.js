const CashWithdrawal = require('../models/walkinwithdrawalModel'); // Adjust path if necessary
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
// Submit Cash Withdrawal Form
exports.submitCashWithdrawal = async (req, res) => {
  const {
    TokenNumber,
    accountNumber,
    name,
    amount,
    phoneNumber,
  } = req.body;

  // Input validation
  if (!TokenNumber || !accountNumber || !name || !amount || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a transaction entry in the withdrawal model
    const withdrawalEntry = await CashWithdrawal.create({
      TokenNumber,
      accountNumber,
      name,
      amount,
      phoneNumber,
    });

    console.log("Cash Withdrawal transaction created:", withdrawalEntry);

    // Send a success response
    res.status(200).json({
      status: 'success',
      message: 'Cash withdrawal form submitted successfully.',
      data: { withdrawalEntry },
    });
  } catch (err) {
    console.error('Error during withdrawal form submission:', err);
    res.status(500).json({ message: err.message || 'Error occurred while submitting the form.' });
  }
};

// Get all Cash Withdrawal transactions
exports.getAllCashWithdrawals = async (req, res) => {
  try {
    const transactions = await CashWithdrawal.find();
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions },
    });
  } catch (err) {
    console.error('Error fetching withdrawal transactions:', err);
    res.status(500).json({ message: 'Error occurred while fetching transactions.' });
  }
};

// Get a specific transaction by TokenNumber
exports.getTransactionByTokenNumber = async (req, res) => {
  const { tokenNumber } = req.params;
  const bhutanCurrentDate = getBhutanTime().date;

  try {
    const transaction = await CashWithdrawal.findOne({ 
      TokenNumber: tokenNumber,
      date: bhutanCurrentDate 
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
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

// PATCH request handler
// PATCH request handler in withdrawalController.js
exports.updateTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
      const transaction = await CashWithdrawal.findByIdAndUpdate(id, req.body, {
          new: true, // returns the updated document
          runValidators: true,
      });

      if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
      }

      res.status(200).json({
          status: 'success',
          data: { transaction },
      });
  } catch (err) {
      console.error('Error updating transaction:', err);
      res.status(500).json({ message: 'Error occurred while updating the transaction.' });
  }
};



// Delete a Cash Withdrawal transaction by ID
exports.deleteTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await CashWithdrawal.findByIdAndDelete(id);
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
