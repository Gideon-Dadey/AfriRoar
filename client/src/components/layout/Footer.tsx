import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
  { label: 'Contact Us', to: '/contact' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

const social: { label: string; icon: IconDefinition; href: string }[] = [
  { label: 'Facebook', icon: faFacebookF, href: 'https://www.facebook.com/' },
  { label: 'YouTube', icon: faYoutube, href: 'https://www.youtube.com/' },
  { label: 'Instagram', icon: faInstagram, href: 'https://www.instagram.com/' },
  { label: 'LinkedIn', icon: faLinkedinIn, href: 'https://www.linkedin.com/' },
  { label: 'X', icon: faXTwitter, href: 'https://x.com/' },
  { label: 'WhatsApp', icon: faWhatsapp, href: 'https://wa.me/' },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[var(--color-sr-border)] bg-[var(--color-sr-bg)]">
      <div className="sr-container grid grid-cols-1 gap-10 py-10 md:grid-cols-3">
        <div>
          <p className="sr-footer-label mb-3 text-[var(--color-sr-muted)]">ABOUT</p>
          <p className="sr-footer-text mb-5 text-[var(--color-sr-text)]">
            AfriRoar.com is an updated listing of international scholarships and internships for
            students who seek national and global development through higher education.
          </p>
          <img src="/sr/logo.png" alt="AfriRoar" className="h-8 w-auto object-contain" />
        </div>

        <div>
          <p className="sr-footer-label mb-3 text-[var(--color-sr-muted)]">FOLLOW US AND SUBSCRIBE</p>
          <div className="flex flex-wrap gap-2.5">
            {social.map(({ label, icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sr-navy)] text-white transition-colors hover:bg-[var(--color-sr-yellow)] hover:text-[var(--color-sr-navy-deeper)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sr-navy)]"
              >
                <FontAwesomeIcon icon={icon} className="text-[16px]" />
              </a>
            ))}
          </div>
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
