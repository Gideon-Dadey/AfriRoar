import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFileLines,
  faGaugeHigh,
  faGraduationCap,
  faHouse,
  faNewspaper,
  faRightFromBracket,
  faUserShield,
  faClockRotateLeft,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems: { to: string; label: string; icon: IconDefinition; end?: boolean }[] = [
  { to: '/dashboard/admin', label: 'Overview', icon: faGaugeHigh, end: true },
  { to: '/dashboard/admin/users', label: 'Students & users', icon: faUsers },
  { to: '/dashboard/admin/scholarships', label: 'Scholarships', icon: faGraduationCap },
  { to: '/dashboard/admin/applications', label: 'Applications', icon: faFileLines },
  { to: '/dashboard/admin/content', label: 'Content', icon: faNewspaper },
  { to: '/dashboard/admin/activity', label: 'Activity', icon: faClockRotateLeft },
];

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 px-3 py-2.5 text-[14px] font-semibold transition-colors',
    isActive
      ? 'bg-white/10 text-[var(--color-sr-yellow)]'
      : 'text-white/85 hover:bg-white/5 hover:text-[var(--color-sr-yellow)]',
  );
}

export default function AdminShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    toast.success('Logged out');
    closeDrawer();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <Link to="/dashboard/admin" onClick={closeDrawer} className="min-w-0 shrink-0">
          <img
            src="/sr/logo.png"
            alt="AfriRoar"
            className="h-7 w-auto object-contain object-left"
          />
        </Link>
        <span className="inline-flex items-center gap-1 border border-[var(--color-sr-yellow)]/40 bg-[var(--color-sr-yellow)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-sr-yellow)]">
          <FontAwesomeIcon icon={faUserShield} className="text-[10px]" />
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="Admin">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={closeDrawer} className={navClass}>
            <FontAwesomeIcon icon={icon} className="w-4 text-[14px] opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-white/10 px-2 py-3">
        <Link
          to="/dashboard"
          onClick={closeDrawer}
          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-white/75 hover:text-[var(--color-sr-yellow)]"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 text-[13px]" />
          Student dashboard
        </Link>
        <Link
          to="/"
          onClick={closeDrawer}
          className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-white/75 hover:text-[var(--color-sr-yellow)]"
        >
          <FontAwesomeIcon icon={faHouse} className="w-4 text-[13px]" />
          Browse site
        </Link>
        <p className="truncate px-3 pt-2 text-[12px] text-white/50">{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-semibold text-white/85 hover:text-[var(--color-sr-yellow)]"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-[13px]" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-sr-bg)]">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto bg-[var(--color-sr-navy)] text-white lg:block">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-sr-border)] bg-[var(--color-sr-navy)] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <Link to="/dashboard/admin">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-6 w-auto" />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-sr-yellow)]">
              Admin
            </span>
          </div>
          <button
            type="button"
            className="inline-flex p-2"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close drawer"
              onClick={closeDrawer}
            />
            <aside className="absolute inset-y-0 left-0 w-[min(280px,85vw)] bg-[var(--color-sr-navy)] text-white shadow-xl">
              {sidebar}
            </aside>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
