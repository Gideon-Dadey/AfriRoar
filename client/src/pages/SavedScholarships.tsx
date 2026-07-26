import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Calendar, Globe2, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDeadline, getLevelLabel } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship, User } from '@/types';

function savedId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return String((value as { _id: string })._id);
  }
  return String(value);
}

export default function SavedScholarships() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me', 'saved'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      const nextUser = data.data.user as User;
      updateUser(nextUser);
      return nextUser;
    },
  });

  const saved = (me?.savedScholarships || user?.savedScholarships || []) as unknown[];
  const items = saved.filter((s) => s && typeof s === 'object' && 'title' in (s as object)) as Scholarship[];

  const unsave = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/auth/save-scholarship/${id}`);
      return data.data as { saved: boolean; savedScholarships: string[] };
    },
    onSuccess: (result) => {
      updateUser({ savedScholarships: result.savedScholarships });
      queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
      toast.success('Removed from saved');
    },
    onError: () => toast.error('Could not update saved list'),
  });

  return (
    <>
      <Helmet>
        <title>Saved scholarships | AfriRoar</title>
      </Helmet>

      <div className="min-h-[70vh] w-full max-w-[100vw] overflow-x-hidden bg-[var(--color-sr-bg)] pb-16">
        <div className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-8">
            <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              Workspace
            </p>
            <h1 className="text-[1.75rem] font-bold text-[var(--color-sr-navy-deeper)]">
              Saved scholarships
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-[var(--color-sr-muted)]">
              Bookmarks sync across devices. We also remind you when a saved deadline is within 14 days.
            </p>
          </div>
        </div>

        <div className="sr-container py-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[var(--color-sr-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading saved list…
            </div>
          ) : items.length === 0 ? (
            <div className="border border-[var(--color-sr-border)] bg-white p-8 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-[var(--color-sr-navy)]" />
              <p className="mt-3 font-semibold text-[var(--color-sr-navy-deeper)]">No saved scholarships yet</p>
              <p className="mt-1 text-sm text-[var(--color-sr-muted)]">
                Tap Save on any scholarship detail page to build your shortlist.
              </p>
              <Link to="/scholarships" className="sr-load-more mt-5 inline-flex">
                Browse scholarships
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((s) => (
                <li
                  key={s._id}
                  className="flex flex-col gap-3 border border-[var(--color-sr-border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/scholarships/${s.slug}`}
                      className="text-[16px] font-semibold text-[var(--color-sr-navy-deeper)] hover:underline"
                    >
                      {s.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-[13px] text-[var(--color-sr-muted)]">
                      {s.country ? (
                        <span className="inline-flex items-center gap-1">
                          <Globe2 className="h-3.5 w-3.5" />
                          {s.country}
                        </span>
                      ) : null}
                      {s.level ? <span>{getLevelLabel(s.level)}</span> : null}
                      {s.deadline ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDeadline(s.deadline)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/scholarships/${s.slug}`}
                      className="inline-flex items-center border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      disabled={unsave.isPending}
                      onClick={() => unsave.mutate(savedId(s._id))}
                      className="inline-flex items-center gap-1.5 border border-[var(--color-sr-border)] px-3 py-2 text-[13px] font-semibold text-[var(--color-sr-muted)] hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
