import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Plus,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatDeadline, getEmploymentTypeLabel } from '@/lib/utils';
import type { Job, JobApplication } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
] as const;

type ListPayload = {
  applications: JobApplication[];
  pagination?: { page?: number; limit?: number; total?: number; pages?: number };
};

function jobOf(app: JobApplication): Partial<Job> | null {
  const j = app.jobId;
  if (j && typeof j === 'object') return j;
  return null;
}

function statusMeta(status: string) {
  switch (status) {
    case 'accepted':
      return {
        icon: CheckCircle2,
        label: 'Accepted',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      };
    case 'rejected':
      return {
        icon: XCircle,
        label: 'Rejected',
        className: 'border-red-200 bg-red-50 text-red-900',
      };
    case 'submitted':
      return {
        icon: Clock,
        label: 'Submitted',
        className: 'border-sky-200 bg-sky-50 text-sky-900',
      };
    case 'under_review':
      return {
        icon: Clock,
        label: 'Under review',
        className: 'border-amber-200 bg-amber-50 text-amber-900',
      };
    case 'withdrawn':
      return {
        icon: XCircle,
        label: 'Withdrawn',
        className: 'border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] text-[var(--color-sr-muted)]',
      };
    default:
      return {
        icon: FileText,
        label: 'Draft',
        className: 'border-[var(--color-sr-border)] bg-white text-[var(--color-sr-navy)]',
      };
  }
}

