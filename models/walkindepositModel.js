const mongoose = require('mongoose');
const moment = require('moment-timezone');

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
// Cash Deposit Schema
const cashDepositSchema = new mongoose.Schema({
  TokenNumber: {
    type: String,
    required: [true, 'TokenNumber is required'],
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    validate: {
      validator: function (v) {
        return /^\d{9}$/.test(v);
      },
      message: 'Account number must be exactly 9 digits',
    },
  },
  name: {
    type: String,
    required: [true, 'Account holder name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  // Only letters and spaces
      },
      message: 'Name should only contain alphabets',
    },
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be a positive number'],
  },
  depositorName: {
    type: String,
    required: [true, 'Depositor name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  // Only letters and spaces
      },
      message: 'Depositor name should only contain alphabets',
    },
  },
  cidNumber: {
    type: String,
    required: [true, 'CID number is required'],
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);  // 11-digit CID validation
      },
      message: 'CID number must be exactly 11 digits',
    },
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^(17|77)\d{6}$/.test(v);  // Must start with 17 or 77 and be 8 digits long
      },
      message: 'Phone number must start with 17 or 77 and be 8 digits long',
    },
  },
  date: {
    type: Date,
    default: getBhutanTime().date,
  },
});




// Export CashDeposit model
const CashDeposit = mongoose.model('CashDeposit', cashDepositSchema);
module.exports = CashDeposit;