import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, getEmploymentTypeLabel, getWorkplaceTypeLabel } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmModal';
import type { ApiResponse, Job, Pagination } from '@/types';
import {
  AdminTable,
  EmptyState,
  ErrorBlock,
  FilterBar,
  LoadingBlock,
  PageHeader,
  PaginationControls,
  StatusBadge,
  btnDanger,
  btnGhost,
  btnPrimary,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from './adminUi';

type JobsPayload = {
  jobs: Job[];
  pagination: Pagination;
};

export default function AdminJobs() {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    setStatus(searchParams.get('status') || '');
  }, [searchParams]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'jobs', page, search, status],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<JobsPayload>>('/admin/jobs', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          status: status || undefined,
        },
      });
      return res.data!;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });

  const featureMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/admin/jobs/${id}/feature`, { isFeatured }),
    onSuccess: (_, vars) => {
      toast.success(vars.isFeatured ? 'Marked featured' : 'Removed from featured');
      invalidate();
    },
    onError: () => toast.error('Could not update featured'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/jobs/${id}`),
    onSuccess: () => {
      toast.success('Job deleted');
      invalidate();
    },
    onError: () => toast.error('Could not delete'),
  });

  const handleDelete = async (job: Job) => {
    const ok = await confirm({
      title: 'Confirm Deletion',
      description: `Are you sure you want to permanently remove “${job.title}”? Related applications may break.`,
      confirmLabel: 'Delete job',
      variant: 'danger',
    });
    if (ok === false) return;
    deleteMutation.mutate(job._id);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      {dialog}
      <Helmet>
        <title>Admin · Jobs | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Jobs"
        description="Publish roles, feature openings, and manage the jobs catalog."
        actions={
          <Link to="/dashboard/admin/jobs/new" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" />
            Add job
          </Link>
        }
      />

      <FilterBar>
        <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, company, field"
            className={`${inputClass} max-w-sm`}
          />
          <button type="submit" className={btnGhost}>
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value;
            setPage(1);
            setStatus(next);
            if (next) setSearchParams({ status: next });
            else setSearchParams({});
          }}
          className={`${selectClass} sm:w-44`}
          aria-label="Status filter"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </FilterBar>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? <ErrorBlock message="Could not load jobs." onRetry={() => refetch()} /> : null}

      {data && !isLoading ? (
        data.jobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Try a different filter or add one." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Role</th>
                  <th className={thClass()}>Company</th>
                  <th className={thClass()}>Type</th>
                  <th className={thClass()}>Status</th>
                  <th className={thClass()}>Featured</th>
                  <th className={thClass()}>Deadline</th>
                  <th className={thClass()}>Apps</th>
                  <th className={thClass()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <tr key={job._id}>
                    <td className={tdClass()}>
                      <div className="flex items-center gap-2.5">
                        {job.coverImage ? (
                          <img
                            src={job.coverImage}
                            alt=""
                            className="h-10 w-14 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center bg-[var(--color-sr-bg)] text-[10px] text-[var(--color-sr-muted)]">
                            N/A
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="line-clamp-2 font-semibold text-[var(--color-sr-navy-deeper)]">
                            {job.title}
                          </span>
                          <p className="text-[11px] text-[var(--color-sr-muted)]">
                            {job.location || job.country} · {getWorkplaceTypeLabel(job.workplaceType)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass()}>{job.company}</td>
                    <td className={tdClass()}>{getEmploymentTypeLabel(job.employmentType)}</td>
                    <td className={tdClass()}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className={tdClass()}>
                      {job.isFeatured ? (
                        <Star className="h-4 w-4 fill-[var(--color-sr-yellow)] text-[var(--color-sr-yellow)]" />
                      ) : (
                        <span className="text-[var(--color-sr-muted)]">-</span>
                      )}
                    </td>
                    <td className={tdClass()}>{formatDate(job.deadline)}</td>
                    <td className={tdClass()}>{job.applicationCount ?? 0}</td>
                    <td className={tdClass()}>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className={btnGhost}
                          disabled={featureMutation.isPending}
                          onClick={() =>
                            featureMutation.mutate({ id: job._id, isFeatured: !job.isFeatured })
                          }
                        >
                          {job.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <Link to={`/dashboard/admin/jobs/${job._id}/edit`} className={btnGhost}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(job)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
