import { useState } from 'react';
import { X } from 'lucide-react';
import { createTransaction } from '../utils/api';

export default function AddTransactionModal({ onClose, onAdded, categories = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: '', date: today });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const availableCats = categories.filter(c => c.type === 'both' || c.type === form.type);
  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.category) return setError('Please fill all fields');
    setLoading(true); setError('');
    try {
      await createTransaction({ ...form, amount: parseFloat(form.amount) });
      onAdded(); onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add transaction');
    } finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex mb-5 bg-slate-100 rounded-xl p-1">
          {['expense', 'income'].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${form.type === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
              <option value="">Select a category</option>
              {availableCats.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g., Groceries at Whole Foods"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
