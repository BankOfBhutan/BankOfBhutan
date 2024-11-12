
const mongoose = require('mongoose');

// RTGS Transaction Schema
const rtgsTransactionSchema = new mongoose.Schema({
  TokenNumber: {
    type: String,
    required: [true, 'TokenNumber is required'],
  },
  accountNumberDepositor: {
    type: String,
    required: [true, 'Account number of depositor is required'],
    validate: {
      validator: function (v) {
        return /^\d{9}$/.test(v);  
      },
      message: 'Depositor account number must be exactly 9 digits'
    }
  },
  nameDepositor: {
    type: String,
    required: [true, 'Depositor name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  
      },
      message: 'Depositor name should only contain alphabets'
    }
  },
  amountDepositor: {
    type: Number,
    required: [true, 'Amount to transfer is required'],
    min: [1, 'Amount must be a positive number'],  
  },
  phoneDepositor: {
    type: String,
    required: [true, 'Phone number of depositor is required'],
    validate: {
      validator: function (v) {
        return /^(17|77)\d{6}$/.test(v);  
      },
      message: 'Phone number must start with 17 or 77 and be 8 digits long'
    }
  },
  licenseDepositor: {
    type: String,
    required: [true, 'License or CID number of depositor is required'],
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);  
      },
      message: 'License or CID number must be exactly 11 digits'
    }
  },
  // Receiver Information
  accountNumberReceiver: {
    type: String,
    required: [true, 'Account number of receiver is required'],
    validate: {
      validator: function (v) {
        return /^\d+$/.test(v);  
      },
      message: 'Receiver account number must be a positive number'
    }
  },
  nameReceiver: {
    type: String,
    required: [true, 'Receiver name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  
      },
      message: 'Receiver name should only contain alphabets'
    }
  },
  bankNameReceiver: {
    type: String,
    required: [true, 'Receiver bank name is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  
      },
      message: 'Bank name should only contain alphabets'
    }
  },
  branchNameReceiver: {
    type: String,
    required: [true, 'Branch name of receiver is required'],
    validate: {
      validator: function (v) {
        return /^[A-Za-z\s]+$/.test(v);  
      },
      message: 'Branch name should only contain alphabets'
    }
  },
  ifscCodeReceiver: {
    type: String,
    required: [true, 'IFSC code of receiver is required'],
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of transfer is required'],
  },
  otherPurpose: {
    type: String, 
  },
  paymentTerm: {
    type: String, 
  },
  declarationNo: {
    type: String, 
  },
  // Date field for storing date in a specific format (e.g., YYYY-MM-DD)
  date: {
    type: String,
    required: true,
    default: () => new Date().toLocaleDateString('en-GB'), // Defaults to current date in 'DD/MM/YYYY'
  },
  date: {
    type: String,  // Use String to store the date in a specific format like 'YYYY-MM-DD'
    required: true,
    default: () => new Date().toLocaleDateString('en-GB'),  // Defaults to the current date
  },
});

// Export RTGS Transaction model
const RTGSTransaction = mongoose.model('RTGSTransaction', rtgsTransactionSchema);
module.exports = RTGSTransaction;
