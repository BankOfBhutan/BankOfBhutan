const mongoose = require('mongoose');
const validator = require('validator');

// Token Schema
const tokenSchema = new mongoose.Schema({
  service: {
    type: String,
    required: [true, 'Service is required'],
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  otp: {
    type: String,
    required: false,
  },
  otpExpires: Date,
  tokens: [tokenSchema],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Export User model
const Customer = mongoose.model('Customer', userSchema);
module.exports = Customer;