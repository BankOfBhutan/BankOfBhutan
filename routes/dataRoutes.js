const express = require('express')
const queueController = require('../Controllers/dashboardController')
const appointmentController = require('../Controllers/appointment')
const authController = require('../Controllers/authController')
const serviceController = require('../Controllers/servicesController')
const operatorController = require('../Controllers/operatorController')
const priorityController = require('../Controllers/priotitizeController')
const router = express.Router()

router
   .get('/getMaxCounterNumber',authController.protect, authController.restrictTo('admin'), queueController.getMaxCounter);

router
   .get('/getServiceCountToday',authController.protect, authController.restrictTo('admin'), queueController.getServiceCountsToday);

router
   .get('/getTokenTypeCountsToday',authController.protect, authController.restrictTo('admin'), queueController.getTokenTypeCountsToday);

router
   .get('/getDetailedServiceCountsToday',authController.protect, authController.restrictTo('admin'), queueController.getDetailedServiceCountsToday);

router
   .get('/getServiceStatsToday',authController.protect, authController.restrictTo('admin'), queueController.getServiceStatsToday);

router
   .get('/getAppointmentInfo',authController.protect, authController.restrictTo('admin'), appointmentController.getAppointmentInfo);

router
   .get('/getFeedbackInfo',authController.protect, authController.restrictTo('admin'), appointmentController.getFeedbackInfo); 
   
router
   .get('/getTokenTypeCounts',authController.protect, authController.restrictTo('admin'), appointmentController.getTokenTypeCounts);

router
   .get('/getTokensForAppointmentsByService',authController.protect, authController.restrictTo('admin'), appointmentController.getTokensForAppointmentsByService);

router
   .get('/getServiceStatsInRange',authController.protect, authController.restrictTo('admin'), serviceController.getServiceStatsInRange);

router
   .get('/getTokenStatsGroupedByService',authController.protect, authController.restrictTo('admin'), serviceController.getTokenStatsGroupedByService);

router
   .get('/getTellerOperators',authController.protect, authController.restrictTo('admin'), operatorController.getTellerOperators);

router
   .get('/getDailyTokenDataBySingleOperator',authController.protect, authController.restrictTo('admin'), operatorController.getDailyTokenDataBySingleOperator);

router
   .get('/getMonthlyTokenDataBySingleOperator',authController.protect, authController.restrictTo('admin'), operatorController.getMonthlyTokenDataBySingleOperator);

router
   .get('/getTellerForGraph',authController.protect, authController.restrictTo('admin'), operatorController.getAllTellers);

router
   .get('/getTodayPendingTokens',authController.protect, authController.restrictTo('admin'), priorityController.getTodayPendingTokens);

router
   .post('/assignTokenToOperator',authController.protect, authController.restrictTo('admin'), priorityController.assignTokenToOperator);




module.exports = router