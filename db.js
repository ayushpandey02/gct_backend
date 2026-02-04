const mongoose = require('mongoose');
require("dotenv").config(); // Ensure dotenv is configured if this file is run standalone (though index.js usually handles it)

mongoose.connect(process.env.MONGO_URI);

const formSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    mobileNumber: {
        type: Number,
        required: true,
        min: 0
    },
    wardNumber: {
        type: String,
        required: true,
        enum: ['Ward 40', 'Ward 41']
    },
    role: {
        type: String,
        required: true,
        enum: ['Batter', 'Bowler', 'All Rounder']
    },
    profilePic: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\.(jpg|jpeg|png|gif)$/i.test(v);
            },
            message: props => `${props.value} is not a valid image path!`
        }
    },
    upiTransactionId: {
        type: String,
        required: true,
        unique: true,
        
    },
    transactionScreenshot: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\.(jpg|jpeg|png|gif)$/i.test(v);
            },
            message: props => `${props.value} is not a valid image path!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
// formSchema.index({ upiTransactionId: 1 });
// formSchema.index({ wardNumber: 1 });

const Form = mongoose.model('Form', formSchema); 

module.exports = Form;

