import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { ApiResponse, Pagination, User } from '@/types';
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
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from './adminUi';

type UsersPayload = {
  users: User[];
  pagination: Pagination;
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const roleRaw = searchParams.get('role');
  const role = roleRaw === null ? 'student' : roleRaw === 'all' ? '' : roleRaw;
  const suspended = searchParams.get('suspended') || '';

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', page, search, role, suspended],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<UsersPayload>>('/admin/users', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          role: role || undefined,
          suspended: suspended || undefined,
        },
      });
      return res.data!;
    },
  });

  const updateFilter = (key: 'role' | 'suspended', value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (key === 'role') {
      next.set('role', value || 'all');
    } else if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  const suspendMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch(`/admin/users/${id}/suspend`, { reason });
    },
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Could not suspend user'),
  });

  const unsuspendMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/users/${id}/unsuspend`);
    },
    onSuccess: () => {
      toast.success('User unsuspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Could not unsuspend user'),
  });

  const handleSuspend = (user: User) => {
    if (!window.confirm(`Suspend ${user.name}? They will lose access until unsuspended.`)) return;
    const reason = window.prompt('Reason for suspension:', 'Policy violation');
    if (reason == null) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error('A reason is required');
      return;
    }
    suspendMutation.mutate({ id: user._id, reason: trimmed });
  };

  const handleUnsuspend = (user: User) => {
    if (!window.confirm(`Restore access for ${user.name}?`)) return;
    unsuspendMutation.mutate(user._id);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <Helmet>
        <title>Admin · Users | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Students & users"
        description="Search accounts, filter by role, and manage suspensions."
      />

      <FilterBar>
        <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email"
            className={`${inputClass} max-w-sm`}
          />
          <button type="submit" className={btnGhost}>
            Search
          </button>
        </form>
        <select
          value={role}
          onChange={(e) => updateFilter('role', e.target.value)}
          className={`${selectClass} sm:w-40`}
          aria-label="Role filter"
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={suspended}
          onChange={(e) => updateFilter('suspended', e.target.value)}
          className={`${selectClass} sm:w-44`}
          aria-label="Suspended filter"
        >
          <option value="">All statuses</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
      </FilterBar>

      {isLoading ? <LoadingBlock /> : null}
      {isError ? <ErrorBlock message="Could not load users." onRetry={() => refetch()} /> : null}

      {data && !isLoading ? (
        data.users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or filter." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Name</th>
                  <th className={thClass()}>Email</th>
                  <th className={thClass()}>Role</th>
                  <th className={thClass()}>Status</th>
                  <th className={thClass()}>Joined</th>
                  <th className={thClass()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user._id}>
                    <td className={tdClass()}>
                      <span className="font-semibold text-[var(--color-sr-navy-deeper)]">
                        {user.name}
                      </span>
                    </td>
                    <td className={tdClass()}>{user.email}</td>
                    <td className={tdClass()}>
                      <StatusBadge status={user.role} />
                    </td>
                    <td className={tdClass()}>
                      <StatusBadge status={user.isSuspended ? 'suspended' : 'active'} />
                    </td>
                    <td className={tdClass()}>{formatDate(user.createdAt)}</td>
                    <td className={tdClass()}>
                      {user.role === 'admin' ? (
                        <span className="text-[12px] text-[var(--color-sr-muted)]">-</span>
                      ) : user.isSuspended ? (
                        <button
                          type="button"
                          className={btnGhost}
                          disabled={unsuspendMutation.isPending}
                          onClick={() => handleUnsuspend(user)}
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={suspendMutation.isPending}
                          onClick={() => handleSuspend(user)}
                        >
                          Suspend
                        </button>
                      )}
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
