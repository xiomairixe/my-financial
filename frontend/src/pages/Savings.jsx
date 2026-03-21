import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Pencil, Trash2, Calendar } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useCurrency } from '../context/CurrencyContext';
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '../utils/api';

const GOAL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function GoalModal({ onClose, onSaved, goal }) {
  const currency = useCurrency();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(goal ? {
    name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount,
    deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : today,
    color: goal.color
  } : { name: '', targetAmount: '', currentAmount: '', deadline: today, color: '#3b82f6' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.targetAmount) return;
    setLoading(true);
    try {
      const data = { ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount || 0) };
      if (goal) await updateSavingsGoal(goal._id, data);
      else await createSavingsGoal(data);
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">{goal ? 'Edit' : 'Create'} Savings Goal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Goal Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Emergency Fund"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Target</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
                <input type="number" min="0" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                  placeholder="0" className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Current</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
                <input type="number" min="0" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                  placeholder="0" className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Color</label>
            <div className="flex gap-3">
              {GOAL_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-60">
            {loading ? 'Saving...' : (goal ? 'Save Changes' : 'Create Goal')}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddFundsModal({ goal, onClose, onSaved }) {
  const currency = useCurrency();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await updateSavingsGoal(goal._id, { currentAmount: goal.currentAmount + parseFloat(amount) });
      onSaved(); onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Add Funds</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Adding to <strong>{goal.name}</strong></p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currency}</span>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Funds'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Savings() {
  const currency = useCurrency();
  const [goals, setGoals] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [addFundsGoal, setAddFundsGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const r = await getSavingsGoals(); setGoals(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await deleteSavingsGoal(id);
    fetchData();
  };

  const daysLeft = (deadline) => {
    if (!deadline) return '—';
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff}d left` : '0d left';
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Savings" />
      <div className="p-4 md:p-8 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Savings Goals</h2>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={15} /> Create Goal
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center gap-3">
            <p className="font-bold text-slate-700">No savings goals yet</p>
            <p className="text-sm text-slate-400 text-center">Create your first savings goal to start tracking!</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600">
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => {
              const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
              const r   = 38;
              const circumference = 2 * Math.PI * r;
              return (
                <div key={goal._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="h-1.5" style={{ background: goal.color }} />
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1 mr-2">
                        <h3 className="font-bold text-slate-800 text-base md:text-lg truncate">{goal.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 flex-wrap">
                          <Calendar size={11} />
                          <span>{goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                          <span>•</span>
                          <span>{daysLeft(goal.deadline)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditGoal(goal)} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(goal._id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-slate-400">Current</p>
                            <p className="font-mono font-bold text-slate-800 text-sm">{currency}{goal.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Target</p>
                            <p className="font-mono font-semibold text-slate-500 text-sm">{currency}{goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                          </div>
                        </div>
                        <button onClick={() => setAddFundsGoal(goal)}
                          className="w-full md:w-auto px-4 py-2 bg-slate-800 text-white rounded-xl text-xs md:text-sm font-medium hover:bg-slate-700 transition-all text-center">
                          Add Funds
                        </button>
                      </div>
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <svg width="90" height="90" className="-rotate-90">
                          <circle cx="45" cy="45" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle cx="45" cy="45" r={r} fill="none" stroke={goal.color} strokeWidth="8"
                            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                            strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                        </svg>
                        <span className="absolute font-bold text-lg text-slate-800">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate   && <GoalModal onClose={() => setShowCreate(false)} onSaved={fetchData} />}
      {editGoal     && <GoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSaved={fetchData} />}
      {addFundsGoal && <AddFundsModal goal={addFundsGoal} onClose={() => setAddFundsGoal(null)} onSaved={fetchData} />}
    </div>
  );
}