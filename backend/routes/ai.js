const express    = require('express');
const router     = express.Router();
const Anthropic  = require('@anthropic-ai/sdk');
const mongoose   = require('mongoose');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Re-use your existing models (adjust paths to match your project) ──────────
const Transaction = mongoose.model('Transaction');
const Budget      = mongoose.model('Budget');
const Bill        = mongoose.model('Bill');
const Saving      = mongoose.model('Saving');

// ── Helper: load all user financial context ───────────────────────────────────
async function getUserContext(userId) {
  const now     = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const start60 = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

  const [transactions, budgets, bills, savings] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: start60 } }).sort({ date: -1 }).limit(200).lean(),
    Budget.find({ user: userId }).lean(),
    Bill.find({ user: userId }).lean(),
    Saving.find({ user: userId }).lean(),
  ]);

  // Summarise spending by category for the last 30 days
  const last30Txns = transactions.filter(t => new Date(t.date) >= start30);
  const byCategory = {};
  last30Txns.forEach(t => {
    if (t.type === 'expense') {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  });

  const totalIncome  = last30Txns.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const totalExpense = last30Txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return {
    summary: {
      last30Days: { totalIncome, totalExpense, net: totalIncome - totalExpense, byCategory },
      transactionCount: last30Txns.length,
    },
    recentTransactions: last30Txns.slice(0, 30).map(t => ({
      date: t.date, description: t.description,
      category: t.category, amount: t.amount, type: t.type,
    })),
    budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
    bills:   bills.map(b => ({
      name: b.name, amount: b.amount, frequency: b.frequency,
      dueDate: b.dueDate, isPaid: b.isPaid,
    })),
    savings: savings.map(s => ({
      name: s.name, targetAmount: s.targetAmount,
      currentAmount: s.currentAmount, deadline: s.deadline,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI CHAT  POST /api/ai/chat
// Body: { messages: [{role, content}], currency }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, currency = '₱' } = req.body;
    const ctx = await getUserContext(req.user._id);

    const system = `You are Finn, an expert AI financial advisor embedded inside FinTrack, a personal finance app.
You have full access to the user's real financial data shown below. Give personalized, actionable, friendly advice.
Be concise — use bullet points where helpful. Format numbers with the ${currency} currency symbol.
Never make up data. If you don't know something, say so.

CURRENT FINANCIAL SNAPSHOT:
${JSON.stringify(ctx, null, 2)}

Today's date: ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;

    const response = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      system,
      messages,
    });

    res.json({ reply: response.content[0].text });
  } catch (e) {
    console.error('[AI Chat]', e);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SPENDING INSIGHTS  GET /api/ai/insights
// ─────────────────────────────────────────────────────────────────────────────
router.get('/insights', async (req, res) => {
  try {
    const { currency = '₱' } = req.query;
    const ctx = await getUserContext(req.user._id);

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role:    'user',
        content: `Analyze this user's financial data and return EXACTLY 4 spending insights as a JSON array.
Each insight must have: { "type": "positive"|"warning"|"neutral", "icon": "emoji", "title": "short title", "detail": "1-2 sentence insight" }
Focus on patterns, comparisons, and actionable observations. Use ${currency} for amounts.
Data: ${JSON.stringify(ctx)}
Return ONLY valid JSON array, no markdown.`,
      }],
    });

    let insights;
    try {
      insights = JSON.parse(response.content[0].text.trim());
    } catch {
      // Fallback: strip any accidental markdown fences
      const clean = response.content[0].text.replace(/```json|```/g, '').trim();
      insights = JSON.parse(clean);
    }

    res.json({ insights });
  } catch (e) {
    console.error('[AI Insights]', e);
    res.status(500).json({ error: 'Could not generate insights' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUTO-CATEGORIZE  POST /api/ai/categorize
// Body: { description, amount, categories: ['Food & Dining', ...] }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/categorize', async (req, res) => {
  try {
    const { description, amount, categories } = req.body;

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{
        role:    'user',
        content: `Given this transaction description: "${description}" and amount: ${amount}
Pick the BEST matching category from this list: ${categories.join(', ')}
Reply with ONLY the category name, nothing else.`,
      }],
    });

    const suggested = response.content[0].text.trim();
    // Validate it's actually in the list
    const match = categories.find(c => c.toLowerCase() === suggested.toLowerCase()) || categories[0];
    res.json({ category: match });
  } catch (e) {
    console.error('[AI Categorize]', e);
    res.status(500).json({ error: 'Could not categorize' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANOMALY ALERTS  GET /api/ai/alerts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const { currency = '₱' } = req.query;
    const ctx = await getUserContext(req.user._id);

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role:    'user',
        content: `Analyze this user's financial data for anomalies, risks, and urgent items.
Return a JSON array of alerts (max 4, only include real issues — return [] if nothing notable).
Each alert: { "severity": "high"|"medium"|"low", "icon": "emoji", "title": "short title", "detail": "specific detail with numbers" }
High = overdue bills, budget exceeded. Medium = budget nearly exceeded, unusual spending spike. Low = tips, upcoming due dates.
Use ${currency} for amounts. Data: ${JSON.stringify(ctx)}
Return ONLY valid JSON array, no markdown.`,
      }],
    });

    let alerts;
    try {
      alerts = JSON.parse(response.content[0].text.trim());
    } catch {
      const clean = response.content[0].text.replace(/```json|```/g, '').trim();
      alerts = JSON.parse(clean);
    }

    res.json({ alerts });
  } catch (e) {
    console.error('[AI Alerts]', e);
    res.status(500).json({ error: 'Could not generate alerts' });
  }
});

module.exports = router;const express    = require('express');
const router     = express.Router();
const Anthropic  = require('@anthropic-ai/sdk');
const mongoose   = require('mongoose');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Re-use your existing models (adjust paths to match your project) ──────────
const Transaction = mongoose.model('Transaction');
const Budget      = mongoose.model('Budget');
const Bill        = mongoose.model('Bill');
const Saving      = mongoose.model('Saving');

// ── Helper: load all user financial context ───────────────────────────────────
async function getUserContext(userId) {
  const now     = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const start60 = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

  const [transactions, budgets, bills, savings] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: start60 } }).sort({ date: -1 }).limit(200).lean(),
    Budget.find({ user: userId }).lean(),
    Bill.find({ user: userId }).lean(),
    Saving.find({ user: userId }).lean(),
  ]);

  // Summarise spending by category for the last 30 days
  const last30Txns = transactions.filter(t => new Date(t.date) >= start30);
  const byCategory = {};
  last30Txns.forEach(t => {
    if (t.type === 'expense') {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  });

  const totalIncome  = last30Txns.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const totalExpense = last30Txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return {
    summary: {
      last30Days: { totalIncome, totalExpense, net: totalIncome - totalExpense, byCategory },
      transactionCount: last30Txns.length,
    },
    recentTransactions: last30Txns.slice(0, 30).map(t => ({
      date: t.date, description: t.description,
      category: t.category, amount: t.amount, type: t.type,
    })),
    budgets: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent })),
    bills:   bills.map(b => ({
      name: b.name, amount: b.amount, frequency: b.frequency,
      dueDate: b.dueDate, isPaid: b.isPaid,
    })),
    savings: savings.map(s => ({
      name: s.name, targetAmount: s.targetAmount,
      currentAmount: s.currentAmount, deadline: s.deadline,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI CHAT  POST /api/ai/chat
// Body: { messages: [{role, content}], currency }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, currency = '₱' } = req.body;
    const ctx = await getUserContext(req.user._id);

    const system = `You are Finn, an expert AI financial advisor embedded inside FinTrack, a personal finance app.
You have full access to the user's real financial data shown below. Give personalized, actionable, friendly advice.
Be concise — use bullet points where helpful. Format numbers with the ${currency} currency symbol.
Never make up data. If you don't know something, say so.

CURRENT FINANCIAL SNAPSHOT:
${JSON.stringify(ctx, null, 2)}

Today's date: ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;

    const response = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      system,
      messages,
    });

    res.json({ reply: response.content[0].text });
  } catch (e) {
    console.error('[AI Chat]', e);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SPENDING INSIGHTS  GET /api/ai/insights
// ─────────────────────────────────────────────────────────────────────────────
router.get('/insights', async (req, res) => {
  try {
    const { currency = '₱' } = req.query;
    const ctx = await getUserContext(req.user._id);

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role:    'user',
        content: `Analyze this user's financial data and return EXACTLY 4 spending insights as a JSON array.
Each insight must have: { "type": "positive"|"warning"|"neutral", "icon": "emoji", "title": "short title", "detail": "1-2 sentence insight" }
Focus on patterns, comparisons, and actionable observations. Use ${currency} for amounts.
Data: ${JSON.stringify(ctx)}
Return ONLY valid JSON array, no markdown.`,
      }],
    });

    let insights;
    try {
      insights = JSON.parse(response.content[0].text.trim());
    } catch {
      // Fallback: strip any accidental markdown fences
      const clean = response.content[0].text.replace(/```json|```/g, '').trim();
      insights = JSON.parse(clean);
    }

    res.json({ insights });
  } catch (e) {
    console.error('[AI Insights]', e);
    res.status(500).json({ error: 'Could not generate insights' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUTO-CATEGORIZE  POST /api/ai/categorize
// Body: { description, amount, categories: ['Food & Dining', ...] }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/categorize', async (req, res) => {
  try {
    const { description, amount, categories } = req.body;

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{
        role:    'user',
        content: `Given this transaction description: "${description}" and amount: ${amount}
Pick the BEST matching category from this list: ${categories.join(', ')}
Reply with ONLY the category name, nothing else.`,
      }],
    });

    const suggested = response.content[0].text.trim();
    // Validate it's actually in the list
    const match = categories.find(c => c.toLowerCase() === suggested.toLowerCase()) || categories[0];
    res.json({ category: match });
  } catch (e) {
    console.error('[AI Categorize]', e);
    res.status(500).json({ error: 'Could not categorize' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANOMALY ALERTS  GET /api/ai/alerts
// ─────────────────────────────────────────────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const { currency = '₱' } = req.query;
    const ctx = await getUserContext(req.user._id);

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role:    'user',
        content: `Analyze this user's financial data for anomalies, risks, and urgent items.
Return a JSON array of alerts (max 4, only include real issues — return [] if nothing notable).
Each alert: { "severity": "high"|"medium"|"low", "icon": "emoji", "title": "short title", "detail": "specific detail with numbers" }
High = overdue bills, budget exceeded. Medium = budget nearly exceeded, unusual spending spike. Low = tips, upcoming due dates.
Use ${currency} for amounts. Data: ${JSON.stringify(ctx)}
Return ONLY valid JSON array, no markdown.`,
      }],
    });

    let alerts;
    try {
      alerts = JSON.parse(response.content[0].text.trim());
    } catch {
      const clean = response.content[0].text.replace(/```json|```/g, '').trim();
      alerts = JSON.parse(clean);
    }

    res.json({ alerts });
  } catch (e) {
    console.error('[AI Alerts]', e);
    res.status(500).json({ error: 'Could not generate alerts' });
  }
});

module.exports = router;