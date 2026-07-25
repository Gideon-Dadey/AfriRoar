import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  UserRound,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatDeadline, getFundingTypeLabel } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Application, Scholarship } from '@/types';

type ApplicationsPayload = {
  applications: Application[];
  pagination?: { total?: number; page?: number; pages?: number };
};

function statusMeta(status: string) {
  switch (status) {
    case 'accepted':
      return {
        icon: CheckCircle2,
        label: 'Accepted',
        className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    case 'rejected':
      return {
        icon: XCircle,
        label: 'Rejected',
        className: 'text-red-700 bg-red-50 border-red-200',
      };
    case 'submitted':
      return {
        icon: Clock,
        label: 'Submitted',
        className: 'text-sky-800 bg-sky-50 border-sky-200',
      };
    case 'under_review':
      return {
        icon: Clock,
        label: 'Under review',
        className: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    case 'withdrawn':
      return {
        icon: XCircle,
        label: 'Withdrawn',
        className: 'text-[var(--color-sr-muted)] bg-[var(--color-sr-bg)] border-[var(--color-sr-border)]',
      };
    default:
      return {
        icon: FileText,
        label: 'Draft',
        className: 'text-[var(--color-sr-navy)] bg-[var(--color-sr-bg)] border-[var(--color-sr-border)]',
      };
  }
}

function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function scholarshipTitle(app: Application) {
  const scholarship = app.scholarshipId;
  if (scholarship && typeof scholarship === 'object' && 'title' in scholarship) {
    return scholarship.title || 'Scholarship application';
  }
  return 'Scholarship application';
}

function Metric({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group border border-[var(--color-sr-border)] bg-white p-4 transition hover:border-[var(--color-sr-navy)]"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
        {label}
      </p>
      <p className="mt-2 text-[1.75rem] font-bold tabular-nums leading-none text-[var(--color-sr-navy-deeper)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[13px] text-[var(--color-sr-muted)] group-hover:text-[var(--color-sr-navy)]">
          {hint}
        </p>
      ) : null}
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';

  const {
    data: applicationsData,
    isLoading: appsLoading,
    isError: appsError,
  } = useQuery({
    queryKey: ['my-applications', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/applications?limit=5');
      return data.data as ApplicationsPayload;
    },
    enabled: isStudent,
  });

  const {
    data: recommendations,
    isLoading: recsLoading,
  } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/scholarships/user/recommendations');
      return (data.data.scholarships || []) as Scholarship[];
    },
    enabled: isStudent,
  });

  const applications = applicationsData?.applications || [];
  const totalApplications = applicationsData?.pagination?.total ?? applications.length;
  const savedCount = Array.isArray(user?.savedScholarships) ? user.savedScholarships.length : 0;

  const drafts = useMemo(
    () => applications.filter((a) => a.status === 'draft'),
    [applications],
  );
  const accepted = useMemo(
    () => applications.filter((a) => a.status === 'accepted').length,
    [applications],
  );

  const profileScore = user?.profileCompletionScore ?? 0;
  const needsProfile = isStudent && profileScore < 80;

  const nextActions = useMemo(() => {
    if (!user || !isStudent) return [];
    const actions: Array<{ title: string; detail: string; to: string; cta: string }> = [];

    if (needsProfile) {
      actions.push({
        title: 'Finish your profile',
        detail: `At ${profileScore}% complete — country and education unlock better matches.`,
        to: '/dashboard/profile',
        cta: 'Edit profile',
      });
    }

    if (drafts.length > 0) {
      const draft = drafts[0];
      actions.push({
        title: 'Continue a draft application',
        detail: scholarshipTitle(draft),
        to: `/dashboard/applications/${draft._id}`,
        cta: 'Resume',
      });
    }

    if (applications.length === 0) {
      actions.push({
        title: 'Start your first application',
        detail: 'Browse verified scholarships and submit with your documents in one place.',
        to: '/scholarships',
        cta: 'Browse scholarships',
      });
    }

    return actions.slice(0, 2);
  }, [user, isStudent, needsProfile, profileScore, drafts, applications.length]);

  if (!user) return null;

  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <>
      <Helmet>
        <title>Dashboard | AfriRoar</title>
      </Helmet>

      <div className="min-h-[70vh] bg-[var(--color-sr-bg)] pb-16">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-8 md:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sr-muted)]">
                  {greetingForHour()}
                </p>
                <h1 className="text-[1.85rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2.15rem]">
                  {firstName}, here is your workspace
                </h1>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-sr-muted)]">
                  {user.role === 'student' &&
                    'Track applications, strengthen your profile, and move on scholarships that fit.'}
                  {user.role === 'provider' &&
                    'Manage listings and review applicants from one place.'}
                  {user.role === 'admin' &&
                    'Moderate users, scholarships, and platform health.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isStudent ? (
                  <>
                    <Link
                      to="/dashboard/profile"
                      className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] bg-white px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)]"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/applications/new"
                      className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[#e0b400]"
                    >
                      Start application
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            {isStudent ? (
              <div className="mt-8 border-t border-[var(--color-sr-border)] pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                      Match readiness
                    </p>
                    <p className="mt-1 text-[15px] text-[var(--color-sr-text)]">
                      {profileScore >= 80
                        ? 'Profile is strong enough for solid matching.'
                        : 'A few more details will improve scholarship recommendations.'}
                    </p>
                  </div>
                  <p className="text-[1.5rem] font-bold tabular-nums text-[var(--color-sr-navy)]">
                    {profileScore}%
                  </p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden bg-[var(--color-sr-border)]">
                  <div
                    className="h-full bg-[var(--color-sr-yellow)] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, profileScore))}%` }}
                  />
                </div>
                {needsProfile ? (
                  <Link
                    to="/dashboard/profile"
                    className="mt-3 inline-flex text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Complete profile →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="sr-container mt-8 space-y-8">
          {isStudent && nextActions.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Next up
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {nextActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex flex-col justify-between gap-4 border border-[var(--color-sr-border)] bg-white p-5 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">{action.title}</p>
                      <p className="mt-1 truncate text-[14px] text-[var(--color-sr-muted)]">{action.detail}</p>
                    </div>
                    <Link
                      to={action.to}
                      className="inline-flex shrink-0 items-center gap-1.5 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-dark)]"
                    >
                      {action.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {isStudent ? (
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric
                label="Applications"
                value={appsLoading ? '—' : totalApplications}
                hint="View all"
                to="/dashboard/applications"
              />
              <Metric
                label="Drafts"
                value={appsLoading ? '—' : drafts.length}
                hint="Finish later"
                to="/dashboard/applications?status=draft"
              />
              <Metric
                label="Accepted"
                value={appsLoading ? '—' : accepted}
                hint="In recent list"
                to="/dashboard/applications?status=accepted"
              />
              <Metric
                label="Saved"
                value={savedCount}
                hint="From your account"
                to="/scholarships"
              />
            </section>
          ) : null}

          {isStudent ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <section className="border border-[var(--color-sr-border)] bg-white">
                <div className="flex items-center justify-between border-b border-[var(--color-sr-border)] px-5 py-4">
                  <h2 className="text-[17px] font-bold text-[var(--color-sr-navy-deeper)]">
                    Recent applications
                  </h2>
                  <Link
                    to="/dashboard/applications"
                    className="text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                {appsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-14 text-[14px] text-[var(--color-sr-muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading applications…
                  </div>
                ) : appsError ? (
                  <div className="px-5 py-10 text-center text-[14px] text-[var(--color-sr-muted)]">
                    Could not load applications. Refresh and try again.
                  </div>
                ) : applications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-[var(--color-sr-muted)]" />
                    <p className="font-semibold text-[var(--color-sr-navy)]">No applications yet</p>
                    <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                      When you start one, progress will show up here.
                    </p>
                    <Link
                      to="/scholarships"
                      className="mt-5 inline-flex items-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[13px] font-semibold text-white"
                    >
                      Browse scholarships
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--color-sr-border)]">
                    {applications.map((app) => {
                      const meta = statusMeta(app.status);
                      const StatusIcon = meta.icon;
                      return (
                        <li key={app._id}>
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="flex items-center gap-4 px-5 py-4 transition hover:bg-[var(--color-sr-bg)]"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-[var(--color-sr-navy-deeper)]">
                                {scholarshipTitle(app)}
                              </p>
                              <p className="mt-1 text-[13px] text-[var(--color-sr-muted)]">
                                Updated {formatDate(app.updatedAt || app.lastSavedAt || app.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[12px] font-semibold ${meta.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                            <ArrowRight className="hidden h-4 w-4 shrink-0 text-[var(--color-sr-muted)] sm:block" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="border border-[var(--color-sr-border)] bg-white">
                <div className="border-b border-[var(--color-sr-border)] px-5 py-4">
                  <h2 className="text-[17px] font-bold text-[var(--color-sr-navy-deeper)]">
                    Suggested for you
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--color-sr-muted)]">
                    Based on your profile details.
                  </p>
                </div>

                {recsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-14 text-[14px] text-[var(--color-sr-muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding matches…
                  </div>
                ) : !recommendations || recommendations.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="font-semibold text-[var(--color-sr-navy)]">No matches yet</p>
                    <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                      Add country and education level on your profile to unlock suggestions.
                    </p>
                    <Link
                      to="/dashboard/profile"
                      className="mt-4 inline-flex text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                    >
                      Update profile →
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--color-sr-border)]">
                    {recommendations.slice(0, 4).map((s) => (
                      <li key={s._id}>
                        <Link
                          to={`/scholarships/${s.slug || s._id}`}
                          className="block px-5 py-4 transition hover:bg-[var(--color-sr-bg)]"
                        >
                          <p className="font-semibold leading-snug text-[var(--color-sr-navy-deeper)]">
                            {s.title}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--color-sr-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {s.country || 'Multiple'}
                            </span>
                            <span>{getFundingTypeLabel(s.fundingType)}</span>
                            {s.deadline ? <span>{formatDeadline(s.deadline)}</span> : null}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-[var(--color-sr-border)] px-5 py-3">
                  <Link
                    to="/scholarships"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Browse all scholarships
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            </div>
          ) : null}

          {(user.role === 'provider' || user.role === 'admin') && (
            <section>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Tools
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {user.role === 'provider' ? (
                  <>
                    <Link
                      to="/dashboard/provider/listings"
                      className="border border-[var(--color-sr-border)] bg-white p-5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">My listings</p>
                      <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                        Create and update scholarship posts.
                      </p>
                    </Link>
                    <Link
                      to="/dashboard/provider/applicants"
                      className="border border-[var(--color-sr-border)] bg-white p-5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">Applicants</p>
                      <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                        Review submissions for your programmes.
                      </p>
                    </Link>
                  </>
                ) : null}
                {user.role === 'admin' ? (
                  <>
                    <Link
                      to="/dashboard/admin/users"
                      className="border border-[var(--color-sr-border)] bg-white p-5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">Users</p>
                      <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                        Manage accounts and access.
                      </p>
                    </Link>
                    <Link
                      to="/dashboard/admin/scholarships"
                      className="border border-[var(--color-sr-border)] bg-white p-5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">Scholarships</p>
                      <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                        Moderate listings before publish.
                      </p>
                    </Link>
                    <Link
                      to="/dashboard/admin/analytics"
                      className="border border-[var(--color-sr-border)] bg-white p-5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <p className="font-bold text-[var(--color-sr-navy-deeper)]">Analytics</p>
                      <p className="mt-1 text-[14px] text-[var(--color-sr-muted)]">
                        Review platform activity.
                      </p>
                    </Link>
                  </>
                ) : null}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
