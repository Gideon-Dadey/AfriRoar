import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-3 text-[15px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)]';

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

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormError('Enter a valid email address.');
      return;
    }

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

      <div className="flex min-h-[80vh] items-center justify-center bg-[var(--color-sr-bg)] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-5 inline-block">
              <img src="/sr/logo.png" alt="AfriRoar" className="mx-auto h-12 object-contain" />
            </Link>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[var(--color-sr-navy)] text-[var(--color-sr-yellow)]">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1
              className="mb-2 text-[26px] font-bold text-[var(--color-sr-navy-deeper)]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              {step === 'request' ? 'Forgot password?' : 'Choose a new password'}
            </h1>
            <p className="text-[15px] text-[var(--color-sr-muted)]">
              {step === 'request'
                ? 'Enter your email and we will send a reset code.'
                : `Enter the code sent to ${email}, then set a new password.`}
            </p>
          </div>

          <div className="border border-[var(--color-sr-border)] bg-white p-8">
            {formError ? (
              <div
                role="alert"
                className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-900"
              >
                {formError}
              </div>
            ) : null}

            {step === 'request' ? (
              <form onSubmit={requestCode} className="space-y-5" noValidate>
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
                    autoComplete="email"
                    value={email}
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
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
              <form onSubmit={submitReset} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="reset-code"
                    className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Reset code
                  </label>
                  <input
                    id="reset-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    disabled={loading}
                    onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resending || loading}
                    className="mt-2 text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline disabled:opacity-60"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
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
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  className="inline-flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use a different email
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-[14px] text-[var(--color-sr-muted)]">
            Remembered it?{' '}
            <Link
              to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
