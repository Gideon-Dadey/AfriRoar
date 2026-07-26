import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Analytics, ApiResponse } from '@/types';
import {
  AdminTable,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatTile,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  tdClass,
  thClass,
} from './adminUi';

export default function AdminOverview() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<Analytics>>('/admin/analytics');
      return res.data!;
    },
  });

  return (
    <>
      <Helmet>
        <title>Admin · Overview | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Overview"
        description="Platform health, pending work, and recent activity."
        actions={
          <>
            <Link to="/dashboard/admin/scholarships/new" className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" />
              Add scholarship
            </Link>
            <Link to="/dashboard/admin/content/new" className={btnSecondary}>
              <Plus className="h-3.5 w-3.5" />
              Add content
            </Link>
            <Link to="/dashboard/admin/applications" className={btnSecondary}>
              View applications
            </Link>
          </>
        }
      />

      {isLoading ? <LoadingBlock label="Loading analytics…" /> : null}
      {isError ? (
        <ErrorBlock message="Could not load analytics." onRetry={() => refetch()} />
      ) : null}

      {data ? (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Users"
              value={data.users.total}
              hint={`${data.users.students} students · ${data.users.admins ?? 0} admins`}
              to="/dashboard/admin/users"
            />
            <StatTile
              label="Pending scholarships"
              value={data.scholarships.pending}
              hint={`${data.scholarships.approved} approved · ${data.scholarships.total} total`}
              to="/dashboard/admin/scholarships?status=pending"
            />
            <StatTile
              label="Applications"
              value={data.applications.total}
              hint="Across all statuses"
              to="/dashboard/admin/applications"
            />
            <StatTile
              label="Content"
              value={data.content?.total ?? 0}
              hint={`${data.content?.published ?? 0} published`}
              to="/dashboard/admin/content"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[var(--color-sr-navy-deeper)]">
                  Recent users
                </h2>
                <Link
                  to="/dashboard/admin/users"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  View all
                </Link>
              </div>
              <AdminTable>
                <thead>
                  <tr>
                    <th className={thClass()}>Name</th>
                    <th className={thClass()}>Role</th>
                    <th className={thClass()}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent.users || []).map((u) => (
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
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[var(--color-sr-navy-deeper)]">
                  Recent scholarships
                </h2>
                <Link
                  to="/dashboard/admin/scholarships"
                  className="text-[12px] font-semibold text-[var(--color-sr-navy)] hover:underline"
                >
                  View all
                </Link>
              </div>
              <AdminTable>
                <thead>
                  <tr>
                    <th className={thClass()}>Title</th>
                    <th className={thClass()}>Status</th>
                    <th className={thClass()}>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent.scholarships || []).map((s) => (
                    <tr key={s._id}>
                      <td className={tdClass()}>
                        <div className="font-semibold text-[var(--color-sr-navy-deeper)]">
                          {s.title || '-'}
                        </div>
                        <div className="text-[12px] text-[var(--color-sr-muted)]">
                          {s.country || '-'}
                        </div>
                      </td>
                      <td className={tdClass()}>
                        <StatusBadge status={s.status || 'pending'} />
                      </td>
                      <td className={tdClass()}>
                        {s.createdAt ? formatDate(s.createdAt) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
