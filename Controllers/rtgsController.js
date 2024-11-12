const RTGSRequest = require('../models/rtgsModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const otpStore = {};

const generateOTP = (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    const expires = Date.now() + 300000; // OTP expires in 5 minutes
    otpStore[email] = { otp, expires };

    return otp; // Return the generated OTP
};

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to generate a unique token for RTGS requests
const generateCustomToken = async (rtgsDate) => {
    const formattedDate = new Date(rtgsDate).toISOString().split('T')[0].replace(/-/g, '');
    const lastRequest = await RTGSRequest.findOne({
        token: { $regex: `^ORTGS` }
    }).sort({ token: -1 }).exec();

    if (lastRequest) {
        // Extract the date portion of the last withdrawal's `withdrawalDate` field for comparison
        const lastRequestDate = new Date(lastRequest.rtgsDate)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');

        if (lastRequestDate === formattedDate) {
            // If the dates match, increment the unique number
            const lastUniqueNumber = parseInt(lastRequest.token.slice(-2), 10); // Get the last 2 digits of the token
            uniqueNumber = lastUniqueNumber + 1;
        }
    }
    const formattedUniqueNumber = uniqueNumber.toString().padStart(2, '0');
    return `ORTGS${formattedUniqueNumber}`;
};

// Function to send confirmation email
const sendConfirmationEmail = async (mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return reject(error);
            }
            console.log('Email sent: ' + info.response);
            resolve(info);
        });
    });
};
exports.submitRTGS = async (req, res) => {
    const {
        service,
        bankRefNumber,
        referralNumber,
        remitSum,
        charge,
        accountNumber,
        depositorName,
        depositorCID: depositorCid,  // Map correctly to match schema
        depositorContact,
        depositorAddress,
        email,  
        receiverName,
        receiverAccountNumber,
        receiverBankName: receiverBank,  // Correct mapping for receiverBank
        receiverBranchName,
        IFSCCode: ifscCode,  // Correct mapping for ifscCode
        receiverCID: receiverCid,  // Ensure this matches
        purpose,
        paymentTerms,
        declarationNumber,
        rtgsDate,
        rtgsTime,
        otp
    } = req.body;
    
    

    try {
        if (!otp || otp !== otpStore[email]?.otp) {
            return res.status(400).json({ message: 'Invalid or missing OTP' });
          }
        // Generate token
        const token = await generateCustomToken(rtgsDate);

        // Create a new RTGS request document
        const rtgsRequest = new RTGSRequest({
            service,
            bankRefNumber,
            referralNumber,
            remitSum,
            charge,
            accountNumber,
            depositorName,
            depositorCid,
            depositorContact,
            depositorAddress,
            email,
            receiverName,
            receiverAccountNumber,
            receiverBank,
            receiverBranchName,
            ifscCode,
            receiverCid,
            rtgsDate,
            rtgsTime,
            purpose,
            paymentTerms,
            declarationNumber,
            token,
            otp
        });

        // Save the RTGS request to the database
        await rtgsRequest.save();

        // Prepare and send the email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'RTGS Request Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">RTGS Request Confirmation</h2>
                    <p>Dear <strong>${depositorName}</strong>,</p>
                    <p>We are pleased to confirm that your RTGS request of <strong>${remitSum}</strong> from <strong>${accountNumber}</strong> has been successfully processed.</p>
                    <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                        <p><strong>Details of your RTGS request:</strong></p>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Your Token Number:</strong> ${token}</li>
                            <li><strong>Amount:</strong> ${remitSum}</li>
                            <li><strong>Debit Account Number:</strong> ${accountNumber}</li>
                            <li><strong>Receiver's Name:</strong> ${receiverName}</li>
                            <li><strong>Receiver's Account Number:</strong> ${receiverAccountNumber}</li>
                            <li><strong>Date:</strong> ${rtgsDate}</li>
                            <li><strong>Time:</strong> ${rtgsTime}</li>
                            <li><strong>Purpose:</strong> ${purpose}</li>
                            <li><strong>Declaration Number:</strong> ${declarationNumber}</li>
                        </ul>
                    </div>
                    <p style="margin-top: 20px;">If you have any questions or need further assistance, feel free to contact us.</p>
                    <p>Thank you for choosing our service!</p>
                    <p style="text-align: right;">Best regards,<br><strong>[Bank Of Bhutan]</strong></p>
                </div>`
        };

        await sendConfirmationEmail(mailOptions);

        // Send success response
        res.status(200).json({ message: 'RTGS request successfully submitted!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while submitting the RTGS request' });
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
    const { email, rtgsDate,rtgsTime} = req.body;
    try {
        const emailConflict = await RTGSRequest.findOne({ email, rtgsDate });
        const timeConflict = await RTGSRequest.findOne({ rtgsTime,rtgsDate });

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





