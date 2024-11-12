const express = require('express');
const searchController = require('../Controllers/searchController');

const router = express.Router();

// POST request to check withdrawals and deposits by account number
router.post('/search', searchController.getTransactionsByAccountNumber);

router.post('/searchDetail',searchController.getDetailTransactionsByAccountNumber)

router.post('/send-otp',searchController.sendOTP)

router.delete('/search/:id',searchController.deleteTransactionById)



module.exports = router;
