import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from '@/components/sr/BackToTop';

const HIDE_FOOTER_PATHS = new Set(['/login', '/register']);

export default function Layout() {
  const { pathname } = useLocation();
  const hideFooter = HIDE_FOOTER_PATHS.has(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-sr-bg)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter ? <Footer /> : null}
      {!hideFooter ? <BackToTop /> : null}
    </div>
  );
}
