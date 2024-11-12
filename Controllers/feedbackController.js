const feedbackModel = require('../models/feedbackModel')

exports.submitfeedback = async (req,res)=>{
    const {rating,comment}=req.body;
    // console.log(req.body);

    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }
    
    try {
        
        const newfeedback = new feedbackModel({
            rating,
            comment
        })
        

        await newfeedback.save();
        res.status(200).json({ message: 'feedback successfully submitted!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while submitting the feedback' });
        
    }
}