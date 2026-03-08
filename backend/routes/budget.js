const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month ?? now.getMonth());
    const year = parseInt(req.query.year ?? now.getFullYear());

    const budgets = await Budget.find({ month, year });

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    const expenses = await Transaction.find({ type: 'expense', date: { $gte: start, $lte: end } });

    const spentMap = {};
    expenses.forEach(t => { spentMap[t.category] = (spentMap[t.category] || 0) + t.amount; });

    const result = budgets.map(b => ({ ...b.toObject(), spent: spentMap[b.category] || 0 }));
    const totalBudgeted = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const totalSpent = result.reduce((s, b) => s + b.spent, 0);

    res.json({ budgets: result, totalBudgeted, totalSpent, remaining: totalBudgeted - totalSpent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    const existing = await Budget.findOne({ category, month, year });
    if (existing) {
      existing.monthlyLimit = monthlyLimit;
      await existing.save();
      return res.json(existing);
    }
    const budget = new Budget({ category, monthlyLimit, month, year });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;