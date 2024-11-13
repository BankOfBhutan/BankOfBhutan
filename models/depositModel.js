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

const depositSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['Cash Deposit'],  // Assuming this service will have only one type
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
    depositorName: {
        type: String,
        required: true
    },
    TPN: {
        type: String,
        
    },
    contact: {
        type: String,
        required: true,
        // match: [/^\d{10}$/, 'is invalid']  // Assuming it's a 10-digit number
    },
    depositDate: {
        type: Date,
        required: true
    },
    depositTime: {
        type: String,
        required: true
    },
    token: { 
        type: String, 
    },
    transferred: { type: Boolean, default: false },
    transferredtodeposit: { type: Boolean, default: false } ,
    // appointment: { type: Boolean, default: false } 
}, { timestamps: true });

depositSchema.pre('save', function (next) {
    if (this.depositTime) {
        this.depositTime = to12HourFormat(this.depositTime);
    }
    next();
});

depositSchema.index({ email: 1, depositDate: 1 }, { unique: true });
depositSchema.index({ depositTime: 1, depositDate: 1 }, { unique: true });
depositSchema.index({ depositDate: 1, accountNumber: 1 }, { unique: true });

// Export the model
const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = Deposit;
