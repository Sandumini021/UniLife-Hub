const express = require('express');
const router = express.Router();
const Countdown = require('../models/Countdown');

// 1. Get all countdowns (Sorted by closest deadline)
router.get('/', async (req, res) => {
    try {
        const countdowns = await Countdown.find().sort({ deadline: 1 });
        res.json(countdowns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a new countdown
router.post('/', async (req, res) => {
    try {
        const newCountdown = new Countdown(req.body);
        const savedCountdown = await newCountdown.save();
        res.status(201).json(savedCountdown);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Update a countdown (Edit details or mark as completed)
router.put('/:id', async (req, res) => {
    try {
        const updatedCountdown = await Countdown.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(updatedCountdown);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. Delete a countdown
router.delete('/:id', async (req, res) => {
    try {
        const deletedCountdown = await Countdown.findByIdAndDelete(req.params.id);
        if (!deletedCountdown) return res.status(404).json({ message: 'Countdown not found' });
        res.json({ message: 'Countdown deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;