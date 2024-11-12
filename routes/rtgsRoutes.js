const express = require('express');
const rtgsController = require('../Controllers/newrtgsController'); // Assuming rtgsController is in the Controllers folder

const router = express.Router();

// POST route to handle RTGS submission
router.post('/rtgs', rtgsController.submitRTGS);

router.post('/send-otp',rtgsController.sendOTP);

router.post('/check_Conflict',rtgsController.checkConflict);

module.exports = router;
