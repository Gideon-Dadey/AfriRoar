import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeHigh, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { ChevronDown, ChevronRight, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type MenuLink = { label: string; to: string };

const scholarshipMenu = {
  byCountries: { label: 'Scholarships by Countries', to: '/countries' } as MenuLink,
  levels: [
    { label: 'Undergraduate Scholarships', to: '/scholarships?level=undergraduate' },
    { label: 'Masters Scholarships', to: '/scholarships?level=masters' },
    { label: 'PhD Scholarships', to: '/scholarships?level=phd' },
    { label: 'Postdoctoral Fellowships', to: '/scholarships?level=postdoctoral' },
    { label: 'Training Scholarships', to: '/scholarships?level=training' },
  ] as MenuLink[],
  deadlines: [
    { label: 'January-March Deadlines', to: '/scholarships?deadline=q1' },
    { label: 'April-June Deadlines', to: '/scholarships?deadline=q2' },
    { label: 'July-September Deadlines', to: '/scholarships?deadline=q3' },
    { label: 'October-December Deadlines', to: '/scholarships?deadline=q4' },
  ] as MenuLink[],
};

const jobsMenu = {
  browse: { label: 'Browse all jobs', to: '/jobs' } as MenuLink,
  countries: [
    { label: 'Jobs in United States', to: '/jobs?country=United%20States' },
    { label: 'Jobs in Canada', to: '/jobs?country=Canada' },
    { label: 'Jobs in New Zealand', to: '/jobs?country=New%20Zealand' },
    { label: 'Jobs in United Kingdom', to: '/jobs?country=United%20Kingdom' },
    { label: 'Remote jobs', to: '/jobs?country=Remote' },
  ] as MenuLink[],
  types: [
    { label: 'Full-time', to: '/jobs?employmentType=full-time' },
    { label: 'Part-time', to: '/jobs?employmentType=part-time' },
    { label: 'Contract', to: '/jobs?employmentType=contract' },
    { label: 'Internship', to: '/jobs?employmentType=internship' },
    { label: 'Closing soon', to: '/jobs?closing=soon' },
  ] as MenuLink[],
};

const panelItemClass =
  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] font-normal text-white transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)]';

const panelLinkClass =
  'block px-4 py-2.5 text-[15px] font-normal text-white transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)]';

function FlyoutPanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute left-0 top-full z-50 min-w-[260px] pt-1">
      <div className="relative border border-white/10 bg-[var(--color-sr-navy-dark)] py-1.5 text-white shadow-xl">
        {children}
      </div>
    </div>
  );
}

