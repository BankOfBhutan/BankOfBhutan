const { generateSequentialToken } = require('../services/ktokenService');
const Queue = require('../models/queueModel');
const { calculateEstimatedWaitingTime } = require('../Controllers/waitingController');

// Helper function to get Bhutan Time (UTC+6)
const getBhutanTime = () => {
  const utcDate = new Date();
  const bhutanOffset = 6 * 60 * 60 * 1000; 
  return new Date(utcDate.getTime() + bhutanOffset); 
};

// Helper function to get the next queue number
const getNextQueueNumber = async () => {
  const lastQueue = await Queue.findOne().sort({ queueNumber: -1 });
  return (lastQueue ? lastQueue.queueNumber : 0) + 1;
};

// Function to generate token for service
exports.generateTokenForService = async (req, res) => {
  try {
    const { service } = req.body;

    if (!service) {
      return res.status(400).json({ message: 'Service type is required.' });
    }

    // Generate the token and set the issue time and date
    const token = await generateSequentialToken(service);
    const bhutanTime = getBhutanTime();
    const date = bhutanTime.toISOString().split('T')[0]; // Store date in 'YYYY-MM-DD' format
    const issueTime = bhutanTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const waitingTimeResult = await calculateEstimatedWaitingTime(service);
    const waitingTime = waitingTimeResult.estimatedWaitingTime;
    // Get the next available queue number
    const queueNumber = await getNextQueueNumber();

    // Save the queue entry in the database
    const newQueueEntry = new Queue({
      token: token,
      queueNumber: queueNumber,
      date: date,
      issueTime: issueTime,
      serviceName: service,
      status: 'pending', // Set default status to 'pending'
      estimatedTime: waitingTime,
    });

    await newQueueEntry.save();

    return res.status(200).json({
      message: `Token generated successfully for service ${service}.`,
      token: token,
      queueNumber: queueNumber,
      date: date,
      issueTime: issueTime,
      estimatedTime: waitingTime,

    });

  } catch (error) {
    console.error('Error occurred while generating token:', error);
    return res.status(500).json({ message: 'Failed to generate token for service. Please try again later.' });
  }
};
