const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50 // Validation constraint as discussed
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);