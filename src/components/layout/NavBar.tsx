import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Crest } from '@/components/ui/Crest';

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { isAdmin, isUser, user, loading } = useAuth();
  const [theme, , toggleTheme] = useTheme();

  const navLinks = [
    { to: '/', label: 'Scoreboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [
      { to: '/draft', label: 'Draft' },
      { to: '/settings', label: 'Settings' },
    ] : []),
  ];

  const linkBase =
    'relative text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors';
  const linkClass = (isActive: boolean) =>
    cn(linkBase, isActive ? 'text-brass-bright' : 'text-[#C9D7C5] hover:text-brass-bright');

  const initials =
    (user?.email?.[0] ?? 'M').toUpperCase() +
    (user?.email?.split('@')[0]?.[1]?.toUpperCase() ?? 'R');

  const signOutLabel = isAdmin
    ? `Sign out (${user?.email?.split('@')[0]})`
    : 'Sign out';

  return (
    <nav className="leather sticky top-0 z-50 text-white">
      <div className="max-w-[1280px] mx-auto h-[60px] px-4 sm:px-7 grid grid-cols-[auto_1fr_auto] items-center gap-6">
        {/* Logo / wordmark */}
        <Link to="/" className="flex items-center gap-3">
          <Crest size={36} />
          <div className="hidden sm:block leading-tight">
            <div className="font-serif text-[18px] font-medium text-[#F2EBD8]">
              FM <em className="not-italic font-serif italic text-brass-bright">Clubhouse</em>
            </div>
            <div className="smallcaps text-[9px] text-[#A8B6A2] mt-0.5">
              Est. MMXXIV · Members Only
            </div>
          </div>
        </Link>

        {/* Desktop nav (center) */}
        <div className="hidden md:flex items-center justify-center gap-7">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                cn(linkClass(isActive), 'pb-1')
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-[3px] w-[18px]"
                      style={{ background: 'var(--brass-bright)' }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right rail */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-brass/40 text-brass-bright hover:bg-black/20 transition-colors"
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* Live pill — hidden on mobile */}
          <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.22em] font-semibold text-brass-bright"
                style={{ borderColor: 'rgba(212,179,84,0.45)' }}>
            <span
              className="pulse-live block h-1.5 w-1.5 rounded-full"
              style={{ background: '#E26B5C', boxShadow: '0 0 6px rgba(226,107,92,0.7)' }}
            />
            Live
          </span>

          {!loading && (isAdmin || isUser) && (
            <>
              <button
                onClick={() => signOut(auth)}
                className="hidden md:inline text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9D7C5] hover:text-brass-bright transition-colors"
              >
                {signOutLabel}
              </button>
              {/* Brass avatar */}
              <div
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-green-900"
                style={{
                  background:
                    'linear-gradient(135deg, #EBD897 0%, #D4B354 45%, #8A6A12 100%)',
                  letterSpacing: '0.05em',
                }}
                title={user?.email ?? undefined}
              >
                {initials}
              </div>
            </>
          )}
          {!loading && !isAdmin && !isUser && (
            <NavLink to="/login"
              className={({ isActive }) =>
                cn(linkBase, isActive ? 'text-brass-bright' : 'text-[#C9D7C5] hover:text-brass-bright')
              }
            >
              Sign in
            </NavLink>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-black/20 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={cn('block w-5 h-0.5 bg-white mb-1 transition-transform', open && 'rotate-45 translate-y-1.5')} />
            <span className={cn('block w-5 h-0.5 bg-white mb-1 transition-opacity', open && 'opacity-0')} />
            <span className={cn('block w-5 h-0.5 bg-white transition-transform', open && '-rotate-45 -translate-y-1.5')} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: 'rgba(212,179,84,0.25)', background: 'var(--green-deep)' }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn('block px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors',
                  isActive ? 'text-brass-bright' : 'text-[#C9D7C5] hover:text-brass-bright')
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => { toggleTheme(); }}
            className="block w-full text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9D7C5] hover:text-brass-bright transition-colors"
          >
            Theme: {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
          {!loading && (
            (isAdmin || isUser)
              ? <button
                  onClick={() => { signOut(auth); setOpen(false); }}
                  className="block w-full text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9D7C5] hover:text-brass-bright transition-colors"
                >
                  {signOutLabel}
                </button>
              : <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('block px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors',
                      isActive ? 'text-brass-bright' : 'text-[#C9D7C5] hover:text-brass-bright')
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
