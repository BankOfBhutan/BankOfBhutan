const express = require('express');
const kioskController = require('../Controllers/koiskeController');
const router = express.Router();

// POST route for generating tokens
router.post('/generate-token', kioskController.generateTokenForService);

// POST route for marking a token as served
// router.post('/mark-token-served', kioskController.markTokenServed);  

module.exports = router;
