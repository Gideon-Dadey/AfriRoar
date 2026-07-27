import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function safeRedirect(raw: string | null | undefined) {
  if (!raw) return '/dashboard';
  // Only allow same-origin relative paths
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) {
    return '/dashboard';
  }
  return raw;
}

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-3 text-[16px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)]';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirect = useMemo(() => {
    const fromPath = fromState?.pathname
      ? `${fromState.pathname}${fromState.search || ''}`
      : null;
    return safeRedirect(params.get('redirect') || fromPath);
  }, [params, fromState?.pathname, fromState?.search]);

  const sessionNotice = params.get('reason') === 'expired';

  const clearSessionNotice = () => {
    if (params.get('reason') !== 'expired') return;
    const next = new URLSearchParams(params);
    next.delete('reason');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const q = params.get('email');
    if (q) setEmail(q);
  }, [params]);

  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated, navigate, redirect]);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearSessionNotice();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      login(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}.`);
      navigate(redirect, { replace: true });
    } catch (err: unknown) {
      const payload = (err as { response?: { data?: { code?: string; message?: string; data?: { email?: string } } } })
        ?.response?.data;
      if (payload?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Verify your email before logging in.');
        navigate(
          `/verify-email?email=${encodeURIComponent(payload.data?.email || email.trim())}`,
        );
        return;
      }
      const message = payload?.message || 'Could not log in. Check your email and password.';
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const registerHref =
    redirect && redirect !== '/dashboard'
      ? `/register?redirect=${encodeURIComponent(redirect)}`
      : '/register';

  return (
    <>
      <Helmet>
        <title>Log in | AfriRoar</title>
        <meta name="description" content="Sign in to AfriRoar to track scholarship applications and drafts." />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-sr-bg)] lg:grid lg:grid-cols-2">
        {/* Brand panel, full-bleed visual */}
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
                Student workspace
              </p>
              <h2
                className="text-[2rem] font-bold leading-tight text-white xl:text-[2.35rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Pick up your applications where you left off.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                Track drafts, upload documents, and submit for programmes across Africa and the world.
              </p>
              <ul className="mt-8 space-y-3 text-[14px] text-white/85">
                {[
                  'Save progress across five clear steps',
                  'Match readiness from your profile',
                  'Deadlines and status in one place',
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
            <h1 className="sr-only">Log in to AfriRoar</h1>
            <p className="text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              Sign in to continue your scholarship applications.
            </p>

            {sessionNotice ? (
              <div className="mt-5 border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-950">
                Your previous session expired. Log in again to continue.
              </div>
            ) : null}

            <div className="mt-8">
              <GoogleSignInButton
                label="signin"
                onSuccessNavigate={() => {
                  clearSessionNotice();
                  navigate(redirect, { replace: true });
                }}
              />
              <AuthDivider />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate onFocus={clearSessionNotice}>
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
                  htmlFor="login-email"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  inputMode="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                    if (formError) setFormError(null);
                  }}
                  className={[
                    inputClass,
                    fieldErrors.email ? 'border-red-400 focus:border-red-500' : '',
                  ].join(' ')}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                />
                {fieldErrors.email ? (
                  <p id="login-email-error" className="mt-1.5 text-[12px] text-red-700">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                  >
                    Password
                  </label>
                  <Link
                    to={`/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`}
                    className="text-[12px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                      if (formError) setFormError(null);
                    }}
                    onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
                    onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
                    className={[
                      inputClass,
                      'pr-11',
                      fieldErrors.password ? 'border-red-400 focus:border-red-500' : '',
                    ].join(' ')}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      [fieldErrors.password ? 'login-password-error' : '', capsLock ? 'login-caps' : '']
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
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
                {fieldErrors.password ? (
                  <p id="login-password-error" className="mt-1.5 text-[12px] text-red-700">
                    {fieldErrors.password}
                  </p>
                ) : null}
                {capsLock ? (
                  <p id="login-caps" className="mt-1.5 text-[12px] font-medium text-amber-800">
                    Caps Lock is on
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
                    Signing in…
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-[14px] text-[var(--color-sr-muted)]">
              Don&apos;t have an account?{' '}
              <Link
                to={registerHref}
                className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                Create one
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
