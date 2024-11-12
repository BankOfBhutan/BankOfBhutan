const express = require('express')
const router = express.Router()

const dollarSelling = require('../Controllers/dollarSelling')

router.post('/dollarSelling',dollarSelling.submitDS)

router.post('/send-otp',dollarSelling.sendOTP)

router.post('/check_Conflict',dollarSelling.checkConflict)

module.exports = router