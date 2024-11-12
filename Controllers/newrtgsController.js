const RTGS = require('../models/newRTGS');
const nodemailer = require('nodemailer');
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

const generateCustomToken = async (rtgsDate) => {
    const formattedDate = new Date(rtgsDate).toISOString().split('T')[0].replace(/-/g, '');

    const lastrtgs = await RTGS.findOne({
        token: { $regex: `^ORTGS` } // Match tokens starting with ODT + formattedDate (YYYYMMDD)
    })
        .sort({ token: -1 }) // Sort by token in descending order
        .exec();

    let uniqueNumber = 1; // Default starting number

    if (lastrtgs) {
        // Extract the date portion of the last withdrawal's `withdrawalDate` field for comparison
        const lastrtgsDate = new Date(lastrtgs.rtgsDate)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');

        if (lastrtgsDate === formattedDate) {
            // If the dates match, increment the unique number
            const lastUniqueNumber = parseInt(lastrtgs.token.slice(-2), 10); // Get the last 2 digits of the token
            uniqueNumber = lastUniqueNumber + 1;
        }
    }

    const formattedUniqueNumber = uniqueNumber.toString().padStart(2, '0');
    const token = `ORTGS${formattedUniqueNumber}`;

    return token; // Return the unique token
};

exports.submitRTGS = async (req, res) => {
    const { service, Name, email, accountNumber, contact, rtgsDate, rtgsTime,otp } = req.body;
    
    if (!otp || otp !== otpStore[email]?.otp) {
        return res.status(400).json({ message: 'Invalid or missing OTP' });
      }
    try {
        const token = await generateCustomToken(rtgsDate); // Add await here
        console.log(req.body); // Fix console log typo

        const rtgs = new RTGS({
            service,
            Name,
            email,
            accountNumber, // Fix typo here
            contact,
            rtgsDate,
            rtgsTime,
            token,
            otp
        });

        await rtgs.save();

        const mailOptions = {
            from: '12210063.gcit@rub.edu.bt', // Replace with your email
            to: email,                    // Send email to the customer
            subject: 'rtgs Token Booking Confirmation',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">rtgs Token Booking Confirmation</h2>
                <p>Dear <strong>${Name}</strong>,</p>
                <p>We are pleased to confirm your booking with the following details:</p>
                <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Your Token Number:</strong> ${token}</li>
                        <li><strong>Service:</strong> ${service}</li>
                        <li><strong>Account Number:</strong> ${accountNumber}</li>
                        <li><strong>Date:</strong> ${rtgsDate}</li>
                        <li><strong>Time:</strong> ${rtgsTime}</li>
                    </ul>
                </div>
                <p style="margin-top: 20px;">If you have any questions or need further assistance, feel free to contact us.</p>
                <p>Thank you for choosing our service!</p>
                <div style="text-align: right;">
                    <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bob.bt%2F&psig=AOvVaw30D4DVSNLiDgQgH9xi1XVt&ust=1730374665230000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMCPh4uCtokDFQAAAAAdAAAAABAE" style="width: 150px; height: auto;">
                </div>            
            </div>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'rtgs Token successfully booked!', token });

    } catch (err) {
        console.error('Error details:', err.stack); // More detailed error logging
        if (err.code === 11000) {
            const conflictingField = Object.keys(err.keyPattern)[0];  // Get the field that caused the conflict
            
            if (conflictingField === 'email') {
                res.status(400).json({ error: 'This email is already used. Please change your email.' });
            } else if (conflictingField === 'rtgsTime') {
                res.status(400).json({ error: 'This time slot is already booked. Please select a different time.' });
            } else {
                res.status(400).json({ error: 'Duplicate entry for email, date, and time' });
            }
        } else {
            res.status(500).json({ error: 'An error occurred while submitting the rtgs' });
        }
    
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
    const { email, rtgsDate, rtgsTime } = req.body;
    try {
        const emailConflict = await RTGS.findOne({ email, rtgsDate });
        const timeConflict = await RTGS.findOne({ rtgsDate, rtgsTime });

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