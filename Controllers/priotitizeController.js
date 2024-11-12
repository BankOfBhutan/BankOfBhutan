const mongoose = require('mongoose');
const Queue = require("../models/queueModel")
const moment = require('moment-timezone');

exports.getTodayPendingTokens = async (req, res) => {
    try {
        // Set timezone to Bhutan's time
        const bhutanTimeZone = 'Asia/Thimphu';
        
        // Get today's start and end times in Bhutan's timezone, converted to UTC for querying
        const startOfToday = moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfToday = moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        // Query to find pending tokens created today
        const pendingTokens = await Queue.find({
            date: { $gte: startOfToday, $lte: endOfToday },
            status: 'pending'
        }).select('_id token'); // Only return the _id field and token field
        // Return the pending tokens in the response
        res.status(200).json({
            status: 'success',
            data: { pendingTokens }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.assignTokenToOperator = async (req, res) => {
    const { tokenId, operatorId } = req.body;
    console.log("hii")
    try {
        const operatorObjectId = new mongoose.Types.ObjectId(operatorId);
        // Assuming you have a model method or a function to handle the assignment
        const result = await Queue.updateOne({ _id: tokenId }, { $set: { servedBy: operatorObjectId, priority: true} });

        if (result.modifiedCount > 0) {
            res.status(200).json({ status: 'success', message: 'Token assigned successfully' });
        } else {
            res.status(400).json({ status: 'error', message: 'Token assignment failed' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};