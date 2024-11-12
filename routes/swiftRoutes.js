const express = require('express')
const router = express.Router()
const swiftController = require('../Controllers/newSWIFTController')

router.post('/send-otp',swiftController.sendOTP)

router.post('/swift',swiftController.submitswift)

router.post('/check_Conflict',swiftController.checkConflict)


module.exports = router;