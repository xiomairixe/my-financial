import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Categories from './pages/Categories';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNav={setActivePage} />;
      case 'transactions': return <Transactions />;
      case 'budget':       return <Budget />;
      case 'categories':   return <Categories />;
      case 'savings':      return <Savings />;
      case 'reports':      return <Reports />;
      case 'settings':     return <Settings />;
      default:             return <Dashboard onNav={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={activePage} onNav={setActivePage} />
      <main className="flex-1 ml-[220px] min-h-screen bg-slate-50">
        {renderPage()}
      </main>
    </div>
  );
}