const mongoose = require('mongoose');

const countdownSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    deadline: {
        type: Date,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Countdown', countdownSchema);