const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const budgetRoutes = require('./routes/budgets');
const categoryRoutes = require('./routes/categories');
const savingsRoutes = require('./routes/savings');
const reportRoutes = require('./routes/reports');
const auth = require('./middleware/auth'); 
const billRoutes = require('./routes/bills');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'FinTrack API running', version: '2.0.0' }));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes); 
app.use('/api/summary',      auth, summaryRoutes); 
app.use('/api/budgets',      auth, budgetRoutes); 
app.use('/api/categories',   auth, categoryRoutes);
app.use('/api/savings',      auth, savingsRoutes);   
app.use('/api/reports',      auth, reportRoutes);   
app.use('/api/bills', auth, billRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 FinTrack API on port ${PORT}`));