const path = require('path')

exports.getToken = (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'token_option.html'))
};

exports.getBookOnlineToken = (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'online_token_options.html'))
};

exports.getTokenOptions = (req,res)=>{
    res.sendFile(path.join(__dirname, '../', 'views', 'book_token_options.html'))
};

exports.getCashToken = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views','token_selection.html'))
};

exports.getDepositToken = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','cash_Deposit.html'))
}

exports.getWithdrawalToken = (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'cash_withdrawal.html'))
}

exports.getRTGS = (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','newRTGS.html'))
}
exports.getswift_edu = (req,res) =>{
    res.sendFile(path.join(__dirname,'../','views','swift_edu.html'))
}

exports.getswift = (req,res) =>{
    res.sendFile(path.join(__dirname,'../','views', 'newSWIFT.html'))
}

exports.getats = (req,res) =>{
    res.sendFile(path.join(__dirname,'../','views', 'ATS.html'))
}
exports.getdollarSelling = (req,res) =>{
    res.sendFile(path.join(__dirname,'../','views', 'DollarSelling.html'))
}

exports.getcheck_token = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','check_token.html'))
}

exports.walkin = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','Branchwalkinindex.html'))
}

exports.cashDeposit = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','CashDiposit.html'))
}

exports.onlineMonitor = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views','token_monitor.html'))
}

exports.cashOptional = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','cashOptional.html'))
}
exports.cashWithdrawal = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','CashWidrawal.html'))
}
exports.Email = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','Email.html'))
}

exports.Monitor = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','Monitor.html'))
}
exports.Optional_message_form = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','Optional_message_form.html'))
}
exports.OTP = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','OTP.html'))
}
exports.SWIFT1 = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','SWIFT1.html'))
}
exports.SWIFT2 = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','SWIFT2.html'))
}
exports.Token = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','Token.html'))
}
exports.walkinRTGS = (req,res) =>{
    res.sendFile(path.join(__dirname, '../','views','walkinRTGS.html'))
}
exports.getKioskMachineForm = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/koiske machine', 'Koiske.html'));
};


exports.dashboard = (req, res) =>{
    res.sendFile(path.join(__dirname, '../','views/admin','admin_dashboard.html'))
}

exports.appointment = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_appointment.html'))
}

exports.operator = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_operator.html'))

}

exports.prioritize = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_prioritize.html'))
}

exports.service = (req,res) =>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_service.html'))
}

exports.pass1 = (req, res) =>{
    res.sendFile(path.join(__dirname, '../','views/admin','admin_forgot_pass1.html'))
}

exports.pass2 = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_forgot_pass2.html'))
}

exports.login = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_login.html'))

}

exports.pass = (req,res)=>{
    res.sendFile(path.join(__dirname,'../','views/admin','admin_forgot_pass.html'))
}
exports.getTellerDashboard= (req, res) => {
    res.sendFile(path.join(__dirname, '../','views/admin', 'TellerDashboard.html'));
};

// Serve the teller login form (GET)
exports.getTellerOperation= (req, res) => {
    res.sendFile(path.join(__dirname, '../','views/admin', 'tellerOperation.html'));
};


// monitor
exports.getMonitorPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../','views/admin', 'Monitor.html'));
}



