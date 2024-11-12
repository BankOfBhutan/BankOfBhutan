const express = require('express');
const router = express.Router();
const transferController = require('../Controllers/transferDepositData');
const transferwithdrwal = require('../Controllers/transferWithdrawalData');

// Route to trigger the automated transfer
router.post('/transfer', transferController.automatedTransfer,transferwithdrwal.automatedTransfer);

module.exports = router;
