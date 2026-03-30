import { useState, useEffect, useCallback } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import TopBar from '../components/TopBar';
import AddTransactionModal from '../components/AddTransactionModal';
import { useCurrency } from '../context/CurrencyContext';
import { getSummary, getMonthlySummary, getCategorySummary, getTransactions, deleteTransaction, getCategories } from '../utils/api';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const categoryEmojis = {
  Salary: '💼', 'Food & Dining': '🍔', Transportation: '🚌', Entertainment: '🎬',
  Healthcare: '⚕️', Shopping: '🛍️', Utilities: '💡', Education: '📚', Housing: '🏠', Investments: '📈'
};

export default function Dashboard({ onNav }) {
  const currency = useCurrency(); // ← dynamic symbol
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, totalBalance: 0, totalSavings: 0 });
  const [monthly, setMonthly] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [s, m, c, t, cats] = await Promise.all([
        getSummary(), getMonthlySummary(), getCategorySummary(),
        getTransactions({ limit: 10 }), getCategories()
      ]);
      setSummary(s.data);
      setMonthly(m.data);
      setPieData(c.data);
      setTransactions(t.data.transactions);
      setAllCategories(cats.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    fetchAll();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white shadow-xl rounded-xl p-3 border border-slate-100 text-sm">
        <p className="font-medium text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-mono">
            {p.name}: {currency}{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">Welcome back 👋</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shadow-lg shadow-emerald-500/25">
            <Plus size={15} /> <span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
          <StatCard title="Balance"  value={summary.totalBalance}  currency={currency} icon={<Wallet size={18} />}      color="blue"   delay="fade-up-1" />
          <StatCard title="Income"   value={summary.totalIncome}   currency={currency} icon={<TrendingUp size={18} />}  color="green"  delay="fade-up-2" />
          <StatCard title="Expenses" value={summary.totalExpenses} currency={currency} icon={<TrendingDown size={18} />} color="red"   delay="fade-up-3" />
          <StatCard title="Savings"  value={summary.totalSavings}  currency={currency} icon={<PiggyBank size={18} />}  color="purple" delay="fade-up-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="md:col-span-2 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4 text-sm md:text-base">
              Income vs Expenses <span className="text-slate-400 font-normal text-xs">(Last 6 Months)</span>
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthly} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${currency}${v}`} width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"   name="Income"   stroke="#10b981" strokeWidth={2} fill="url(#ig)" dot={{ fill: '#10b981', r: 3 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#eg)" dot={{ fill: '#ef4444', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-3 text-sm md:text-base">
              By Category <span className="text-slate-400 font-normal text-xs">(This Month)</span>
            </h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No expenses</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.slice(0, 4).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 truncate max-w-[90px]">{cat.name}</span>
                      </div>
                      <span className="font-mono font-medium text-slate-700">{currency}{cat.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Recent Transactions</h2>
            <button onClick={() => onNav && onNav('transactions')} className="text-xs text-emerald-500 hover:underline">View all</button>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No transactions yet. Add your first one!</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map(t => (
                <div key={t._id} className="flex items-center justify-between px-4 md:px-5 py-3 hover:bg-slate-50/60 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                      {categoryEmojis[t.category] || '💳'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{t.description}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {t.category} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`font-mono font-semibold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(t._id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={fetchAll} categories={allCategories} />}
    </div>
  );
}