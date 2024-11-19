const express = require("express")
const http = require('http');
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {Server} = require('socket.io'); 
const cron = require('node-cron');

const app = express()

const server = http.createServer(app); 
const io = new Server(server);


// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.static(path.join(__dirname, 'views')));


const viewRoutes = require('./routes/viewRoutes')

const depositRoutes = require('./routes/depositRoutes')

const withdrawalRoutes = require('./routes/withdrawalRoutes')

const searchRoutes = require('./routes/searchRoutes')

const rtgsRoutes = require('./routes/rtgsRoutes')

const atsRoute = require('./routes/atsRoutes')

const dollarSelling = require('./routes/dollarSelling')

const swiftRoutes = require('./routes/swiftRoutes')

const feedback = require('./routes/feedbackRoutes')

const customerRoutes = require('./routes/customerRoutes')

const kioskRoutes = require('./routes/kioskRoutes')

const queueRoutes = require('./routes/queueRoutes')

const walkindepositRoutes = require('./routes/walkindepositRoutes')

const walkinwathdrawRoutes = require('./routes/walkinwithdrawRoutes')

const walkinrtgsRoutes = require('./routes/walkinRTGsRoutes')

const walkinswiftRoutes = require('./routes/walkinSWIFTRoutes')

const monitor = require('./routes/displayQueue')

const Teller = require('./routes/authRoutes')


const transferController = require('./Controllers/appointmentController');
const transferToQueue = require('./Controllers/transfertoQueue')
const transferDeposit = require('./Controllers/transferDepositData')
const transferWithdrawal = require('./Controllers/transferWithdrawalData')

const userRouter = require('./routes/userRoutes')

const dataRouter = require('./routes/dataRoutes')

// const queueController = require('./Controllers/queueController')


// Use CORS to allow requests from your frontend
// app.use(cors({
//     origin: 'https://bankofbhutan.onrender.com'  // Your frontend URL
// }));
app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});
// landing
app.use('/',viewRoutes)

// online
app.use('/api/v1/deposits', depositRoutes)

app.use('/api/v1/withdrawals',withdrawalRoutes)


app.use('/api/v1/search',searchRoutes)

app.use('/api/v1/rtgs',rtgsRoutes)

app.use('/api/v1/ats',atsRoute)

app.use('/api/v1/ds',dollarSelling)

app.use('/api/v1/swift',swiftRoutes)

app.use('/api/v1/feedback',feedback)

app.use('/api/v1/display',monitor)

app.use('/api/teller',Teller)


cron.schedule('* * * * *', transferToQueue.automatedTransfer);
// cron.schedule('* * * * *', transferController.automatedTransferToAppointment);
cron.schedule('* * * * *', transferDeposit.automatedTransfer);
// cron.schedule('* * * * *', queueController.automatedTransfer);
cron.schedule('* * * * *', transferWithdrawal.automatedTransfer);


// walkin

app.use('/api/v1/walkindeposit',walkindepositRoutes)

app.use('/api/v1/walkinwithdrawal',walkinwathdrawRoutes)

app.use('/api/v1/walkinrtgs',walkinrtgsRoutes)

app.use('/api/v1/walkinswift',walkinswiftRoutes)

app.use('/api/v1/customer',customerRoutes)

app.use('/api/kiosk',kioskRoutes)
// admin

app.use('/api/v1/users',userRouter)

app.use('/api/v1/data',dataRouter)

app.use('/api/queue', queueRoutes)



// app.use(express.static(path.join(__dirname, 'views')))
// Socket.IO setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});
module.exports = app