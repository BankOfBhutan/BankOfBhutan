const express = require('express');
const rtgsController = require('../Controllers/walkinRTGsController'); // Correct file name
const router = express.Router();

// Define routes for RTGS operations
router.post('/submit', rtgsController.createTransaction); // Route to submit RTGS form
router.get('/transactions', rtgsController.getAllTransactions); // Route to get all RTGS transactions
router.get('/transactions/:tokenNumber', rtgsController.getTransactionByTokenNumber); // Route to get a specific RTGS transaction by token number
router.patch('/transactions/:id', rtgsController.updateTransactionById); // Route to update an RTGS transaction by ID
router.delete('/transactions/:id', rtgsController.deleteTransactionById); // Route to delete an RTGS transaction by ID

module.exports = router;
