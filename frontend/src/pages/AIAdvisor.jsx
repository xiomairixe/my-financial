import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, RotateCcw, Lightbulb } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import axios from 'axios';

const SUGGESTED = [
  "How much did I spend last month?",
  "Am I on track with my savings goals?",
  "Which category is draining my budget?",
  "What bills are coming up this week?",
  "Give me 3 tips to save more this month.",
];

function MessageText({ text }) {
  const parts = text.split('\n').map((line, i) => {
    const rendered = line.split(/\*\*(.*?)\*\*/g).map((seg, j) =>
      j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg
    );
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <span style={{ color: '#10b981' }}>•</span>
          <span>{rendered}</span>
        </div>
      );
    }
    return <div key={i} style={{ marginTop: i > 0 ? 4 : 0 }}>{rendered}</div>;
  });
  return <div style={{ lineHeight: 1.65 }}>{parts}</div>;
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#10b981',
          animation: `finnBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function AIAdvisor() {
  const currency = useCurrency();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hey! I'm **Finn**, your AI financial advisor.\n\nI can see your transactions, budgets, bills, and savings. Ask me anything!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const updated = [...messages, { role: 'user', content: msg }];
    setMessages(updated);
    setLoading(true);
    try {
      const payload = updated.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post('/api/ai/chat', { messages: payload, currency });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I could not connect. Please try again.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => setMessages([{
    role: 'assistant',
    content: "Hey! I'm **Finn**, your AI financial advisor.\n\nI can see your transactions, budgets, bills, and savings. Ask me anything!",
  }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes finnBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .finn-msg { animation: fadeUp 0.25s ease both; }
      `}</style>

      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Finn — AI Advisor</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Connected to your financial data</span>
            </div>
          </div>
        </div>
        <button onClick={reset} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <RotateCcw size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
        {messages.map((m, i) => (
          <div key={i} className="finn-msg" style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'assistant' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {m.role === 'assistant' ? <Sparkles size={15} color="white" /> : <User size={15} color="white" />}
            </div>
            <div style={{ maxWidth: '72%', background: m.role === 'user' ? '#0f172a' : 'white', color: m.role === 'user' ? '#f1f5f9' : '#1e293b', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '12px 16px', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: m.role === 'assistant' ? '1px solid #f1f5f9' : 'none' }}>
              <MessageText text={m.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="finn-msg" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="white" />
            </div>
            <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', padding: '8px 16px', border: '1px solid #f1f5f9' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && !loading && (
        <div style={{ padding: '0 24px 12px', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Lightbulb size={13} color="#94a3b8" />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Try asking</span>
          </div>
          {SUGGESTED.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 99, padding: '6px 14px', fontSize: 12, color: '#475569', cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 24px 20px', background: 'white', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#f8fafc', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '8px 8px 8px 16px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Finn anything about your finances…"
            rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 14, color: '#0f172a', fontFamily: 'sans-serif', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: input.trim() && !loading ? '#10b981' : '#e2e8f0', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Send size={15} color={input.trim() && !loading ? 'white' : '#94a3b8'} />
          </button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
          Finn uses your real financial data · Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
