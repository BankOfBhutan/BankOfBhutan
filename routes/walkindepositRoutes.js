const express = require('express');
const depositController = require('../Controllers/walkindepositController');
const router = express.Router();

// Route to submit a cash deposit
router.post('/submit', depositController.submitCashDeposit);

// Route to get all transactions
router.get('/transactions', depositController.getAllTransactions);

// Route to get a specific transaction by ID
router.get('/transactions/:tokenNumber', depositController.getTransactionByTokenNumber);

// Route to update a transaction by ID
router.patch('/transactions/:id', depositController.updateTransactionById);

// Route to delete a transaction by ID
router.delete('/transactions/:id', depositController.deleteTransactionById);

module.exports = router;
