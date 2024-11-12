const express = require('express');
const SWIFTController = require('../Controllers/walkinSWIFTController'); // Correct file name for SWIFTController
const router = express.Router();

// Define routes for SWIFT operations
router.post('/submit', SWIFTController.createSWIFTTransaction); // Route to submit SWIFT transaction
router.get('/transactions', SWIFTController.getAllSWIFTTransactions); // Route to get all SWIFT transactions
router.get('/transactions/:tokenNumber', SWIFTController.getTransactionByTokenNumber); // Route to get a specific transaction by token number
router.patch('/transactions/:id', SWIFTController.updateTransactionById); // Route to update a SWIFT transaction by ID
router.delete('/transactions/:id', SWIFTController.deleteTransactionById); // Route to delete a SWIFT transaction by ID

module.exports = router;
