// models/Deposit.js
const mongoose = require('mongoose');

function to12HourFormat(timeString) {
    const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/; // Regex to match "HH:mm" format
    
    if (!timePattern.test(timeString)) {
        console.warn("Invalid time format, expected 'HH:mm'");
        return timeString; // Return as-is if the format is incorrect
    }
    
    const [hour, minute] = timeString.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12; // Convert 0 or 12 to 12, and 13-23 to 1-11

    return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

const withdrawalSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['Cash Withdrawal'],  // Assuming this service will have only one type
    },
    Name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']  // Basic email validation
    },
    accountNumber: {
        type: String,
        required: true,
        
    },
    amount: {
        type: Number,
        required: true,
        min: [1, 'Amount must be greater than zero']
    },
    contact: {
        type: String,
        required: true,
        // match: [/^\d{10}$/, 'is invalid']  // Assuming it's a 10-digit number
    },
    withdrawalDate: {
        type: Date,
        required: true,
    },
    WithdrawalTime: {
        type: String,
        required: true
    },
    token: { 
        type: String, 
    },
    transferredTowithdrawal: { type: Boolean, default: false },
    transferred: { type: Boolean, default: false },
    // appointment: { type: Boolean, default: false } 
}, { timestamps: true });
withdrawalSchema.pre('save', function (next) {
    if (this.WithdrawalTime) {
        this.WithdrawalTime = to12HourFormat(this.WithdrawalTime);
    }
    next();
});
withdrawalSchema.index({email : 1,withdrawalDate :1},{unique:true});
withdrawalSchema.index({WithdrawalTime : 1,withdrawalDate :1},{unique:true});
// Export the model
const Withdrawal = mongoose.model('withdrawal', withdrawalSchema);
module.exports = Withdrawal;
