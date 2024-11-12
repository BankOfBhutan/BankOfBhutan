const mongoose = require('mongoose');

const swiftTransactionSchema = new mongoose.Schema({
  TokenNumber: {
    type: String,
    required: [true, 'TokenNumber is required'], // Add TokenNumber field
  },
  passportNo: { type: String, required: [true, 'Passport/ID No is required'] },
  productDetails: { type: String, required: [true, 'Product details are required'] },
  issuedDate: {
    type: Date,
    required: [true, 'Issued Date is required'],
    validate: {
      validator: function (v) {
        return !isNaN(Date.parse(v));
      },
      message: props => `${props.value} is not a valid issued date!`
    }
  },
  expiryDate: { type: Date, required: [true, 'Expiry Date is required'] },
  currencyType: { type: String, required: [true, 'Currency type is required'] },
  amount: { type: Number, required: [true, 'Amount is required'], min: [0, 'Amount must be positive'] },
  valueDate: { type: Date, required: [true, 'Value Date is required'] },
  orderingCustomer: {
    name: { type: String, required: [true, 'Customer name is required'] },
    address: { type: String, required: [true, 'Customer address is required'] }
  },
  beneficiaryBank: {
    name: { type: String, required: [true, 'Beneficiary bank name is required'] },
    address: { type: String, required: [true, 'Beneficiary bank address is required'] },
    swiftCode: { type: String, required: [true, 'SWIFT code is required'] }
  },
  beneficiaryCustomer: {
    name: { type: String, required: [true, 'Beneficiary name is required'] },
    accountNo: { type: String, required: [true, 'Beneficiary account number is required'] },
    address: { type: String }
  },
  purpose: { type: String, required: [true, 'Purpose is required'] },
  paymentTerm: { type: String, enum: ['advance_payment', 'final_payment'], required: false },
  declarationNo: {
    type: String,
    required: function () {
      return this.paymentTerm === 'final_payment';
    }
  },
  charges: { type: String, enum: ['our', 'beneficiary', 'share'], required: [true, 'Details of charges are required'] },

  // Institution-related fields
  institution: {
    name: { type: String },
    address: { type: String },
    course: { type: String },
    commencementDate: { type: Date },
    courseDuration: { type: String },
    travelDate: { type: Date },
    travelTime: { type: String },
    tuitionFees: {
      amount: { type: Number },
      paymentMode: { type: String }
    },
    stipend: {
      amount: { type: Number },
      paymentMode: { type: String }
    },
    livingAllowance: {
      amount: { type: Number },
      paymentMode: { type: String }
    },
    totalAmount: { type: Number }
  },
  
  // Add a date field to store the date in string format
  date: {
    type: String, 
    required: true,
    default: () => new Date().toLocaleDateString('en-GB'), // Default to current date
  }
});

const SWIFTTransaction = mongoose.model('SWIFTTransaction', swiftTransactionSchema);
module.exports = SWIFTTransaction;
