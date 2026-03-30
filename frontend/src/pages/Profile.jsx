export default function Profile({ user, onLogout }) {
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-8 max-w-lg mx-auto w-full">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-8 mb-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">{user?.name}</h2>
              <p className="text-slate-500 text-xs md:text-sm truncate">{user?.email}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-0 divide-y divide-slate-100">
            <div className="flex justify-between py-3">
              <span className="text-xs md:text-sm text-slate-500">Full Name</span>
              <span className="text-xs md:text-sm font-medium text-slate-800 truncate ml-4 max-w-[55%] text-right">{user?.name}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-xs md:text-sm text-slate-500">Email</span>
              <span className="text-xs md:text-sm font-medium text-slate-800 truncate ml-4 max-w-[55%] text-right">{user?.email}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-xs md:text-sm text-slate-500">Plan</span>
              <span className="text-xs md:text-sm font-medium text-emerald-500">Free Plan</span>
            </div>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all active:scale-[0.98]">
          Sign out
        </button>
      </div>
    </div>
  );
}