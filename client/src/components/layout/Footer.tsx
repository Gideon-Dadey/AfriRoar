import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const categories = [
  { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
  { label: "Master's Scholarships", to: '/scholarships?level=masters' },
  { label: 'PhD & Doctoral Scholarships', to: '/scholarships?level=phd' },
  { label: 'Postdoctoral Fellowships', to: '/scholarships?level=postdoctoral' },
  { label: 'Internships & Work-Study Programs', to: '/internships' },
  { label: 'Jobs & Career Roles', to: '/jobs' },
  { label: 'Application Guides & Documents', to: '/guides' },
  { label: 'Scholarship Advisory Desk', to: '/guides' },
];

const forStudents = [
  { label: 'Browse scholarships', to: '/scholarships' },
  { label: 'Browse jobs', to: '/jobs' },
  { label: 'Browse internships', to: '/internships' },
  { label: 'Scholarship guides', to: '/guides' },
  { label: 'Curated scholarship lists', to: '/lists' },
  { label: 'Create student account', to: '/register' },
  { label: 'Student dashboard', to: '/dashboard' },
  { label: 'Contact support', to: '/contact' },
];

const legal = [
  { label: 'About Us', to: '/about' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Editorial Policy', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/contact/newsletter', {
        email: email.trim(),
        source: 'footer',
        company: honeypot,
      });
      toast.success('Subscribed — watch your inbox for new listings.');
      setEmail('');
    } catch {
      toast.error('Could not subscribe. Try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="mt-10 border-t border-[var(--color-sr-border)] bg-[var(--color-sr-bg)]">
      <div className="sr-container grid grid-cols-1 gap-10 py-10 md:grid-cols-3">
        <div>
          <p className="sr-footer-label mb-3 text-[var(--color-sr-muted)]">ABOUT</p>
          <p className="sr-footer-text mb-5 text-[var(--color-sr-text)]">
            AfriRoar is a trusted platform connecting African students and professionals to verified
            international scholarships, internships, and career opportunities.
          </p>
          <img src="/sr/logo.png" alt="AfriRoar" className="h-8 w-auto object-contain" />

          <form onSubmit={subscribe} className="mt-6">
            <p className="sr-footer-label mb-2 text-[var(--color-sr-muted)]">NEWSLETTER</p>
            <p className="mb-3 text-[14px] text-[var(--color-sr-muted)]">
              New scholarships and closing deadlines. One email when we publish.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
              />
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[var(--color-sr-navy-dark)] disabled:opacity-60"
              >
                {submitting ? '…' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <p className="sr-footer-label mb-3 text-[var(--color-sr-muted)]">FOR STUDENTS</p>
          <ul className="space-y-2">
            {forStudents.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-[18px] font-normal leading-[30.6px] text-[var(--color-sr-link)] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold tracking-widest text-[var(--color-sr-muted)]">
            POPULAR CATEGORIES
          </h2>
          <ul className="space-y-2">
            {categories.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-[18px] font-normal leading-[30.6px] text-[var(--color-sr-link)] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            {legal.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors hover:text-[var(--color-sr-yellow)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-white/70">Copyright © {new Date().getFullYear()} AfriRoar.com</p>
        </div>
      </div>
    </footer>
  );
}
