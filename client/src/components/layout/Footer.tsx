import { Link } from 'react-router-dom';

const categories = [
  { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
  { label: "Master's Scholarships", to: '/scholarships?level=masters' },
  { label: 'PhD & Doctoral Scholarships', to: '/scholarships?level=phd' },
  { label: 'Postdoctoral Fellowships', to: '/scholarships?level=postdoctoral' },
  { label: 'Internships & Work-Study Programs', to: '/internships' },
  { label: 'Application Guides & Documents', to: '/guides' },
  { label: 'Scholarship Advisory Desk', to: '/guides' },
];

const forStudents = [
  { label: 'Browse scholarships', to: '/scholarships' },
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

const SUPPORT_EMAIL = 'afriroar.support@gmail.com';

export default function Footer() {
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
          <p className="mt-5 text-[14px] leading-relaxed text-[var(--color-sr-muted)]">
            Need help with an application?{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-[var(--color-sr-link)] hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
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
