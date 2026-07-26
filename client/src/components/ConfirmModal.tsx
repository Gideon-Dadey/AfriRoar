import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'default';

export type ConfirmRequest = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** Optional reason / note field */
  input?: {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    required?: boolean;
  };
};

type Resolver = (value: string | false) => void;

type ActiveState = ConfirmRequest & { resolve: Resolver };

const variantStyles: Record<
  ConfirmVariant,
  { icon: string; confirm: string; ring: string }
> = {
  danger: {
    icon: 'bg-red-50 text-red-700',
    confirm: 'bg-red-700 text-white hover:bg-red-800',
    ring: 'focus-visible:ring-red-700/30',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-800',
    confirm: 'bg-amber-700 text-white hover:bg-amber-800',
    ring: 'focus-visible:ring-amber-700/30',
  },
  default: {
    icon: 'bg-[var(--color-sr-bg)] text-[var(--color-sr-navy)]',
    confirm: 'bg-[var(--color-sr-navy)] text-white hover:bg-[var(--color-sr-navy-dark)]',
    ring: 'focus-visible:ring-[var(--color-sr-navy)]/30',
  },
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  input,
  inputValue,
  onInputChange,
  inputError,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  input?: ConfirmRequest['input'];
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputError?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => confirmRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--color-sr-navy-deeper)]/55"
        aria-label="Close dialog"
        disabled={busy}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative w-full max-w-md border border-[var(--color-sr-border)] bg-white shadow-2xl"
      >
        <div className="flex gap-3 p-5 sm:p-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center ${styles.icon}`}
            aria-hidden
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[1.05rem] font-bold text-[var(--color-sr-navy-deeper)]">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-sr-muted)]">
                {description}
              </p>
            ) : null}
            {input ? (
              <div className="mt-4">
                <label
                  htmlFor={inputId}
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  {input.label}
                  {input.required ? <span className="text-red-600"> *</span> : null}
                </label>
                <textarea
                  id={inputId}
                  rows={3}
                  value={inputValue ?? ''}
                  onChange={(e) => onInputChange?.(e.target.value)}
                  placeholder={input.placeholder}
                  disabled={busy}
                  className="w-full border border-[var(--color-sr-border)] px-3 py-2.5 text-[16px] text-[var(--color-sr-text)] outline-none focus:border-[var(--color-sr-navy)] disabled:opacity-60"
                />
                {inputError ? (
                  <p className="mt-1.5 text-[12px] font-medium text-red-700">{inputError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex items-center justify-center border border-[var(--color-sr-border)] bg-white px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center px-4 py-2.5 text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 ${styles.confirm} ${styles.ring}`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Promise-based confirm for destructive / irreversible actions.
 * Returns `false` on cancel, or the input string (empty if no input) on confirm.
 */
export function useConfirm(): {
  confirm: (options: ConfirmRequest) => Promise<string | false>;
  dialog: ReactNode;
} {
  const [active, setActive] = useState<ActiveState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const confirm = useCallback((options: ConfirmRequest) => {
    return new Promise<string | false>((resolve) => {
      setInputValue(options.input?.defaultValue ?? '');
      setInputError('');
      setActive({ ...options, resolve });
    });
  }, []);

  const close = useCallback((result: string | false) => {
    setActive((current) => {
      current?.resolve(result);
      return null;
    });
    setInputError('');
  }, []);

  const onConfirm = useCallback(() => {
    if (!active) return;
    if (active.input?.required && !inputValue.trim()) {
      setInputError('This field is required');
      return;
    }
    close(active.input ? inputValue.trim() : '');
  }, [active, close, inputValue]);

  const dialog = (
    <ConfirmModal
      open={Boolean(active)}
      title={active?.title || ''}
      description={active?.description}
      confirmLabel={active?.confirmLabel}
      cancelLabel={active?.cancelLabel}
      variant={active?.variant || 'danger'}
      input={active?.input}
      inputValue={inputValue}
      onInputChange={(v) => {
        setInputValue(v);
        if (inputError) setInputError('');
      }}
      inputError={inputError}
      onCancel={() => close(false)}
      onConfirm={onConfirm}
    />
  );

  return { confirm, dialog };
}
