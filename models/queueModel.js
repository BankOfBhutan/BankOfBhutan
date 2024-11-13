const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment-timezone')

const queueSchema = new Schema({
  name :{
    type: String,
    
    default: null,

  },
  email: {
    type: String,
    required: false,
    default: null,
  },
  accountNumber: {
    type: Number,
    default:null,
  },
  token: {
    type: String,
    default: null,
  },
  queueNumber: {
    type: Number,
    default : 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  issueTime: {
    type: String,
    default: () => moment().tz("Asia/Thimphu").format("HH:mm:ss")
  },
  estimatedTime: {
    type: String,
    default: null,
  },
  startServingTime: {
    type: String,
    default: null,
  },
  endServingTime: {
    type: String,
    default: null,
  },
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    default: null,
  },
  serviceName: {
    type: String,
    enum: [
      'ATS/DSA',
      'Dollar Selling/FC Transfer/Travel Agent/CBC',
      'Cash (Deposit/Withdraw)',
      'RTGS',
      'SWIFT',
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'serving', 'served'],
    default: 'pending',
  },
  counter: {
    type: String,
    default: null,
  },
  skip: {
    type: Number,
    default: 0,
  },
  requeue: {
    type: Number,
    default: 0,
  },
  repeat: {
    type: Number,
    default: 0,
  },
  actualWaitingTime: {
    type: Number,
    default: null,
  },
  transactionTime: {
    type: Number,
    default: null,
  },
  priority: {
    type: Boolean,
    default: false,
  },
});
appointmentSchema.index({ accountNumber: 1, serviceName: 1, date: 1 }, { unique: true });
const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;
