import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-[1.35rem] font-bold tracking-tight text-[var(--color-sr-navy-deeper)] sm:text-[1.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-sr-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:flex-wrap sm:items-center [&>a]:w-full [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
        {label}
      </p>
      <p className="mt-2 text-[1.5rem] font-bold tabular-nums leading-none text-[var(--color-sr-navy-deeper)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-[12px] text-[var(--color-sr-muted)]">{hint}</p> : null}
    </>
  );

  const className =
    'flex min-h-[96px] flex-col border border-[var(--color-sr-border)] bg-white p-3.5 transition hover:border-[var(--color-sr-navy)]';

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-2 border border-[var(--color-sr-border)] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center [&>input]:w-full [&>select]:w-full sm:[&>input]:max-w-sm sm:[&>select]:w-auto">
      {children}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border border-dashed border-[var(--color-sr-border)] bg-white px-4 py-12 text-center">
      <p className="text-[15px] font-semibold text-[var(--color-sr-navy)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-[13px] text-[var(--color-sr-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 border border-[var(--color-sr-border)] bg-white py-16 text-[14px] text-[var(--color-sr-muted)]">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-8 text-center">
      <p className="text-[14px] font-semibold text-red-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex border border-red-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-red-800 hover:bg-red-50"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function PaginationControls({
  page,
  pages,
  total,
  onPageChange,
}: {
  page: number;
  pages: number;
  total?: number;
  onPageChange: (page: number) => void;
}) {
  if (pages <= 1 && (total == null || total === 0)) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border border-[var(--color-sr-border)] bg-white px-3 py-2.5">
      <p className="text-[12px] text-[var(--color-sr-muted)]">
        Page {page} of {Math.max(pages, 1)}
        {total != null ? ` · ${total} total` : ''}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border border-[var(--color-sr-border)] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="border border-[var(--color-sr-border)] px-3 py-1.5 text-[13px] font-semibold text-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    published: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-900 border-amber-200',
    draft: 'bg-amber-50 text-amber-900 border-amber-200',
    submitted: 'bg-sky-50 text-sky-900 border-sky-200',
    under_review: 'bg-sky-50 text-sky-900 border-sky-200',
    rejected: 'bg-red-50 text-red-800 border-red-200',
    suspended: 'bg-red-50 text-red-800 border-red-200',
    withdrawn: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles[status] || 'bg-[var(--color-sr-bg)] text-[var(--color-sr-navy)] border-[var(--color-sr-border)]',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain border border-[var(--color-sr-border)] bg-white [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[560px] border-collapse text-left text-[13px] sm:min-w-[680px]">
        {children}
      </table>
    </div>
  );
}

export function thClass() {
  return 'border-b border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-sr-muted)]';
}

export function tdClass() {
  return 'border-b border-[var(--color-sr-border)] px-3 py-2.5 align-middle text-[var(--color-sr-text)]';
}

export const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-2 text-[16px] text-[var(--color-sr-text)] outline-none focus:border-[var(--color-sr-navy)]';

export const selectClass = inputClass;

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 border border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-deeper)] disabled:opacity-50 sm:py-2';

export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 border border-[var(--color-sr-border)] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)] disabled:opacity-50 sm:py-2';

export const btnDanger =
  'inline-flex items-center justify-center gap-1.5 border border-red-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50';

export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 border border-[var(--color-sr-border)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)] disabled:opacity-50';
