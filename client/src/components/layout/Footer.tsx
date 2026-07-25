import { Link } from 'react-router-dom';

const categories = [
  { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
  { label: 'Masters Scholarships', to: '/scholarships?level=masters' },
  { label: 'PhD Scholarships', to: '/scholarships?level=phd' },
  { label: 'Postdoctoral Fellowships', to: '/scholarships?level=postdoctoral' },
  { label: 'Internships', to: '/internships' },
  { label: 'Application Documents', to: '/guides' },
  { label: 'Scholarship Help Desk', to: '/guides' },
];

const legal = [
  { label: 'About Us', to: '/about' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Editorial Policy', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Contact Us', to: '/about' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

const social = [
  { label: 'Facebook', letter: 'f' },
  { label: 'YouTube', letter: '▶' },
  { label: 'Instagram', letter: '◎' },
  { label: 'LinkedIn', letter: 'in' },
  { label: 'X', letter: '𝕏' },
  { label: 'WhatsApp', letter: 'W' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-sr-bg)] border-t border-[var(--color-sr-border)] mt-10">
      <div className="sr-container py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="sr-footer-label text-[var(--color-sr-muted)] mb-3">ABOUT</p>
          <p className="sr-footer-text text-[var(--color-sr-text)] mb-5">
            AfriRoar.com is an updated listing of international scholarships and internships for
            students who seek national and global development through higher education.
          </p>
          <img src="/sr/logo.png" alt="AfriRoar" className="h-8 w-auto object-contain" />
        </div>

        <div>
          <p className="sr-footer-label text-[var(--color-sr-muted)] mb-3">FOLLOW US AND SUBSCRIBE</p>
          <div className="flex flex-wrap gap-3">
            {social.map(({ label, letter }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-10 h-10 rounded-full bg-[var(--color-sr-navy)] text-white flex items-center justify-center hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)] transition-colors text-sm font-bold"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold tracking-widest text-[var(--color-sr-muted)] mb-3">
            POPULAR CATEGORIES
          </h2>
          <ul className="space-y-2">
            {categories.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="text-[18px] font-normal text-[var(--color-sr-link)] hover:underline leading-[30.6px]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            {legal.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-[var(--color-sr-yellow)] transition-colors">
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
