const mongoose = require('mongoose')

const feedbackSchema = mongoose.Schema({
    rating :{
        type: Number,
    },
    comment :{
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

},{timestamps:true});

const feedbackModel = mongoose.model('feedback',feedbackSchema);
module.exports = feedbackModel;