export default function JobApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const setFilter = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    next.set('page', '1');
    setSearchParams(next);
  };

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['job-applications', statusFilter, page],
    queryFn: async () => {
      const { data: res } = await api.get('/job-applications', {
        params: {
          page,
          limit: 10,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      });
      return res.data as ListPayload;
    },
    placeholderData: (prev) => prev,
  });

  const { data: counts } = useQuery({
    queryKey: ['job-application-counts'],
    queryFn: async () => {
      const { data: res } = await api.get('/job-applications', { params: { page: 1, limit: 100 } });
      const apps = (res.data?.applications || []) as JobApplication[];
      const total = res.data?.pagination?.total ?? apps.length;
      const next: Record<string, number> = {
        all: total,
        draft: 0,
        submitted: 0,
        under_review: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };
      for (const app of apps) {
        if (app.status in next) next[app.status] += 1;
      }
      return next;
    },
    staleTime: 60_000,
  });

  const applications = data?.applications || [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? applications.length;
  const pages = Math.max(1, pagination?.pages || 1);
  const activeFilterLabel = useMemo(
    () => STATUS_FILTERS.find((f) => f.value === statusFilter)?.label || 'All',
    [statusFilter],
  );

  return (
    <>
      <Helmet>
        <title>Job applications | AfriRoar</title>
      </Helmet>

      <div className="min-h-[70vh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--color-sr-bg)] pb-10 sm:pb-16">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-7 md:py-9">
            <Link
              to="/dashboard"
              className="mb-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 max-w-2xl">
                <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                  Career tracker
                </p>
                <h1 className="text-[1.7rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[1.95rem]">
                  Job applications
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                  Track drafts, submitted applications, and hiring decisions in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Browse jobs
                </Link>
                <Link
                  to="/dashboard/job-applications/new"
                  className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] hover:bg-[var(--color-sr-yellow-hover)]"
                >
                  <Plus className="h-4 w-4" />
                  Apply
                </Link>
              </div>
            </div>

            {counts ? (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Total', counts.all],
                  ['Drafts', counts.draft],
                  ['In flight', (counts.submitted ?? 0) + (counts.under_review ?? 0)],
                  ['Decisions', (counts.accepted ?? 0) + (counts.rejected ?? 0)],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                      {label}
                    </p>
                    <p className="mt-1 text-[1.4rem] font-bold tabular-nums text-[var(--color-sr-navy-deeper)]">
                      {value ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="sr-container mt-8 space-y-5">
          <div className="flex min-w-0 flex-col gap-3 border border-[var(--color-sr-border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
              role="tablist"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((filter) => {
                const active = statusFilter === filter.value;
                const countKey = filter.value || 'all';
                const count = counts?.[countKey];
                return (
                  <button
                    key={filter.value || 'all'}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(filter.value)}
                    className={[
                      'inline-flex shrink-0 items-center gap-1.5 border px-3 py-2 text-[13px] font-semibold transition',
                      active
                        ? 'border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] text-white'
                        : 'border-transparent text-[var(--color-sr-navy)] hover:bg-[var(--color-sr-bg)]',
                    ].join(' ')}
                  >
                    {filter.label}
                    {typeof count === 'number' ? (
                      <span className={active ? 'text-white/80' : 'text-[var(--color-sr-muted)]'}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="shrink-0 px-1 text-[13px] text-[var(--color-sr-muted)]">
              {isFetching && !isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating…
                </span>
              ) : (
                <>
                  {total} {activeFilterLabel.toLowerCase()}
                  {total === 1 ? ' application' : ' applications'}
                </>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-[var(--color-sr-border)] bg-white p-5">
                  <div className="h-5 w-2/3 animate-pulse bg-[var(--color-sr-border)]" />
                  <div className="mt-3 h-4 w-1/3 animate-pulse bg-[var(--color-sr-border)]" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border border-[var(--color-sr-border)] bg-white px-6 py-12 text-center">
              <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                Could not load job applications
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 border border-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="border border-[var(--color-sr-border)] bg-white px-6 py-14 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-[var(--color-sr-muted)]" />
              <h2 className="mt-4 text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">
                {statusFilter ? `No ${activeFilterLabel.toLowerCase()} applications` : 'No job applications yet'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[var(--color-sr-muted)]">
                Browse open roles and apply with your CV and cover letter.
              </p>
              <Link
                to="/jobs"
                className="mt-5 inline-flex items-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Browse jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)] bg-white">
              {applications.map((app) => {
                const job = jobOf(app);
                const meta = statusMeta(app.status);
                const StatusIcon = meta.icon;
                const step = Math.min(3, Math.max(1, app.currentStep || 1));
                const progressPct =
                  app.status === 'draft' ? Math.round(((step - 1) / 2) * 100) : 100;

                return (
                  <li key={app._id}>
                    <Link
                      to={`/dashboard/job-applications/${app._id}`}
                      className="group flex flex-col gap-4 p-5 transition hover:bg-[var(--color-sr-bg)]/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-semibold',
                              meta.className,
                            ].join(' ')}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                          {app.status === 'draft' ? (
                            <span className="text-[12px] text-[var(--color-sr-muted)]">
                              Step {step} of 3 · {progressPct}%
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-2 text-[1.05rem] font-bold text-[var(--color-sr-navy-deeper)] group-hover:text-[var(--color-sr-navy)]">
                          {job?.title || 'Job application'}
                        </h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-sr-muted)]">
                          {job?.company ? <span className="font-medium text-[var(--color-sr-navy)]">{job.company}</span> : null}
                          {job?.country ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.country}
                            </span>
                          ) : null}
                          {job?.employmentType ? (
                            <span>{getEmploymentTypeLabel(job.employmentType)}</span>
                          ) : null}
                          {job?.deadline ? <span>Deadline {formatDeadline(job.deadline)}</span> : null}
                          <span>
                            {app.submittedAt
                              ? `Submitted ${formatDate(app.submittedAt)}`
                              : `Updated ${formatDate(app.updatedAt || app.lastSavedAt)}`}
                          </span>
                        </div>
                        {app.status === 'draft' ? (
                          <div className="mt-3 h-1 max-w-xs overflow-hidden bg-[var(--color-sr-border)]">
                            <div
                              className="h-full bg-[var(--color-sr-yellow)]"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-[var(--color-sr-navy)]">
                        {app.status === 'draft' ? 'Continue' : 'View'}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!isLoading && !isError && pages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-sr-border)] bg-white px-4 py-3">
              <p className="text-[13px] text-[var(--color-sr-muted)]">
                Page {page} of {pages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)] disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                  className="border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
