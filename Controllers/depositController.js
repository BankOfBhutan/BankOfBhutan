// controllers/depositController.js
const Deposit = require('../models/depositModel');
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

const generateCustomToken = async (depositDate) => {
    // Convert depositDate to format YYYYMMDD
    const formattedDate = new Date(depositDate).toISOString().split('T')[0].replace(/-/g, '');

    // Find the latest deposit token for this date
    const lastDeposit = await Deposit.findOne({
        token: { $regex: `^ODT` } // Match tokens starting with ODT + formattedDate (YYYYMMDD)
    })
        .sort({ token: -1 }) // Sort by token in descending order
        .exec();

    let uniqueNumber = 1; // Default starting number

    if (lastDeposit) {
        // Extract the date portion of the last withdrawal's `withdrawalDate` field for comparison
        const lastDepositDate = new Date(lastDeposit.depositDate)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');

        if (lastDepositDate === formattedDate) {
            // If the dates match, increment the unique number
            const lastUniqueNumber = parseInt(lastDeposit.token.slice(-2), 10); // Get the last 2 digits of the token
            uniqueNumber = lastUniqueNumber + 1;
        }
    }

    // Pad the unique number to always be two digits (e.g., 01, 02, ..., 99)
    const formattedUniqueNumber = uniqueNumber.toString().padStart(2, '0');

    // Construct the token: ODT + depositDate + formattedUniqueNumber
    const token = `ODT${formattedUniqueNumber}`;

    return token; // Return the unique token
};

// Controller to handle form submission
exports.submitDeposit = async (req, res) => {
    const {
        service,
        cidNumber,
        Name,
        email,
        accountNumber,
        amount,
        depositorName,
        TPN,
        contact,
        depositDate,
        depositTime,
        otp
    } = req.body;
    console.log(req.body);
    if (!otp || otp !== otpStore[email]?.otp) {
        return res.status(400).json({ message: 'Invalid or missing OTP' });
      }

    try {
        const token = await generateCustomToken(depositDate);
        // Create a new deposit document
        const deposit = new Deposit({
            service,
            cidNumber,
            Name,
            email,
            accountNumber,
            amount,
            depositorName,
            TPN,
            contact,
            depositDate,
            depositTime,
            token,
            otp
        });

        // Save the deposit to the database
        await deposit.save();

        // Send an email notification after successful deposit
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Sender email address
            to: email,                     // The depositor's email address
            subject: 'Deposit Confirmation',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Deposit Confirmation</h2>
            <p>Dear <strong>${Name}</strong>,</p>
            <p>We are pleased to confirm that your Deposit of <strong>${amount}</strong> from <strong>${accountNumber}</strong> has been successfully processed.</p>
            <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                <p><strong>Details of your transaction:</strong></p>
                <ul style="list-style-type: none; padding: 0;">
                    <li><strong>Your Token Number:</strong> ${token}</li>
                   
                    <li><strong>Amount:</strong> ${amount}</li>
                    <li><strong>Account Number:</strong> ${accountNumber}</li>
                    <li><strong>Date:</strong> ${depositDate}</li>
                    <li><strong>Time:</strong> ${depositTime}</li>
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
        res.status(200).json({ message: 'Deposit successfully submitted!' });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'An error occurred while submitting the deposit' });
    }
};

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    console.log(req.body);
  
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
    const { email, depositDate, depositTime } = req.body;
    try {
        const emailConflict = await Deposit.findOne({ email, depositDate });
        const timeConflict = await Deposit.findOne({ depositDate, depositTime });

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