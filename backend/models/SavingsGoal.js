const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  color: { type: String, default: '#3b82f6' },
}, { timestamps: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);