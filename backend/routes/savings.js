const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');

router.get('/', async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 }); // ← userId
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const goal = new SavingsGoal({ ...req.body, userId: req.user._id }); // ← userId
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // ← userId check
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); // ← userId
    if (!deleted) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;