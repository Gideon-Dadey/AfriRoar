import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const { data: res } = await api.get('/notifications', { params: { limit: 1 } });
      return res.data as { unreadCount: number };
    },
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (!isAuthenticated) return null;

  const unread = data?.unreadCount || 0;

  return (
    <Link
      to="/dashboard/notifications"
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center text-white/85 transition hover:text-[var(--color-sr-yellow)]"
      aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
    >
      <Bell className="h-[18px] w-[18px]" />
      {unread > 0 ? (
        <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center bg-[var(--color-sr-yellow)] px-1 text-[10px] font-bold text-[var(--color-sr-navy-deeper)]">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
