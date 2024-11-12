const mongoose = require('mongoose')
const walkinDeposit = require('../models/walkindepositModel')
const deposit = require('../models/depositModel')

// Helper function to transfer data from a source to Appointment
async function transferToDeposit(sourceData, serviceName) {
    const walkinDepositData = {
        name: sourceData.Name,
        TokenNumber: sourceData.token || null,
        amount : sourceData.amount,
        TPN : sourceData.TPN,
        cidNumber:sourceData.cidNumber,
        phoneNumber:sourceData.contact,
        depositorName : sourceData.depositorName,
        accountNumber: sourceData.accountNumber,
        date: sourceData.depositDate,
        
    };

    const newwalkinDeposit = new walkinDeposit(walkinDepositData);
    await newwalkinDeposit.save();
}

// Controller function for automated transfer
async function automatedTransfer(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight


    try {
        // Process ATS entries
        const depositEntries = await deposit.find({ token: { $exists: true }, transferredtodeposit: { $ne: true } }).session(session);
        for (const depositEntry of depositEntries) {
            const entryDate = new Date(depositEntry.depositDate).setHours(0, 0, 0, 0);
            if (entryDate === today){
                await transferToDeposit(depositEntry);
                depositEntry.transferredtodeposit = true;
                await depositEntry.save({ session });

            }
            
        }

        // Commit the transaction
        await session.commitTransaction();
        console.log('deposit Automated transfer complete');
        
        // Only respond if res exists (for API route)
        if (res) {
            res.status(200).json({ message: 'Automated transfer complete' });
        }
    } catch (error) {
        // Abort the transaction in case of error
        await session.abortTransaction();
        console.error('Error during automated transfer of Deposit:', error.message);
        
        if (res) {
            res.status(500).json({ message: 'Error during automated transfer Deposit', error: error.message });
        }
    } finally {
        session.endSession();
    }
}

module.exports = {
    automatedTransfer
};
