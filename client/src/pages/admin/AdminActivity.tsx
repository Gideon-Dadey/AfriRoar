import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';
import type { ApiResponse, AuditLog, Pagination, User } from '@/types';
import {
  AdminTable,
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  PaginationControls,
  tdClass,
  thClass,
} from './adminUi';

type AuditPayload = {
  logs: AuditLog[];
  pagination: Pagination;
};

function actorLabel(log: AuditLog) {
  const u = log.userId;
  if (u && typeof u === 'object') {
    return (u as User).name || (u as User).email || 'System';
  }
  return 'System';
}

function metadataSnippet(meta?: Record<string, unknown>) {
  if (!meta || Object.keys(meta).length === 0) return '-';
  try {
    return truncate(JSON.stringify(meta), 80);
  } catch {
    return '-';
  }
}

export default function AdminActivity() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: async () => {
      const { data: res } = await api.get<ApiResponse<AuditPayload>>('/admin/audit-logs', {
        params: { page, limit: 50 },
      });
      return res.data!;
    },
  });

  return (
    <>
      <Helmet>
        <title>Admin · Activity | AfriRoar</title>
      </Helmet>

      <PageHeader
        title="Activity"
        description="Audit trail of admin actions across the platform."
      />

      {isLoading ? <LoadingBlock /> : null}
      {isError ? (
        <ErrorBlock message="Could not load activity logs." onRetry={() => refetch()} />
      ) : null}

      {data && !isLoading ? (
        data.logs.length === 0 ? (
          <EmptyState title="No activity yet" description="Admin actions will appear here." />
        ) : (
          <>
            <AdminTable>
              <thead>
                <tr>
                  <th className={thClass()}>Action</th>
                  <th className={thClass()}>Actor</th>
                  <th className={thClass()}>Target</th>
                  <th className={thClass()}>Time</th>
                  <th className={thClass()}>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log._id}>
                    <td className={tdClass()}>
                      <code className="text-[12px] font-semibold text-[var(--color-sr-navy-deeper)]">
                        {log.action}
                      </code>
                    </td>
                    <td className={tdClass()}>{actorLabel(log)}</td>
                    <td className={tdClass()}>
                      <div className="text-[12px] font-medium">{log.targetModel || '-'}</div>
                      <div className="font-mono text-[11px] text-[var(--color-sr-muted)]">
                        {log.targetId ? truncate(String(log.targetId), 18) : '-'}
                      </div>
                    </td>
                    <td className={tdClass()}>{formatDate(log.createdAt)}</td>
                    <td className={tdClass()}>
                      <span className="font-mono text-[11px] text-[var(--color-sr-muted)]">
                        {metadataSnippet(log.metadata)}
                      </span>
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
