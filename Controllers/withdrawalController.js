// controllers/depositController.js
const Withdrawal = require('../models/withdrawalModel');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const otpStore = {};

const generateOTP = (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expires = Date.now() + 300000; // OTP expires in 5 minutes
    otpStore[email] = { otp, expires };

    return otp; // Return the generated OTP
};
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,      // Your email from environment variables
        pass: process.env.EMAIL_PASS       // App password from environment variables
    }
});
const generateCustomToken = async (withdrawalDate) => {
    // Convert depositDate to format YYYYMMDD
    const formattedDate = new Date(withdrawalDate).toISOString().split('T')[0].replace(/-/g, '');

    // Find the latest deposit token for this date
    const lastWithdrawal = await Withdrawal.findOne({
        token: { $regex: `^OWT` } // Match tokens starting with ODT + formattedDate (YYYYMMDD)
    })
        .sort({ token: -1 }) // Sort by token in descending order
        .exec();

    let uniqueNumber = 1; // Default starting number

    if (lastWithdrawal) {
        const lastWithdrawalDate = new Date(lastWithdrawal.withdrawalDate)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');

        if (lastWithdrawalDate === formattedDate) {
            // If the dates match, increment the unique number
            const lastUniqueNumber = parseInt(lastWithdrawal.token.slice(-2), 10); // Get the last 2 digits of the token
            uniqueNumber = lastUniqueNumber + 1;
        }
    }

    // Pad the unique number to always be two digits (e.g., 01, 02, ..., 99)
    const formattedUniqueNumber = uniqueNumber.toString().padStart(2, '0');

    // Construct the token: ODT + depositDate + formattedUniqueNumber
    const token = `OWT${formattedUniqueNumber}`;

    return token; // Return the unique token
};
// Controller to handle form submission
exports.submitWithdrawal = async (req, res) => {
    try {
        // Extract data from the request body
        const {
            service,
            Name,
            email,
            accountNumber,
            amount,         
            contact,
            withdrawalDate,
            WithdrawalTime,
            otp
        } = req.body;
        if (!otp || otp !== otpStore[email]?.otp) {
            return res.status(400).json({ message: 'Invalid or missing OTP' });
          }  

        const token = await generateCustomToken(withdrawalDate);

        // Create a new deposit document
        const withdrawal = new Withdrawal({
            service,
            Name,
            email,
            accountNumber,
            amount,
            contact,
            withdrawalDate,
            WithdrawalTime,
            token,
            otp
        });

        // Save the deposit to the database
        await withdrawal.save();

        // Send an email notification after successful deposit
        const mailOptions = {
            from: '12210063.gcit@rub.edu.bt',  // Sender email address
            to: email,                     // The depositor's email address
            subject: 'Withdrawal Confirmation',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Withdrawal Confirmation</h2>
            <p>Dear <strong>${Name}</strong>,</p>
            <p>We are pleased to confirm that your withdrawal of <strong>${amount}</strong> from  <strong>${accountNumber}</strong> has been successfully processed.</p>
            <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <p><strong>Details of your transaction:</strong></p>
                <ul style="list-style-type: none; padding: 0;">
                     <li><strong>Your Token Number:</strong> ${token}</li>
                    <li><strong>Amount:</strong> ${amount}</li>
                    <li><strong>Account Number:</strong> ${accountNumber}</li>
                    <li><strong>Date:</strong> ${withdrawalDate}</li>
                    <li><strong>Time:</strong> ${WithdrawalTime}</li>
                </ul>
            </div>
            <p style="margin-top: 20px;">If you have any questions or need further assistance, feel free to contact us.</p>
            <p>Thank you for choosing our service!</p>
            <p style="text-align: right;">Best regards,<br><strong>[Bank Of Bhutan]</strong></p>
        </div>`
            
        };

        // Send email using the transporter
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        // Send a success response
        res.status(200).json({ message: 'Withdrawal successfully submitted!' });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'An error occurred while submitting the deposit' });
    }
};

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
  
    // Generate OTP and store it temporarily
    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 600000 };
  
    // Send the OTP to the user's email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Transaction',
        text: `Your OTP is ${otp}. It is valid for the next 10 minutes.`,
    };
  
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
  };

  exports.checkConflict = async (req,res)=>{
    const { email, withdrawalDate,WithdrawalTime } = req.body;
    try {
        const emailConflict = await Withdrawal.findOne({ email, withdrawalDate });
        const timeConflict = await Withdrawal.findOne({ WithdrawalTime, withdrawalDate });

        if (emailConflict) {
            return res.json({ conflict: true, message: 'This email has already been used to book for this date. Please choose a different date or email.' });
        }

        if (timeConflict) {
            return res.json({ conflict: true, message: 'This time slot is already booked on this date. Please select a different time.' });
        }

        res.json({ conflict: false });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ conflict: true, message: 'An error occurred while checking conflicts. Please try again.' });
    }

}
