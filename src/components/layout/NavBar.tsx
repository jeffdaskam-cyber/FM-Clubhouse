import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isUser, user, loading } = useAuth();

  const navLinks = [
    { to: '/', label: 'Scoreboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [
      { to: '/draft', label: 'Draft' },
      { to: '/settings', label: 'Settings' },
    ] : []),
  ];

  const linkClass = (isActive: boolean) =>
    cn('text-sm font-medium transition-colors hover:text-gold-400',
      isActive ? 'text-gold-400' : 'text-green-100');

  const signOutLabel = isAdmin
    ? `Sign out (${user?.email?.split('@')[0]})`
    : 'Sign out';

  return (
    <nav className="bg-green-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-gold-400">
          <img src="/icons/Logo_192.png" alt="" className="w-8 h-8 rounded-sm object-contain shrink-0" />
          FM Clubhouse
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => linkClass(isActive)}
            >
              {label}
            </NavLink>
          ))}

          {!loading && (
            (isAdmin || isUser)
              ? <button
                  onClick={() => signOut(auth)}
                  className="text-sm font-medium text-green-100 hover:text-gold-400 transition-colors"
                >
                  {signOutLabel}
                </button>
              : <NavLink to="/login" className={({ isActive }) => linkClass(isActive)}>
                  Sign in
                </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-green-700 transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={cn('block w-5 h-0.5 bg-white mb-1 transition-transform', open && 'rotate-45 translate-y-1.5')} />
          <span className={cn('block w-5 h-0.5 bg-white mb-1 transition-opacity', open && 'opacity-0')} />
          <span className={cn('block w-5 h-0.5 bg-white transition-transform', open && '-rotate-45 -translate-y-1.5')} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-green-700 border-t border-green-900">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn('block px-4 py-3 text-sm font-medium transition-colors hover:bg-green-800',
                  isActive ? 'text-gold-400 bg-green-800' : 'text-green-100')
              }
            >
              {label}
            </NavLink>
          ))}

          {!loading && (
            (isAdmin || isUser)
              ? <button
                  onClick={() => { signOut(auth); setOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-green-100 hover:bg-green-800 transition-colors"
                >
                  {signOutLabel}
                </button>
              : <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('block px-4 py-3 text-sm font-medium transition-colors hover:bg-green-800',
                      isActive ? 'text-gold-400 bg-green-800' : 'text-green-100')
                  }
                >
                  Sign in
                </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}
