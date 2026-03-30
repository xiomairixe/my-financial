import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { getReports } from '../utils/api';

const PERIOD_OPTIONS = [
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '1Y', value: 12 },
];

export default function Reports() {
  const currency = useCurrency();
  const [months, setMonths] = useState(6);
  const [data, setData] = useState({ monthly: [], avgMonthlyIncome: 0, avgMonthlyExpenses: 0, savingsRate: 0, topCategories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReports(months).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [months]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white shadow-xl rounded-xl p-3 border border-slate-100 text-sm">
        <p className="font-medium text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {currency}{p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  };

  const savingsLabel = data.savingsRate >= 20 ? 'Excellent' : data.savingsRate >= 10 ? 'Good' : 'Needs Work';
  const maxCat = data.topCategories[0]?.total || 1;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 flex-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Reports</h2>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setMonths(o.value)}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${months === o.value ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-400">Avg. Monthly Income</p>
              <p className="font-mono font-bold text-xl md:text-2xl text-slate-800 mt-1">{currency}{Math.round(data.avgMonthlyIncome).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><TrendingUp size={18} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-400">Avg. Monthly Expenses</p>
              <p className="font-mono font-bold text-xl md:text-2xl text-slate-800 mt-1">{currency}{Math.round(data.avgMonthlyExpenses).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-400"><TrendingDown size={18} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-400">Avg. Savings Rate</p>
              <p className="font-mono font-bold text-xl md:text-2xl text-slate-800 mt-1">{data.savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={11} />{savingsLabel}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400"><Activity size={18} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm md:text-base">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthly} margin={{ left: -15, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${currency}${v}`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm md:text-base">Net Balance Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.monthly} margin={{ left: -15, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${currency}${v}`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" name="Net Balance" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm md:text-base">Top Spending Categories</h3>
          {data.topCategories.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No expense data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topCategories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-4 text-right flex-shrink-0">{i + 1}</span>
                  <span className="text-xs md:text-sm font-medium text-slate-700 w-24 md:w-32 truncate flex-shrink-0">{cat.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full transition-all duration-500"
                      style={{ width: `${(cat.total / maxCat) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs md:text-sm font-semibold text-slate-700 w-20 text-right flex-shrink-0">{currency}{cat.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}