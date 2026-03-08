const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  try {
    const { type, category, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(filter);
    res.json({ transactions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;