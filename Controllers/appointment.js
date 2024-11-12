const Queue = require("../models/queueModel")
const moment = require('moment-timezone');
const Feedback = require('../models/feedbackModel');
const Appointment = require("../models/queueModel");

exports.getTokenTypeCounts = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Get start and end date from request query or default to today
        const startOfDay = req.query.startDate 
            ? moment.tz(req.query.startDate, bhutanTimeZone).startOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfDay = req.query.endDate 
            ? moment.tz(req.query.endDate, bhutanTimeZone).endOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

            const tokenTypeCounts = await Queue.aggregate([
                {
                    $match: {
                        date: { $gte: startOfDay, $lte: endOfDay },
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
            data: tokenTypeCounts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAppointmentInfo = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Get start and end date from request query or default to today
        const startOfDay = req.query.startDate 
            ? moment.tz(req.query.startDate, bhutanTimeZone).startOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfDay = req.query.endDate 
            ? moment.tz(req.query.endDate, bhutanTimeZone).endOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        // Fetch appointment data in date range
        const appointments = await Appointment.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            token: { $regex: /^O/, $options: 'i' }
        }).select('token name accountNumber email date issueTime');
        res.status(200).json({
            status: 'success',
            data: {
                appointments
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeedbackInfo = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        // Get start and end date from request query or default to today
        const startOfDay = req.query.startDate 
            ? moment.tz(req.query.startDate, bhutanTimeZone).startOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfDay = req.query.endDate 
            ? moment.tz(req.query.endDate, bhutanTimeZone).endOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        // Fetch feedback data in date range
        const feedbackToday = await Feedback.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ createdAt: 1 });

        res.status(200).json({
            status: 'success',
            data: {
                feedbackToday
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Controller to get tokens for appointments
exports.getTokensForAppointmentsByService = async (req, res) => {
    try {
        const bhutanTimeZone = 'Asia/Thimphu';

        const startOfDay = req.query.startDate 
            ? moment.tz(req.query.startDate, bhutanTimeZone).startOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).startOf('day').tz('UTC', true).toDate();
        const endOfDay = req.query.endDate 
            ? moment.tz(req.query.endDate, bhutanTimeZone).endOf('day').tz('UTC', true).toDate()
            : moment.tz(bhutanTimeZone).endOf('day').tz('UTC', true).toDate();

        // Build the query
        const query = {
            token: { $regex: '^O' }, // Filter tokens starting with 'O'
        };

        // Add date range to query if both dates are provided
        if (startOfDay && endOfDay) {
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        // Fetch all tokens matching the query
        const tokens = await Queue.find(query);
        // Count tokens by service
        const serviceCounts = tokens.reduce((acc, token) => {
            if (acc[token.serviceName]) {
                acc[token.serviceName]++;
            } else {
                acc[token.serviceName] = 1;
            }
            return acc;
        }, {});

        // Transform the service counts into an array of objects
        const result = Object.keys(serviceCounts).map(service => ({
            service: service,
            count: serviceCounts[service],
        }));

        // Return the data in the response
        res.status(200).json({
            status: 'success',
            data: {
                result
            },
        });
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching tokens.',
        });
    }
};