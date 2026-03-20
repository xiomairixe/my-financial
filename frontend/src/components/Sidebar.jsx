import {
  LayoutDashboard, ArrowLeftRight, PieChart, Tag,
  PiggyBank, BarChart2, Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    id: 'dashboard' },
  { icon: ArrowLeftRight,  label: 'Transactions', id: 'transactions' },
  { icon: PieChart,        label: 'Budget',       id: 'budget' },
  { icon: Tag,             label: 'Categories',   id: 'categories' },
  { icon: PiggyBank,       label: 'Savings',      id: 'savings' },
  { icon: BarChart2,       label: 'Reports',      id: 'reports' },
  { icon: Settings,        label: 'Settings',     id: 'settings' },
];

export default function Sidebar({ active, onNav, user, collapsed, onCollapse, mobileOpen, onMobileClose }) {
  const w = collapsed ? 72 : 220;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const NavContent = ({ forMobile = false }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
            <path d="M2 10h20" stroke="white" strokeWidth="2"/>
            <circle cx="7" cy="15" r="1.5" fill="white"/>
          </svg>
        </div>
        {/* Always show label on mobile drawer; respect collapsed on desktop */}
        {(forMobile || !collapsed) && (
          <span className="font-bold text-white text-lg flex-1">FinTrack</span>
        )}
        {/* Close button — mobile drawer only */}
        {forMobile && (
          <button
            onClick={onMobileClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => onNav(id)}
            title={(!forMobile && collapsed) ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left w-full
              ${active === id
                ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {(forMobile || !collapsed) && <span className="text-sm">{label}</span>}
          </button>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-slate-800 px-3 py-4">
        <button
          onClick={() => onNav('profile')}
          title={(!forMobile && collapsed) ? (user?.name || 'User') : undefined}
          className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {(forMobile || !collapsed) && (
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">Free Plan</p>
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────── */}
      <aside
        style={{ width: w, minWidth: w }}
        className="hidden md:flex fixed left-0 top-0 h-full bg-slate-900 flex-col transition-all duration-300 z-50"
      >
        <NavContent forMobile={false} />

        {/* Collapse / expand toggle */}
        <button
          onClick={() => onCollapse(c => !c)}
          className="absolute -right-3 top-16 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-600 transition-all"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── MOBILE DRAWER ────────────────────────────────────────── */}
      {/* Slide-in from the left when mobileOpen = true */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent forMobile={true} />
      </aside>
    </>
  );
}