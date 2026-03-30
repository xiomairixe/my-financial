import { useState } from 'react';
import { Save, Download, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { updateProfile, updatePassword, updateCurrency, exportData, deleteAccount } from '../utils/api';

const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'PHP (₱)'];

// ── Small reusable alert ──────────────────────────────────────
function Alert({ type, message }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mt-3 ${
      isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      {isSuccess ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

// ── Confirm-password modal for account deletion ───────────────
function DeleteConfirmModal({ onClose, onConfirm }) {
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleConfirm = async () => {
    if (!password) { setError('Password is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect password.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 text-center mb-1">Delete Account</h2>
        <p className="text-sm text-slate-500 text-center mb-5">
          This will permanently delete your account and <strong>all your data</strong>. This cannot be undone.
        </p>

        <label className="text-xs font-medium text-slate-500 mb-1 block">Enter your password to confirm</label>
        <div className="relative mb-1">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
          />
          <button onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60">
            {loading ? 'Deleting...' : 'Delete Everything'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────
export default function Settings({ user, onUserUpdate, onLogout }) {
  // Profile
  const [profile,        setProfile]        = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileStatus,  setProfileStatus]  = useState({ type: '', message: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password
  const [passwords,       setPasswords]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw,          setShowPw]          = useState({ current: false, new: false, confirm: false });
  const [passwordStatus,  setPasswordStatus]  = useState({ type: '', message: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Currency
  const [currency,        setCurrency]        = useState(user?.currency || 'USD ($)');
  const [currencyStatus,  setCurrencyStatus]  = useState({ type: '', message: '' });
  const [currencyLoading, setCurrencyLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Handlers ────────────────────────────────────────────────

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileStatus({ type: '', message: '' });
    try {
      const res = await updateProfile(profile);
      const updated = res.data.user;
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updated));
      onUserUpdate?.(updated);
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordStatus({ type: '', message: '' });
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCurrencySave = async () => {
    setCurrencyLoading(true);
    setCurrencyStatus({ type: '', message: '' });
    try {
      const res = await updateCurrency({ currency });
      const updated = res.data.user;
      localStorage.setItem('user', JSON.stringify(updated));
      onUserUpdate?.(updated);
      setCurrencyStatus({ type: 'success', message: 'Currency preference saved.' });
    } catch (err) {
      setCurrencyStatus({ type: 'error', message: err.response?.data?.error || 'Failed to save currency.' });
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportData();
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'fintrack-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteConfirm = async (password) => {
    await deleteAccount({ password });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout?.();
  };

  const pwField = (key, placeholder, showKey) => (
    <div className="relative">
      <input
        type={showPw[showKey] ? 'text' : 'password'}
        value={passwords[key]}
        onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
      />
      <button onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {showPw[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  const SectionLabel = ({ title, desc }) => (
    <div className="hidden md:block">
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );

  const MobileLabel = ({ title, desc }) => (
    <div className="mb-3 md:hidden">
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 flex-1 max-w-5xl">

        {/* ── Profile ──────────────────────────────────────── */}
        <section className="mb-4">
          <MobileLabel title="Profile" desc="Update your name and email." />
          <div className="md:grid md:grid-cols-3 md:gap-8 md:py-8 md:border-b md:border-slate-100">
            <SectionLabel title="Profile" desc="Update your personal information and email address." />
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">Full Name</label>
                  <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">Email Address</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
                </div>
              </div>
              <Alert type={profileStatus.type} message={profileStatus.message} />
              <div className="mt-4 flex justify-end">
                <button onClick={handleProfileSave} disabled={profileLoading}
                  className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-all">
                  <Save size={14} /> {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Change Password ───────────────────────────────── */}
        <section className="mb-4">
          <MobileLabel title="Change Password" desc="Update your account password." />
          <div className="md:grid md:grid-cols-3 md:gap-8 md:py-8 md:border-b md:border-slate-100">
            <SectionLabel title="Change Password" desc="Choose a strong password with at least 6 characters." />
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">Current Password</label>
                  {pwField('currentPassword', '••••••••', 'current')}
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">New Password</label>
                  {pwField('newPassword', 'Min. 6 characters', 'new')}
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">Confirm New Password</label>
                  {pwField('confirmPassword', 'Re-enter new password', 'confirm')}
                </div>
              </div>
              <Alert type={passwordStatus.type} message={passwordStatus.message} />
              <div className="mt-4 flex justify-end">
                <button onClick={handlePasswordSave} disabled={passwordLoading}
                  className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-all">
                  <Save size={14} /> {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Currency ──────────────────────────────────────── */}
        <section className="mb-4">
          <MobileLabel title="Preferences" desc="Set your preferred currency." />
          <div className="md:grid md:grid-cols-3 md:gap-8 md:py-8 md:border-b md:border-slate-100">
            <SectionLabel title="Preferences" desc="Choose your preferred currency for displaying amounts." />
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div>
                <label className="text-xs md:text-sm font-medium text-slate-600 mb-1 block">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Alert type={currencyStatus.type} message={currencyStatus.message} />
              <div className="mt-4 flex justify-end">
                <button onClick={handleCurrencySave} disabled={currencyLoading}
                  className="flex items-center gap-2 px-4 md:px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60 transition-all">
                  <Save size={14} /> {currencyLoading ? 'Saving...' : 'Save Preference'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Data Management ───────────────────────────────── */}
        <section>
          <MobileLabel title="Data Management" desc="Export or delete your account data." />
          <div className="md:grid md:grid-cols-3 md:gap-8 md:py-8">
            <SectionLabel title="Data Management" desc="Export your financial data or permanently delete your account." />
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-3">

              {/* Export */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700 text-sm">Export Data</p>
                  <p className="text-xs text-slate-400">Download all your transactions, budgets, and savings as JSON.</p>
                </div>
                <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-600 hover:bg-slate-50 transition-all flex-shrink-0">
                  <Download size={13} /> Export
                </button>
              </div>

              {/* Delete */}
              <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50/40 rounded-xl gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-red-600 text-sm">Danger Zone</p>
                  <p className="text-xs text-red-400">Permanently delete your account and all data. Cannot be undone.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-red-500 text-white rounded-xl text-xs md:text-sm font-medium hover:bg-red-600 transition-all flex-shrink-0">
                  <Trash2 size={13} /> Delete
                </button>
              </div>

            </div>
          </div>
        </section>

      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}