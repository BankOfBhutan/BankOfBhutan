const mongoose = require('mongoose');

// TokenCounter Schema to track the last generated tokens independently
const tokenCounterSchema = new mongoose.Schema({
  kioskLastToken: {
    type: Number,
    required: true,
    default: 0
  },
  userLastToken: {
    type: Number,
    required: true,
    default: 0
  }
});

// Export TokenCounter model
const TokenCounter = mongoose.model('TokenCounter', tokenCounterSchema);
module.exports = TokenCounter;

