import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, getLevelLabel } from '@/lib/utils';
import type { ApiResponse, Pagination, Scholarship } from '@/types';
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

type ScholarshipsPayload = {
  scholarships: Scholarship[];
  pagination: Pagination;
};

export default function AdminScholarships() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    const fromUrl = searchParams.get('status') || '';
    setStatus(fromUrl);
  }, [searchParams]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'scholarships', page, search, status],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<ScholarshipsPayload>>('/admin/scholarships', {
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'scholarships'] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/scholarships/${id}/approve`),
    onSuccess: () => {
      toast.success('Scholarship approved');
      invalidate();
    },
    onError: () => toast.error('Could not approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/admin/scholarships/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Scholarship rejected');
      invalidate();
    },
    onError: () => toast.error('Could not reject'),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/admin/scholarships/${id}/feature`, { isFeatured }),
    onSuccess: (_, vars) => {
      toast.success(vars.isFeatured ? 'Marked featured' : 'Removed from featured');
      invalidate();
    },
    onError: () => toast.error('Could not update featured'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/scholarships/${id}`),
    onSuccess: () => {
      toast.success('Scholarship deleted');
      invalidate();
    },
    onError: () => toast.error('Could not delete'),
  });

  const handleReject = (s: Scholarship) => {
    if (!window.confirm(`Reject "${s.title}"?`)) return;
    const reason = window.prompt('Reason for rejection:', 'Does not meet listing standards');
    if (reason == null) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error('A reason is required');
      return;
    }
    rejectMutation.mutate({ id: s._id, reason: trimmed });
  };

  const handleDelete = (s: Scholarship) => {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(s._id);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <Helmet>
        <title>Admin · Scholarships | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Scholarships"
        description="Approve listings, feature opportunities, and manage the catalog."
        actions={
          <Link to="/dashboard/admin/scholarships/new" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" />
            Add scholarship
          </Link>
        }
      />

      <FilterBar>
        <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, country, field"
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterBar>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <ErrorBlock message="Could not load scholarships." onRetry={() => refetch()} />
      ) : null}

      {data && !isLoading ? (
        data.scholarships.length === 0 ? (
          <EmptyState title="No scholarships found" description="Try a different filter or add one." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Scholarship</th>
                  <th className={thClass()}>Country</th>
                  <th className={thClass()}>Level</th>
                  <th className={thClass()}>Status</th>
                  <th className={thClass()}>Featured</th>
                  <th className={thClass()}>Deadline</th>
                  <th className={thClass()}>Apps</th>
                  <th className={thClass()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.scholarships.map((s) => (
                  <tr key={s._id}>
                    <td className={tdClass()}>
                      <div className="flex items-center gap-2.5">
                        {s.coverImage ? (
                          <img
                            src={s.coverImage}
                            alt=""
                            className="h-10 w-14 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center bg-[var(--color-sr-bg)] text-[10px] text-[var(--color-sr-muted)]">
                            N/A
                          </div>
                        )}
                        <span className="line-clamp-2 font-semibold text-[var(--color-sr-navy-deeper)]">
                          {s.title}
                        </span>
                      </div>
                    </td>
                    <td className={tdClass()}>{s.country}</td>
                    <td className={tdClass()}>{getLevelLabel(s.level)}</td>
                    <td className={tdClass()}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td className={tdClass()}>
                      {s.isFeatured ? (
                        <Star className="h-4 w-4 fill-[var(--color-sr-yellow)] text-[var(--color-sr-yellow)]" />
                      ) : (
                        <span className="text-[var(--color-sr-muted)]">-</span>
                      )}
                    </td>
                    <td className={tdClass()}>{formatDate(s.deadline)}</td>
                    <td className={tdClass()}>{s.applicationCount ?? 0}</td>
                    <td className={tdClass()}>
                      <div className="flex flex-wrap gap-1.5">
                        {s.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              className={btnGhost}
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate(s._id)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className={btnDanger}
                              disabled={rejectMutation.isPending}
                              onClick={() => handleReject(s)}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          className={btnGhost}
                          disabled={featureMutation.isPending}
                          onClick={() =>
                            featureMutation.mutate({ id: s._id, isFeatured: !s.isFeatured })
                          }
                        >
                          {s.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <Link to={`/dashboard/admin/scholarships/${s._id}/edit`} className={btnGhost}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(s)}
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
