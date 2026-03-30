import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { getBills, createBill, deleteBill, toggleBillPaid } from '../utils/api';

const FREQ_STYLES = {
  weekly:      'bg-blue-100 text-blue-700',
  'bi-weekly': 'bg-pink-100 text-pink-700',
  monthly:     'bg-violet-100 text-violet-700',
  'semi-annual':'bg-emerald-100 text-emerald-700',
  annual:      'bg-amber-100 text-amber-700',
};

const FREQ_LABELS = {
  weekly:       'Weekly',
  'bi-weekly':  'Bi-weekly',
  monthly:      'Monthly',
  'semi-annual':'Semi-annual',
  annual:       'Annual',
};

const ICONS = ['📺','⚡','🌐','🏠','🎵','💳','📱','🚗','💧','🔥','🏥','📦','🎓','💡'];

function dueDateLabel(dateStr, isPaid, paidAt) {
  if (isPaid && paidAt) {
    return { text: `Paid ${new Date(paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, overdue: false };
  }
  const due = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0)  return { text: `Due ${due.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · ${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { text: 'Due today', overdue: true };
  if (diff <= 3)  return { text: `Due in ${diff}d`, overdue: false };
  return { text: `Due ${due.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`, overdue: false };
}

// ─── Add Bill Modal ───────────────────────────────────────────────────────────
function AddBillModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', amount: '', frequency: 'monthly',
    dueDate: '', icon: '📺', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.dueDate) return;
    setLoading(true);
    try {
      await createBill({ ...form, amount: parseFloat(form.amount) });
      onSaved();
      onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Bill</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => set('icon', ic)}
                  className={`w-9 h-9 text-lg rounded-xl transition-all ${form.icon === ic ? 'bg-emerald-100 ring-2 ring-emerald-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Bill name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g., Netflix, Meralco"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>

          {/* Amount + Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
              <input value={form.amount} onChange={e => set('amount', e.target.value)}
                type="number" min="0" step="0.01" placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Frequency</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="semi-annual">Semi-annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {/* Next due date */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Next due date</label>
            <input value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
              type="date"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="e.g., Auto-charged to BPI card"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || !form.name || !form.amount || !form.dueDate}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-all">
            {loading ? 'Adding...' : 'Add Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bill Row ─────────────────────────────────────────────────────────────────
function BillRow({ bill, currency, onToggle, onDelete }) {
  const { text: dueText, overdue } = dueDateLabel(bill.dueDate, bill.isPaid, bill.paidAt);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(bill._id, !bill.isPaid);
    setToggling(false);
  };

  return (
    <div className={`flex items-center gap-3 px-4 md:px-6 py-4 group transition-all ${bill.isPaid ? 'opacity-50' : ''}`}>
      {/* Check button */}
      <button onClick={handleToggle} disabled={toggling}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          bill.isPaid
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
        }`}>
        {bill.isPaid && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
      </button>

      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
        {bill.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-slate-800 truncate ${bill.isPaid ? 'line-through text-slate-400' : ''}`}>
          {bill.name}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FREQ_STYLES[bill.frequency] || 'bg-slate-100 text-slate-600'}`}>
            {FREQ_LABELS[bill.frequency]}
          </span>
          {bill.notes && (
            <span className="text-xs text-slate-400 truncate max-w-[120px] hidden sm:inline">{bill.notes}</span>
          )}
          <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
            {dueText}
          </span>
        </div>
      </div>

      {/* Amount + delete */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-sm font-mono font-semibold ${bill.isPaid ? 'text-slate-400' : 'text-slate-800'}`}>
          {currency}{parseFloat(bill.amount).toFixed(2)}
        </span>
        <button onClick={() => onDelete(bill._id)}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 inline-flex items-center justify-center text-red-400 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Bills() {
  const currency = useCurrency();
  const [bills, setBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [freqFilter, setFreqFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getBills();
      setBills(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (id, isPaid) => {
    await toggleBillPaid(id, isPaid);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return;
    await deleteBill(id);
    fetchData();
  };

  const filtered = bills.filter(b => !freqFilter || b.frequency === freqFilter);
  const unpaid = filtered.filter(b => !b.isPaid);
  const paid   = filtered.filter(b =>  b.isPaid);

  // Summary — monthly-equivalent totals
  const FREQ_MULTIPLIER = { weekly: 4.33, 'bi-weekly': 2.17, monthly: 1, 'semi-annual': 1/6, annual: 1/12 };
  const monthlyTotal = bills.reduce((s, b) => s + b.amount * (FREQ_MULTIPLIER[b.frequency] ?? 1), 0);
  const paidTotal    = bills.filter(b => b.isPaid).reduce((s, b) => s + b.amount, 0);
  const unpaidTotal  = bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 flex-1">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Bills</h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={15} /> <span className="hidden sm:inline">Add Bill</span><span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Monthly est.</p>
            <p className="text-lg md:text-xl font-bold text-slate-800">{currency}{monthlyTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Paid</p>
            <p className="text-lg md:text-xl font-bold text-emerald-600">{currency}{paidTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">Remaining</p>
            <p className="text-lg md:text-xl font-bold text-amber-500">{currency}{unpaidTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Frequency filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['', 'weekly', 'bi-weekly', 'monthly', 'semi-annual', 'annual'].map(f => (
            <button key={f} onClick={() => setFreqFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                freqFilter === f
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}>
              {f === '' ? 'All' : FREQ_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Bills list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">No bills yet.</p>
            <button onClick={() => setShowModal(true)} className="mt-3 text-emerald-500 text-sm font-medium hover:underline">
              + Add your first bill
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Unpaid section */}
            {unpaid.length > 0 && (
              <>
                <div className="px-4 md:px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Unpaid · {unpaid.length} bill{unpaid.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {unpaid.map(b => (
                    <BillRow key={b._id} bill={b} currency={currency} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              </>
            )}

            {/* Paid section */}
            {paid.length > 0 && (
              <>
                <div className="px-4 md:px-6 py-2.5 bg-slate-50 border-t border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Paid · {paid.length} bill{paid.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {paid.map(b => (
                    <BillRow key={b._id} bill={b} currency={currency} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {showModal && <AddBillModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  );
}