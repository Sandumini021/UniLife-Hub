const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'], // Only these 3 statuses are allowed
        default: 'To Do'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Links this task to a specific category
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);