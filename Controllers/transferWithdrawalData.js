const mongoose = require('mongoose')
const walkinDeposit = require('../models/walkinwithdrawalModel')
const deposit = require('../models/withdrawalModel')

// Helper function to transfer data from a source to Appointment
async function transferToWithdrwal(sourceData, serviceName) {
    const walkinDepositData = {
        name: sourceData.Name,
        TokenNumber: sourceData.token || null,
        amount : sourceData.amount,
        phoneNumber:sourceData.contact,
        accountNumber: sourceData.accountNumber,
        date: sourceData.withdrawalDate,
        
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
        const withdrawalEntries = await deposit.find({ token: { $exists: true }, transferredTowithdrawal: { $ne: true } }).session(session);
        for (const withdrawalEntry of withdrawalEntries) {
            const entryDate = new Date(withdrawalEntry.withdrawalDate).setHours(0, 0, 0, 0);

            if (entryDate === today){
                await transferToWithdrwal(withdrawalEntry);
                withdrawalEntry.transferredTowithdrawal = true;
                await withdrawalEntry.save({ session });

            }
            
        }

        // Commit the transaction
        await session.commitTransaction();
        console.log('withdrawal Automated transfer complete');
        
        // Only respond if res exists (for API route)
        if (res) {
            res.status(200).json({ message: 'Automated transfer complete of withdrawal' });
        }
    } catch (error) {
        // Abort the transaction in case of error
        await session.abortTransaction();
        console.error('Error during automated transfer withdrawal:', error.message);
        
        if (res) {
            res.status(500).json({ message: 'Error during automated transfer withdrawal', error: error.message });
        }
    } finally {
        session.endSession();
    }
}

module.exports = {
    automatedTransfer
};
