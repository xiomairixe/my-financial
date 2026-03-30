import { useState, useEffect, useRef } from 'react';
import Login from './Login';
import Register from './Register';

// ── Inject fonts once ────────────────────────────────────────────────────────
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap';
document.head.appendChild(fontLink);

// ── Tiny hook: element is in viewport ────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Feature card data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '💸',
    title: 'Smart Transaction Tracking',
    desc: 'Log income and expenses instantly. Filter by category, date, or type — find anything in seconds.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    icon: '📊',
    title: 'Visual Budget Control',
    desc: 'Set monthly budgets per category. Watch progress bars fill up and get alerted before you overspend.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    icon: '🧾',
    title: 'Bills & Reminders',
    desc: 'Never miss a due date. Track recurring bills weekly, monthly, or annually and mark them paid.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    icon: '🐖',
    title: 'Savings Goals',
    desc: 'Create savings goals for anything — vacations, gadgets, emergencies. Track progress visually.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.08)',
  },
  {
    icon: '📈',
    title: 'Reports & Insights',
    desc: 'Monthly spending breakdowns, category trends, and income vs expense charts — all in one place.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
  },
  {
    icon: '🏷️',
    title: 'Custom Categories',
    desc: 'Create your own spending categories with custom colors. Organize money the way your life works.',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
  },
];

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Sign up in under a minute. No credit card, no subscriptions — completely free.' },
  { n: '02', title: 'Add your transactions', desc: 'Log what comes in and what goes out. Import categories or build your own.' },
  { n: '03', title: 'Watch your money grow', desc: 'Get clear insights into your habits and start making smarter financial decisions.' },
];

const STATS = [
  { value: '100%', label: 'Free to use' },
  { value: '6+',   label: 'Core modules' },
  { value: '∞',    label: 'Transactions' },
  { value: '24/7', label: 'Always available' },
];

