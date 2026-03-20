import { useState } from 'react';
import Sidebar from './components/Sidebar';
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

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });
  const [authPage, setAuthPage] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false); // ← LIFTED UP DITO

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthPage('login');
  };

  if (!user) {
    return authPage === 'login'
      ? <Login onLogin={handleLogin} onGoRegister={() => setAuthPage('register')} />
      : <Register onLogin={handleLogin} onGoLogin={() => setAuthPage('login')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNav={setActivePage} />;
      case 'transactions': return <Transactions />;
      case 'budget':       return <Budget />;
      case 'categories':   return <Categories />;
      case 'savings':      return <Savings />;
      case 'reports':      return <Reports />;
      case 'settings':     return <Settings />;
      case 'profile':      return <Profile user={user} onLogout={handleLogout} />;
      default:             return <Dashboard onNav={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ← IPINASA ang collapsed at setCollapsed sa Sidebar */}
      <Sidebar
        active={activePage}
        onNav={setActivePage}
        user={user}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      {/* ← DYNAMIC na ang margin — nag-a-adjust kapag nag-collapse */}
      <main
        className="flex-1 min-h-screen bg-slate-50 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 220 }}
      >
        {renderPage()}
      </main>
    </div>
  );
}