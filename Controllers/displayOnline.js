const Queue = require('../models/queueModel');

exports.getAllQueue = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison

    try {
        // Find only documents where the date is exactly today
        const queue = await Queue.find({
            date: today,
            status: { $in: ['pending', 'serving'] }
        });

        if (!queue.length) {
            return res.status(404).json({
                status: 'fail',
                message: 'No data found for today',
            });
        }

        res.status(200).json({
            data: queue,
            status: 'success',
            result: queue.length,
        });
    } catch (error) {
        console.error('Error fetching queue data:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Server error',
        });
    }
};
