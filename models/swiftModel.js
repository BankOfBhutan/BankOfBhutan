const mongoose = require('mongoose');

const swiftschema = mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['Swift'],
    },
    Reference: {
        type: String,
        required: true,
    },
    approval: {
        type: String,
        required: true,
    },
    cid: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerAddress: {
        type: String,
        required: true,
    },
    BIC: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address']
    },
    remit: {
        type: Number,
        required: true,
        min: [1, 'Remit sum must be greater than zero']
    },
    product: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    valueDate: {
        type: Date,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be greater than zero']
    },
    bankName: {
        type: String,
        required: true
    },
    bankAddress: {
        type: String,
        required: true
    },
    swiftCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
       
    },
    address: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Term of Payment', 'Advance Payment/Final Payment']
    },
    declarationNo: {
        type: String,
        required: function () {
            return this.purpose === 'Advance Payment/Final Payment';
        }
    },
    charge: {
        type: String,
        enum: ['Our', 'Beneficiary', 'Share'],
        required: true
    },
    education: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    swiftDate: {
        type: Date,
        required: true
    },
    swiftTime: {
        type: String,
        required: true
    },
    institutionName: {
        type: String,
        required: function() {
            return this.education === 'Yes'; 
        }
    },
    institutionAddress: {
        type: String,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    course: {
        type: String,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    DateofCommencement: {
        type: Date,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    duration: {
        type: String,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    DateofTravel: {
        type: Date,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    travelTime: {
        type: String,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    TuitionFeesCurrency: {
        type: String,
         required: function() {
            return this.education === 'Yes';  
        }
    },
    TuitionFeesAmount: {
        type: Number,
         required: function() {
            return this.education === 'Yes'; 
         } 
    },
    TuitionFees: {
        type : String,
        enum: ['Swift', 'Draft'],
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    StipendCurrency: {
        type: String,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    StipendAmount: {
        type: Number,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    Stipendpayment: {
        type: String,
        enum: ['Swift', 'Draft', 'Debit Card'],
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    allowanceCurrency: {
        type: String,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    allowanceAmount: {
        type: Number,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    allowance: {
        type: String,
        enum: ['Swift', 'Draft', 'Debit Card'],
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    TotalAmount: {
        type: String,
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    Accountno: {
        type: String,
       
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    Contact: {
        type: String,
        
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    Place: {
        type: String,
        
         required: function() {
            return this.education === 'Yes'; 
        }
    },
    token: {
        type: String,
   
    },transferred: { type: Boolean, default: false }
}, { timestamps: true });

swiftschema.index({email:1, swiftDate:1},{unique:true});
swiftschema.index({swiftTime:1, swiftDate:1},{unique:true});
swiftschema.index({swiftDate:1, accountNumber:1},{unique:true});

const swift = mongoose.model('swiftschema', swiftschema);
module.exports = swift;
