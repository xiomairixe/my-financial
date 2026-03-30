import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { getBudgets, createBudget, deleteBudget, getCategories } from '../utils/api';

function SetBudgetModal({ onClose, onSaved, categories, month, year }) {
  const currency = useCurrency();
  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
  const [loading, setLoading] = useState(false);
  const expenseCats = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const handleSubmit = async () => {
    if (!form.category || !form.monthlyLimit) return;
    setLoading(true);
    try {
      await createBudget({ ...form, monthlyLimit: parseFloat(form.monthlyLimit), month, year });
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Set Budget</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
              <option value="">Select a category</option>
              {expenseCats.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
              <input type="number" min="0" value={form.monthlyLimit}
                onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-60">
            {loading ? 'Saving...' : 'Set Budget'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const currency = useCurrency();
  const now = new Date();
  const [viewDate, setViewDate] = useState({ month: now.getMonth(), year: now.getFullYear() });
  const [data, setData] = useState({ budgets: [], totalBudgeted: 0, totalSpent: 0, remaining: 0 });
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([getBudgets(viewDate.month, viewDate.year), getCategories()]);
      setData(b.data);
      setCategories(c.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [viewDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeMonth = (dir) => {
    setViewDate(d => {
      let m = d.month + dir, y = d.year;
      if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
      return { month: m, year: y };
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Budget</h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={15} /> Set Budget
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><ChevronLeft size={16} /></button>
            <span className="font-semibold text-slate-700 text-sm w-36 text-center">{monthLabel}</span>
            <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1">Budgeted</p>
              <p className="font-mono font-bold text-slate-700 text-sm">{currency}{data.totalBudgeted.toFixed(0)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1">Spent</p>
              <p className="font-mono font-bold text-slate-700 text-sm">{currency}{data.totalSpent.toFixed(0)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1">Remaining</p>
              <p className={`font-mono font-bold text-sm ${data.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {currency}{Math.abs(data.remaining).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.budgets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-3xl">+</div>
            <p className="font-bold text-slate-700 text-center">No budgets set for this month</p>
            <p className="text-sm text-slate-400 text-center">Create budgets to track your spending.</p>
            <button onClick={() => setShowModal(true)} className="mt-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all">
              Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {data.budgets.map(b => {
              const pct  = Math.min((b.spent / b.monthlyLimit) * 100, 100);
              const over = b.spent > b.monthlyLimit;
              return (
                <div key={b._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-semibold text-slate-800">{b.category}</p>
                      <p className="text-xs text-slate-400">{currency}{b.spent.toFixed(2)} of {currency}{b.monthlyLimit.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-sm font-mono font-bold ${over ? 'text-red-500' : 'text-emerald-500'}`}>
                        {currency}{Math.abs(b.monthlyLimit - b.spent).toFixed(0)} {over ? 'over' : 'left'}
                      </span>
                      <button onClick={() => { if (confirm('Delete?')) deleteBudget(b._id).then(fetchData); }}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : pct > 80 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-slate-400">{pct.toFixed(0)}% used</span>
                    <span className="text-xs text-slate-400">Limit: {currency}{b.monthlyLimit.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && <SetBudgetModal onClose={() => setShowModal(false)} onSaved={fetchData} categories={categories} month={viewDate.month} year={viewDate.year} />}
    </div>
  );
}