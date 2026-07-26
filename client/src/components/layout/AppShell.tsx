import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faGaugeHigh,
  faMagnifyingGlass,
  faRightFromBracket,
  faUser,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const baseLinks: {
  to: string;
  label: string;
  icon: IconDefinition;
  end: boolean;
}[] = [
  { to: '/dashboard', label: 'Overview', icon: faGaugeHigh, end: true },
  { to: '/dashboard/applications', label: 'Applications', icon: faFileLines, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: faUser, end: false },
];

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex items-center gap-2 px-3 py-2 text-[14px] font-semibold transition-colors',
    isActive
      ? 'text-[var(--color-sr-yellow)]'
      : 'text-white/85 hover:text-[var(--color-sr-yellow)]',
  ].join(' ');
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const links =
    user?.role === 'admin'
      ? [
          ...baseLinks,
          {
            to: '/dashboard/admin',
            label: 'Admin',
            icon: faUserShield,
            end: false,
          },
        ]
      : baseLinks;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    toast.success('Logged out');
    closeMenu();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[var(--color-sr-navy)] text-white">
      <div className="sr-container flex h-14 items-center justify-between gap-3 md:h-16">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/dashboard" className="shrink-0" onClick={closeMenu}>
            <img
              src="/sr/logo.png"
              alt="AfriRoar"
              className="h-7 w-auto object-contain object-left md:h-8"
            />
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Workspace">
            {links.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <FontAwesomeIcon icon={icon} className="text-[14px] opacity-90" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-white/80 transition hover:text-[var(--color-sr-yellow)]"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[13px]" />
            Browse scholarships
          </Link>
          <span className="mx-1 hidden h-5 w-px bg-white/20 lg:block" aria-hidden />
          <span className="hidden max-w-[140px] truncate text-[13px] text-white/70 lg:inline">
            {firstName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-semibold text-white/85 transition hover:text-[var(--color-sr-yellow)]"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="text-[13px]" />
            Log out
          </button>
        </div>

        <button
          type="button"
          className="inline-flex p-2 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[var(--color-sr-navy)] md:hidden">
          <nav className="sr-container flex flex-col py-2" aria-label="Workspace mobile">
            {links.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2.5 px-1 py-3 text-[15px] font-semibold',
                    isActive ? 'text-[var(--color-sr-yellow)]' : 'text-white',
                  ].join(' ')
                }
              >
                <FontAwesomeIcon icon={icon} className="w-4 text-[14px] opacity-90" />
                {label}
              </NavLink>
            ))}
            <Link
              to="/scholarships"
              onClick={closeMenu}
              className="flex items-center gap-2.5 px-1 py-3 text-[15px] font-semibold text-white/90"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 text-[14px] opacity-90" />
              Browse scholarships
            </Link>
            <div className="mt-1 border-t border-white/15 pt-2">
              <p className="px-1 py-2 text-[13px] text-white/60">{user?.email || firstName}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-1 py-3 text-left text-[15px] font-semibold text-white"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-[14px] opacity-90" />
                Log out
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
