import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';

const SEV = {
  high:   { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', icon: AlertTriangle, iconColor: '#dc2626', label: '#dc2626', dot: '#ef4444' },
  medium: { bg: '#fffbeb', border: '#fde68a', iconBg: '#fef3c7', icon: AlertCircle,  iconColor: '#d97706', label: '#92400e', dot: '#f59e0b' },
  low:    { bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', icon: Info,          iconColor: '#2563eb', label: '#1e40af', dot: '#60a5fa' },
};

export default function AnomalyAlerts({ onNav }) {
  const currency = useCurrency();
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [dismissed,setDismissed]= useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/ai/alerts?currency=${currency}`);
        setAlerts(res.data.alerts || []);
      } catch { /* silent fail — alerts are non-critical */ }
      finally { setLoading(false); }
    })();
  }, []);

  const visible = alerts.filter((_, i) => !dismissed.has(i));

  if (loading || visible.length === 0) return null;

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden', marginBottom: 20,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <style>{`
        @keyframes alertSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .dismiss-btn:hover { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid #f8fafc',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <ShieldAlert size={16} color="#ef4444" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          AI Alerts
        </span>
        <div style={{
          marginLeft: 4, background: '#ef4444', color: 'white',
          borderRadius: 99, fontSize: 11, fontWeight: 700,
          padding: '1px 7px',
        }}>
          {visible.length}
        </div>
      </div>

      {/* Alerts */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((alert, i) => {
          const s = SEV[alert.severity] || SEV.low;
          const Icon = s.icon;
          const originalIndex = alerts.indexOf(alert);

          return (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.border}`,
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              animation: `alertSlide 0.3s ease ${i * 0.06}s both`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 15,
              }}>
                {alert.icon || <Icon size={15} color={s.iconColor} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.label, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{alert.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.55 }}>{alert.detail}</p>
              </div>
              <button
                className="dismiss-btn"
                onClick={() => setDismissed(prev => new Set([...prev, originalIndex]))}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', flexShrink: 0, transition: 'background 0.15s',
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      {alerts.some(a => a.severity === 'high') && onNav && (
        <div style={{ padding: '0 16px 14px' }}>
          <button onClick={() => onNav('bills')} style={{
            width: '100%', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 10,
            padding: '8px', fontSize: 12, fontWeight: 600,
            color: '#dc2626', cursor: 'pointer', transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            Review overdue bills →
          </button>
        </div>
      )}
    </div>
  );
}