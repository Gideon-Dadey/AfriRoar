import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeHigh, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const scholarshipMenu = {
  byCountries: { label: 'Scholarships by Countries', to: '/countries' },
  levels: [
    { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
    { label: 'Masters Scholarships', to: '/scholarships?level=masters' },
    { label: 'PhD Scholarships', to: '/scholarships?level=phd' },
    { label: 'Postdoctoral Fellowships', to: '/scholarships?level=postdoctoral' },
    { label: 'Training Scholarships', to: '/scholarships?level=training' },
  ],
  deadlines: [
    { label: 'January-March Deadlines', to: '/scholarships?deadline=q1' },
    { label: 'April-June Deadlines', to: '/scholarships?deadline=q2' },
    { label: 'July-September Deadlines', to: '/scholarships?deadline=q3' },
    { label: 'October-December Deadlines', to: '/scholarships?deadline=q4' },
  ],
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scholarOpen, setScholarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(q ? `/scholarships?q=${encodeURIComponent(q)}` : '/scholarships');
  };

  const closeAll = () => {
    setMenuOpen(false);
    setScholarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    toast.success('Logged out');
    closeAll();
    navigate('/');
  };

  return (
    <header className="bg-[var(--color-sr-navy)] text-white sticky top-0 z-50 shadow-sm">
      <div className="sr-container flex items-center justify-between gap-3 h-14 md:h-16">
        <Link to="/" className="shrink-0 flex items-center h-full" onClick={closeAll}>
          <img
            src="/sr/logo.png"
            alt="AfriRoar"
            className="h-7 md:h-8 w-auto object-contain object-left"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sr-nav-link px-3 py-2 hover:text-[var(--color-sr-yellow)] transition-colors ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
            }
          >
            Home
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setScholarOpen(true)}
            onMouseLeave={() => setScholarOpen(false)}
          >
            <button
              type="button"
              className="sr-nav-link px-3 py-2 inline-flex items-center gap-1 hover:text-[var(--color-sr-yellow)] transition-colors"
            >
              Scholarships
              <ChevronDown className="w-4 h-4" />
            </button>
            {scholarOpen && (
              <div className="absolute left-0 top-full pt-1 min-w-[280px]">
                <div className="border border-white/10 bg-[var(--color-sr-navy)] py-2 text-[15px] font-normal text-white shadow-xl">
                  <Link
                    to={scholarshipMenu.byCountries.to}
                    className="block px-4 py-2 transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)]"
                    onClick={closeAll}
                  >
                    {scholarshipMenu.byCountries.label}
                  </Link>
                  <div className="px-4 pt-2 pb-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Level of Study
                  </div>
                  {scholarshipMenu.levels.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)]"
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="px-4 pt-2 pb-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Deadlines
                  </div>
                  {scholarshipMenu.deadlines.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)]"
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/internships"
            className={({ isActive }) =>
              `sr-nav-link px-3 py-2 hover:text-[var(--color-sr-yellow)] transition-colors ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
            }
          >
            Internships
          </NavLink>
          <NavLink
            to="/guides"
            className={({ isActive }) =>
              `sr-nav-link px-3 py-2 hover:text-[var(--color-sr-yellow)] transition-colors ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
            }
          >
            Scholarship Guides
          </NavLink>
          <NavLink
            to="/lists"
            className={({ isActive }) =>
              `sr-nav-link px-3 py-2 hover:text-[var(--color-sr-yellow)] transition-colors ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
            }
          >
            Scholarship Lists
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open Search Bar"
            onClick={() => setSearchOpen((v) => !v)}
            className="p-2 hover:text-[var(--color-sr-yellow)] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-semibold hover:text-[var(--color-sr-yellow)]"
                >
                  <FontAwesomeIcon icon={faGaugeHigh} className="text-[13px]" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-semibold border border-white/30 hover:bg-white/10"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="text-[13px]" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-1.5 text-sm font-semibold hover:text-[var(--color-sr-yellow)]">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-sm font-bold bg-[var(--color-sr-yellow)] text-[var(--color-sr-navy-deeper)] hover:bg-[#e0b400]"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Menu"
            className="lg:hidden inline-flex items-center gap-2 px-2 py-1.5 border border-white/30"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-semibold">Menu</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-white/15 bg-[var(--color-sr-navy-dark)]">
          <form onSubmit={submitSearch} className="sr-container py-3 flex gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scholarships, countries, guides..."
              className="flex-1 px-3 py-2.5 bg-white text-[var(--color-sr-text)] outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[var(--color-sr-yellow)] text-[var(--color-sr-navy-deeper)] font-bold"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[min(100%,340px)] bg-[var(--color-sr-navy)] shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/15">
              <span className="font-bold text-lg">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="px-2 py-3 sr-nav-link">
              <Link to="/" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                Home
              </Link>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/10"
                onClick={() => setScholarOpen((v) => !v)}
              >
                Scholarships
                <ChevronDown className={`w-4 h-4 transition-transform ${scholarOpen ? 'rotate-180' : ''}`} />
              </button>
              {scholarOpen && (
                <div className="pb-2 text-[15px] font-normal">
                  <Link to="/countries" className="block px-5 py-2.5 hover:bg-white/10" onClick={closeAll}>
                    Scholarships by Countries
                  </Link>
                  <p className="px-5 pt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Level of Study
                  </p>
                  {scholarshipMenu.levels.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-5 py-2.5 hover:bg-white/10"
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/internships" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                Internships
              </Link>
              <Link to="/guides" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                Scholarship Guides
              </Link>
              <Link to="/lists" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                Scholarship Lists
              </Link>

              <div className="border-t border-white/15 mt-3 pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-3 hover:bg-white/10"
                      onClick={closeAll}
                    >
                      <FontAwesomeIcon icon={faGaugeHigh} className="w-4 text-[14px]" />
                      Dashboard {user?.name ? `(${user.name.split(' ')[0]})` : ''}
                    </Link>
                    <Link to="/dashboard/applications" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                      My applications
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 px-3 py-3 text-left hover:bg-white/10"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-[14px]" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                      Log in
                    </Link>
                    <Link to="/register" className="block px-3 py-3 hover:bg-white/10 font-bold text-[var(--color-sr-yellow)]" onClick={closeAll}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
