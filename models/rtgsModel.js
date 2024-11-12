const mongoose = require('mongoose');

const rtgsSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['RTGS'],  // Assuming RTGS as the only service for this form
    },
    bankRefNumber: {
        type: String,
        default: null  // Setting default to null for clarity
    },
    referralNumber: {
        type: String,
        required: true
    },
    remitSum: {
        type: Number,
        required: true,
        min: [1, 'Remit sum must be greater than zero']
    },
    charge: {
        type: Number,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
       
    },
    depositorName: {
        type: String,
        required: true
    },
    depositorCid: {
        type: String,
        required: true
    },
    depositorContact: {
        type: String,
        required: true,
        match: [/^\d{8,15}$/, 'Invalid contact number']  // Assuming a valid number format
    },
    depositorAddress: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address']
    },
    receiverName: {
        type: String,
        required: true
    },
    receiverAccountNumber: {
        type: String,
        required: true
    },
    receiverBank: {
        type: String,
        required: true
    },
    receiverBranchName: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    receiverCid: {
        type: String,
        required: true
    },
    rtgsDate: {
        type: Date,
        required: true,
    },
    rtgsTime: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ['Bill Payment', 'Education', 'Medical', 'Salary', 'Family Maintenance', 'Government Fund', 'Other']
    },
    paymentTerms: {
        type: String,
        enum: ['Advance Payment', 'Final Payment'],
        required: function() {
            return this.purpose === 'Bill Payment';  // paymentTerms is required if purpose is 'Bill Payment'
        }
    },
    declarationNumber: {
        type: String,
        required: true
    },
    token: { 
        type: String, 
     
    }, transferred: { type: Boolean, default: false }
}, { timestamps: true });

rtgsSchema.index({ email: 1, rtgsDate: 1 }, { unique: true });
rtgsSchema.index({ rtgsDate: 1, rtgsTime: 1 }, { unique: true });
rtgsSchema.index({rtgsDate: 1 , accountNumber: 1}, { unique: true });


// Export the model
const RTGSRequest = mongoose.model('RTGSRequest', rtgsSchema);
module.exports = RTGSRequest;
