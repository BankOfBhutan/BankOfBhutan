const RTGSTransaction = require('../models/walkinrtgsModel');

// Helper function to parse dates and validate the format
const parseDate = (dateString) => {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date: ${dateString}`);
    }
    return parsedDate;
};

// Submit SWIFT Transaction (store only in SWIFT model)
exports.createTransaction = async (req, res) => {
    const {
        TokenNumber,
        passportNo, productDetails, issuedDate, expiryDate,
        currencyType, amount, valueDate, orderingCustomerName, orderingCustomerAddress,
        intermediaryBank, bankName, bankAddress, swiftCode, beneficiaryName,
        beneficiaryAccount, beneficiaryAddress, purpose, paymentTerm, declarationNo,
        charges, institutionName, institutionAddress, courseName, commencementDate,
        courseDuration, travelDate, travelTime, tuitionAmount, tuitionPaymentMode,
        stipendAmount, stipendPaymentMode, livingAllowance, allowancePaymentMode,
        totalAmount
    } = req.body;

    // Input validation
    if (!TokenNumber || !passportNo || !orderingCustomerName || !amount || !swiftCode || !beneficiaryName) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    try {
        const parsedIssuedDate = parseDate(issuedDate);
        const parsedExpiryDate = parseDate(expiryDate);
        const parsedValueDate = parseDate(valueDate);
        const parsedCommencementDate = commencementDate ? parseDate(commencementDate) : null;
        const parsedTravelDate = travelDate ? parseDate(travelDate) : null;

        const institutionData = (institutionName || institutionAddress || courseName) ? {
            name: institutionName || null,
            address: institutionAddress || null,
            course: courseName || null,
            commencementDate: parsedCommencementDate,
            courseDuration,
            travelDate: parsedTravelDate,
            travelTime,
            tuitionFees: { amount: tuitionAmount, paymentMode: tuitionPaymentMode },
            stipend: { amount: stipendAmount, paymentMode: stipendPaymentMode },
            livingAllowance: { amount: livingAllowance, paymentMode: allowancePaymentMode },
            totalAmount
        } : null;

        const swiftTransaction = await SWIFTTransaction.create({
            TokenNumber,
            passportNo, productDetails, issuedDate: parsedIssuedDate, 
            expiryDate: parsedExpiryDate, currencyType, amount, valueDate: parsedValueDate,
            orderingCustomer: { name: orderingCustomerName, address: orderingCustomerAddress },
            intermediaryBank, beneficiaryBank: { name: bankName, address: bankAddress, swiftCode },
            beneficiaryCustomer: { name: beneficiaryName, accountNo: beneficiaryAccount, address: beneficiaryAddress },
            purpose, paymentTerm, declarationNo, charges, institution: institutionData
        });

     

        // Send a success response
        res.status(200).json({
            status: 'success',
            message: 'SWIFT form submitted successfully.',
            data: { swiftTransaction },
        });
    } catch (error) {
        console.error('Error during SWIFT form submission:', error);
        res.status(500).json({ message: error.message || 'Error occurred while submitting the SWIFT form.' });
    }
};

// Function to get all SWIFT transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await SWIFTTransaction.find();
        res.status(200).json({
            status: 'success',
            results: transactions.length,
            data: { transactions },
        });
    } catch (error) {
        console.error('Error fetching SWIFT transactions:', error);
        res.status(500).json({ message: 'Error occurred while fetching SWIFT transactions.' });
    }
};

// Get a specific SWIFT transaction by TokenNumber
exports.getTransactionByTokenNumber = async (req, res) => {
    const { tokenNumber } = req.params;
    try {
        const transaction = await SWIFTTransaction.findOne({ TokenNumber: tokenNumber });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({
            status: 'success',
            data: { transaction },
        });
    } catch (err) {
        console.error('Error fetching transaction:', err);
        res.status(500).json({ message: 'Error occurred while fetching the transaction.' });
    }
};

// Update a SWIFT Transaction by ID
exports.updateTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await SWIFTTransaction.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { transaction },
        });
    } catch (err) {
        console.error('Error updating transaction:', err);
        res.status(500).json({ message: 'Error occurred while updating the transaction.' });
    }
};

// Delete a SWIFT Transaction by ID
exports.deleteTransactionById = async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await SWIFTTransaction.findByIdAndDelete(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Transaction deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({ message: 'Error occurred while deleting the transaction.' });
    }
};
