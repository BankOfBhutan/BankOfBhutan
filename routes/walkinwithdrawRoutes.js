const express = require('express');
const withdrawController = require('../Controllers/walkinwithdrawController'); // Correct file name
const router = express.Router();

// Define routes for withdrawal operations
router.post('/submit', withdrawController.submitCashWithdrawal); // Route to submit cash withdrawal
router.get('/transactions', withdrawController.getAllCashWithdrawals); // Route to get all cash withdrawal transactions
router.get('/transactions/:tokenNumber', withdrawController.getTransactionByTokenNumber); // Route to get a specific transaction by token number
router.patch('/transactions/:id', withdrawController.updateTransactionById); // Route to update a cash withdrawal by ID
router.delete('/transactions/:id', withdrawController.deleteTransactionById); // Route to delete a cash withdrawal by ID

module.exports = router;
