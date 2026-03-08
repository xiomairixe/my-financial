import { useState } from 'react';
import { Save, Download, Trash2, Globe } from 'lucide-react';
import TopBar from '../components/TopBar';

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Alex Johnson', email: 'alex@example.com' });
  const [prefs, setPrefs] = useState({ currency: 'USD ($)', theme: 'System Default' });
  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const handleExport = () => {
    const data = { profile, prefs, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fintrack-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" />
      <div className="p-8 flex-1 max-w-5xl">

        {/* Profile */}
        <div className="grid grid-cols-3 gap-8 py-8 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-700 mb-1">Profile</h3>
            <p className="text-sm text-slate-400">Update your personal information and email address.</p>
          </div>
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">AJ</div>
              <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">Change Avatar</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Full Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Email Address</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => handleSave('profile')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all">
                <Save size={14} /> {saved === 'profile' ? '✓ Saved!' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-3 gap-8 py-8 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-700 mb-1">Preferences</h3>
            <p className="text-sm text-slate-400">Manage your currency and app appearance.</p>
          </div>
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Currency</label>
                <select value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                  <option>PHP (₱)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1 block">Theme</label>
                <select value={prefs.theme} onChange={e => setPrefs(p => ({ ...p, theme: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                  <option>System Default</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => handleSave('prefs')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-all">
                <Save size={14} /> {saved === 'prefs' ? '✓ Saved!' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="grid grid-cols-3 gap-8 py-8">
          <div>
            <h3 className="font-semibold text-slate-700 mb-1">Data Management</h3>
            <p className="text-sm text-slate-400">Export your financial data or permanently delete your account data.</p>
          </div>
          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div>
                <p className="font-medium text-slate-700 text-sm">Export Data</p>
                <p className="text-xs text-slate-400">Download all your data as a JSON file.</p>
              </div>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                <Download size={14} /> Export JSON
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50/40 rounded-xl">
              <div>
                <p className="font-medium text-red-600 text-sm">Danger Zone</p>
                <p className="text-xs text-red-400">Permanently delete all your financial data.</p>
              </div>
              <button onClick={() => confirm('Are you sure? This cannot be undone.') && alert('Connect to your backend API to implement this.')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all">
                <Trash2 size={14} /> Clear All Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}