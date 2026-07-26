import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { ApiResponse, Job, JobApplication, Pagination, User } from '@/types';
import {
  AdminTable,
  EmptyState,
  ErrorBlock,
  FilterBar,
  LoadingBlock,
  PageHeader,
  PaginationControls,
  StatusBadge,
  btnGhost,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from './adminUi';

type Payload = {
  applications: JobApplication[];
  pagination: Pagination;
};

function userLabel(app: JobApplication) {
  const u = app.userId;
  if (u && typeof u === 'object') {
    return {
      name: (u as User).name || 'Unknown',
      email: (u as User).email || '-',
    };
  }
  return { name: 'Unknown', email: '-' };
}

function jobLabel(app: JobApplication) {
  const j = app.jobId;
  if (j && typeof j === 'object') {
    const job = j as Job;
    return `${job.title || 'Role'}${job.company ? ` · ${job.company}` : ''}`;
  }
  return 'Job';
}

export default function AdminJobApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const status = searchParams.get('status') || '';
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'job-applications', page, status, search],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<Payload>>('/admin/job-applications', {
        params: {
          page,
          limit: 20,
          status: status || undefined,
          search: search || undefined,
        },
      });
      return res.data!;
    },
  });

  const applySearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const setStatus = (value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Admin · Job applications | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Job applications"
        description="Review candidate submissions and update hiring status."
      />

      <FilterBar>
        <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidate name or email"
            className={`${inputClass} max-w-sm`}
          />
          <button type="submit" className={btnGhost}>
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${selectClass} sm:w-48`}
          aria-label="Status filter"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </FilterBar>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <ErrorBlock message="Could not load job applications." onRetry={() => refetch()} />
      ) : null}

      {data && !isLoading ? (
        data.applications.length === 0 ? (
          <EmptyState title="No applications found" description="Nothing matches this filter yet." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Candidate</th>
                  <th className={thClass()}>Role</th>
                  <th className={thClass()}>Status</th>
                  <th className={thClass()}>Submitted</th>
                  <th className={thClass()}>Updated</th>
                  <th className={thClass()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((app) => {
                  const student = userLabel(app);
                  return (
                    <tr key={app._id}>
                      <td className={tdClass()}>
                        <div className="font-semibold text-[var(--color-sr-navy-deeper)]">
                          {student.name}
                        </div>
                        <div className="text-[12px] text-[var(--color-sr-muted)]">{student.email}</div>
                      </td>
                      <td className={tdClass()}>
                        <span className="line-clamp-2 font-medium">{jobLabel(app)}</span>
                      </td>
                      <td className={tdClass()}>
                        <StatusBadge status={app.status} />
                      </td>
                      <td className={tdClass()}>
                        {app.submittedAt ? formatDate(app.submittedAt) : '-'}
                      </td>
                      <td className={tdClass()}>{formatDate(app.updatedAt)}</td>
                      <td className={tdClass()}>
                        <Link
                          to={`/dashboard/admin/job-applications/${app._id}`}
                          className="text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                        >
                          View application
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </AdminTable>
            <PaginationControls
              page={data.pagination.page}
              pages={data.pagination.pages}
              total={data.pagination.total}
              onPageChange={setPage}
            />
          </>
        )
      ) : null}
    </>
  );
}
