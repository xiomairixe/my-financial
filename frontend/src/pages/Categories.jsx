import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '../utils/api';

const COLORS = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#64748b'];

const TYPE_BADGE = {
  expense: 'bg-red-100 text-red-600',
  income: 'bg-green-100 text-green-600',
  both: 'bg-blue-100 text-blue-600',
};

function AddCategoryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#ef4444' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name) return;
    setLoading(true);
    try { await createCategory(form); onSaved(); onClose(); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add Category</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Subscriptions"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
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
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const r = await getCategories(); setCategories(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id);
    fetchData();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={16} /> Add Category
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 group hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: cat.color + '25', color: cat.color }}>
                  {cat.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{cat.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[cat.type]}`}>{cat.type}</span>
                    <span className="text-xs text-slate-400">{cat.txCount} tx</span>
                  </div>
                </div>
                {!cat.isDefault && (
                  <button onClick={() => handleDelete(cat._id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <AddCategoryModal onClose={() => setShowModal(false)} onSaved={fetchData} />}
    </div>
  );
}