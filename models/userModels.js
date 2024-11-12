const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['teller', 'admin'],
        default: 'teller',
    },
    operatorId: {
        type: String,
        required: true,
    },
    counter: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return this.isModified('password') ? el === this.password : true;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordResetOtp: String,
    passwordResetExpires: Date,
    status: {
        type: String,
        enum: ['leave', 'active', 'inactive'],
        default: 'active',
    },
    service: {
        type: String,
        enum: [
            'Cash (Deposit/Withdraw)',
            'RTGS',
            'SWIFT',
            'ATS/DSA',
            'Dollar Selling/FC Transfer/Travel Agent/CBC'
        ],
        required: [true, 'Service type is required'],
    },
});

// Hash password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // Remove passwordConfirm from database
    next();
});

// Method to check if passwords match
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Create the User model
const User = mongoose.model('User', userSchema);
module.exports = User;