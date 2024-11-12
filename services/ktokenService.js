const TokenCounter = require('../models/TokenCounter');

// Map service types to their respective kiosk prefixes with KO-
const tokenPrefixes = {
  'ATS/DSA': 'KAD',
  'Dollar Selling/FC Transfer/Travel Agent/CBC': 'KFT',
  'Cash (Deposit/Withdraw)': 'KCA',
  'RTGS': 'KRT',
  'SWIFT': 'KSW'
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

    // Increment kioskLastToken for kiosk tokens only
    counter.kioskLastToken += 1;
    await counter.save();

    const token = `${prefix}${counter.kioskLastToken.toString().padStart(3, '0')}`;
    return token;
  } catch (error) {
    console.error('Error generating sequential token for kiosk:', error.message); 
    throw new Error('Failed to generate kiosk token');
  }
};

