 const express = require('express')
 const userController = require('../Controllers/userController')
 const authController = require('../Controllers/authController')

 const router = express.Router()

 router.post('/signup', authController.signup)
 router.post("/login", authController.login)
 router.post("/send-otp", authController.forgotPassword)
 router.post("/verify-otp", authController.verifyOtp)
 router.post('/reset-password', authController.resetPassword);
 router.get("/logout", authController.logout)
 router.get('/teller-details',authController.protect, userController.getTellerDetails)

router.get('/teller-count', userController.countActiveTellers)
 router.patch(
     "/updateMyPassword",
     authController.protect,
     authController.updatePassword,
 )
 router.patch(
     "/updateMe",
     authController.protect,
     userController.updateMe
 )
 router
     .route('/')
     .get(userController.getAllUsers)
     .post(userController.createUser)

 router
     .route('/getauser')
     .get(authController.protect,userController.getUser)

router
    .get('/getalltellers',authController.protect, authController.restrictTo('admin'), userController.getAllTellers);
router
    .route('/:id')
    .get(authController.protect, authController.restrictTo('admin'),userController.getEditTellerData)
    .patch(authController.protect, authController.restrictTo('admin'),userController.updateUser)
    .delete(authController.protect, authController.restrictTo('admin'),userController.deleteUser)

 module.exports = router