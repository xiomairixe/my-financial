const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/', async (req, res) => {
  try {
    const months = parseInt(req.query.months || 6);
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ date: { $gte: start } });

    const monthlyMap = {};
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyMap[key] = { label, income: 0, expenses: 0, net: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount;
        else monthlyMap[key].expenses += t.amount;
      }
    });

    const monthly = Object.values(monthlyMap).map(m => ({ ...m, net: m.income - m.expenses }));
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const avgMonthlyIncome = totalIncome / months;
    const avgMonthlyExpenses = totalExpenses / months;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(catMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({ monthly, avgMonthlyIncome, avgMonthlyExpenses, savingsRate, topCategories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;