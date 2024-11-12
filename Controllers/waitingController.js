const Queue = require('../models/queueModel');
const Teller = require('../models/userModels');
const moment = require('moment-timezone'); 


// Helper function to get the current time in Bhutan Time (UTC+6)
function getBhutanTime() {
    const utcDate = new Date();
    const bhutanOffset = 6 * 60 * 60 * 1000; // UTC+6 offset in milliseconds
    return new Date(utcDate.getTime() + bhutanOffset);
}

// Helper function to generate a random integer between min and max (inclusive)
function getRandomServiceRate(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Find the number of active tellers by service
async function countActiveTellersByService(serviceName) {
    try {
        return await Teller.countDocuments({
            service: serviceName,
            status: { $ne: 'leave' }
        });
    } catch (error) {
        console.error('Error counting tellers:', error);
        throw error;
    }
}

// Calculate average service rate for the previous day in Bhutan Time
async function calculateAverageServiceRateByService(serviceName) {
    try {
        const todayBhutanTime = getBhutanTime();
        todayBhutanTime.setHours(0, 0, 0, 0); // Set to the start of the day

        // Calculate start and end times for the previous day
        const startTime = new Date(todayBhutanTime);
        startTime.setDate(todayBhutanTime.getDate() - 1); // Go back one day

        const endTime = new Date(todayBhutanTime);
        endTime.setMilliseconds(-1); // End of the previous day

        // Fetch records for the previous day with non-null transaction time
        const records = await Queue.find({
            serviceName,
            date: { $gte: startTime, $lte: endTime },
            transactionTime: { $ne: null }
        });

        // Apply service-specific logic based on record data
        if (records.length === 0) {
            // No records available, apply random rate based on service type
            if (serviceName === "Cash (Deposit/Withdraw)") {
                return getRandomServiceRate(5, 15); // 4-7 minutes for Cash
            } else if (serviceName === "SWIFT" || serviceName === "RTGS") {
                return getRandomServiceRate(9, 15); // 7-15 minutes for SWIFT and RTGS
            } else {
                return 15; // Default for other services
            }
        } else {
            // Records found, calculate average transaction time
            const totalTransactionTime = records.reduce((sum, record) => sum + record.transactionTime, 0);
            const averageServiceRate = totalTransactionTime / records.length;

            // Check thresholds and return appropriate rate
            if (serviceName === "Cash (Deposit/Withdraw)" && averageServiceRate < 3) {
                return getRandomServiceRate(5, 15); // Use random rate if below threshold
            } else if ((serviceName === "SWIFT" || serviceName === "RTGS") && averageServiceRate < 7) {
                return getRandomServiceRate(9, 15); // Use random rate if below threshold
            } else {
                return averageServiceRate; // Return calculated average if above threshold
            }
        }
    } catch (error) {
        console.error('Error calculating average service rate:', error);
        throw error;
    }
}

// Calculate queue length of pending customers for the current day in Bhutan Time
async function calculateQueueLengthByService(serviceName) {
    try {
        const bhutanNow = getBhutanTime();
        const startOfDay = new Date(bhutanNow);
        startOfDay.setHours(0, 0, 0, 0); // Start of Bhutan day in Bhutan Time

        const endOfDay = new Date(bhutanNow);
        endOfDay.setHours(23, 59, 59, 999); // End of Bhutan day in Bhutan Time

        return await Queue.countDocuments({
            serviceName,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: "pending"
        }) || 0;
    } catch (error) {
        console.error('Error calculating queue length:', error);
        throw error;
    }
}


// Main function to calculate estimated waiting time in Bhutan Time
async function calculateEstimatedWaitingTime(serviceName) {
    try {
        const numServers = await countActiveTellersByService(serviceName);
        const averageServiceTime = await calculateAverageServiceRateByService(serviceName); // in minutes
        const serviceRatePerServer = 60 / averageServiceTime; // Rate per minute per server
        const combinedServiceRate = numServers * serviceRatePerServer;
        const currentQueueLength = await calculateQueueLengthByService(serviceName);

        

        const waitingTimeHours = currentQueueLength / combinedServiceRate; // Waiting time in hours
        const waitingTimeMinutes = Math.floor(waitingTimeHours * 60); // Convert to total minutes

        // Get the current time in Bhutan Time
        const now = moment().tz("Asia/Thimphu");
        const currentHour = now.hour();
        // Check if queue length is zero and return a minimum waiting time of 2 minutes
        if (currentQueueLength === 0 && currentHour>9) {
            return { estimatedWaitingTime: 2 }; // Return as 2 minutes
        }
        // Check if the token is requested before 9 am Bhutan time
        if (currentHour < 9) {
            const nineAm = now.clone().set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
            const timeUntilNineAmMinutes = nineAm.diff(now, 'minutes'); // Minutes until 9 am
            const totalMinutes = waitingTimeMinutes + timeUntilNineAmMinutes; // Add time difference to waiting time

            return { estimatedWaitingTime: totalMinutes }; // Return total minutes until 9 AM plus waiting time
        }

        console.log(numServers, averageServiceTime, serviceRatePerServer, combinedServiceRate, currentQueueLength, waitingTimeHours);

        // Return the usual waiting time in minutes if it's past 9 am
        return { estimatedWaitingTime: waitingTimeMinutes };
    } catch (error) {
        console.error('Error calculating estimated waiting time:', error);
        throw error;
    }
}


// Export all functions
module.exports = {
    calculateEstimatedWaitingTime,
    countActiveTellersByService,
    calculateAverageServiceRateByService,
    calculateQueueLengthByService
};

