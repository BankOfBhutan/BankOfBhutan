const mongoose = require('mongoose');

// Define the schema for storing service, token, waiting time, estimated time, and served status
const KioskServiceSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  waitingTime: {
    type: Number, 
    required: true
  },
  estimatedTime: {
    type: Date, 
    required: true
  },
  queueNumber: {
    type: Number, 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  served: {
    type: Boolean,
    default: false 
  }
});

const KioskService = mongoose.model('KioskService', KioskServiceSchema);
module.exports = { KioskService };
