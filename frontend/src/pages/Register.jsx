import { useState } from 'react';
import { registerUser } from '../utils/api';

const validate = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name.trim())                                          errors.name = 'Name is required.';
  else if (name.trim().length < 2)                           errors.name = 'Name must be at least 2 characters.';
  else if (name.trim().length > 50)                          errors.name = 'Name must be 50 characters or less.';
  if (!email.trim())                                         errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))errors.email = 'Enter a valid email address.';
  if (!password)                                             errors.password = 'Password is required.';
  else if (password.length < 6)                              errors.password = 'Password must be at least 6 characters.';
  if (!confirmPassword)                                      errors.confirmPassword = 'Please confirm your password.';
  else if (password !== confirmPassword)                     errors.confirmPassword = 'Passwords do not match.';
  return errors;
};

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '11px 16px',
  color: '#f1f5f9', fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none', transition: 'border-color 0.2s, background 0.2s',
};
const inputError = { ...inputBase, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.06)' };

// ── Password strength ─────────────────────────────────────────
function PasswordStrength({ password }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const levels = [
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#3b82f6' },
    { label: 'Strong',    color: '#10b981' },
  ];
  const level = levels[Math.min(score, 4)];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {levels.map((l, i) => (
          <div key={i} style={{
            height: 3, flex: 1, borderRadius: 99,
            background: i < score ? level.color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
        Strength: <span style={{ color: level.color, fontWeight: 500 }}>{level.label}</span>
      </p>
    </div>
  );
}

export default function Register({ onLogin, onGoLogin }) {
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState('');

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    if (field === 'password' && form.confirmPassword) {
      setErrors(p => ({ ...p, confirmPassword: val !== form.confirmPassword ? 'Passwords do not match.' : '' }));
    }
    if (field === 'confirmPassword') {
      setErrors(p => ({ ...p, confirmPassword: val !== form.password ? 'Passwords do not match.' : '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setLoading(true);
    try {
      const res = await registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password });
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

  const getInputStyle = (field) => ({
    ...(errors[field] ? inputError : inputBase),
    ...(focused === field ? { borderColor: errors[field] ? 'rgba(239,68,68,0.8)' : '#10b981', background: 'rgba(255,255,255,0.07)' } : {}),
  });

  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 24,
      padding: '36px 32px',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ width: 38, height: 38, background: '#10b981', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
            <path d="M2 10h20" stroke="white" strokeWidth="2"/>
            <circle cx="7" cy="15" r="1.5" fill="white"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 20, letterSpacing: '-0.02em' }}>FinTrack</span>
      </div>

      <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 600, margin: '0 0 4px', textAlign: 'center' }}>Create account</h1>
      <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', margin: '0 0 28px' }}>Start tracking your finances today</p>

      {/* API error */}
      {apiError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 18 }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Full Name */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Full Name</label>
          <input
            type="text" value={form.name} onChange={set('name')}
            placeholder="Juan dela Cruz"
            style={getInputStyle('name')}
            onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
          />
          {errors.name && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com"
            style={getInputStyle('email')}
            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
          />
          {errors.email && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
          <input
            type="password" value={form.password} onChange={set('password')}
            placeholder="Min. 6 characters"
            style={getInputStyle('password')}
            onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
          />
          {errors.password && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.password}</p>}
          {form.password.length > 0 && <PasswordStrength password={form.password} />}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Confirm Password</label>
          <input
            type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
            placeholder="Re-enter your password"
            style={getInputStyle('confirmPassword')}
            onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused('')}
          />
          {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.confirmPassword}</p>}
          {form.confirmPassword.length > 0 && !errors.confirmPassword && form.password === form.confirmPassword && (
            <p style={{ color: '#10b981', fontSize: 12, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>✓</span> Passwords match
            </p>
          )}
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', background: '#10b981', border: 'none',
            color: 'white', borderRadius: 12, padding: '13px',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            transition: 'all 0.2s', opacity: loading ? 0.8 : 1,
            marginTop: 4,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#10b981'; }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#475569', fontSize: 14, marginTop: 22 }}>
        Already have an account?{' '}
        <button onClick={onGoLogin} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', padding: 0 }}>
          Sign in
        </button>
      </p>
    </div>
  );
}