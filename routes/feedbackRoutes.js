const express = require('express')

const feedbackController = require('../Controllers/feedbackController')
const router = express.Router()

router.post('/feedback',feedbackController.submitfeedback)


module.exports = router;