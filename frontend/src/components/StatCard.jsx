export default function StatCard({ title, value, icon, color, delay = '' }) {
  const colors = {
    blue:   { icon: 'bg-blue-100 text-blue-500' },
    green:  { icon: 'bg-green-100 text-green-500' },
    red:    { icon: 'bg-red-100 text-red-500' },
    purple: { icon: 'bg-purple-100 text-purple-500' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 fade-up ${delay} flex items-center justify-between`}>
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">
          ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
        {icon}
      </div>
    </div>
  );
}