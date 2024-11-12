const jwt = require('jsonwebtoken');
const path = require('path'); // Add this line to import the path module
// const Teller = require(path.resolve(__dirname, '../models/userModel')); // Use the path module
const Teller = require('../models/userModels')
// Function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Middleware to check authentication
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // If no token found
    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please log in to get access.',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Teller.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists.',
            });
        }

        // Continue to next middleware or route
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'fail',
                message: 'Your session has expired. Please log in again.',
            });
        }
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token. Please log in again.',
        });
    }
};

// Signup Function
exports.signup = async (req, res) => {
    try {
        const newUser = await Teller.create({
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            operatorId: req.body.operatorId,
            counter: req.body.counter,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            service: req.body.service,
        });

        const token = createToken(newUser._id);

        // Ensure JWT_COOKIE_EXPIRES is a valid number, fallback to 90 days if undefined
        const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES) || 90;

        // Set the cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000), // Convert days to milliseconds
        });

        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

// Login Function
exports.login = async (req, res) => {
    const { operatorId, password } = req.body;

    if (!operatorId || !password) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide operator ID and password!',
        });
    }

    const user = await Teller.findOne({ operatorId }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
            status: 'fail',
            message: 'Incorrect operator ID or password',
        });
    }

    const token = createToken(user._id);

    // Ensure JWT_COOKIE_EXPIRES is a valid number, fallback to 90 days if undefined
    const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES) || 90;

    // Set the cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000), // Convert days to milliseconds
    });

    // Instead of returning user data, send a status response for client-side redirection
    res.status(200).json({
        status: 'success',
        message: 'Login successful', // Optional message for the frontend
    });
};

// Get Teller Details by operatorId
exports.getTellerDetails = async (req, res) => {
    try {
        const teller = await Teller.findById(req.user._id); // Find teller by their decoded token

        if (!teller) {
            return res.status(404).json({ message: 'Teller not found' });
        }

        res.status(200).json({
            name: teller.name,
            counter: teller.counter,
            service: teller.service, 
            email: teller.email,
            operatorId: teller.operatorId// Return the service name
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching teller details', error });
    }
};
// Change Password Function
exports.changePassword = async (req, res) => {
    try {
        const operatorId = req.headers['operator-id'];
        const currentPassword = req.headers['current-password'];
        const newPassword = req.headers['new-password'];

        // Ensure all headers are provided
        if (!operatorId || !currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide your operator ID, current password, and new password in the headers.',
            });
        }

        // Find user by operator ID and select password field
        const user = await Teller.findOne({ operatorId }).select('+password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found with the provided operator ID.',
            });
        }

        // Check if the current password is correct
        if (!(await user.correctPassword(currentPassword, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Operator ID and password do not match.',
            });
        }

        // Update the password
        user.password = newPassword;
        
        // Save without validating passwordConfirm
        await user.save({ validateBeforeSave: false });

        // Send a success response without setting a JWT
        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully!',
        });
    } catch (error) {
        console.error('Error details:', error);  // Log the actual error
        res.status(500).json({
            status: 'fail',
            message: 'Error changing password. Please try again later.',
        });
    }
};