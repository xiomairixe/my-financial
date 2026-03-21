// src/components/SplashScreen.jsx
// Lalabas lang kapag natulog pa rin ang server kahit may keep-alive.

export default function SplashScreen({ message = 'Connecting to server' }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 select-none">

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #10b981 0%, transparent 70%)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Main content */}
      <div
        className="relative flex flex-col items-center gap-6"
        style={{ animation: 'fade-up 0.6s ease-out both' }}
      >
        {/* Spinning rings + logo */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-24 h-24 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#10b981',
              borderRightColor: '#10b98130',
              animation: 'spin 1.4s linear infinite',
            }}
          />
          <div
            className="absolute w-16 h-16 rounded-full border-2 border-transparent"
            style={{
              borderBottomColor: '#34d399',
              borderLeftColor: '#34d39930',
              animation: 'spin 1s linear infinite reverse',
            }}
          />
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2"/>
              <path d="M2 10h20" stroke="white" strokeWidth="2"/>
              <circle cx="7" cy="15" r="1.5" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">FinTrack</h1>
          <p className="text-slate-400 text-sm">Your personal finance tracker</p>
        </div>

        {/* Status */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">{message}</span>
            <LoadingDots />
          </div>
          <div className="w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
              style={{ animation: 'progress-bar 2.5s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <p
        className="absolute bottom-8 text-slate-600 text-xs"
        style={{ animation: 'fade-up 0.8s 0.4s ease-out both' }}
      >
        Free hosting — waking up the server ☕
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.15; }
          50%       { transform: translate(-50%,-50%) scale(1.2); opacity: 0.25; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-bar {
          0%   { width: 0%;  margin-left: 0%; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%;  margin-left: 100%; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 bg-emerald-400 rounded-full inline-block"
          style={{ animation: `dot-bounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}