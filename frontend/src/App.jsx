import { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowLeftRight, PieChart, PiggyBank, BarChart2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Categories from './pages/Categories';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import useKeepAlive from './hooks/useKeepAlive';

const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: 'Home',         id: 'dashboard' },
  { icon: ArrowLeftRight,  label: 'Transactions', id: 'transactions' },
  { icon: PieChart,        label: 'Budget',       id: 'budget' },
  { icon: PiggyBank,       label: 'Savings',      id: 'savings' },
  { icon: BarChart2,       label: 'Reports',      id: 'reports' },
];

const BASE_URL       = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
const MAX_WAIT_MS    = 60 * 1000;
const RETRY_INTERVAL = 3 * 1000;

async function checkServer() {
  try {
    const res = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch { return false; }
}

export default function App() {
  const [serverReady, setServerReady] = useState(false);
  const [splashMsg,   setSplashMsg]   = useState('Connecting to server');

  const [user,       setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [authPage,   setAuthPage]   = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  useKeepAlive(serverReady);

  // Cold-start polling
  useEffect(() => {
    let alive = true, elapsed = 0;
    const messages = ['Connecting to server', 'Waking up the backend', 'Almost there', 'Just a few more seconds'];
    let msgIdx = 0;

    const msgTimer  = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      if (alive) setSplashMsg(messages[msgIdx]);
    }, 4000);

    const pollTimer = setInterval(async () => {
      elapsed += RETRY_INTERVAL;
      const ok = await checkServer();
      if (ok || elapsed >= MAX_WAIT_MS) {
        clearInterval(pollTimer); clearInterval(msgTimer);
        if (alive) setServerReady(true);
      }
    }, RETRY_INTERVAL);

    checkServer().then(ok => {
      if (ok && alive) { clearInterval(pollTimer); clearInterval(msgTimer); setServerReady(true); }
    });

    return () => { alive = false; clearInterval(pollTimer); clearInterval(msgTimer); };
  }, []);

  // Responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!serverReady) return <SplashScreen message={splashMsg} />;

  const handleLogin      = (u) => { setUser(u); setActivePage('dashboard'); };
  const handleLogout     = ()  => { setUser(null); setAuthPage('login'); };
  const handleNav        = (p) => { setActivePage(p); setMobileOpen(false); };
  // Called by Settings when profile/currency is updated
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return authPage === 'login'
      ? <Login    onLogin={handleLogin} onGoRegister={() => setAuthPage('register')} />
      : <Register onLogin={handleLogin} onGoLogin={()    => setAuthPage('login')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard    onNav={handleNav} />;
      case 'transactions': return <Transactions />;
      case 'budget':       return <Budget />;
      case 'categories':   return <Categories />;
      case 'savings':      return <Savings />;
      case 'reports':      return <Reports />;
      case 'settings':     return (
        <Settings
          user={user}
          onUserUpdate={handleUserUpdate}  // ← updates name/email/currency in App state
          onLogout={handleLogout}          // ← called after account deletion
        />
      );
      case 'profile':      return <Profile user={user} onLogout={handleLogout} />;
      default:             return <Dashboard    onNav={handleNav} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activePage} onNav={handleNav} user={user}
        collapsed={collapsed} onCollapse={setCollapsed}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <main
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 220) }}
      >
        {isMobile && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
            <button onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 active:scale-95 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow shadow-emerald-500/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
                  <path d="M2 10h20" stroke="white" strokeWidth="2"/>
                  <circle cx="7" cy="15" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-slate-800 text-base">FinTrack</span>
            </div>
            <button onClick={() => handleNav('profile')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow active:scale-95 transition-transform">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </button>
          </div>
        )}

        <div className={isMobile ? 'pb-20' : ''}>{renderPage()}</div>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 px-1">
          <div className="flex items-center justify-around">
            {BOTTOM_NAV.map(({ icon: Icon, label, id }) => {
              const isActive = activePage === id;
              return (
                <button key={id} onClick={() => handleNav(id)}
                  className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all active:scale-95 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isActive && <span className="absolute inset-0 bg-emerald-50 rounded-xl" />}
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="relative z-10" />
                  <span className={`text-[10px] relative z-10 font-medium ${isActive ? 'text-emerald-600' : ''}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}