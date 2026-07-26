import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-3 text-[16px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)]';

type Step = 'request' | 'reset';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

  useEffect(() => {
    const q = params.get('email');
    if (q) setEmail(q);
  }, [params]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    }),
    [password, confirmPassword],
  );

  const loginHref = `/login${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`;

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: trimmed });
      setEmail(trimmed);
      setStep('reset');
      if (data.data?.devCode) {
        toast.success(`Reset code (dev): ${data.data.devCode}`, { duration: 12000 });
      } else {
        toast.success(data.data?.message || 'If that email exists, a reset code was sent.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not send reset code.';
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email.trim()) return;
    setResending(true);
    setFormError(null);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      if (data.data?.devCode) {
        toast.success(`New code (dev): ${data.data.devCode}`, { duration: 12000 });
      } else {
        toast.success('If that email exists, a new reset code was sent.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not resend code.';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!/^\d{4,8}$/.test(code.trim())) {
      setFormError('Enter the reset code from your email.');
      return;
    }
    if (!passwordChecks.length || !passwordChecks.upper || !passwordChecks.number) {
      setFormError('Password must be at least 8 characters with one uppercase letter and one number.');
      return;
    }
    if (!passwordChecks.match) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
      });
      toast.success(data.data?.message || 'Password updated. You can log in.');
      navigate(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not reset password.';
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot password | AfriRoar</title>
        <meta name="description" content="Reset your AfriRoar account password with an email code." />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-sr-bg)] lg:grid lg:grid-cols-2">
        {/* Brand panel - same as login */}
        <aside className="relative hidden overflow-hidden bg-[var(--color-sr-navy-deeper)] lg:block">
          <picture>
            <source srcSet="/sr/hero/panel-1.webp" type="image/webp" />
            <img
              src="/sr/hero/panel-1.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              width={1600}
              height={1066}
              decoding="async"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-sr-navy-deeper)] via-[var(--color-sr-navy-deeper)]/75 to-[var(--color-sr-navy)]/40" />
          <div className="relative flex h-full min-h-[70vh] flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-10 w-auto object-contain" />
            </Link>

            <div className="max-w-md">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sr-yellow)]">
                Account recovery
              </p>
              <h2
                className="text-[2rem] font-bold leading-tight text-white xl:text-[2.35rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Get back into your scholarship workspace.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                Reset your password securely and continue tracking drafts, documents, and deadlines.
              </p>
              <ul className="mt-8 space-y-3 text-[14px] text-white/85">
                {[
                  'Email code verification in minutes',
                  'Choose a strong new password',
                  'Pick up applications right where you left off',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--color-sr-yellow)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[12px] text-white/55">AfriRoar · Scholarships for African ambition</p>
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
          <div className="w-full max-w-[420px]">
            <Link to="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-9 object-contain" />
            </Link>

            <h1 className="sr-only">
              {step === 'request' ? 'Forgot password' : 'Choose a new password'}
            </h1>
            <p className="text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              {step === 'request'
                ? 'Enter your email and we will send a reset code.'
                : `Enter the code sent to ${email}, then set a new password.`}
            </p>

            {step === 'request' ? (
              <form onSubmit={requestCode} className="mt-8 space-y-5" noValidate>
                {formError ? (
                  <div
                    role="alert"
                    className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-900"
                  >
                    {formError}
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    inputMode="email"
                    value={email}
                    disabled={loading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({});
                      if (formError) setFormError(null);
                    }}
                    className={[
                      inputClass,
                      fieldErrors.email ? 'border-red-400 focus:border-red-500' : '',
                    ].join(' ')}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'forgot-email-error' : undefined}
                  />
                  {fieldErrors.email ? (
                    <p id="forgot-email-error" className="mt-1.5 text-[12px] text-red-700">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-3 text-[15px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send reset code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={submitReset} className="mt-8 space-y-5" noValidate>
                {formError ? (
                  <div
                    role="alert"
                    className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-900"
                  >
                    {formError}
                  </div>
                ) : null}

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="reset-code"
                      className="block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                    >
                      Reset code
                    </label>
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={resending || loading}
                      className="text-[12px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline disabled:opacity-60"
                    >
                      {resending ? 'Sending…' : 'Resend code'}
                    </button>
                  </div>
                  <input
                    id="reset-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={code}
                    disabled={loading}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\s/g, ''));
                      if (formError) setFormError(null);
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reset-password"
                    className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      disabled={loading}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-sr-muted)] transition hover:text-[var(--color-sr-navy)]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm"
                    className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Confirm password
                  </label>
                  <input
                    id="reset-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    disabled={loading}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className={inputClass}
                  />
                  <ul className="mt-3 space-y-1 text-[12px] text-[var(--color-sr-muted)]">
                    <li className={passwordChecks.length ? 'text-[var(--color-sr-navy)]' : ''}>
                      At least 8 characters
                    </li>
                    <li className={passwordChecks.upper ? 'text-[var(--color-sr-navy)]' : ''}>
                      One uppercase letter
                    </li>
                    <li className={passwordChecks.number ? 'text-[var(--color-sr-navy)]' : ''}>
                      One number
                    </li>
                    <li className={passwordChecks.match ? 'text-[var(--color-sr-navy)]' : ''}>
                      Passwords match
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-3 text-[15px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setCode('');
                    setPassword('');
                    setConfirmPassword('');
                    setFormError(null);
                  }}
                  className="w-full text-center text-[13px] font-semibold text-[var(--color-sr-muted)] underline-offset-2 hover:text-[var(--color-sr-navy)] hover:underline"
                >
                  Use a different email
                </button>
              </form>
            )}

            <p className="mt-6 text-[14px] text-[var(--color-sr-muted)]">
              Remembered it?{' '}
              <Link
                to={loginHref}
                className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                Back to log in
              </Link>
            </p>

            <p className="mt-8 border-t border-[var(--color-sr-border)] pt-5 text-[12px] leading-relaxed text-[var(--color-sr-muted)]">
              By continuing you agree to AfriRoar&apos;s{' '}
              <Link to="/terms" className="underline-offset-2 hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
