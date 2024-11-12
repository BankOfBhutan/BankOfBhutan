const User = require('../models/customerModel');
const Queue = require("../models/queueModel");
const { generateSequentialToken } = require('../services/tokenService');
const { calculateEstimatedWaitingTime } = require('../Controllers/waitingController');
const { KioskService } = require('../models/koiskeModel'); // Import the Kiosk model
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (recipientEmail, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};

// Generate a 5-digit numeric OTP
const generateNumericOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

// Helper function to get the current time in Bhutan timezone
const getBhutanTime = (offsetMinutes = 0) => {
  const bhutanTimeZone = 'Asia/Thimphu';
  const currentTime = new Date(Date.now() + offsetMinutes * 60 * 1000);

  return {
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: bhutanTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(currentTime),
    time: new Intl.DateTimeFormat('en-US', {
      timeZone: bhutanTimeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(currentTime),
  };
};

// Request OTP function
const requestOTP = async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ message: 'Please provide a valid email.' });

  try {
    const otp = generateNumericOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({ email: userEmail, otp, otpExpires });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }

    const subject = 'Your OTP Code - Bank of Bhutan';
    const message = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="padding: 20px;">
          <p>Dear Customer,</p>
          <p>Your OTP number is below. This number is valid for 10 minutes only.</p>
           
          <p><strong>OTP: </strong>  ${otp}</p>
          
          <p>Best regards,<br>Bank of Bhutan Customer Service Team</p>
        </div>
        <div style="text-align: center; padding: 10px; background-color: #eee; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;

    await sendEmail(userEmail, subject, message);
    res.status(200).json({ status: 'success', message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Function to get the next queue number
const getNextQueueNumber = async () => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const [latestUserQueue, latestKioskQueue] = await Promise.all([
      Queue.findOne({ date: { $gte: currentDate } }).sort({ queueNumber: -1 }).lean(),
      KioskService.findOne({ createdAt: { $gte: currentDate } }).sort({ queueNumber: -1 }).lean()
    ]);

    let lastQueueNumber = Math.max(latestUserQueue?.queueNumber || 0, latestKioskQueue?.queueNumber || 0);
    return lastQueueNumber + 1;
  } catch (error) {
    console.error('Error fetching next queue number:', error);
    throw new Error('Failed to get the next queue number.');
  }
};

// Verify OTP and issue token
const verifyOTP = async (req, res) => {
  const { email, service, otp } = req.body;
  if (!email || !service || !otp) return res.status(400).json({ message: 'Please provide email, service, and OTP.' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const servicesWithoutForm = ['RTGS', 'SWIFT', 'ATS/DSA', 'Dollar Selling/FC Transfer/Travel Agent/CBC', 'Cash (Deposit/Withdraw)'];
    if (!servicesWithoutForm.includes(service)) {
      return res.status(400).json({ message: `Unsupported service: ${service}` });
    }

    const token = await generateSequentialToken(service);
    const waitingTimeResult = await calculateEstimatedWaitingTime(service);
    const waitingTime = waitingTimeResult.estimatedWaitingTime;

    const issueTime = getBhutanTime();
    const expectedServiceTime = getBhutanTime(waitingTime);

    const queueEntry = await Queue.create({
      email,
      serviceName: service,
      token,
      queueNumber: await getNextQueueNumber(),
      issueTime: issueTime.time,
      estimatedTime: waitingTime,
      date: issueTime.date,
    });

    await sendTokenEmail(email, service, token, waitingTime, issueTime.time, expectedServiceTime.time);

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Token for ${service} sent to your email.`,
      token: token,
      waitingTime: waitingTime,
      queueEntry,
    });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    res.status(500).json({ message: 'Server error occurred.' });
  }
};

async function sendTokenEmail(email, service, token, waitingTime, issueTime, expectedServiceTime) {
  const subject = `Your Service Token for ${service} - Bank of Bhutan`;
  const message = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <div style="padding: 20px;">
        <p>Dear Customer,</p>
        <p>We are pleased to confirm your service token for the <strong>${service}</strong> service. Below are the details:</p>
        <p><strong>Token Number:</strong> <span>${token}</span></p>
        <p><strong>Issued At:</strong> <span>${issueTime}</span></p>
        <p><strong>Estimated Waiting Time:</strong> <span>Approximately ${waitingTime} minutes</span></p>
        <p><strong>Expected Service Time:</strong> <span>${expectedServiceTime}</span></p>
        <p>To ensure a smooth experience, we recommend arriving <strong>20 minutes prior to your estimated service time</strong>.</p>
        <p>Best regards,<br>Bank of Bhutan Customer Service Team</p>
      </div>
      <div style="text-align: center; padding: 10px; background-color: #eee; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
        <p>Please do not reply to this email. For further assistance, contact our support team.</p>
      </div>
    </div>
  `;
  await sendEmail(email, subject, message);
}

module.exports = {
  requestOTP,
  verifyOTP,
  getNextQueueNumber,
};
