const { error } = require('console');
const Queue = require('../models/queueModel');
// Helper to get serviceName and counterNo from either cookies or query params
const { calculateEstimatedWaitingTime} = require('../Controllers/waitingController');
const Teller = require('../models/userModels');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables
const { io } = require('../app'); // Import the Socket.IO instance


// Helper to get serviceName and counterNo from either cookies or query params
const getServiceDetails = (req) => {
  return {
    serviceName: req.cookies.serviceName || req.query.serviceName,
    counterNo: req.cookies.counterNo || req.query.counterNo,
  };
};

// Find all tokens by current date, service from cookie or query param, and pending status
exports.todayToken = async (req, res) => {
  try {
    const serviceName = req.query.serviceName;

    if (!serviceName) {
      return res.status(400).json({ error: 'Service name not provided' });
    }

    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    const pendingTokens = await Queue.find({
      serviceName,
      status: 'pending',
      date: { $gte: today, $lte: tomorrow },
    }).sort({ queueNumber: 1 });

    if (!pendingTokens.length) {
      console.log(serviceName);
      return res.status(404).json({ error: 'No pending tokens found for the service today' });
    }

    res.status(200).json(pendingTokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Main function
exports.serveOrFindNextToken = async (req, res) => {
  try {
    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    const serviceName = req.query.serviceName;
    const counterNo = req.query.counterNo;

    if (!serviceName || !counterNo) {
      return res.status(400).json({ error: 'Service name and counter number are required.' });
    }

    // Check for a currently serving token and update if needed
    const servingToken = await checkAndCompleteServingToken(serviceName, counterNo, today, tomorrow);
    if (servingToken) {
      console.log('Serving token updated to served:', servingToken.queueNumber);
    }

    // Find and serve the next pending token
    const pendingToken = await serveNextPendingToken(serviceName, counterNo, today, tomorrow);
    if (pendingToken) {
      return res.status(200).json({ message: 'Next token is now serving', token: pendingToken });
    }

    // No pending tokens, return "N/A"
    return res.status(200).json({ message: 'No pending token available', token: { token: 'N/A' } });
  } catch (error) {
    console.log('An error occurred:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Subfunction to check if a serving token exists and complete it
async function checkAndCompleteServingToken(serviceName, counterNo, today, tomorrow) {
  const servingToken = await Queue.findOne({
    serviceName,
    status: 'serving',
    date: { $gte: today, $lte: tomorrow },
    counter: counterNo,
  });

  if (servingToken) {
    const endServingTime = moment().tz('Asia/Thimphu').format('hh:mm A');
    servingToken.status = 'served';
    servingToken.endServingTime = endServingTime;

    const startTime = moment(`${moment(servingToken.date).format('YYYY-MM-DD')} ${servingToken.startServingTime}`, 'YYYY-MM-DD hh:mm A');
    const endTime = moment(`${moment(servingToken.date).format('YYYY-MM-DD')} ${servingToken.endServingTime}`, 'YYYY-MM-DD hh:mm A');

    if (startTime.isValid() && endTime.isValid()) {
      servingToken.transactionTime = endTime.diff(startTime, 'minutes');
    } else {
      console.log("Invalid start or end time for transactionTime calculation");
      servingToken.transactionTime = null;
    }

    await servingToken.save();
  }

  return servingToken;
}

async function serveNextPendingToken(serviceName, counterNo, today, tomorrow) {
  const bhutanTime = moment().tz('Asia/Thimphu');

  // Step 1: Fetch the teller details based on service and counter
  const teller = await Teller.findOne({ service: serviceName, counter: counterNo });
  if (!teller) {
    console.log("Teller not found for the given service and counter");
    return null;
  }

  const operatorObjectId = teller._id;
  console.log(`Teller ID found: ${operatorObjectId}`);

  // Step 2: Check for a prioritized token assigned specifically to this teller
  console.log("Checking for prioritized tokens assigned to the current operator");
  let pendingToken = await Queue.findOne({
    serviceName,
    status: 'pending',
    date: { $gte: today, $lte: tomorrow },
    priority: true,            // Only fetch tokens that are prioritized
    servedBy: operatorObjectId  // Only if they are assigned to this teller
  });

  if (pendingToken) {
    await updateTokenToServing(pendingToken, operatorObjectId, counterNo, bhutanTime);
    return pendingToken;
  }

  // Step 3: Fetch online tokens (non-prioritized) starting with "O"
  console.log("Checking for online tokens starting with 'O'");
  pendingToken = await Queue.findOne({
    serviceName,
    status: 'pending',
    date: { $gte: today, $lte: tomorrow },
    priority: false,  // Exclude prioritized tokens
    token: /^O/       // Tokens starting with 'O'
  }).sort({ startServingTime: 1 });

  if (pendingToken) {
    const startServingTime = pendingToken.startServingTime
      ? moment(`${moment(pendingToken.date).format('YYYY-MM-DD')} ${pendingToken.startServingTime}`, 'YYYY-MM-DD hh:mm A')
      : null;

    // Check if startServingTime is within 30 minutes of the current time
    if (startServingTime && bhutanTime.diff(startServingTime, 'minutes') <= 10) {
      await updateTokenToServing(pendingToken, operatorObjectId, counterNo, bhutanTime);
      return pendingToken;
    }
  }

  // Step 4: Fetch walk-in tokens (non-prioritized) starting with "K" or "W"
  console.log("Checking for walk-in tokens starting with 'K' or 'W'");
  pendingToken = await Queue.findOne({
    serviceName,
    status: 'pending',
    date: { $gte: today, $lte: tomorrow },
    priority: false,  // Exclude prioritized tokens
    token: /^[KW]/    // Tokens starting with 'K' or 'W'
  }).sort({ queueNumber: 1 });

  if (pendingToken) {
    await updateTokenToServing(pendingToken, operatorObjectId, counterNo, bhutanTime);
  }

  return pendingToken;
}

async function updateTokenToServing(token, operatorObjectId, counterNo, currentTime) {
  token.status = 'serving';
  token.startServingTime = currentTime.format('hh:mm A');
  token.counter = counterNo;
  token.servedBy = operatorObjectId;

  const issueTime = moment(`${moment(token.date).format('YYYY-MM-DD')} ${token.issueTime}`, 'YYYY-MM-DD hh:mm A');
  const startTime = moment(`${moment(token.date).format('YYYY-MM-DD')} ${token.startServingTime}`, 'YYYY-MM-DD hh:mm A');

  if (issueTime.isValid() && startTime.isValid()) {
    token.actualWaitingTime = startTime.diff(issueTime, 'minutes');
  } else {
    console.log("Invalid issue or start time for actualWaitingTime calculation");
    token.actualWaitingTime = null;
  }

  await token.save();
  console.log(`Token ${token.token} is now serving at counter ${counterNo} by operator ${operatorObjectId}`);
}





// Unified completeToken function
exports.completeToken = async (req, res) => {
  try {
    // Extract data from headers
    const serviceName = req.headers['service-name'];
    const counterNo = req.headers['counter-no'];
    
    // Define today and tomorrow based on Bhutan timezone
    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    // Validate required headers
    if (!serviceName || !counterNo) {
      return res.status(400).json({ error: 'Missing required headers' });
    }

    // Find and complete the serving token
    const servingToken = await Queue.findOne({
      serviceName,
      status: 'serving',
      date: { $gte: today, $lte: tomorrow },
      counter: counterNo,
    });

    if (servingToken) {
      // Set end serving time to current time in Bhutan timezone
      const endServingTime = moment().tz('Asia/Thimphu').format('hh:mm A');
      servingToken.status = 'served';
      servingToken.endServingTime = endServingTime;

      // Calculate transaction time in minutes
      const startTime = moment(`${moment(servingToken.date).format('YYYY-MM-DD')} ${servingToken.startServingTime}`, 'YYYY-MM-DD hh:mm A');
      const endTime = moment(`${moment(servingToken.date).format('YYYY-MM-DD')} ${servingToken.endServingTime}`, 'YYYY-MM-DD hh:mm A');

      if (startTime.isValid() && endTime.isValid()) {
        servingToken.transactionTime = endTime.diff(startTime, 'minutes');
      } else {
        console.log("Invalid start or end time for transactionTime calculation");
        servingToken.transactionTime = null;
      }

      // Save the updated token information
      await servingToken.save();

      // Send success response with the updated token details
      res.status(200).json({ message: 'Token completed successfully', result: servingToken });
    } else {
      // No serving token found
      res.status(404).json({ message: 'No serving token found' });
    }
  } catch (error) {
    console.error('Error completing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.totalToken = async (req, res) => {
  try {
    const { serviceName } = getServiceDetails(req);
    if (!serviceName) {
      return res.status(400).json({ error: 'Service name not provided' });
    }

    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();
   
    const tokenCount = await Queue.countDocuments({
      serviceName,
      date: { $gte: today, $lte: tomorrow },
    });

    // Emit the updated token count to clients
    // req.io.emit('totalTokenCountUpdated', { serviceName, tokenCount });

    // console.log('Emitting token count update:', { serviceName, tokenCount });
    req.io.emit('totalTokenCountUpdated', { serviceName, tokenCount });
    res.status(200).json({ tokenCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.waitingTokens = async (req, res) => {
  try {
    const { serviceName } = getServiceDetails(req);
    if (!serviceName) {
      return res.status(400).json({ error: 'Service name not provided' });
    }

    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    const tokenCount = await Queue.countDocuments({
      serviceName,
      status: 'pending',
      date: { $gte: today, $lte: tomorrow },
    });

    // Emit event to clients with the updated pending token count
    // req.io.emit('pendingTokenCountUpdated', { serviceName, tokenCount });


    res.status(200).json({ tokenCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.servedToken = async (req, res) => {
  try {
    const { serviceName } = getServiceDetails(req);
    if (!serviceName) {
      return res.status(400).json({ error: 'Service name not provided' });
    }

    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    const tokenCount = await Queue.countDocuments({
      serviceName,
      status: 'served',
      date: { $gte: today, $lte: tomorrow },
    });

    // Emit event to clients with the updated served token count
    // req.io.emit('servedTokenCountUpdated', { serviceName, tokenCount });


    res.status(200).json({ tokenCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Configure Nodemailer transporter with environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.skipCurrentToken = async (req, res) => {
  try {
    const tokenNumber = req.headers['token-number'];

    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number not provided' });
    }

    // Step 1: Find the token using the token number from the header
    const currentToken = await Queue.findOne({
      token: tokenNumber,
    });

    if (!currentToken) {
      return res.status(404).json({ error: 'Token not found or not currently serving' });
    }

    // Step 2: Update the current token's status to 'served' and increment the skip count
    const endServingTime = moment().tz('Asia/Thimphu').format('hh:mm A');
    currentToken.status = 'served';
    currentToken.endServingTime = endServingTime;
    currentToken.skip = 1;
    await currentToken.save();

    if (currentToken.email) {
      // Formatted email content
      const subject = 'Token Skipped';
      const message = `
            <div style="padding: 20px;">
              <p>Dear Customer,</p>
              
              <p>We would like to inform you that your service token <strong>${tokenNumber}</strong> has been skipped.</p>
              
              <p>Please contact our Customer Care Team for any assistence.</p>

              <p>Best regards,<br>Bank of Bhutan Customer Service Team</p>

               <div style="text-align: center; padding: 10px; background-color: #eee; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
                <p style="margin: 0;">Please do not reply to this email. For further assistance, contact our support team.</p>
              </div>
            </div>
      `;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: currentToken.email,
        subject: subject,
        html: message // Use 'html' property for HTML content
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Failed to send email:', error);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });
    }

    return res.status(200).json({ message: 'Token skipped successfully', token: currentToken });

  } catch (error) {
    console.log('An error occurred while skipping the token:', error.message);
    return res.status(500).json({ error: error.message });
  }
};


// Controller function to forward a token to another counter (set status to 'pending')
exports.forwardToOtherCounter = async (req, res) => {
  try {
    const tokenNumber = req.headers['token-number'];

    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number not provided' });
    }

    const currentToken = await Queue.findOne({
      token: tokenNumber,
      status: 'serving'
    });

    if (!currentToken) {
      return res.status(404).json({ error: 'Token not found or not currently serving' });
    }

    currentToken.status = 'pending';
    currentToken.startServingTime = null;
    currentToken.counter = null;
    currentToken.operatorId = null;
    await currentToken.save();

    return res.status(200).json({ message: 'Token forwarded successfully', token: currentToken });
  } catch (error) {
    console.error('Error forwarding token:', error.message);
    return res.status(500).json({ error: error.message });
  }
};



// Helper function to get the current time in Bhutan timezone
const getBhutanTime = (offsetMinutes = 0) => {
  const bhutanTimeZone = 'Asia/Thimphu';
  const currentTime = new Date(Date.now() + offsetMinutes * 60 * 1000);

  return {
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: bhutanTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(currentTime),
    time: new Intl.DateTimeFormat('en-US', {
      timeZone: bhutanTimeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(currentTime),
  };
};

exports.requeueCurrentToken = async (req, res) => {
  try {
    const tokenNumber = req.headers['token-number'];
    const service = req.headers['service-name'];
    const waitingTimeResult = await calculateEstimatedWaitingTime(service);
    const waitingTime = waitingTimeResult.estimatedWaitingTime;

    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number not provided' });
    }

    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();

    const currentToken = await Queue.findOne({
      token: tokenNumber,
      date: { $gte: today, $lte: tomorrow }
    });

    if (!currentToken) {
      return res.status(404).json({ error: 'Token not found or not currently serving' });
    }

    const expectedServiceTime = getBhutanTime(waitingTime).time;
    console.log(expectedServiceTime)   
    const lastToken = await Queue.findOne({
      date: { $gte: today, $lte: tomorrow }
    }).sort({ queueNumber: -1 });

    const newQueueNumber = lastToken ? lastToken.queueNumber + 1 : 1;

    // Update token details
    currentToken.queueNumber = newQueueNumber;
    currentToken.requeue = 1;
    currentToken.status = 'pending';
    currentToken.counter = null;
    currentToken.operatorId = null;
    currentToken.startServingTime = null;
    currentToken.estimatedTime = waitingTime;
    await currentToken.save();

    if (currentToken.email) {
      // Formatted email content
      const subject = 'Token Requeued';
      const message = `
            <div style="padding: 20px;">
              <p>Dear Customer,</p>
              
              <p>Your service token <strong>${tokenNumber}</strong> for the service ${service}.</p>

              <span><strong>Estimated Waiting Time: </strong> ${waitingTime} minutes</span><br>
              <span><strong>Expected Service Time: </strong> ${expectedServiceTime}</span>

              <p>To ensure a smooth experience, we recommend that you arrive <strong>10 minutes</strong> prior to your estimated service time to allow for any additional requirements.</p>
              
              <p>We will notify you with any further updates as needed.</p>

              <p>Best regards,<br><br>Bank of Bhutan Customer Service Team</p>

              <div style="text-align: center; padding: 10px; background-color: #eee; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
                <p style="margin: 0;">Please do not reply to this email. For further assistance, contact our support team.</p>
              </div>
            </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: currentToken.email,
        subject: subject,
        html: message // Use 'html' property for HTML content
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Failed to send email:', error);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });
    }

    return res.status(200).json({ message: 'Token requeued successfully', token: currentToken });
  } catch (error) {
    console.log('An error occurred while requeuing the token:', error.message);
    return res.status(500).json({ error: error.message });
  }
};



exports.callSpecificToken = async (req, res) => {
  try {
    const tokenNumber = req.headers['token-number'];
    const counterNo = req.headers['counter-number'];
    const operatorId = req.headers['operatorid']; // Corrected to req.headers

    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number not provided' });
    }

    if (!counterNo) {
      return res.status(400).json({ error: 'Counter number not provided' });
    }
    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();
    const specificToken = await Queue.findOne({ 
      token: tokenNumber,
      date: { $gte: today, $lte: tomorrow }

    });

    if (!specificToken) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const startServingTime = moment().tz('Asia/Thimphu').format('hh:mm A');

    specificToken.status = 'serving';
    specificToken.counter = counterNo;
    specificToken.operatorId = operatorId;
    specificToken.startServingTime = startServingTime;

    await specificToken.save();

    return res.status(200).json({ message: 'Token is now being served', token: specificToken });
  } catch (error) {
    console.log('An error occurred while calling the specific token:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Controller function to forward a token to another service
exports.forwardToOtherService = async (req, res) => {
  try {
    const tokenNumber = req.headers['token-number'];
    const newServiceName = req.headers['new-service-name'];
    const waitingTimeResult = await calculateEstimatedWaitingTime(newServiceName);
    const waitingTime = waitingTimeResult.estimatedWaitingTime;

    const expectedServiceTime = getBhutanTime(waitingTime).time;

    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number not provided' });
    }

    if (!newServiceName) {
      return res.status(400).json({ error: 'New service name not provided' });
    }

    const currentToken = await Queue.findOne({ token: tokenNumber });

    if (!currentToken) {
      return res.status(404).json({ error: 'Token not found or not currently serving' });
    }

    const lastToken = await Queue.findOne({
      serviceName: newServiceName,
    }).sort({ queueNumber: -1 });

    const newQueueNumber = lastToken ? lastToken.queueNumber + 1 : 1;

    currentToken.queueNumber = newQueueNumber;
    currentToken.status = 'pending';
    currentToken.counter = null;
    currentToken.operatorId = null;
    currentToken.startServingTime = null;
    currentToken.endServingTime = null;
    currentToken.serviceName = newServiceName;

    await currentToken.save();

    if (currentToken.email) {
      // Formatted email content
      const subject = 'Forward to Other Service';
      const message = `
            <div style="padding: 20px;">
              <p>Dear Customer,</p>
              
              <p>Your service token <strong>${tokenNumber}</strong> has been forward to ${newServiceName} service.</p>

              <span><strong>New Estimated Waiting Time: </strong> ${waitingTime} minutes</span><br>
              <span><strong>New Expected Service Time: </strong> ${expectedServiceTime}</span>

              <p>To ensure a smooth experience, we recommend that you arrive <strong>10 minutes</strong> prior to your estimated service time to allow for any additional requirements.</p>
              
              <p>We will notify you with any further updates as needed.</p>

              <p>Best regards,<br><br>Bank of Bhutan Customer Service Team</p>

              <div style="text-align: center; padding: 10px; background-color: #eee; color: #666; font-size: 12px; border-radius: 0 0 8px 8px;">
                <p style="margin: 0;">Please do not reply to this email. For further assistance, contact our support team.</p>
              </div>
            </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: currentToken.email,
        subject: subject,
        html: message // Use 'html' property for HTML content
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Failed to send email:', error);
        } else {
          console.log('Email sent successfully:', info.response);
        }
      });
    }
    return res.status(200).json({ message: 'Token forwarded successfully', token: currentToken });
  } catch (error) {
    console.error('Error forwarding token to another service:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get all currently serving tokens across all counters
exports.getServingTokens = async (req, res) => {
  try {
    const servingTokens = await Queue.find({ status: 'serving' });

    // Emit an update only when there are tokens being served
    if (servingTokens.length > 0) {
      req.io.emit('updateMonitor', servingTokens);
    }

    res.status(200).json({ servingTokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Fetch all currently serving tokens for a specified service
exports.getServingTokensByService = async (req, res) => {
  try {
    const serviceName = req.headers['service-name'];

    if (!serviceName) {
      return res.status(400).json({ error: 'Service name is required in the headers' });
    }
    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();
    // Find all tokens with status 'serving' for the specified service
    const servingTokens = await Queue.find({ 
      status: 'serving', 
      serviceName,
      date: { $gte: today, $lte: tomorrow }

    });

    if (!servingTokens.length) {
      return res.status(404).json({ error: `No serving tokens found for the service: ${serviceName}` });
    }

    // Emit the updated serving tokens to all connected clients
    req.io.emit('servingTokensUpdated', { serviceName, servingTokens });

    res.status(200).json({ servingTokens });
  } catch (error) {
    console.error('Error fetching serving tokens by service:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Fetch the count of served tokens by each counter for a specified service
exports.getServedCountByCounter = async (req, res) => {
  try {
    const serviceName = req.headers['service-name'];

    if (!serviceName) {
      return res.status(400).json({ error: 'Service name is required in the headers' });
    }

    // Count the number of served tokens by each counter for the specified service
    const servedCounts = await Queue.aggregate([
      { $match: { serviceName, status: 'served' } },
      { $group: { _id: "$counter", servedCount: { $sum: 1 } } }
    ]);

    if (!servedCounts.length) {
      return res.status(404).json({ error: `No served tokens found for the service: ${serviceName}` });
    }

    // Emit the served counts to all connected clients
    // req.io.emit('servedTokenCountsUpdated', { serviceName, servedCounts });

    // Return the served counts by counter
    res.status(200).json({ servedCounts });
  } catch (error) {
    console.error('Error fetching served token counts by counter:', error.message);
    res.status(500).json({ error: error.message });
  }
};
// Fetch the currently serving token for a specified service and counter from headers
exports.getServingTokenByServiceAndCounter = async (req, res) => {
  try {
    const serviceName = req.query.serviceName;
    const counterNo = req.query.counterNo;

    if (!serviceName || !counterNo) {
      return res.status(400).json({ error: 'Service name and counter number are required' });
    }
    const today = moment().tz('Asia/Thimphu').startOf('day').toDate();
    const tomorrow = moment().tz('Asia/Thimphu').endOf('day').toDate();
    // Find the token with status 'serving' for the specified service and counter
    const servingToken = await Queue.findOne({
       status: 'serving', 
       serviceName, 
       counter: counterNo,
       date: { $gte: today, $lte: tomorrow }
      });

    if (servingToken) {
      // Emit the currently serving token to all connected clients
      // req.io.emit('servingTokenUpdated', { serviceName, counter: counterNo, token: servingToken.token });

      // Send response to the current request
      res.status(200).json({ token: servingToken.token });
    } else {
      res.status(200).json({ token: 'N/A' });
    }
  } catch (error) {
    console.error('Error fetching serving token by service and counter:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Fetch the currently serving token for a specified service and counter from headers
exports.repeatToken = async (req, res) => {
  try {
    const serviceName = req.query.serviceName;
    const counterNo = req.query.counterNo;

    if (!serviceName || !counterNo) {
      return res.status(400).json({ error: 'Service name and counter number are required' });
    }

    const servingToken = await Queue.findOne({ status: 'serving', serviceName, counter: counterNo });

    if (servingToken) {
      servingToken.repeat = 1;
      await servingToken.save();

      // Emit the specific event for repeating the token announcement
      req.io.emit('servingTokenUpdated', { serviceName, counter: counterNo, token: servingToken.token });

      return res.status(200).json({ token: servingToken.token });
    } else {
      return res.status(404).json({ token: 'N/A' });
    }
  } catch (error) {
    console.error('Error fetching serving token by service and counter:', error.message);
    res.status(500).json({ error: error.message });
  }
};

