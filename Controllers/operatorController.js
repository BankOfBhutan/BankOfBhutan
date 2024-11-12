const Queue = require("../models/queueModel")
const moment = require('moment-timezone');
const User = require("../models/userModels")
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.getTellerOperators = async (req, res) => {
    try {
        // Find all users with the role 'teller' and select only 'operatorId' and '_id'
        const tellers = await User.find({ role: 'teller' }).select('operatorId _id');

        res.status(200).json({
            status: 'success',
            data: {
                tellers
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getDailyTokenDataBySingleOperator = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';
        const { year, month, operatorId } = req.query;
        const startOfMonth = moment.tz([parseInt(year), parseInt(month) - 1, 1], bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfMonth = moment.tz([parseInt(year), parseInt(month) - 1, 1], bhutanTimeZone).endOf('month').tz('UTC', true).toDate();
        
        const operatorObjectId = new mongoose.Types.ObjectId(operatorId);

        // Aggregate data for the specified operator, grouped by day
        const dailyData = await Queue.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth },
                    status: 'served',
                    servedBy: operatorObjectId 
                }
            },
            {
                $group: {
                    _id: { day: { $dayOfMonth: "$date" } },
                    totalTokens: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    day: "$_id.day",
                    totalTokens: 1
                }
            },
            {
                $sort: { day: 1 }
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: { dailyData, selectedMonth: parseInt(month) } // Send the selected month
        });
    } catch (err) {
        console.log("hii")
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getMonthlyTokenDataBySingleOperator = async (req, res) => {
    try {
        console.log("hiiiiiiiiiii")
        const bhutanTimeZone = 'Asia/Thimphu';
        const { year, operatorId } = req.query;

        const startOfYear = moment.tz([parseInt(year), 0, 1], bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfYear = moment.tz([parseInt(year), 11, 31], bhutanTimeZone).endOf('day').tz('UTC', true).toDate();
        const operatorObjectId = new mongoose.Types.ObjectId(operatorId);
        // Aggregate data for the specified operator, grouped by month
        const monthlyData = await Queue.aggregate([
            {
                $match: {
                    date: { $gte: startOfYear, $lte: endOfYear },
                    status: 'served',
                    servedBy: operatorObjectId  // Casting operatorId to ObjectId type
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$date" } },
                    totalTokens: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    totalTokens: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: { monthlyData }
        });
    } catch (err) {
        console.log("hi")
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.getAllTellers = async (req, res, next) => {
    try {
        // Find users with the role 'teller' and select specific fields
        const tellers = await User.find({ role: 'teller' }, 'operatorId _id');

        // Return the result in the response
        res.status(200).json({
            status: 'success',
            data: tellers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};