// ── Floating mock card ────────────────────────────────────────────────────────
function MockCard() {
  const items = [
    { icon: '⚡', name: 'Meralco Bill',  cat: 'Utilities',   amt: '-₱2,400', c: '#f59e0b' },
    { icon: '💼', name: 'Freelance Pay', cat: 'Salary',      amt: '+₱18,500', c: '#10b981' },
    { icon: '🌐', name: 'PLDT Fiber',    cat: 'Utilities',   amt: '-₱1,299', c: '#6366f1' },
    { icon: '🛒', name: 'SM Grocery',    cat: 'Food',        amt: '-₱3,640', c: '#ec4899' },
  ];
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '20px',
      width: '100%',
      maxWidth: 340,
      fontFamily: 'DM Sans, sans-serif',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Recent Activity</span>
        <span style={{ color: '#10b981', fontSize: 12, fontWeight: 500 }}>March 2026</span>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 0',
          borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          animation: `slideIn 0.4s ease ${i * 0.1}s both`,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${it.c}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{it.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>{it.name}</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>{it.cat}</div>
          </div>
          <div style={{ color: it.amt.startsWith('+') ? '#10b981' : '#f1f5f9', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{it.amt}</div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>Net this month</span>
          <span style={{ color: '#10b981', fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>+₱11,161</span>
        </div>
        <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
          <div style={{ width: '62%', height: '100%', background: '#10b981', borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

// ── Auth Modal wrapper ────────────────────────────────────────────────────────
function AuthModal({ mode, onLogin, onClose }) {
  const [page, setPage] = useState(mode);
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: -44, right: 0,
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
          width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
          fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
        {page === 'login'
          ? <Login onLogin={onLogin} onGoRegister={() => setPage('register')} />
          : <Register onLogin={onLogin} onGoLogin={() => setPage('login')} />
        }
      </div>
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ f, i, inView }) {
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20,
      padding: '28px 24px',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transitionDelay: `${i * 0.07}s`,
      transitionProperty: 'opacity, transform',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = f.color + '40'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
      <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>{f.title}</h3>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{f.desc}</p>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Landing({ onLogin }) {
  const [auth, setAuth] = useState(null); // 'login' | 'register' | null
  const [scrolled, setScrolled] = useState(false);
  const [featRef, featInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [statsRef, statsInView] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const S = {
    page: {
      background: '#020817',
      minHeight: '100vh',
      fontFamily: 'DM Sans, sans-serif',
      color: '#f1f5f9',
      overflowX: 'hidden',
    },
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%',
      height: 64,
      background: scrolled ? 'rgba(2,8,23,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    logoBox: {
      width: 34, height: 34, background: '#10b981', borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    logoText: { fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' },
    navBtns: { display: 'flex', gap: 10, alignItems: 'center' },
    btnGhost: {
      background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
      color: '#cbd5e1', borderRadius: 10, padding: '8px 18px',
      fontSize: 14, fontWeight: 500, cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
    },
    btnPrimary: {
      background: '#10b981', border: 'none', color: 'white',
      borderRadius: 10, padding: '8px 20px', fontSize: 14, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
    },
  };

  return (
    <div style={S.page}>

      {/* ── Global keyframes ─────────── */}
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulse   { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .btn-ghost:hover { background:rgba(255,255,255,0.08)!important; color:#fff!important; }
        .btn-primary:hover { background:#059669!important; transform:translateY(-1px); }
        .btn-hero:hover { background:#059669!important; transform:translateY(-2px); box-shadow:0 12px 32px rgba(16,185,129,0.4)!important; }
        .btn-hero-2:hover { background:rgba(255,255,255,0.12)!important; }
      `}</style>

      {/* ── Navbar ───────────────────── */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
              <circle cx="7" cy="15" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={S.logoText}>FinTrack</span>
        </div>
        <div style={S.navBtns}>
          <button className="btn-ghost" style={S.btnGhost} onClick={() => setAuth('login')}>Sign In</button>
          <button className="btn-primary" style={S.btnPrimary} onClick={() => setAuth('register')}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 5% 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div style={{ flex: '1 1 400px', minWidth: 300 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 99, padding: '6px 14px', marginBottom: 28,
              animation: 'fadeUp 0.6s ease both',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#10b981', fontSize: 13, fontWeight: 500 }}>Free personal finance tracker</span>
            </div>

            <h1 style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 'clamp(42px, 6vw, 72px)',
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: '#f8fafc',
              margin: '0 0 12px',
              animation: 'fadeUp 0.6s ease 0.1s both',
            }}>
              Your money,<br />
              <em style={{ color: '#10b981' }}>finally clear.</em>
            </h1>

            <p style={{
              color: '#64748b', fontSize: 18, lineHeight: 1.7,
              maxWidth: 460, margin: '0 0 36px',
              animation: 'fadeUp 0.6s ease 0.2s both',
            }}>
              Track spending, plan budgets, manage bills, and build savings — all in one beautifully simple dashboard.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.3s both' }}>
              <button className="btn-hero" onClick={() => setAuth('register')} style={{
                background: '#10b981', border: 'none', color: 'white',
                borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                transition: 'all 0.25s ease',
              }}>
                Start for free →
              </button>
              <button className="btn-hero-2" onClick={() => setAuth('login')} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.25s ease',
              }}>
                Sign in
              </button>
            </div>

            {/* Trust line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 32, animation: 'fadeUp 0.6s ease 0.4s both' }}>
              <div style={{ display: 'flex' }}>
                {['#10b981','#6366f1','#f59e0b','#ec4899'].map((c, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c,
                    border: '2px solid #020817', marginLeft: i ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'white', fontWeight: 700,
                  }}>
                    {['J','M','A','R'][i]}
                  </div>
                ))}
              </div>
              <span style={{ color: '#475569', fontSize: 13 }}>No credit card required. Free forever.</span>
            </div>
          </div>

          {/* Right mockup */}
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', animation: 'float 5s ease-in-out infinite' }}>
            <MockCard />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────── */}
      <div ref={statsRef} style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 5%',
        background: 'rgba(15,23,42,0.6)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center',
              opacity: statsInView ? 1 : 0,
              transform: statsInView ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
            }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, color: '#10b981', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: '#475569', fontSize: 13, marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────── */}
      <section style={{ padding: '96px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Everything you need</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#f1f5f9', margin: 0, lineHeight: 1.15 }}>
              Built for real people,<br /><em>not accountants.</em>
            </h2>
          </div>
          <div ref={featRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} inView={featInView} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────── */}
      <section style={{ padding: '0 5% 96px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Simple process</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#f1f5f9', margin: 0 }}>
              Up and running in minutes.
            </h2>
          </div>
          <div ref={stepsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                padding: '36px 32px',
                background: i === 1 ? 'rgba(16,185,129,0.06)' : 'rgba(15,23,42,0.4)',
                border: i === 1 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: i === 0 ? '20px 0 0 20px' : i === 2 ? '0 20px 20px 0' : 0,
                opacity: stepsInView ? 1 : 0,
                transform: stepsInView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
              }}>
                <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 52, color: 'rgba(16,185,129,0.3)', lineHeight: 1, marginBottom: 18 }}>{s.n}</div>
                <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────── */}
      <section style={{ padding: '0 5% 96px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 28, padding: 'clamp(40px, 6vw, 80px) clamp(28px, 5%, 80px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative ring */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, border: '1px solid rgba(16,185,129,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -120, right: -120, width: 380, height: 380, border: '1px solid rgba(16,185,129,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, color: '#f8fafc', margin: '0 0 16px', lineHeight: 1.1 }}>
              Take control of your<br /><em style={{ color: '#10b981' }}>finances today.</em>
            </h2>
            <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 36px', fontFamily: 'DM Sans, sans-serif' }}>
              Join thousands who already use FinTrack to spend smarter, save more, and stress less about money.
            </p>
            <button className="btn-hero" onClick={() => setAuth('register')} style={{
              background: '#10b981', border: 'none', color: 'white',
              borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
              transition: 'all 0.25s ease',
            }}>
              Create free account →
            </button>
            <p style={{ color: '#334155', fontSize: 13, marginTop: 16, fontFamily: 'DM Sans, sans-serif' }}>No credit card · No subscription · No nonsense</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 5%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: '#10b981', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
              <circle cx="7" cy="15" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ color: '#475569', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>© 2026 FinTrack. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: '#475569', fontSize: 14, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#10b981'}
              onMouseLeave={e => e.target.style.color = '#475569'}>
              {l}
            </a>
          ))}
        </div>
      </footer>

      {/* ── Auth Modal ───────────────── */}
      {auth && <AuthModal mode={auth} onLogin={onLogin} onClose={() => setAuth(null)} />}

    </div>
  );
}