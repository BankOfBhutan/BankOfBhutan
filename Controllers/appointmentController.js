const mongoose = require('mongoose');
const ATS = require('../models/atsModel');
const Deposit = require('../models/depositModel');
const RTGS = require('../models/newRTGS');
const Withdrawal = require('../models/withdrawalModel');
const DollarSelling = require('../models/dollerSellingModel');
const Swift = require('../models/newSWIFT');
const appointment = require('../models/appointmentModel')




async function transferToAppointment(sourceData, serviceName) {
    const AppointmentData = {
        name: sourceData.Name,
        email: sourceData.email,
        token: sourceData.token || null,
        accountNumber: sourceData.accountNumber,
        date: sourceData.atsDate || sourceData.depositDate || sourceData.withdrawalDate || sourceData.rtgsDate || sourceData.swiftDate || sourceData.dsDate,
        startServingTime: sourceData.atsTime || sourceData.depositTime || sourceData.WithdrawalTime || sourceData.rtgsTime || sourceData.swiftTime || sourceData.dsTime,
        serviceName: serviceName,
    };

    const existingQueue = await appointment.findOne({
        accountNumber: AppointmentData.accountNumber,
        serviceName: AppointmentData.serviceName,
        date: AppointmentData.date
    });

    // If no existing record is found, insert the new document
    if (!existingQueue) {
        const newAppointment = new appointment(AppointmentData);
        await newAppointment.save();
    } else {
        console.log(`Duplicate entry found for accountNumber: ${AppointmentData.accountNumber}, serviceName: ${AppointmentData.serviceName}, date: ${AppointmentData.date}`);
    }
}

// Controller function for automated transfer
async function automatedTransferToAppointment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight

    try {
        // Process ATS entries
        const atsEntries = await ATS.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const atsEntry of atsEntries) {
            await transferToAppointment(atsEntry, 'ATS/DSA');
            atsEntry.appointment = true;
            await atsEntry.save({ session });
                
        }

        // Process Deposit entries
        const depositEntries = await Deposit.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const depositEntry of depositEntries) {
            
           
            await transferToAppointment(depositEntry, 'Cash (Deposit/Withdraw)');
            depositEntry.appointment = true;
            await depositEntry.save({ session });
          
        }

        // Process RTGS entries
        const rtgsEntries = await RTGS.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const rtgsEntry of rtgsEntries) {
            await transferToAppointment(rtgsEntry, 'RTGS');
            rtgsEntry.appointment = true;
            await rtgsEntry.save({ session });
          
        }

        // Process Withdrawal entries
        const withdrawalEntries = await Withdrawal.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const withdrawalEntry of withdrawalEntries) {
            await transferToAppointment(withdrawalEntry, 'Cash (Deposit/Withdraw)');
            withdrawalEntry.appointment = true;
            await withdrawalEntry.save({ session });
        }

        // Process Dollar Selling entries
        const dollarSellingEntries = await DollarSelling.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const dollarSellingEntry of dollarSellingEntries) {
            await transferToAppointment(dollarSellingEntry, 'Dollar Selling/FC Transfer/Travel Agent/CBC');
            dollarSellingEntry.appointment = true;
            await dollarSellingEntry.save({ session });
        }

        // Process Swift entries
        const swiftEntries = await Swift.find({ token: { $exists: true }, appointment: { $ne: true } }).session(session);
        for (const swiftEntry of swiftEntries) {
            await transferToAppointment(swiftEntry, 'SWIFT');
            swiftEntry.appointment = true;
            await swiftEntry.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        console.log('Automated transfer complete');
        
        if (res) {
            res.status(200).json({ message: 'Automated transfer complete' });
        }
    } catch (error) {
        await session.abortTransaction();
        console.error('Error during automated transfer:', error.message);
        
        if (res) {
            res.status(500).json({ message: 'Error during automated transfer', error: error.message });
        }
    } finally {
        session.endSession();
    }
}


module.exports = {
   automatedTransferToAppointment
};
