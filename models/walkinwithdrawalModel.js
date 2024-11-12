const mongoose = require('mongoose');
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
// Cash Withdrawal Schema
const cashWithdrawalSchema = new mongoose.Schema({
  TokenNumber: {
    type: String,
    required: [true, 'TokenNumber is required'],
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    validate: {
      validator: function (v) {
        return /^\d{9}$/.test(v);  // Validate 9 digits
      },
      message: 'Account number must be exactly 9 digits'
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  // Validate alphabets only
      },
      message: 'Name should only contain alphabets'
    }
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be a positive number'],  // Validate positive amount
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^(17|77)\d{6}$/.test(v);  // Validate phone number format
      },
      message: 'Phone number must start with 17 or 77 and be 8 digits long'
    }
  },
  date: {
    type: Date,
    default: getBhutanTime().date,
  },
});

// Export CashWithdrawal model
const CashWithdrawal = mongoose.model('CashWithdrawal', cashWithdrawalSchema);
module.exports = CashWithdrawal;