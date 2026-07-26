import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmModal';
import type { ApiResponse, ContentItem, Pagination } from '@/types';
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

type ContentPayload = {
  items: ContentItem[];
  pagination: Pagination;
};

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'guide', label: 'Guides' },
  { value: 'internship', label: 'Internships' },
  { value: 'list', label: 'Lists' },
  { value: 'job', label: 'Jobs' },
] as const;

export default function AdminContent() {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const status = searchParams.get('status') || '';
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'content', page, category, status, search],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<ContentPayload>>('/admin/content', {
        params: {
          page,
          limit: 20,
          category: category || undefined,
          status: status || undefined,
          search: search || undefined,
        },
      });
      return res.data!;
    },
  });

  const setStatus = (value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    setSearchParams(next, { replace: true });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/content/${id}`),
    onSuccess: () => {
      toast.success('Content deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
    onError: () => toast.error('Could not delete content'),
  });

  const handleDelete = async (item: ContentItem) => {
    const ok = await confirm({
      title: 'Confirm Deletion',
      description: `Are you sure you want to permanently remove “${item.title}”? This page will be taken off the site.`,
      confirmLabel: 'Delete content',
      variant: 'danger',
    });
    if (ok === false) return;
    deleteMutation.mutate(item._id);
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
        <title>Admin · Content | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Content"
        description="Guides, internships, lists, and job posts."
        actions={
          <Link to="/dashboard/admin/content/new" className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" />
            Add content
          </Link>
        }
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.value || 'all'}
            type="button"
            onClick={() => {
              setPage(1);
              setCategory(c.value);
            }}
            className={
              category === c.value
                ? 'border border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] px-3 py-1.5 text-[12px] font-semibold text-white'
                : 'border border-[var(--color-sr-border)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]'
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <FilterBar>
        <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or excerpt"
            className={`${inputClass} max-w-sm`}
          />
          <button type="submit" className={btnGhost}>
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className={`${selectClass} sm:w-40`}
          aria-label="Status filter"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </FilterBar>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? <ErrorBlock message="Could not load content." onRetry={() => refetch()} /> : null}

      {data && !isLoading ? (
        data.items.length === 0 ? (
          <EmptyState title="No content found" description="Try another category or add a post." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Item</th>
                  <th className={thClass()}>Category</th>
                  <th className={thClass()}>Status</th>
                  <th className={thClass()}>Updated</th>
                  <th className={thClass()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item._id}>
                    <td className={tdClass()}>
                      <div className="flex items-center gap-2.5">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="h-10 w-14 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 shrink-0 items-center justify-center bg-[var(--color-sr-bg)] text-[10px] text-[var(--color-sr-muted)]">
                            N/A
                          </div>
                        )}
                        <span className="line-clamp-2 font-semibold text-[var(--color-sr-navy-deeper)]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className={tdClass()}>
                      <StatusBadge status={item.category} />
                    </td>
                    <td className={tdClass()}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className={tdClass()}>{formatDate(item.updatedAt)}</td>
                    <td className={tdClass()}>
                      <div className="flex flex-wrap gap-1.5">
                        <Link to={`/dashboard/admin/content/${item._id}/edit`} className={btnGhost}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(item)}
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
