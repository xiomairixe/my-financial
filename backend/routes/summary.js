const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalBalance > 0 ? totalBalance * 0.9 : 0;
    res.json({ totalIncome, totalExpenses, totalBalance, totalSavings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const transactions = await Transaction.find({ date: { $gte: sixMonthsAgo } });

    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[key] = { label, income: 0, expenses: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        if (t.type === 'income') monthlyData[key].income += t.amount;
        else monthlyData[key].expenses += t.amount;
      }
    });

    res.json(Object.values(monthlyData));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Transaction.find({ type: 'expense', date: { $gte: startOfMonth } });
    const byCategory = {};
    expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    const result = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;