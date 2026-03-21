import { useState } from 'react';
import { registerUser } from '../utils/api';

// ── Validation helpers ────────────────────────────────────────
const validate = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name.trim())
    errors.name = 'Name is required.';
  else if (name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';
  else if (name.trim().length > 50)
    errors.name = 'Name must be 50 characters or less.';

  if (!email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Enter a valid email address.';

  if (!password)
    errors.password = 'Password is required.';
  else if (password.length < 6)
    errors.password = 'Password must be at least 6 characters.';

  if (!confirmPassword)
    errors.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  return errors;
};

export default function Register({ onLogin, onGoLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    // Clear field error as user types
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    // Re-check confirmPassword match live
    if (field === 'password' && form.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: e.target.value !== form.confirmPassword
          ? 'Passwords do not match.' : '',
      }));
    }
    if (field === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        confirmPassword: e.target.value !== form.password
          ? 'Passwords do not match.' : '',
      }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: field class based on error state
  const fieldClass = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors
    ${errors[field]
      ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
      : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
              <circle cx="7" cy="15" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-2xl">FinTrack</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">Start tracking your finances today</p>

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Juan dela Cruz"
                className={fieldClass('name')}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                className={fieldClass('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 6 characters"
                className={fieldClass('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <PasswordStrength password={form.password} />
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Re-enter your password"
                className={fieldClass('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && !errors.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                  <span>✓</span> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <button onClick={onGoLogin} className="text-emerald-500 font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Password strength indicator ───────────────────────────────
function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const score = getStrength(password);
  const levels = [
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak',      color: 'bg-orange-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Good',      color: 'bg-blue-400' },
    { label: 'Strong',    color: 'bg-emerald-500' },
  ];
  const level = levels[Math.min(score, levels.length - 1)];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {levels.map((l, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? level.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Strength: <span className="font-medium text-slate-600">{level.label}</span>
      </p>
    </div>
  );
}