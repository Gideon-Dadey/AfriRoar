import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Plus,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatDeadline, getLevelLabel } from '@/lib/utils';
import type { Application, Scholarship } from '@/types';

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
  applications: Application[];
  pagination?: { page?: number; limit?: number; total?: number; pages?: number };
};

function scholarshipOf(app: Application): Partial<Scholarship> | null {
  const s = app.scholarshipId;
  if (s && typeof s === 'object') return s;
  return null;
}

function titleOf(app: Application) {
  return scholarshipOf(app)?.title || 'Scholarship application';
}

function programmeOf(app: Application): { level?: string; field?: string } {
  const step1 = app.steps?.find((s) => s.stepNumber === 1)?.data as
    | {
        intendedLevel?: string;
        intendedField?: string;
        fullName?: string;
        firstName?: string;
        lastName?: string;
      }
    | undefined;
  if (!step1 || step1.fullName || step1.firstName || step1.lastName) return {};
  return { level: step1.intendedLevel, field: step1.intendedField };
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

function actionLabel(status: string) {
  if (status === 'draft') return 'Continue';
  return 'View';
}

export default function Applications() {
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

  const {
    data,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['applications', statusFilter, page],
    queryFn: async () => {
      const { data: res } = await api.get('/applications', {
        params: {
          page,
          limit: 10,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      });
      return res.data as ListPayload;
    },
    placeholderData: (prev) => prev,
    retry: (failureCount, err) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) return false;
      return failureCount < 1;
    },
  });

  const authError = (() => {
    const message = String(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message || '',
    ).toLowerCase();
    return (
      (error as { response?: { status?: number } })?.response?.status === 401 ||
      message.includes('expired') ||
      message.includes('token') ||
      message.includes('not logged in')
    );
  })();

  const { data: counts } = useQuery({
    queryKey: ['application-counts'],
    queryFn: async () => {
      const { data: res } = await api.get('/applications', {
        params: { page: 1, limit: 100 },
      });
      const apps = (res.data?.applications || []) as Application[];
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

  const activeFilterLabel = useMemo(() => {
    return STATUS_FILTERS.find((f) => f.value === statusFilter)?.label || 'All';
  }, [statusFilter]);

  const draftHint = (counts?.draft || 0) > 0 && !statusFilter;

  return (
    <>
      <Helmet>
        <title>Applications | AfriRoar</title>
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
                  Application tracker
                </p>
                <h1 className="text-[1.7rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[1.95rem]">
                  Your applications
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                  Continue drafts, review submitted packets, and watch status changes in one place.
                </p>
              </div>

              <Link
                to="/dashboard/applications/new"
                className="inline-flex items-center gap-2 self-start bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] lg:self-auto"
              >
                <Plus className="h-4 w-4" />
                Start application
              </Link>
            </div>

            {counts ? (
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                    Total
                  </p>
                  <p className="mt-1 text-[1.4rem] font-bold tabular-nums text-[var(--color-sr-navy-deeper)]">
                    {counts.all ?? 0}
                  </p>
                </div>
                <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                    Drafts
                  </p>
                  <p className="mt-1 text-[1.4rem] font-bold tabular-nums text-[var(--color-sr-navy-deeper)]">
                    {counts.draft ?? 0}
                  </p>
                </div>
                <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                    In flight
                  </p>
                  <p className="mt-1 text-[1.4rem] font-bold tabular-nums text-[var(--color-sr-navy-deeper)]">
                    {(counts.submitted ?? 0) + (counts.under_review ?? 0)}
                  </p>
                </div>
                <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                    Decisions
                  </p>
                  <p className="mt-1 text-[1.4rem] font-bold tabular-nums text-[var(--color-sr-navy-deeper)]">
                    {(counts.accepted ?? 0) + (counts.rejected ?? 0)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sr-container mt-8 space-y-5">
          {draftHint ? (
            <div className="flex flex-col gap-3 border border-[var(--color-sr-navy)]/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                  {counts?.draft} draft{counts?.draft === 1 ? '' : 's'} waiting
                </p>
                <p className="mt-0.5 text-[14px] text-[var(--color-sr-muted)]">
                  Finish and submit before the programme deadline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFilter('draft')}
                className="inline-flex items-center gap-1.5 self-start text-[14px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                Show drafts
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-col gap-3 border border-[var(--color-sr-border)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch]"
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
                      <span
                        className={[
                          'tabular-nums text-[11px]',
                          active ? 'text-white/80' : 'text-[var(--color-sr-muted)]',
                        ].join(' ')}
                      >
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
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border border-[var(--color-sr-border)] bg-white p-5">
                  <div className="h-5 w-2/3 animate-pulse bg-[var(--color-sr-border)]" />
                  <div className="mt-3 h-4 w-1/3 animate-pulse bg-[var(--color-sr-border)]" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="border border-[var(--color-sr-border)] bg-white px-6 py-12 text-center">
              <p className="font-semibold text-[var(--color-sr-navy-deeper)]">
                {authError ? 'Your session has expired' : 'Could not load applications'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[var(--color-sr-muted)]">
                {authError
                  ? 'Log in again to continue managing your applications.'
                  : 'The server may be busy. Wait a moment and retry.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {authError ? (
                  <Link
                    to={`/login?redirect=${encodeURIComponent('/dashboard/applications')}`}
                    className="inline-flex items-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white"
                  >
                    Log in again
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 border border-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="border border-[var(--color-sr-border)] bg-white px-6 py-14 text-center">
              <FileText className="mx-auto h-10 w-10 text-[var(--color-sr-muted)]" />
              <h2 className="mt-4 text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">
                {statusFilter ? `No ${activeFilterLabel.toLowerCase()} applications` : 'No applications yet'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[var(--color-sr-muted)]">
                {statusFilter
                  ? 'Try another filter, or start a new application for a scholarship that fits.'
                  : 'Pick a scholarship and build your packet step by step. Drafts save automatically as you go.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {statusFilter ? (
                  <button
                    type="button"
                    onClick={() => setFilter('')}
                    className="border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Clear filter
                  </button>
                ) : null}
                <Link
                  to="/dashboard/applications/new"
                  className="inline-flex items-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white"
                >
                  Start application
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-sr-border)] border border-[var(--color-sr-border)] bg-white">
              {applications.map((app) => {
                const scholarship = scholarshipOf(app);
                const meta = statusMeta(app.status);
                const StatusIcon = meta.icon;
                const totalSteps = Math.max(5, app.steps?.length || 6);
                const step = Math.min(totalSteps, Math.max(1, app.currentStep || 1));
                const progressPct =
                  app.status === 'draft'
                    ? Math.round(((step - 1) / Math.max(1, totalSteps - 1)) * 100)
                    : 100;
                const programme = programmeOf(app);

                return (
                  <li key={app._id}>
                    <Link
                      to={`/dashboard/applications/${app._id}`}
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
                            <span className="text-[12px] font-medium text-[var(--color-sr-muted)]">
                              Step {step} of {totalSteps} · {progressPct}%
                            </span>
                          ) : null}
                        </div>

                        <h2 className="mt-2 break-words text-[1.05rem] font-bold text-[var(--color-sr-navy-deeper)] group-hover:text-[var(--color-sr-navy)] sm:truncate">
                          {titleOf(app)}
                        </h2>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--color-sr-muted)]">
                          {programme.level || programme.field ? (
                            <span className="max-w-full break-words font-medium text-[var(--color-sr-navy)]">
                              Applying:{' '}
                              {[programme.level ? getLevelLabel(programme.level) : null, programme.field]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          ) : null}
                          {scholarship?.country ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {scholarship.country}
                            </span>
                          ) : null}
                          {scholarship?.level ? <span>{getLevelLabel(scholarship.level)}</span> : null}
                          {scholarship?.deadline ? (
                            <span>Deadline {formatDeadline(scholarship.deadline)}</span>
                          ) : null}
                          <span>
                            {app.submittedAt
                              ? `Submitted ${formatDate(app.submittedAt)}`
                              : `Updated ${formatDate(app.updatedAt || app.lastSavedAt || app.createdAt)}`}
                          </span>
                        </div>

                        {app.status === 'draft' ? (
                          <div className="mt-3 h-1 max-w-xs overflow-hidden bg-[var(--color-sr-border)]">
                            <div
                              className="h-full bg-[var(--color-sr-yellow)] transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        ) : null}
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-semibold text-[var(--color-sr-navy)]">
                        {actionLabel(app.status)}
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
