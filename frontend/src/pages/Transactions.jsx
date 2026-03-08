import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import AddTransactionModal from '../components/AddTransactionModal';
import { getTransactions, deleteTransaction, getCategories } from '../utils/api';

const TYPE_COLORS = {
  Transportation: 'bg-orange-100 text-orange-600',
  'Food & Dining': 'bg-red-100 text-red-600',
  Utilities: 'bg-yellow-100 text-yellow-600',
  Housing: 'bg-purple-100 text-purple-600',
  Salary: 'bg-green-100 text-green-600',
  Healthcare: 'bg-teal-100 text-teal-600',
  Entertainment: 'bg-pink-100 text-pink-600',
  Shopping: 'bg-cyan-100 text-cyan-600',
  Education: 'bg-blue-100 text-blue-600',
  Investments: 'bg-indigo-100 text-indigo-600',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([getTransactions({ limit: 100 }), getCategories()]);
      setTransactions(t.data.transactions);
      setCategories(c.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    fetchData();
  };

  const filtered = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || t.type === typeFilter;
    const matchCat = !catFilter || t.category === catFilter;
    return matchSearch && matchType && matchCat;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Transactions" />
      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Transactions</h2>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={16} /> Add Transaction
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">No transactions found</td></tr>
              ) : filtered.map(t => (
                <tr key={t._id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[t.category] || 'bg-slate-100 text-slate-600'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-mono font-semibold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t._id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 inline-flex items-center justify-center text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={fetchData} categories={categories} />}
    </div>
  );
}