import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookmark,
  faBell,
  faBriefcase,
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
import NotificationBell from '@/components/NotificationBell';

const baseLinks: {
  to: string;
  label: string;
  icon: IconDefinition;
  end: boolean;
}[] = [
  { to: '/dashboard', label: 'Overview', icon: faGaugeHigh, end: true },
  { to: '/dashboard/applications', label: 'Applications', icon: faFileLines, end: false },
  { to: '/dashboard/job-applications', label: 'Jobs', icon: faBriefcase, end: false },
  { to: '/dashboard/saved', label: 'Saved', icon: faBookmark, end: false },
  { to: '/dashboard/notifications', label: 'Alerts', icon: faBell, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: faUser, end: false },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-[13px] font-semibold leading-none transition-colors',
    isActive
      ? 'text-[var(--color-sr-yellow)]'
      : 'text-white/85 hover:text-[var(--color-sr-yellow)]',
  ].join(' ');
}

const utilityLinkClass =
  'inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-[13px] font-semibold leading-none text-white/80 transition-colors hover:text-[var(--color-sr-yellow)]';

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
    <>
      <header className="sr-safe-top fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container flex h-14 min-w-0 items-center gap-3 md:h-16 md:gap-4">
          <Link
            to="/dashboard"
            className="flex h-9 shrink-0 items-center"
            onClick={closeMenu}
          >
            <img
              src="/sr/logo.png"
              alt="AfriRoar"
              className="block h-7 w-auto max-w-[132px] object-contain object-left md:h-8 md:max-w-[148px]"
            />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex"
            aria-label="Workspace"
          >
            {links.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                <FontAwesomeIcon
                  icon={icon}
                  className="fa-fw text-[12px] leading-none opacity-90"
                  aria-hidden
                />
                <span className="leading-none">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-0.5 lg:flex">
            <NotificationBell />
            <Link to="/jobs" className={utilityLinkClass}>
              <FontAwesomeIcon
                icon={faBriefcase}
                className="fa-fw text-[12px] leading-none opacity-90"
                aria-hidden
              />
              <span className="leading-none">Browse jobs</span>
            </Link>
            <Link to="/scholarships" className={utilityLinkClass}>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="fa-fw text-[12px] leading-none opacity-90"
                aria-hidden
              />
              <span className="leading-none">Scholarships</span>
            </Link>
            <span className="mx-1.5 h-4 w-px shrink-0 bg-white/20" aria-hidden />
            <span
              className="max-w-[7rem] truncate text-[13px] leading-none text-white/70"
              title={user?.name || firstName}
            >
              {firstName}
            </span>
            <button type="button" onClick={handleLogout} className={utilityLinkClass}>
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="fa-fw text-[12px] leading-none opacity-90"
                aria-hidden
              />
              <span className="leading-none">Log out</span>
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:hidden">
            <NotificationBell />
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 bg-[var(--color-sr-navy)] lg:hidden">
            <nav className="sr-container flex flex-col py-2" aria-label="Workspace mobile">
              {links.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    [
                      'flex h-11 items-center gap-2.5 whitespace-nowrap px-1 text-[15px] font-semibold leading-none',
                      isActive ? 'text-[var(--color-sr-yellow)]' : 'text-white',
                    ].join(' ')
                  }
                >
                  <FontAwesomeIcon icon={icon} className="fa-fw w-4 text-[14px] opacity-90" />
                  {label}
                </NavLink>
              ))}
              <Link
                to="/jobs"
                onClick={closeMenu}
                className="flex h-11 items-center gap-2.5 whitespace-nowrap px-1 text-[15px] font-semibold leading-none text-white/90"
              >
                <FontAwesomeIcon icon={faBriefcase} className="fa-fw w-4 text-[14px] opacity-90" />
                Browse jobs
              </Link>
              <Link
                to="/scholarships"
                onClick={closeMenu}
                className="flex h-11 items-center gap-2.5 whitespace-nowrap px-1 text-[15px] font-semibold leading-none text-white/90"
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="fa-fw w-4 text-[14px] opacity-90"
                />
                Scholarships
              </Link>
              <div className="mt-1 border-t border-white/15 pt-2">
                <p className="truncate px-1 py-2 text-[13px] leading-none text-white/60">
                  {user?.email || firstName}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 w-full items-center gap-2.5 whitespace-nowrap px-1 text-left text-[15px] font-semibold leading-none text-white"
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="fa-fw w-4 text-[14px] opacity-90"
                  />
                  Log out
                </button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
      <div className="sr-fixed-nav-spacer" aria-hidden="true">
        <div className="sr-fixed-nav-spacer-bar" />
      </div>
    </>
  );
}
