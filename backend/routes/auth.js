const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User        = require('../models/User');
const Transaction  = require('../models/Transaction');
const Category     = require('../models/Category');
const Budget       = require('../models/Budget');
const SavingsGoal  = require('../models/SavingsGoal');
const auth    = require('../middleware/auth');

// ── Helpers ───────────────────────────────────────────────────
const signToken = (id, rememberMe) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : '7d' });

const isValidEmail    = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const isValidName     = (n) => n.trim().length >= 2 && n.trim().length <= 50;
const isValidPassword = (p) => p.length >= 6 && p.length <= 100;

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (!isValidName(name))
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (!isValidPassword(password))
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists)
      return res.status(400).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password });
    const token = signToken(user._id, false);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Please enter a valid email address.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password.' });

    const token = signToken(user._id, rememberMe);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency },
    });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', auth, (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, currency: req.user.currency },
  });
});

// ── PATCH /api/auth/profile — update name & email ────────────
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: 'Name and email are required.' });
    if (!isValidName(name))
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Please enter a valid email address.' });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing && existing._id.toString() !== req.user._id.toString())
      return res.status(400).json({ error: 'This email is already in use.' });

    req.user.name  = name.trim();
    req.user.email = email.trim().toLowerCase();
    await req.user.save();

    res.json({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, currency: req.user.currency },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── PATCH /api/auth/password — change password ───────────────
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both current and new password are required.' });
    if (!isValidPassword(newPassword))
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    if (currentPassword === newPassword)
      return res.status(400).json({ error: 'New password must be different from the current one.' });

    const user  = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match)
      return res.status(401).json({ error: 'Current password is incorrect.' });

    user.password = newPassword; // pre-save hook hashes it
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ── PATCH /api/auth/currency — save currency preference ───────
router.patch('/currency', auth, async (req, res) => {
  try {
    const { currency } = req.body;
    if (!currency)
      return res.status(400).json({ error: 'Currency is required.' });

    req.user.currency = currency;
    await req.user.save();
    res.json({
      user: { id: req.user._id, name: req.user.name, email: req.user.email, currency: req.user.currency },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update currency.' });
  }
});

// ── GET /api/auth/export — export all user data ───────────────
router.get('/export', auth, async (req, res) => {
  try {
    const [transactions, categories, budgets, savings] = await Promise.all([
      Transaction.find({ userId: req.user._id }),
      Category.find({ userId: req.user._id }),
      Budget.find({ userId: req.user._id }),
      SavingsGoal.find({ userId: req.user._id }),
    ]);

    const payload = {
      exportedAt:   new Date().toISOString(),
      user:         { name: req.user.name, email: req.user.email, currency: req.user.currency },
      transactions,
      categories,
      budgets,
      savingsGoals: savings,
    };

    res.setHeader('Content-Disposition', 'attachment; filename="fintrack-export.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

// ── DELETE /api/auth/account — delete account + all data ─────
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ error: 'Password is required to confirm deletion.' });

    const user  = await User.findById(req.user._id);
    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ error: 'Incorrect password.' });

    await Promise.all([
      Transaction.deleteMany({ userId: req.user._id }),
      Category.deleteMany({ userId: req.user._id }),
      Budget.deleteMany({ userId: req.user._id }),
      SavingsGoal.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id),
    ]);

    res.json({ message: 'Account and all data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;