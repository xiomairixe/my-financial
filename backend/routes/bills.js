const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// ── Schema ────────────────────────────────────────────────────
const BillSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  amount:    { type: Number, required: true },
  frequency: {
    type: String,
    enum: ['one-time', 'weekly', 'bi-weekly', 'monthly', 'semi-annual', 'annual'],
    default: 'monthly',
  },
  dueDate:   { type: Date, required: true },
  icon:      { type: String, default: '📄' },
  notes:     { type: String, default: '' },
  isPaid:    { type: Boolean, default: false },
  paidAt:    { type: Date, default: null },
}, { timestamps: true });

const Bill = mongoose.model('Bill', BillSchema);

// ── Helper: advance due date by one cycle ─────────────────────
function nextDueDate(currentDue, frequency) {
  const d = new Date(currentDue);
  switch (frequency) {
    case 'weekly':       d.setDate(d.getDate() + 7);      break;
    case 'bi-weekly':    d.setDate(d.getDate() + 14);     break;
    case 'monthly':      d.setMonth(d.getMonth() + 1);    break;
    case 'semi-annual':  d.setMonth(d.getMonth() + 6);    break;
    case 'annual':       d.setFullYear(d.getFullYear()+1);break;
    default: return null; // one-time — no next cycle
  }
  return d;
}

// ── Routes ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json({ data: bills });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const bill = await Bill.create({ ...req.body, user: req.user._id });
    res.status(201).json(bill);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ── Toggle paid — auto-spawns next cycle for recurring bills ──
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { isPaid, paidAt } = req.body;

    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isPaid, paidAt: isPaid ? (paidAt || new Date()) : null },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    // If marking as PAID and it's a recurring bill → spawn the next occurrence
    if (isPaid && bill.frequency !== 'one-time') {
      const nextDate = nextDueDate(bill.dueDate, bill.frequency);
      if (nextDate) {
        // Only create if no unpaid copy already exists for the next cycle
        const existing = await Bill.findOne({
          user:      bill.user,
          name:      bill.name,
          frequency: bill.frequency,
          isPaid:    false,
          dueDate:   nextDate,
        });
        if (!existing) {
          await Bill.create({
            user:      bill.user,
            name:      bill.name,
            amount:    bill.amount,
            frequency: bill.frequency,
            dueDate:   nextDate,
            icon:      bill.icon,
            notes:     bill.notes,
            isPaid:    false,
            paidAt:    null,
          });
        }
      }
    }

    res.json(bill);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;