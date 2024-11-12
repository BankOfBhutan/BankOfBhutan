const User =  require('./../models/userModels')
const AppError = require('../utils/appError')
  
//   exports.getMe = (req, res, next) => {
//     req.params.id = req.user.id;
//     next();
//   };
exports.updateMe = async (req, res, next) => {
    try{
         // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400,
          ),
        )
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email')
    var obj = JSON.parse(req.cookies.token)
    const updatedUser = await User.findByIdAndUpdate(obj['_id'], filteredBody, {
        new: true,
        runValidators: true,
    })
    res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
    })

    }
    catch (err){
        res.status(500).json({ error: err.message});
    }
}

exports.getAllUsers = async (req, res, next) =>{
    try{
        const users = await User.find()
        res.status(200).json({data: users, status: 'success'})
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

exports.createUser = async (req, res) =>{
    try{
        const user = await User.create(req.body);
        console.log(req.body.name)
        res.json({data: user, status: 'success'});
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

exports.getUser = async (req, res) => {
    try {
        // User is attached to the request by the protect middleware
        const user = req.user;

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    // Exclude sensitive data like password
                }
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEditTellerData = async (req, res) => {
    try {
        // User is attached to the request by the protect middleware
        const user = await User.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    counter: user.counter,
                    service: user.service,
                    status: user.status
                    // Exclude sensitive data like password
                }
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTellers = async (req, res, next) => {
    try {
        // Find users with the role 'teller' and select specific fields
        const tellers = await User.find({ role: 'teller' }, 'operatorId service counter status');

        // Return the result in the response
        res.status(200).json({
            status: 'success',
            data: tellers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        console.log("hello")
        // Find user by the authenticated user's ID and update their details
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,  // Use ID from req.user (authenticated user)
            req.body,
            { new: true, runValidators: true }  // Return the updated user and validate new data
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Find and delete the authenticated user by their ID
        const user = await User.findByIdAndDelete(req.params.id);  // Use req.user._id

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null  // No content after deletion
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Get Teller Details by operatorId
exports.getTellerDetails = async (req, res) => {
    try {
        const teller = await User.findById(req.user._id); // Find teller by their decoded token
        if (!teller) {
            return res.status(404).json({ message: 'Teller not found' });
        }

        res.status(200).json({
            name: teller.name,
            counter: teller.counter,
            service: teller.service, // Return the service name
            operationID: teller.operatorId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching teller details', error });
    }
};

// Function to count tellers with status other than "leave" and same service as provided in the header
exports.countActiveTellers = async (req, res) => {
    try {
        const service = req.headers['service'];

        if (!service) {
            return res.status(400).json({
                status: 'fail',
                message: 'Service header is required',
            });
        }

        const activeTellerCount = await User.countDocuments({
            service: service,
            status: { $ne: 'leave' }
        });

        // Emit the active teller count update to all connected clients
        req.io.emit('activeTellerCountUpdated', { service, activeTellerCount });

        res.status(200).json({
            status: 'success',
            activeTellerCount,
        });
    } catch (error) {
        console.error('Error counting active tellers:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error counting active tellers',
        });
    }
};