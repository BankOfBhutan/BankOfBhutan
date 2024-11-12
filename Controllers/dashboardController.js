const Queue = require("../models/queueModel")
const moment = require('moment-timezone');
const User =  require('../models/userModels')

exports.getMaxCounter = async (req, res) => {
    try {
        // Find the user with the highest counter value
        const maxCounterUser = await User.findOne().sort({ counter: -1 }).select('counter').lean();
        
        if (maxCounterUser) {
            return res.status(200).json({
                status: 'success',
                data: {
                    maxCounter: maxCounterUser.counter
                }
            });
        } else {
            return res.status(404).json({
                status: 'fail',
                message: 'No users found'
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

exports.getServiceCountsToday = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu'; // Bhutan's time zone (UTC+6)

        // Define the start and end of today in Bhutan time
        const startOfToday = moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfToday = moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();


        const serviceCounts = await Queue.aggregate([
            {
                $match: {
                    date: { $gte: startOfToday, $lte: endOfToday }
                }
            },
            {
                $group: {
                    _id: "$serviceName",
                    count: { $sum: 1 }
                } 
            },
            {
                $project: {
                    _id: 0,
                    serviceName: "$_id",
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                serviceCounts
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getTokenTypeCountsToday = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Define the start and end of today in Bhutan time
        const startOfToday = moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfToday = moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        const tokenTypeCounts = await Queue.aggregate([
            {
                $match: {
                    date: { $gte: startOfToday, $lte: endOfToday },
                    token: { $exists: true, $ne: null } // Ensure token exists and is not null
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: [{ $substr: ["$token", 0, 1] }, 'O'] },
                            'online',
                            'walk-in'
                        ]
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    tokenType: "$_id",
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                tokenTypeCounts
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getDetailedServiceCountsToday = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Define the start and end of today in Bhutan time
        const startOfToday = moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfToday = moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        const detailedServiceCounts = await Queue.aggregate([
            {
                $match: {
                    date: { $gte: startOfToday, $lte: endOfToday },
                    status: "served"
                }
            },
            {
                $group: {
                    _id: {
                        counter: "$counter",
                        serviceName: "$serviceName"
                    },
                    totalTokens: { $sum: 1 },
                    skippedTokens: { $sum: { $cond: [{ $gt: ["$skip", 0] }, 1, 0] } },
                    completedTokens: { $sum: { $cond: [{ $eq: ["$status", "served"] }, 1, 0] } },
                    forwardedTokens: { $sum: { $cond: [{ $gt: ["$requeue", 0] }, 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    counter: "$_id.counter",
                    serviceName: "$_id.serviceName",
                    totalTokens: 1,
                    skippedTokens: 1,
                    completedTokens: 1,
                    forwardedTokens: 1
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                detailedServiceCounts
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getServiceStatsToday = async (req, res) => {
    try {
        const { serviceName } = req.query;
        // Define query filter
        const filter = { status: 'served' };
        if (serviceName && serviceName !== 'All') {
            filter.serviceName = serviceName;
        }

        // Fetch queue entries that match the filter
        const queueEntries = await Queue.find(filter).lean();

        // Calculate statistics for each counter
        const counterStats = queueEntries.reduce((acc, entry) => {
            const counterKey = `${entry.counter}-${entry.serviceName}`;

            if (!acc[counterKey]) {
                acc[counterKey] = {
                    counter: entry.counter,
                    serviceName: entry.serviceName,
                    totalTokensCompleted: 0,
                    totalWaitingTime: 0,
                    totalServingTime: 0
                };
            }

            // Accumulate counts and times
            acc[counterKey].totalTokensCompleted += 1;
            acc[counterKey].totalWaitingTime += entry.actualWaitingTime || 0;
            acc[counterKey].totalServingTime += entry.transactionTime || 0;

            return acc;
        }, {});

        // Format and calculate averages for output
        const formattedStats = Object.values(counterStats).map(counter => ({
            counter: counter.counter,
            serviceName: counter.serviceName,
            totalTokensCompleted: counter.totalTokensCompleted,
            averageWaitingTime: counter.totalTokensCompleted
                ? Math.round(counter.totalWaitingTime / counter.totalTokensCompleted)
                : 0,
            averageServingTime: counter.totalTokensCompleted
                ? Math.round(counter.totalServingTime / counter.totalTokensCompleted)
                : 0
        }));

        // Filter out counters that do not match the selected service name, if specified
        const filteredStats = serviceName && serviceName !== 'All'
            ? formattedStats.filter(stat => stat.serviceName === serviceName)
            : formattedStats;

        res.status(200).json({
            status: 'success',
            data: {
                counterStats: filteredStats
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




