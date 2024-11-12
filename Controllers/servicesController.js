// const CashWithdrawal = require("../models")
// const RTGSTransaction = require("../models/RTGSTransaction")
// const SWIFTTransaction = require("../models/SWIFTTransaction")
// const CashDeposit = require("../models/userDeposit")
const Queue = require("../models/queueModel")
const moment = require('moment-timezone');
const Feedback = require('../models/feedbackModel');
// const Appointment = require('../models/appointmentModel');

exports.getServiceStatsInRange = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Define start and end dates based on query or default to today
        const startOfDay = req.query.startDate 
            ? moment.tz(req.query.startDate, bhutanTimeZone).startOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfDay = req.query.endDate 
            ? moment.tz(req.query.endDate, bhutanTimeZone).endOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        const serviceStats = await Queue.aggregate([
            {
                // Filter by date range and served status
                $match: {
                    date: { $gte: startOfDay, $lte: endOfDay },
                    status: "served"
                }
            },
            {
                // Group by serviceName and day
                $group: {
                    _id: {
                        serviceName: "$serviceName",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } // Group by day
                    },
                    totalTokens: { $sum: 1 },
                    totalWaitingTime: { $sum: "$actualWaitingTime" }, // Use actual waiting time from virtuals
                    totalServingTime: { $sum: "$transactionTime" }    // Use transaction time from virtuals
                }
            },
            {
                // Group by serviceName to get average per day
                $group: {
                    _id: "$_id.serviceName",
                    averageWaitingTime: { $avg: "$totalWaitingTime" },
                    averageServingTime: { $avg: "$totalServingTime" },
                    totalTokensIssued: { $sum: "$totalTokens" },
                    totalDays: { $sum: 1 } // Count days for each service
                }
            },
            {
                // Calculate final averages and project the output fields
                $project: {
                    _id: 0,
                    serviceName: "$_id",
                    averageWaitingTime: 1,
                    averageServingTime: 1,
                    totalTokensIssued: 1,
                    averageCustomersPerDay: { $divide: ["$totalTokensIssued", "$totalDays"] }
                }
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: { serviceStats }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getTokenStatsGroupedByService = async (req, res) => {
    try {
        const { viewType, year, month } = req.query;
        const bhutanTimeZone = 'Asia/Thimphu';

        if (!viewType || !year) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide both viewType (daily or monthly) and year.'
            });
        }

        // Set date range based on daily or monthly view
        let startOfPeriod, endOfPeriod;
        if (viewType === 'daily' && month) {
            // Daily view for a specific month and year
            startOfPeriod = moment.tz(`${year}-${month}-01`, 'YYYY-MM-DD', bhutanTimeZone).startOf('month').toDate();
            endOfPeriod = moment(startOfPeriod).endOf('month').toDate();
        } else if (viewType === 'monthly') {
            // Monthly view for an entire year
            startOfPeriod = moment.tz(`${year}-01-01`, 'YYYY-MM-DD', bhutanTimeZone).startOf('year').toDate();
            endOfPeriod = moment(startOfPeriod).endOf('year').toDate();
        } else {
            return res.status(400).json({
                status: 'fail',
                message: 'For daily view, please provide both year and month.'
            });
        }

        // Aggregation pipeline
        const tokenStats = await Queue.aggregate([
            {
                // Filter by the selected date range and status "served"
                $match: {
                    date: { $gte: startOfPeriod, $lte: endOfPeriod },
                    status: "served"
                }
            },
            {
                // Format and group by either day or month based on viewType
                $group: {
                    _id: {
                        serviceName: "$serviceName",
                        period: viewType === 'daily'
                            ? { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: bhutanTimeZone } }
                            : { $dateToString: { format: "%Y-%m", date: "$date", timezone: bhutanTimeZone } }
                    },
                    totalTokens: { $sum: 1 }
                }
            },
            {
                // Reshape the output to show `serviceName`, `period`, and `totalTokens`
                $group: {
                    _id: "$_id.period",
                    services: {
                        $push: {
                            serviceName: "$_id.serviceName",
                            totalTokens: "$totalTokens"
                        }
                    }
                }
            },
            {
                // Final projection to format data in a clearer way
                $project: {
                    _id: 0,
                    period: "$_id",
                    services: 1
                }
            },
            {
                // Sort by period
                $sort: { period: 1 }
            }
        ]);
        console.log(tokenStats)
        res.status(200).json({
            status: 'success',
            data: {
                viewType,
                tokenStats
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};