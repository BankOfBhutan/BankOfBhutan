// authRoutes.js
const express = require('express');
const tellerAuthController = require('../Controllers/tellerAuthController');

const router = express.Router();

// Public routes (Signup and Login)


// Protected routes (only accessible if logged in)
router.use(tellerAuthController.protect);

// Route to get the logged-in teller's details
router.get('/teller-details', tellerAuthController.getTellerDetails);

router.patch('/reset', tellerAuthController.changePassword)
module.exports = router;
