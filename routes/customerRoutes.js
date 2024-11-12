const express = require('express');
const userController = require('../Controllers/customerController'); 
const tokenController = require('../Controllers/tokenController'); 

const router = express.Router();

// User Routes
router.post('/request-otp', userController.requestOTP); 
router.post('/verify-otp', userController.verifyOTP); 

// Token Routes (if you have token-related operations in the future)
router.post('/generate-token', tokenController.generateSequentialToken); 

module.exports = router;
