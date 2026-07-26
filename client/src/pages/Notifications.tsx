import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

type AppNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: res } = await api.get('/notifications', { params: { limit: 50 } });
      return res.data as { notifications: AppNotification[]; unreadCount: number };
    },
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked read');
    },
  });

  const items = data?.notifications || [];

  return (
    <>
      <Helmet>
        <title>Notifications | AfriRoar</title>
      </Helmet>

      <div className="min-h-[70vh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--color-sr-bg)] pb-16">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Workspace
              </p>
              <h1 className="text-[1.75rem] font-bold text-[var(--color-sr-navy-deeper)]">
                Notifications
              </h1>
              <p className="mt-2 text-[15px] text-[var(--color-sr-muted)]">
                Application updates and deadline reminders for your saved scholarships.
              </p>
            </div>
            {items.some((n) => !n.read) ? (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            ) : null}
          </div>
        </div>

        <div className="sr-container py-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[var(--color-sr-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="border border-[var(--color-sr-border)] bg-white p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-[var(--color-sr-navy)]" />
              <p className="mt-3 font-semibold">You're all caught up</p>
              <p className="mt-1 text-sm text-[var(--color-sr-muted)]">
                New application status changes and deadline alerts will show here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((n) => {
                const inner = (
                  <div
                    className={[
                      'border border-[var(--color-sr-border)] bg-white p-4 transition hover:border-[var(--color-sr-navy)]',
                      !n.read ? 'border-l-4 border-l-[var(--color-sr-yellow)]' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-sr-navy-deeper)]">{n.title}</p>
                        <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                          {n.message}
                        </p>
                        <p className="mt-2 text-[12px] text-[var(--color-sr-muted)]">
                          {formatDate(n.createdAt)}
                        </p>
                      </div>
                      {!n.read ? (
                        <button
                          type="button"
                          className="shrink-0 text-[12px] font-semibold text-[var(--color-sr-link)] hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markRead.mutate(n._id);
                          }}
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </div>
                );

                return (
                  <li key={n._id}>
                    {n.link ? (
                      <Link
                        to={n.link}
                        onClick={() => {
                          if (!n.read) markRead.mutate(n._id);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
