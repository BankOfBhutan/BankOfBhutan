const TokenCounter  = require('../models/TokenCounter');


exports.generateSequentialToken = async () => {
  try {
    let counter = await TokenCounter.findOne();
    if (!counter) {
      counter = await TokenCounter.create({ lastToken: 0 });
    }

    counter.lastToken += 1;
    await counter.save();

    return `OT${counter.lastToken.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating sequential token:', error.message);
    throw new Error('Failed to generate token');
  }
};
