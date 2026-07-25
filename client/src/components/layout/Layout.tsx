import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from '@/components/sr/BackToTop';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-sr-bg)]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
