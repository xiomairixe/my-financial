import { useState } from 'react';
import TopBar from '../components/TopBar';

export default function Profile({ user, onLogout }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Profile" />
      <div className="p-8 max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-4">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Full Name</span>
              <span className="text-sm font-medium text-slate-800">{user?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-800">{user?.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-slate-500">Plan</span>
              <span className="text-sm font-medium text-emerald-500">Free Plan</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all">
          Sign out
        </button>
      </div>
    </div>
  );
}