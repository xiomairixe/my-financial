import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import TopBar from '../components/TopBar';
import { getReports } from '../utils/api';

const PERIOD_OPTIONS = [
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '1 Year', value: 12 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-xl rounded-xl p-3 border border-slate-100 text-sm">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: ${p.value?.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [months, setMonths] = useState(6);
  const [data, setData] = useState({ monthly: [], avgMonthlyIncome: 0, avgMonthlyExpenses: 0, savingsRate: 0, topCategories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReports(months).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [months]);

  const savingsLabel = data.savingsRate >= 20 ? 'Excellent' : data.savingsRate >= 10 ? 'Good' : 'Needs Work';
  const maxCat = data.topCategories[0]?.total || 1;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Reports" />
      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setMonths(o.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${months === o.value ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. Monthly Income</p>
              <p className="font-mono font-bold text-2xl text-slate-800 mt-1">${Math.round(data.avgMonthlyIncome).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><TrendingUp size={20} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. Monthly Expenses</p>
              <p className="font-mono font-bold text-2xl text-slate-800 mt-1">${Math.round(data.avgMonthlyExpenses).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-400"><TrendingDown size={20} /></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. Savings Rate</p>
              <p className="font-mono font-bold text-2xl text-slate-800 mt-1">{data.savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><TrendingUp size={11} />{savingsLabel}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400"><Activity size={20} /></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthly} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Net Balance Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.monthly} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" name="Net Balance" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Top Spending Categories</h3>
          {data.topCategories.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No expense data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topCategories.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 w-5 text-right">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-700 w-32">{cat.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full transition-all duration-500"
                      style={{ width: `${(cat.total / maxCat) * 100}%` }} />
                  </div>
                  <span className="font-mono text-sm font-semibold text-slate-700 w-20 text-right">${cat.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}