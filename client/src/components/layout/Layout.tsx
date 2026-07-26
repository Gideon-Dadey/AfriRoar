import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AppShell from './AppShell';
import AdminShell from './AdminShell';
import Footer from './Footer';
import BackToTop from '@/components/sr/BackToTop';

const HIDE_FOOTER_PATHS = new Set(['/login', '/register', '/forgot-password', '/verify-email']);

export default function Layout() {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith('/dashboard/admin');
  const isDashboard = pathname.startsWith('/dashboard');
  const hideFooter = isDashboard || HIDE_FOOTER_PATHS.has(pathname);

  if (isAdminArea) {
    return (
      <div className="min-h-screen overflow-x-clip bg-[var(--color-sr-bg)]">
        <AdminShell />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[var(--color-sr-bg)]">
      {isDashboard ? <AppShell /> : <Navbar />}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      {!hideFooter ? <Footer /> : null}
      {!hideFooter ? <BackToTop /> : null}
    </div>
  );
}
