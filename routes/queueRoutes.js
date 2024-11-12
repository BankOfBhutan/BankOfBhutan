const express = require('express');
const router = express.Router();
const queueController = require('../Controllers/queueController');

// Route to get today's pending tokens
router.get('/today', queueController.todayToken);

// Route to find and update the serving token
router.get('/next-token', queueController.serveOrFindNextToken );

// Route to serve the next pending token
// router.get('/serve-pending', queueController.servePendingToken);

// Route to get total tokens for today
router.get('/total-token', queueController.totalToken);

// Route to get the number of pending tokens for today
router.get('/waiting-token', queueController.waitingTokens);

// Route to get the number of served tokens for today
router.get('/served-token', queueController.servedToken);

//skip routes
router.get('/skip-token', queueController.skipCurrentToken);

//forward to other counter
router.get('/other-counter', queueController.forwardToOtherCounter);


//requeue token
router.get('/requeue', queueController.requeueCurrentToken);

//call specific token
router.patch('/specific-token', queueController.callSpecificToken);


//forward to other service

router.patch('/other-service', queueController.forwardToOtherService);


//fetch all token with status as serving
router.get('/serving', queueController.getServingTokens);

//fetch token in same service
router.get('/token-in', queueController.getServingTokensByService);

// completeToken
router.patch('/complete-token', queueController.completeToken);


//fetch the total count that the operator served
router.get('/token-count', queueController.getServedCountByCounter);

// fetch current token
router.get('/current-token', queueController.getServingTokenByServiceAndCounter);

//update current's repeat value
router.patch('/repeat-token', queueController.repeatToken)

module.exports = router;
