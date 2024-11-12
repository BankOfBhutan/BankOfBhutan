const mongoose = require('mongoose')
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
const DollarSelling = new mongoose.Schema({
    service:{
        type:String,
        require:true,
        enum:['Dollar Selling/FC Transfer/ Travel Agent/ CBC']
    },
    Name : {
        type:String,
        require:true,
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
    contact: {
        type: Number,
        required: true,
        
    },
    dsDate:{
        type: Date,
        require:true

    },
    dsTime: {
        type:String,
        require:true

    },
    token: { 
        type: String, 
        
    }, transferred: { type: Boolean, default: false },
    appointment: { type: Boolean, default: false } 
}, 
{ timestamps: true});
DollarSelling.pre('save', function (next) {
    if (this.dsTime) {
        this.dsTime = to12HourFormat(this.dsTime);
    }
    next();
});

DollarSelling.index({ email: 1, dsDate: 1 }, { unique: true });
DollarSelling.index({ dsTime: 1, dsDate: 1 }, { unique: true });
DollarSelling.index({ dsDate: 1,accountNumber: 1 }, { unique: true });


const DS = mongoose.model('DollarSelling',DollarSelling)
module.exports = DS;