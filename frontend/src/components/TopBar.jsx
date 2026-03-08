import { Search, Bell } from 'lucide-react';

export default function TopBar({ title }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-30">
      <h1 className="text-base font-medium text-slate-600">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search..."
            className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
        </div>
        <button className="relative w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
          AJ
        </div>
      </div>
    </div>
  );
}