const { JsonWebTokenError } = require('jsonwebtoken')
const User =  require('../models/userModels')
const jwt = require('jsonwebtoken')
const { promisify } =  require('util')
const AppError = require('./../utils/appError')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')

dotenv.config({ path: './../config.env' })


const crypto = require('crypto');

// Function to send OTP for password reset
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(email)
        // Step 1: Check if the user exists based on the email
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('There is no user with that email address.', 404));
        }

        // Step 2: Generate a random OTP (e.g., 6-digit code)
        const otp = crypto.randomInt(100000, 999999).toString();

        // Step 3: Store the OTP and expiration time (e.g., 10 minutes) in the user document
        user.passwordResetOtp = otp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        await user.save({ validateBeforeSave: false });  // Save user without triggering validation

        // Step 4: Send the OTP via email using Nodemailer
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Password Reset OTP</h2>
                <p>Dear User,</p>
                <p>You have requested a password reset. Please use the following OTP to reset your password:</p>
                <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px; text-align: center;">
                    <p style="font-size: 18px; font-weight: bold;">${otp}</p>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request this, please contact support immediately.</p>
                <p style="text-align: right;">Best regards,<br><strong>The Team</strong></p>
            </div>
        `;
        await sendEmail(user.email, 'Password Reset OTP', emailContent);

        res.status(200).json({
            status: 'success',
            message: 'OTP sent to email!'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

// Verify OTP (without resetting password)
exports.verifyOtp = async (req, res, next) => {
    try {
        console.log(req.body)
        const { email, otp } = req.body;
        console.log("hi")
        // Step 1: Find the user by email
        const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetExpires');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Step 2: Check if OTP matches and hasn't expired
        if (user.passwordResetOtp !== otp) {
            return next(new AppError('Invalid or expired OTP', 400));
        }

        if (user.passwordResetExpires < Date.now()) {
            return next(new AppError('OTP has expired', 400));
        }

        // Step 3: If OTP is valid, send success response
        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully. You can now reset your password.',
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',  // You can use other services like Yahoo, Outlook, etc.
    auth: {
        user: process.env.EMAIL_USER,       // Your email
        pass: process.env.EMAIL_PASS         // Your email password (or app-specific password for security)
    }
});

// Function to send the email
async function sendEmail(toEmail, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        html: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}
// const createSendToken = (user, statusCode,res) => {
//     const token = signToken(user._id)
//     const cookieOptions = {
//         expires: new Date(
//             Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
//         ),
//         httpOnly:true,
//     }
//     res.cookie("jwt" , token, cookieOptions)
    
//     res.status(statusCode).json({
//         status: "success",
//         token,
//         data : {
//             user
//         }
//     })
// }
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Updated cookie options with fallback for JWT_COOKIE_EXPIRES_IN
    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 10) * 24 * 60 * 60 * 1000
        ), // Sets a default expiration of 10 days if JWT_COOKIE_EXPIRES_IN is undefined
        maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || 10) * 24 * 60 * 60 * 1000,
        httpOnly: true, // Cookie is only accessible by the web server
        secure: process.env.NODE_ENV === 'production', // Only set cookie over HTTPS in production
        sameSite: 'strict', // CSRF protection
    };

    // Set JWT cookie with updated options
    res.cookie("jwt", token, cookieOptions);

    // Send response with token and user data
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};
exports.signup = async (req,res,next) => {
    try{
        console.log(req.body)
        const lastTeller = await User.findOne({}).sort({ operatorId: -1 }).exec();
        let newOperatorId;
        if (lastTeller && lastTeller.operatorId) {
            // Step 2: Extract the number part from the operatorId
            const lastOperatorId = lastTeller.operatorId;
            const lastOperatorNumber = parseInt(lastOperatorId.replace('OPERATOR', ''), 10);
            
            // Step 3: Increment the number for the new operatorId
            const newOperatorNumber = lastOperatorNumber + 1;
            newOperatorId = `OPERATOR${newOperatorNumber}`;
        } else {
            // If no operator exists yet, start with OPERATOR1
            newOperatorId = 'OPERATOR1';
        }
       
        const newuser = {
            name : req.body.name,
            email : req.body.email,
            operatorId: newOperatorId,
            counter: req.body.counter,
            password: req.body.password,
            passwordConfirm: req.body.password,
            service: req.body.service
        }
        const newUser =await User.create(newuser)
        const token = signToken(newUser._id)
        console.log(`Teller created: ${req.body.name}`);

        // Step 2: Send email with teller's credentials
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Teller Account Created Successfully</h2>
                <p>Dear <strong>${req.body.name}</strong>,</p>
                <p>We are excited to inform you that your teller account has been created successfully.</p>
                <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <p><strong>Account Details:</strong></p>
                    <ul style="list-style-type: none; padding: 0;">
                        <li><strong>Email:</strong> ${req.body.email}</li>
                        <li><strong>Password:</strong> ${req.body.password}</li>
                    </ul>
                </div>
                <p style="margin-top: 20px;">You can log in at: <a href="https://admin-psax.onrender.com">https://admin-psax.onrender.com</a></p>
                <p>Please remember to change your password upon first login.</p>
                <p>Thank you for being part of our team!</p>
                <p style="text-align: right;">Best regards,<br><strong>The Team</strong></p>
            </div>
        `;

        await sendEmail(req.body.email, 'Your Teller Account Credentials', emailContent);

        res.status(201).json({
            status: "success",
            token,
            data : {
                user: newUser
            }
        })
    }
    catch(err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: err.message});
    }   
}
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        console.log(req.body);
        if(!email || !password) {
            return next(new AppError('Please provide an email and password!', 400))
        
        }
        const user = await User.findOne({ email }).select('+password')
        //const correct = await user.correctPassword(password, user.password)
        console.log(user)
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password',401))
        }
        createSendToken(user, 200, res)
        // const token = signToken(user._id)
        // res.status(200).json({
        //     status: 'success',
        //     token,
        // })

    } catch (err) {
        res.status(500).json({error: err.message });

    }
}
exports.protect = async (req, res, next) => {
    try{
        //Getting token and check of its there

        let token
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1]
        }
        else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }
        if(!token) {
            return next(
                new AppError('You are not logged in! PLease log in to get access', 401),
            )
        }

        //verification token 
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        //check if user still exists
        const freshUser = await User.findById(decoded.id);
        if(!freshUser) {
            return next(
                new AppError('THe user belonging to this token is no longer exist', 401),
            )
        }
        //Grant access to protected route
        req.user = freshUser;
        next()
    }
    catch(err) {
        res.status(500).json({ error: err.message });
    }
}
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong', 401));
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, password, passwordConfirm } = req.body;

        // 1. Check if both passwords are provided
        if (!password || !passwordConfirm) {
            return next(new AppError('Please provide both password and password confirmation.', 400));
        }

        // 2. Check if the two passwords match
        if (password !== passwordConfirm) {
            return next(new AppError('Passwords do not match.', 400));
        }

        // 3. Find user based on their email (email should be passed from previous step)
        const user = await User.findOne({ email });

        if (!user) {
            return next(new AppError('User not found with that email.', 404));
        }
        console.log("hello")
        // 4. Hash the new password and update it in the database
        user.password = password;
        user.passwordConfirm = passwordConfirm;  // No need to store passwordConfirm
        await user.save();

        // 5. Send a JWT back to the user
        createSendToken(user, 200, res);
    } catch (err) {
        return next(new AppError('Error resetting password. Please try again.', 500));
    }
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        )
      }
  
      next()
    }
  }  

exports.logout = (req, res) => {
     // Clear the 'jwt' cookie (which stores the JWT)
     res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10 * 1000),  // Cookie expires in 10 seconds
        httpOnly: true,  // Make sure it's httpOnly for security
        secure: process.env.NODE_ENV === 'production',  // Only secure in production
        sameSite: 'strict'  // Protect against CSRF
    });

    // Clear the 'token' cookie (which stores user information)
    res.cookie('token', '', {
        expires: new Date(Date.now() + 10 * 1000),  // Cookie expires in 10 seconds
        httpOnly: true,  // httpOnly for security
        secure: process.env.NODE_ENV === 'production',  // Only secure in production
        sameSite: 'strict'  // Protect against CSRF
    });
    res.status(200).json({ status: 'success' })
} 