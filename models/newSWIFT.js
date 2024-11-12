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
const swiftSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        enum: ['SWIFT'],  // Assuming this service will have only one type
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
    contact: {
        type: Number,
        required: true,
        
    },
    swiftDate:{
        type: Date,
        require:true

    },
    swiftTime: {
        type:String,
        require:true

    },
    token: { 
        type: String,     
    },transferred: { type: Boolean, default: false } ,
    appointment: { type: Boolean, default: false } 
}, { timestamps: true });
swiftSchema.pre('save', function (next) {
    if (this.swiftTime) {
        this.swiftTime = to12HourFormat(this.swiftTime);
    }
    next();
});

swiftSchema.index({ email: 1, swiftDate: 1 }, { unique: true });
swiftSchema.index({ swiftDate: 1, swiftTime: 1 }, { unique: true });
swiftSchema.index({ swiftDate: 1, accountNumber: 1 }, { unique: true });

// Export the model
const swiftSchemas = mongoose.model('swiftSchema', swiftSchema);
module.exports = swiftSchemas;
