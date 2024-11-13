const mongoose = require('mongoose')
const moment = require('moment-timezone');
const appointmentSchema = new mongoose.Schema({
    name : {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: false,
        default: null,
      },
      token: {
        type: String,
        default: null,
      },
      accountNumber: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      issueTime: {
        type: String,
        required: true,
        default: () => moment().tz("Asia/Thimphu").format("HH:mm:ss"),
      },
      estimatedTime: {
        type: String,
        default: null,
      },
      startServingTime: {
        type: String,
        default: () => moment().tz("Asia/Thimphu").format("hh:mm A")
      },
      endServingTime: {
        type: String,
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
});
appointmentSchema.index({ accountNumber: 1, serviceName: 1, date: 1 }, { unique: true });

const appointment = mongoose.model('appointment',appointmentSchema)
module.exports = appointment