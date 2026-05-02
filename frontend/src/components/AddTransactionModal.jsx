import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AddTransactionModal({ onClose, onAdded, categories }) {
  const [form, setForm] = useState({
    description: '', amount: '', type: 'expense',
    category: '', date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [loading,      setLoading]      = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiSuggested,  setAiSuggested]  = useState(null); // suggested category name
  const debounceRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Auto-categorize when description is typed ───────────────
  useEffect(() => {
    if (form.description.trim().length < 3 || categories.length === 0) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const catNames = categories.map(c => c.name);
        const res = await axios.post('/api/ai/categorize', {
          description: form.description,
          amount:      form.amount || 0,
          categories:  catNames,
        });
        const suggested = res.data.category;
        setAiSuggested(suggested);
        // Only auto-fill if user hasn't already picked one
        if (!form.category) {
          set('category', suggested);
        }
      } catch { /* silent */ }
      finally { setAiLoading(false); }
    }, 600); // 600ms debounce
    return () => clearTimeout(debounceRef.current);
  }, [form.description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.category) return;
    setLoading(true);
    try {
      await onAdded({ ...form, amount: parseFloat(form.amount) });
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fieldCls = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => set('type', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
            <input
              value={form.description}
              onChange={e => { set('description', e.target.value); setAiSuggested(null); }}
              placeholder="e.g., Grab to Makati, SM Grocery..."
              className={fieldCls}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
            <input
              type="number" min="0" step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="0.00"
              className={fieldCls}
            />
          </div>

          {/* Category — with AI suggestion badge */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Category</label>
              {/* AI status */}
              {aiLoading && (
                <div className="flex items-center gap-1 text-xs text-emerald-500">
                  <Loader2 size={11} className="animate-spin" />
                  <span>AI thinking…</span>
                </div>
              )}
              {aiSuggested && !aiLoading && (
                <div className="flex items-center gap-1">
                  <Sparkles size={11} className="text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">AI suggested</span>
                </div>
              )}
            </div>
            <select
              value={form.category}
              onChange={e => { set('category', e.target.value); setAiSuggested(null); }}
              className={`${fieldCls} bg-white ${
                aiSuggested && form.category === aiSuggested
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                  : ''
              }`}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {/* Suggestion chips if user hasn't accepted */}
            {aiSuggested && form.category !== aiSuggested && !aiLoading && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400">AI suggests:</span>
                <button
                  type="button"
                  onClick={() => set('category', aiSuggested)}
                  className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-all"
                >
                  <Sparkles size={10} />
                  {aiSuggested}
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className={fieldCls}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any extra details…"
              className={fieldCls}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.description || !form.amount || !form.category}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all"
            >
              {loading ? 'Adding…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}