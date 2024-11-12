const DollarSelling = require('../models/dollerSellingModel')
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

const generateCustomToken = async (dsDate) => {
    const formattedDate = new Date(dsDate).toISOString().split('T')[0].replace(/-/g, '');

    const lastDollarSelling = await DollarSelling.findOne({
        token: { $regex: `^ODS` } // Match tokens starting with ODT + formattedDate (YYYYMMDD)
    })
        .sort({ token: -1 }) // Sort by token in descending order
        .exec();

    let uniqueNumber = 1; // Default starting number

    if (lastDollarSelling) {
        // Extract the date portion of the last withdrawal's `withdrawalDate` field for comparison
        const lastDollarSellingDate = new Date(lastDollarSelling.dsDate)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');

        if (lastDollarSellingDate === formattedDate) {
            // If the dates match, increment the unique number
            const lastUniqueNumber = parseInt(lastDollarSelling.token.slice(-2), 10); // Get the last 2 digits of the token
            uniqueNumber = lastUniqueNumber + 1;
        }
    }

    const formattedUniqueNumber = uniqueNumber.toString().padStart(2, '0');
    const token = `ODS${formattedUniqueNumber}`;

    return token; // Return the unique token
};

exports.submitDS = async(req,res)=>{
    const {service,Name,email,accountNumber,contact,dsDate,dsTime,otp}=req.body;
   
    try {
        if (!otp || otp !== otpStore[email]?.otp) {
            return res.status(400).json({ message: 'Invalid or missing OTP' });
          }
        const token = await generateCustomToken(dsDate);
        
        const DS = new DollarSelling({
            service,
            Name,
            email,
            accountNumber,
            contact,
            dsDate,
            dsTime,
            token,
            otp
        });

        await DS.save();

        const mailOptions = {
            from: '12210063.gcit@rub.edu.bt', // Replace with your email
            to: email,                    // Send email to the customer
            subject: 'Dollar Selling/FC Transfer/ Travel Agent/ CBC Token Booking Confirmation',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Dollar Selling/FC Transfer/ Travel Agent/ CBC</h2>
                <p>Dear <strong>${Name}</strong>,</p>
                <p>We are pleased to confirm your booking with the following details:</p>
                <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Your Token Number:</strong> ${token}</li>
                        <li><strong>Service:</strong> ${service}</li>
                        <li><strong>Account Number:</strong> ${accountNumber}</li>
                        <li><strong>Date:</strong> ${dsDate}</li>
                        <li><strong>Time:</strong> ${dsTime}</li>
                    </ul>
                </div>
                <p style="margin-top: 20px;">If you have any questions or need further assistance, feel free to contact us.</p>
                <p>Thank you for choosing our service!</p>
                <p style="text-align: right;">Best regards,<br><strong>Bank of Bhutan</strong></p>
            </div>`
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ message: 'Dollar Selling/FC Transfer/ Travel Agent/ CBC Token successfully booked!', token });
    } catch (err) {
        console.error('Error details:', err.stack); // More detailed error logging
        res.status(500).json({ error: 'An error occurred while submitting the ATS/DSA' });
        
    }
}
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
    const { email, dsDate, dsTime } = req.body;
    try {
        const emailConflict = await DollarSelling.findOne({ email, dsDate });
        const timeConflict = await DollarSelling.findOne({ dsDate, dsTime });

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
