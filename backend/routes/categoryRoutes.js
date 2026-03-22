const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Task = require('../models/Task');

// 1. Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a new category
router.post('/', async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Update a category name
router.put('/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name },
            { new: true } // This ensures it returns the updated document
        );
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. Delete a category and all its associated tasks
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Delete all tasks linked to this category ID
        await Task.deleteMany({ category: req.params.id });

        res.json({ message: 'Category and its tasks deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;