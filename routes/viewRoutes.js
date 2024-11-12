const express = require('express')
const router = express.Router()
const viewController = require('../Controllers/viewController')
const authController = require('../Controllers/authController')


router.get('/', viewController.getToken)

router.get('/onlinetoken', viewController.getBookOnlineToken)

router.get('/tokenOption', viewController.getTokenOptions)

router.get('/cashToken', viewController.getCashToken)

router.get('/DepositToken', viewController.getDepositToken)

router.get('/WithdrawalToken', viewController.getWithdrawalToken)

router.get('/rtgs', viewController.getRTGS)

router.get('/swift_edu',viewController.getswift_edu)

router.get('/swift',viewController.getswift)

router.get('/check_token',viewController.getcheck_token)

router.get('/ats',viewController.getats)

router.get('/dollerselling',viewController.getdollarSelling)

router.get('/branchwalkin',viewController.walkin)

router.get('/email',viewController.Email)

router.get('/otp',viewController.OTP)

router.get('/kiosk', viewController.getKioskMachineForm);

router.get('/onlineMoniter',viewController.onlineMonitor)

router.get('/monitor',viewController.Monitor)


router.get('/dashboard',authController.protect, authController.restrictTo('admin'), viewController.dashboard)

router.get('/service',authController.protect, viewController.service)

router.get('/prioritize',authController.protect, viewController.prioritize)

router.get('/appointment',authController.protect, viewController.appointment)

router.get('/operator',authController.protect, viewController.operator)

router.get('/login',viewController.login)

router.get('/forgotpass',viewController.pass)

router.get('/forgotpass1',viewController.pass1)

router.get('/forgotpass2',viewController.pass2)

router.get('/Teller', viewController.getTellerDashboard);

// Serve the kiosk machine form
router.get('/operation', viewController.getTellerOperation);

module.exports = router