function SubFlyout({ items, onNavigate }: { items: MenuLink[]; onNavigate: () => void }) {
  return (
    <div className="absolute left-full top-0 z-50 ml-0 min-w-[260px] border border-white/10 border-l-0 bg-[var(--color-sr-navy-dark)] py-1.5 shadow-xl">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={panelLinkClass} onClick={onNavigate}>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scholarOpen, setScholarOpen] = useState(false);
  const [scholarPanel, setScholarPanel] = useState<'levels' | 'deadlines' | null>(null);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [jobsPanel, setJobsPanel] = useState<'countries' | 'types' | null>(null);
  const [mobileScholar, setMobileScholar] = useState<string | null>(null);
  const [mobileJobs, setMobileJobs] = useState<string | null>(null);
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
    setScholarPanel(null);
    setJobsOpen(false);
    setJobsPanel(null);
    setMobileScholar(null);
    setMobileJobs(null);
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
    <>
      <header className="sr-safe-top fixed inset-x-0 top-0 z-50 bg-[var(--color-sr-navy)] text-white shadow-sm">
        <div className="sr-container flex h-14 items-center justify-between gap-3 md:h-16">
          <Link to="/" className="flex h-full shrink-0 items-center" onClick={closeAll}>
            <img
              src="/sr/logo.png"
              alt="AfriRoar"
              className="h-7 w-auto object-contain object-left md:h-8"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `sr-nav-link px-3 py-2 transition-colors hover:text-[var(--color-sr-yellow)] ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
              }
            >
              Home
            </NavLink>

            {/* Scholarships nested flyout */}
            <div
              className="relative"
              onMouseEnter={() => setScholarOpen(true)}
              onMouseLeave={() => {
                setScholarOpen(false);
                setScholarPanel(null);
              }}
            >
              <button
                type="button"
                className={`sr-nav-link inline-flex items-center gap-1 px-3 py-2 transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)] ${scholarOpen ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
              >
                Scholarships
                <ChevronDown className="h-4 w-4" />
              </button>
              <FlyoutPanel open={scholarOpen}>
                <Link
                  to={scholarshipMenu.byCountries.to}
                  className={panelLinkClass}
                  onClick={closeAll}
                >
                  {scholarshipMenu.byCountries.label}
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setScholarPanel('levels')}
                >
                  <button
                    type="button"
                    className={`${panelItemClass} ${scholarPanel === 'levels' ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
                  >
                    Level of Study
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                  </button>
                  {scholarPanel === 'levels' ? (
                    <SubFlyout items={scholarshipMenu.levels} onNavigate={closeAll} />
                  ) : null}
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setScholarPanel('deadlines')}
                >
                  <button
                    type="button"
                    className={`${panelItemClass} ${scholarPanel === 'deadlines' ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
                  >
                    Deadlines
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                  </button>
                  {scholarPanel === 'deadlines' ? (
                    <SubFlyout items={scholarshipMenu.deadlines} onNavigate={closeAll} />
                  ) : null}
                </div>
              </FlyoutPanel>
            </div>

            <NavLink
              to="/internships"
              className={({ isActive }) =>
                `sr-nav-link px-3 py-2 transition-colors hover:text-[var(--color-sr-yellow)] ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
              }
            >
              Internships
            </NavLink>

            {/* Jobs nested flyout */}
            <div
              className="relative"
              onMouseEnter={() => setJobsOpen(true)}
              onMouseLeave={() => {
                setJobsOpen(false);
                setJobsPanel(null);
              }}
            >
              <button
                type="button"
                className={`sr-nav-link inline-flex items-center gap-1 px-3 py-2 transition-colors hover:bg-white/10 hover:text-[var(--color-sr-yellow)] ${jobsOpen ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
              >
                Jobs
                <ChevronDown className="h-4 w-4" />
              </button>
              <FlyoutPanel open={jobsOpen}>
                <Link to={jobsMenu.browse.to} className={panelLinkClass} onClick={closeAll}>
                  {jobsMenu.browse.label}
                </Link>

                <div className="relative" onMouseEnter={() => setJobsPanel('countries')}>
                  <button
                    type="button"
                    className={`${panelItemClass} ${jobsPanel === 'countries' ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
                  >
                    By country
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                  </button>
                  {jobsPanel === 'countries' ? (
                    <SubFlyout items={jobsMenu.countries} onNavigate={closeAll} />
                  ) : null}
                </div>

                <div className="relative" onMouseEnter={() => setJobsPanel('types')}>
                  <button
                    type="button"
                    className={`${panelItemClass} ${jobsPanel === 'types' ? 'bg-white/10 text-[var(--color-sr-yellow)]' : ''}`}
                  >
                    Role type
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
                  </button>
                  {jobsPanel === 'types' ? (
                    <SubFlyout items={jobsMenu.types} onNavigate={closeAll} />
                  ) : null}
                </div>
              </FlyoutPanel>
            </div>

            <NavLink
              to="/guides"
              className={({ isActive }) =>
                `sr-nav-link px-3 py-2 transition-colors hover:text-[var(--color-sr-yellow)] ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
              }
            >
              Scholarship Guides
            </NavLink>
            <NavLink
              to="/lists"
              className={({ isActive }) =>
                `sr-nav-link px-3 py-2 transition-colors hover:text-[var(--color-sr-yellow)] ${isActive ? 'text-[var(--color-sr-yellow)]' : ''}`
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
              className="p-2 transition-colors hover:text-[var(--color-sr-yellow)]"
            >
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-1.5 md:flex">
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
                    className="inline-flex items-center gap-1.5 border border-white/30 px-2.5 py-1.5 text-sm font-semibold hover:bg-white/10"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="text-[13px]" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-2.5 py-1.5 text-sm font-semibold hover:text-[var(--color-sr-yellow)]"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center bg-[var(--color-sr-yellow)] px-3.5 py-2 text-sm font-bold leading-none text-[var(--color-sr-navy-deeper)] hover:bg-[#e0b400]"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label="Menu"
              className="inline-flex items-center gap-2 border border-white/30 px-2 py-1.5 lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm font-semibold">Menu</span>
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-white/15 bg-[var(--color-sr-navy-dark)]">
            <form onSubmit={submitSearch} className="sr-container flex gap-2 py-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scholarships, countries, guides..."
                className="flex-1 bg-white px-3 py-2.5 text-[16px] text-[var(--color-sr-text)] outline-none"
              />
              <button
                type="submit"
                className="bg-[var(--color-sr-yellow)] px-4 py-2.5 font-bold text-[var(--color-sr-navy-deeper)]"
              >
                Search
              </button>
            </form>
          </div>
        ) : null}

        {menuOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu overlay"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="sr-safe-top absolute right-0 top-0 h-full w-[min(100%,340px)] overflow-y-auto bg-[var(--color-sr-navy)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/15 px-4 py-4">
                <span className="text-lg font-bold">Menu</span>
                <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="sr-nav-link px-2 py-3">
                <Link to="/" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                  Home
                </Link>

                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3 hover:bg-white/10"
                  onClick={() => {
                    setScholarOpen((v) => !v);
                    setMobileScholar(null);
                  }}
                >
                  Scholarships
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${scholarOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {scholarOpen ? (
                  <div className="pb-2 text-[15px] font-normal">
                    <Link
                      to="/countries"
                      className="block px-5 py-2.5 hover:bg-white/10"
                      onClick={closeAll}
                    >
                      Scholarships by Countries
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-5 py-2.5 hover:bg-white/10"
                      onClick={() =>
                        setMobileScholar((v) => (v === 'levels' ? null : 'levels'))
                      }
                    >
                      Level of Study
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${mobileScholar === 'levels' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {mobileScholar === 'levels'
                      ? scholarshipMenu.levels.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-8 py-2.5 hover:bg-white/10"
                            onClick={closeAll}
                          >
                            {item.label}
                          </Link>
                        ))
                      : null}
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-5 py-2.5 hover:bg-white/10"
                      onClick={() =>
                        setMobileScholar((v) => (v === 'deadlines' ? null : 'deadlines'))
                      }
                    >
                      Deadlines
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${mobileScholar === 'deadlines' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {mobileScholar === 'deadlines'
                      ? scholarshipMenu.deadlines.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-8 py-2.5 hover:bg-white/10"
                            onClick={closeAll}
                          >
                            {item.label}
                          </Link>
                        ))
                      : null}
                  </div>
                ) : null}

                <Link
                  to="/internships"
                  className="block px-3 py-3 hover:bg-white/10"
                  onClick={closeAll}
                >
                  Internships
                </Link>

                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3 hover:bg-white/10"
                  onClick={() => {
                    setJobsOpen((v) => !v);
                    setMobileJobs(null);
                  }}
                >
                  Jobs
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${jobsOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {jobsOpen ? (
                  <div className="pb-2 text-[15px] font-normal">
                    <Link to="/jobs" className="block px-5 py-2.5 hover:bg-white/10" onClick={closeAll}>
                      Browse all jobs
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-5 py-2.5 hover:bg-white/10"
                      onClick={() =>
                        setMobileJobs((v) => (v === 'countries' ? null : 'countries'))
                      }
                    >
                      By country
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${mobileJobs === 'countries' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {mobileJobs === 'countries'
                      ? jobsMenu.countries.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-8 py-2.5 hover:bg-white/10"
                            onClick={closeAll}
                          >
                            {item.label}
                          </Link>
                        ))
                      : null}
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-5 py-2.5 hover:bg-white/10"
                      onClick={() => setMobileJobs((v) => (v === 'types' ? null : 'types'))}
                    >
                      Role type
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${mobileJobs === 'types' ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {mobileJobs === 'types'
                      ? jobsMenu.types.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="block px-8 py-2.5 hover:bg-white/10"
                            onClick={closeAll}
                          >
                            {item.label}
                          </Link>
                        ))
                      : null}
                  </div>
                ) : null}

                <Link to="/guides" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                  Scholarship Guides
                </Link>
                <Link to="/lists" className="block px-3 py-3 hover:bg-white/10" onClick={closeAll}>
                  Scholarship Lists
                </Link>

                <div className="mt-3 border-t border-white/15 pt-3">
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
                      <Link
                        to="/dashboard/applications"
                        className="block px-3 py-3 hover:bg-white/10"
                        onClick={closeAll}
                      >
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
                      <Link
                        to="/login"
                        className="block px-3 py-3 hover:bg-white/10"
                        onClick={closeAll}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-3 py-3 font-bold text-[var(--color-sr-yellow)] hover:bg-white/10"
                        onClick={closeAll}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </aside>
          </div>
        ) : null}
      </header>
      <div className="sr-fixed-nav-spacer" aria-hidden="true">
        <div className="sr-fixed-nav-spacer-bar" />
      </div>
    </>
  );
}
