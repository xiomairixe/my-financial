import { useState } from 'react';
import { loginUser } from '../utils/api';

const validate = ({ email, password }) => {
  const errors = {};
  if (!email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Enter a valid email address.';
  if (!password)
    errors.password = 'Password is required.';
  else if (password.length < 6)
    errors.password = 'Password must be at least 6 characters.';
  return errors;
};

// ── Shared dark-theme input style ────────────────────────────
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

export default function Login({ onLogin, onGoRegister }) {
  const [form,      setForm]      = useState({ email: '', password: '' });
  const [rememberMe,setRememberMe]= useState(false);
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState('');

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setLoading(true);
    try {
      const res = await loginUser({ ...form, rememberMe });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
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

      <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 600, margin: '0 0 4px', textAlign: 'center' }}>Welcome back</h1>
      <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', margin: '0 0 28px' }}>Sign in to your account</p>

      {/* API error */}
      {apiError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 18 }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Email */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com"
            style={getInputStyle('email')}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
          />
          {errors.email && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Password</label>
          <input
            type="password" value={form.password} onChange={set('password')}
            placeholder="••••••••"
            style={getInputStyle('password')}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
          />
          {errors.password && <p style={{ color: '#f87171', fontSize: 12, margin: '5px 0 0' }}>{errors.password}</p>}
        </div>

        {/* Remember me */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox" id="rememberMe" checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#10b981', cursor: 'pointer' }}
          />
          <label htmlFor="rememberMe" style={{ color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Remember me for 30 days</label>
        </div>

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', background: loading ? '#0d9668' : '#10b981',
            border: 'none', color: 'white', borderRadius: 12,
            padding: '13px', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            transition: 'all 0.2s', opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#10b981'; }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#475569', fontSize: 14, marginTop: 22 }}>
        Don't have an account?{' '}
        <button onClick={onGoRegister} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif', padding: 0 }}>
          Create one
        </button>
      </p>
    </div>
  );
}