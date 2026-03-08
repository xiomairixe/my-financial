const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#f97316', isDefault: true },
  { name: 'Housing', type: 'expense', color: '#8b5cf6', isDefault: true },
  { name: 'Utilities', type: 'expense', color: '#eab308', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#14b8a6', isDefault: true },
  { name: 'Healthcare', type: 'expense', color: '#22c55e', isDefault: true },
  { name: 'Education', type: 'expense', color: '#3b82f6', isDefault: true },
  { name: 'Salary', type: 'income', color: '#10b981', isDefault: true },
  { name: 'Investments', type: 'both', color: '#6366f1', isDefault: true },
];

router.get('/', async (req, res) => {
  try {
    let categories = await Category.find().sort({ createdAt: 1 });
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      categories = await Category.find().sort({ createdAt: 1 });
    }
    const transactions = await Transaction.find();
    const txCountMap = {};
    transactions.forEach(t => { txCountMap[t.category] = (txCountMap[t.category] || 0) + 1; });
    const result = categories.map(c => ({ ...c.toObject(), txCount: txCountMap[c.name] || 0 }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cat = new Category(req.body);
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;