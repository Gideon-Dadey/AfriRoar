import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hard-jump to the top on route change (no smooth scroll animation).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // Instant jump to in-page anchor
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top);
        return;
      }
    }

    // Instant jump, assign scrollTop so CSS smooth never animates the route change
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
