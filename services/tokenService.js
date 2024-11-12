const TokenCounter = require('../models/TokenCounter');

// Map service types to their respective user prefixes with W-
const tokenPrefixes = {
  'ATS/DSA': 'WAD',
  'Dollar Selling/FC Transfer/Travel Agent/CBC': 'WFT',
  'Cash (Deposit/Withdraw)': 'WCA',
  'RTGS': 'WRT',
  'SWIFT': 'WSW'
};

exports.generateSequentialToken = async (serviceType) => {
  try {
    const prefix = tokenPrefixes[serviceType];

    if (!prefix) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    let counter = await TokenCounter.findOne();
    if (!counter) {
      counter = await TokenCounter.create({ kioskLastToken: 0, userLastToken: 0 });
    }

    // Increment userLastToken for user tokens only
    counter.userLastToken += 1;
    await counter.save();

    const token = `${prefix}${counter.userLastToken.toString().padStart(3, '0')}`;
    return token;
  } catch (error) {
    console.error('Error generating sequential token for user:', error.message); 
    throw new Error('Failed to generate user token');
  }
};

