const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages, currency } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `You are Finn, a friendly and knowledgeable AI financial advisor embedded in a personal finance tracking app. You help users understand their spending, budgets, bills, and savings goals. The user's currency is ${currency || 'USD'}.

Give concise, practical, and actionable advice. Use bullet points for lists. Bold key numbers or terms with **text**. Keep responses under 200 words unless the user asks for detail. Always be encouraging and supportive. Note that your advice is general guidance, not professional financial advice, when relevant.`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";

    res.json({ reply });
  } catch (err) {
    console.error('AI route error:', err.message);
    res.status(500).json({ error: err.message || 'AI service unavailable' });
  }
});

module.exports = router;