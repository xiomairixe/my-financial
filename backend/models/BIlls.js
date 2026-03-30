const BillSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  amount:    { type: Number, required: true },
  frequency: { type: String, enum: ['weekly','bi-weekly','monthly','semi-annual','annual'], default: 'monthly' },
  dueDate:   { type: Date, required: true },
  icon:      { type: String, default: '📄' },
  notes:     { type: String, default: '' },
  isPaid:    { type: Boolean, default: false },
  paidAt:    { type: Date, default: null },
}, { timestamps: true });

// routes/bills.js
router.get('/',          auth, async (req, res) => {
  const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });
  res.json(bills);
});
router.post('/',         auth, async (req, res) => {
  const bill = await Bill.create({ ...req.body, user: req.user._id });
  res.status(201).json(bill);
});
router.patch('/:id/toggle', auth, async (req, res) => {
  const bill = await Bill.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isPaid: req.body.isPaid, paidAt: req.body.paidAt },
    { new: true }
  );
  res.json(bill);
});
router.delete('/:id',    auth, async (req, res) => {
  await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});