import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faCircleExclamation,
  faFileLines,
  faGraduationCap,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Analytics, ApiResponse, Application, Scholarship, User } from '@/types';
import {
  AdminTable,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatTile,
  StatusBadge,
  btnSecondary,
  tdClass,
  thClass,
} from './adminUi';

const APP_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'withdrawn',
] as const;

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function BarRow({
  label,
  value,
  total,
  href,
}: {
  label: string;
  value: number;
  total: number;
  href?: string;
}) {
  const width = total > 0 ? Math.max(pct(value, total), value > 0 ? 4 : 0) : 0;
  const content = (
    <>
      <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
        <span className="font-medium text-[var(--color-sr-navy-deeper)]">{label}</span>
        <span className="tabular-nums text-[var(--color-sr-muted)]">
          {value}
          <span className="ml-1.5 text-[12px]">{pct(value, total)}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden bg-[var(--color-sr-border)]">
        <div
          className="h-full bg-[var(--color-sr-navy)] transition-[width] duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </>
  );

  if (href) {
    return (
      <Link to={href} className="block rounded-sm py-1.5 hover:opacity-90">
        {content}
      </Link>
    );
  }

  return <div className="py-1.5">{content}</div>;
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-[var(--color-sr-border)] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-sr-border)] px-3 py-3 sm:px-4">
        <h2 className="min-w-0 text-[14px] font-bold text-[var(--color-sr-navy-deeper)]">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="min-w-0 p-3 sm:p-4">{children}</div>
    </section>
  );
}

function asUser(value: Application['userId']): User | null {
  return value && typeof value === 'object' ? (value as User) : null;
}

function asScholarship(value: Application['scholarshipId']): Scholarship | null {
  return value && typeof value === 'object' ? (value as Scholarship) : null;
}

