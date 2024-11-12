const express = require('express');
const router = express.Router();
const transferController = require('../Controllers/appointmentController');

// Route to trigger the automated transfer
router.post('/transfer', transferController.automatedTransfer,transferController.automatedTransferToAppointment);


module.exports = router;
