import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  const navLinks = [
    { to: '/', label: 'Scoreboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [
      { to: '/draft', label: 'Draft' },
      { to: '/settings', label: 'Settings' },
    ] : []),
  ];

  return (
    <nav className="bg-fairway text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight text-flag-yellow">
          FM Clubhouse
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn('text-sm font-medium transition-colors hover:text-flag-yellow',
                  isActive ? 'text-flag-yellow' : 'text-green-100')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-golf-green transition-colors"
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
        <div className="md:hidden bg-golf-green border-t border-green-700">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn('block px-4 py-3 text-sm font-medium transition-colors hover:bg-fairway',
                  isActive ? 'text-flag-yellow bg-fairway' : 'text-green-100')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