export default function AdminAnalytics() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<Analytics>>('/admin/analytics');
      return res.data!;
    },
  });

  const attention = data
    ? (
        [
          {
            label: 'Pending scholarship reviews',
            value: data.scholarships.pending,
            to: '/dashboard/admin/scholarships?status=pending',
            tone: 'warn' as const,
          },
          {
            label: 'Suspended accounts',
            value: data.users.suspended ?? 0,
            to: '/dashboard/admin/users?suspended=true',
            tone: 'warn' as const,
          },
          {
            label: 'Submitted applications awaiting review',
            value: data.applications.byStatus.submitted ?? 0,
            to: '/dashboard/admin/applications?status=submitted',
            tone: 'info' as const,
          },
          {
            label: 'Draft content not published',
            value: data.content?.draft ?? 0,
            to: '/dashboard/admin/content?status=draft',
            tone: 'info' as const,
          },
        ] as const
      ).filter((item) => item.value > 0)
    : [];

  return (
    <>
      <Helmet>
        <title>Admin · Analytics | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Analytics"
        description="Live platform metrics for users, scholarships, and applications."
        actions={
          <Link to="/dashboard/admin" className={btnSecondary}>
            Back to overview
          </Link>
        }
      />

      {isLoading ? <LoadingBlock label="Loading analytics…" /> : null}
      {isError ? (
        <ErrorBlock message="Could not load analytics." onRetry={() => refetch()} />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Total users"
              value={data.users.total}
              hint={`+${data.users.last7Days ?? 0} in last 7 days`}
              to="/dashboard/admin/users"
            />
            <StatTile
              label="Students"
              value={data.users.students}
              hint={`${data.users.verifiedStudents ?? 0} verified · ${data.users.providers} providers`}
              to="/dashboard/admin/users?role=student"
            />
            <StatTile
              label="Applications"
              value={data.applications.total}
              hint={`+${data.applications.last7Days ?? 0} this week · ${data.applications.last30Days ?? 0} / 30d`}
              to="/dashboard/admin/applications"
            />
            <StatTile
              label="Scholarships live"
              value={data.scholarships.approved}
              hint={`${data.scholarships.pending} pending · ${data.scholarships.featured ?? 0} featured`}
              to="/dashboard/admin/scholarships"
            />
          </div>

          {attention.length > 0 ? (
            <Panel title="Needs attention">
              <ul className="space-y-2">
                {attention.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="flex items-center justify-between gap-3 border border-[var(--color-sr-border)] px-3 py-2.5 transition hover:border-[var(--color-sr-navy)]"
                    >
                      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-sr-navy-deeper)]">
                        <FontAwesomeIcon
                          icon={faCircleExclamation}
                          className={
                            item.tone === 'warn' ? 'text-amber-600' : 'text-[var(--color-sr-navy)]'
                          }
                        />
                        {item.label}
                      </span>
                      <span className="tabular-nums text-[15px] font-bold text-[var(--color-sr-navy)]">
                        {item.value}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <div className="border border-[var(--color-sr-border)] bg-white px-4 py-3 text-[13px] text-[var(--color-sr-muted)]">
              <FontAwesomeIcon icon={faArrowTrendUp} className="mr-2 text-[var(--color-sr-navy)]" />
              No urgent queues — platform looks clear.
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title="Application pipeline"
              action={
                <Link
                  to="/dashboard/admin/applications"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  View all
                </Link>
              }
            >
              <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--color-sr-muted)]">
                <FontAwesomeIcon icon={faFileLines} />
                {data.applications.total} total applications
              </div>
              <div className="space-y-1">
                {APP_STATUSES.map((status) => (
                  <BarRow
                    key={status}
                    label={status.replace(/_/g, ' ')}
                    value={data.applications.byStatus[status] ?? 0}
                    total={data.applications.total}
                    href={`/dashboard/admin/applications?status=${status}`}
                  />
                ))}
              </div>
            </Panel>

            <Panel
              title="User mix"
              action={
                <Link
                  to="/dashboard/admin/users"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  Manage users
                </Link>
              }
            >
              <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--color-sr-muted)]">
                <FontAwesomeIcon icon={faUsers} />
                {data.users.last30Days ?? 0} new accounts in the last 30 days
              </div>
              <div className="space-y-1">
                <BarRow
                  label="Students"
                  value={data.users.students}
                  total={data.users.total}
                  href="/dashboard/admin/users?role=student"
                />
                <BarRow
                  label="Providers"
                  value={data.users.providers}
                  total={data.users.total}
                  href="/dashboard/admin/users?role=provider"
                />
                <BarRow
                  label="Admins"
                  value={data.users.admins ?? 0}
                  total={data.users.total}
                  href="/dashboard/admin/users?role=admin"
                />
                <BarRow
                  label="Verified students"
                  value={data.users.verifiedStudents ?? 0}
                  total={data.users.students || 1}
                />
                <BarRow
                  label="Suspended"
                  value={data.users.suspended ?? 0}
                  total={data.users.total}
                  href="/dashboard/admin/users?suspended=true"
                />
              </div>
            </Panel>

            <Panel
              title="Scholarship catalogue"
              action={
                <Link
                  to="/dashboard/admin/scholarships"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  Manage
                </Link>
              }
            >
              <div className="mb-3 flex items-center gap-2 text-[12px] text-[var(--color-sr-muted)]">
                <FontAwesomeIcon icon={faGraduationCap} />
                {data.scholarships.total} listings · {data.content?.published ?? 0} published content
              </div>
              <div className="space-y-1">
                <BarRow
                  label="Approved"
                  value={data.scholarships.approved}
                  total={data.scholarships.total}
                  href="/dashboard/admin/scholarships?status=approved"
                />
                <BarRow
                  label="Pending"
                  value={data.scholarships.pending}
                  total={data.scholarships.total}
                  href="/dashboard/admin/scholarships?status=pending"
                />
                <BarRow
                  label="Rejected"
                  value={data.scholarships.rejected ?? 0}
                  total={data.scholarships.total}
                  href="/dashboard/admin/scholarships?status=rejected"
                />
                <BarRow
                  label="Featured"
                  value={data.scholarships.featured ?? 0}
                  total={data.scholarships.total}
                />
              </div>
            </Panel>

            <Panel title="Top scholarships by applications">
              {(data.topScholarships || []).length === 0 ? (
                <p className="text-[13px] text-[var(--color-sr-muted)]">
                  No applications yet. Rankings appear once students start applying.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--color-sr-border)]">
                  {(data.topScholarships || []).map((s, index) => (
                    <li key={s._id || index} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--color-sr-navy-deeper)]">
                          {s.title || 'Scholarship'}
                        </p>
                        <p className="text-[12px] text-[var(--color-sr-muted)]">{s.country || '—'}</p>
                      </div>
                      <span className="shrink-0 tabular-nums text-[14px] font-bold text-[var(--color-sr-navy)]">
                        {s.applicationCount ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel
            title="Recent applications"
            action={
              <Link
                to="/dashboard/admin/applications"
                className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
              >
                View all
              </Link>
            }
          >
            {(data.recent.applications || []).length === 0 ? (
              <p className="text-[13px] text-[var(--color-sr-muted)]">No applications yet.</p>
            ) : (
              <AdminTable>
                <thead>
                  <tr>
                    <th className={thClass()}>Student</th>
                    <th className={thClass()}>Scholarship</th>
                    <th className={thClass()}>Status</th>
                    <th className={thClass()}>Updated</th>
                    <th className={thClass()}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent.applications || []).map((app) => {
                    const student = asUser(app.userId as Application['userId']);
                    const scholarship = asScholarship(
                      app.scholarshipId as Application['scholarshipId'],
                    );
                    return (
                      <tr key={app._id}>
                        <td className={tdClass()}>
                          <div className="font-semibold text-[var(--color-sr-navy-deeper)]">
                            {student?.name || 'Unknown'}
                          </div>
                          <div className="text-[12px] text-[var(--color-sr-muted)]">
                            {student?.email || '—'}
                          </div>
                        </td>
                        <td className={tdClass()}>
                          <span className="line-clamp-2 font-medium">
                            {scholarship?.title || 'Scholarship'}
                          </span>
                        </td>
                        <td className={tdClass()}>
                          <StatusBadge status={app.status || 'draft'} />
                        </td>
                        <td className={tdClass()}>
                          {app.updatedAt ? formatDate(app.updatedAt) : '—'}
                        </td>
                        <td className={tdClass()}>
                          <Link
                            to={`/dashboard/admin/applications/${app._id}`}
                            className="text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </AdminTable>
            )}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title="Newest users"
              action={
                <Link
                  to="/dashboard/admin/users"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  View all
                </Link>
              }
            >
              <AdminTable>
                <thead>
                  <tr>
                    <th className={thClass()}>Name</th>
                    <th className={thClass()}>Role</th>
                    <th className={thClass()}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent.users || []).slice(0, 6).map((u) => (
                    <tr key={u._id}>
                      <td className={tdClass()}>
                        <div className="font-semibold text-[var(--color-sr-navy-deeper)]">
                          {u.name || '-'}
                        </div>
                        <div className="text-[12px] text-[var(--color-sr-muted)]">{u.email}</div>
                      </td>
                      <td className={tdClass()}>
                        <StatusBadge status={u.isSuspended ? 'suspended' : u.role || 'student'} />
                      </td>
                      <td className={tdClass()}>
                        {u.createdAt ? formatDate(u.createdAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </Panel>

            <Panel title="Premium">
              <dl className="space-y-2 text-[13px]">
                <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] py-2">
                  <dt className="text-[var(--color-sr-muted)]">Active premium users</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-sr-navy-deeper)]">
                    {data.revenue.totalPremium}
                  </dd>
                </div>
                {(data.revenue.byPlan || []).length === 0 ? (
                  <p className="pt-2 text-[var(--color-sr-muted)]">
                    No paid plans active yet. Counts will appear when subscriptions start.
                  </p>
                ) : (
                  data.revenue.byPlan.map((plan) => (
                    <div
                      key={plan._id}
                      className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] py-2 last:border-b-0"
                    >
                      <dt className="capitalize text-[var(--color-sr-muted)]">{plan._id}</dt>
                      <dd className="font-semibold tabular-nums">
                        {plan.count} · {plan.totalRevenue}
                      </dd>
                    </div>
                  ))
                )}
              </dl>
            </Panel>
          </div>

          {data.generatedAt ? (
            <p className="text-[11px] text-[var(--color-sr-muted)]">
              Snapshot generated {formatDate(data.generatedAt)}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
