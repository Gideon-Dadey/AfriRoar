import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function safeRedirect(raw: string | null | undefined) {
  if (!raw) return '';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return '';
  return raw;
}

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-3 text-[15px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)]';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={[
        'flex items-center gap-2 text-[12px]',
        ok ? 'text-[var(--color-sr-navy)]' : 'text-[var(--color-sr-muted)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-4 w-4 items-center justify-center border',
          ok
            ? 'border-[var(--color-sr-navy)] bg-[var(--color-sr-navy)] text-white'
            : 'border-[var(--color-sr-border)] bg-white',
        ].join(' ')}
      >
        {ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
      </span>
      {label}
    </li>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const redirect = useMemo(() => safeRedirect(params.get('redirect')), [params]);

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      upper: /[A-Z]/.test(form.password),
      number: /[0-9]/.test(form.password),
      match: form.password.length > 0 && form.password === form.confirmPassword,
    }),
    [form.password, form.confirmPassword],
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    if (formError) setFormError(null);
  };

  const validate = () => {
    const next: FieldErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) next.name = 'Enter your full name.';
    else if (name.length < 2) next.name = 'Name must be at least 2 characters.';

    if (!email) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';

    if (!form.password) next.password = 'Create a password.';
    else if (!passwordChecks.length) next.password = 'Password must be at least 8 characters.';
    else if (!passwordChecks.upper) next.password = 'Include at least one uppercase letter.';
    else if (!passwordChecks.number) next.password = 'Include at least one number.';

    if (!form.confirmPassword) next.confirmPassword = 'Confirm your password.';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'student',
      });

      const email = data.data.email || form.email.trim().toLowerCase();
      if (data.data.devCode) {
        toast.success(`Verification code (dev): ${data.data.devCode}`, { duration: 12000 });
      } else {
        toast.success('Account created. Check your email for a verification code.');
      }

      const verifyParams = new URLSearchParams({ email });
      if (redirect) verifyParams.set('redirect', redirect);
      navigate(`/verify-email?${verifyParams.toString()}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : '/login';

  return (
    <>
      <Helmet>
        <title>Create account | AfriRoar</title>
        <meta
          name="description"
          content="Create your AfriRoar student account to apply for scholarships and track drafts."
        />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-sr-bg)] lg:grid lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[var(--color-sr-navy-deeper)] lg:block">
          <img
            src="/sr/hero/panel-2.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-sr-navy-deeper)] via-[var(--color-sr-navy-deeper)]/80 to-[var(--color-sr-navy)]/45" />
          <div className="relative flex h-full min-h-[70vh] flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <img src="/sr/logo.png" alt="" className="h-10 w-auto object-contain" />
              <span
                className="text-[1.35rem] font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                AfriRoar
              </span>
            </Link>

            <div className="max-w-md">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-sr-yellow)]">
                Join AfriRoar
              </p>
              <h2
                className="text-[2rem] font-bold leading-tight text-white xl:text-[2.35rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                Start your scholarship journey in minutes.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-white/80">
                Create a free student account, verify your email, then open drafts for programmes that fit.
              </p>
              <ol className="mt-8 space-y-3 text-[14px] text-white/85">
                {[
                  '1. Create your account',
                  '2. Verify with a 6-digit email code',
                  '3. Build your profile and apply',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--color-sr-yellow)]" />
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[12px] text-white/55">Free for students · No credit card required</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
          <div className="w-full max-w-[440px]">
            <Link to="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-9 object-contain" />
              <span
                className="text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                AfriRoar
              </span>
            </Link>

            <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              New student
            </p>
            <h1
              className="text-[1.75rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] sm:text-[1.95rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Create your AfriRoar account
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              Verify your email, then apply for scholarships with a tracked draft.
            </p>

            <div className="mt-8">
              <GoogleSignInButton
                label="signup"
                onSuccessNavigate={() => navigate(redirect || '/dashboard', { replace: true })}
              />
              <AuthDivider />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  htmlFor="register-name"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Full name
                </label>
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={form.name}
                  disabled={loading}
                  onChange={(e) => setField('name', e.target.value)}
                  className={[inputClass, fieldErrors.name ? 'border-red-400' : ''].join(' ')}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name ? (
                  <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.name}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  disabled={loading}
                  onChange={(e) => setField('email', e.target.value)}
                  className={[inputClass, fieldErrors.email ? 'border-red-400' : ''].join(' ')}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? (
                  <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.email}</p>
                ) : (
                  <p className="mt-1.5 text-[12px] text-[var(--color-sr-muted)]">
                    We’ll send a 6-digit verification code here.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    disabled={loading}
                    onChange={(e) => setField('password', e.target.value)}
                    onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
                    onKeyDown={(e) => setCapsLock(e.getModifierState('CapsLock'))}
                    className={[
                      inputClass,
                      'pr-11',
                      fieldErrors.password ? 'border-red-400' : '',
                    ].join(' ')}
                    aria-invalid={Boolean(fieldErrors.password)}
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
                {fieldErrors.password ? (
                  <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.password}</p>
                ) : null}
                {capsLock ? (
                  <p className="mt-1.5 text-[12px] font-medium text-amber-800">Caps Lock is on</p>
                ) : null}
                <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                  <StrengthRow ok={passwordChecks.length} label="8+ characters" />
                  <StrengthRow ok={passwordChecks.upper} label="One uppercase letter" />
                  <StrengthRow ok={passwordChecks.number} label="One number" />
                  <StrengthRow ok={passwordChecks.match} label="Passwords match" />
                </ul>
              </div>

              <div>
                <label
                  htmlFor="register-confirm"
                  className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-navy)]"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    disabled={loading}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    className={[
                      inputClass,
                      'pr-11',
                      fieldErrors.confirmPassword ? 'border-red-400' : '',
                    ].join(' ')}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-sr-muted)] hover:text-[var(--color-sr-navy)]"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.confirmPassword}</p>
                ) : null}
              </div>

              <p className="text-[12px] leading-relaxed text-[var(--color-sr-muted)]">
                By creating an account, you agree to AfriRoar&apos;s{' '}
                <Link to="/terms" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                , and to receive a one-time verification code by email.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-3 text-[15px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-[14px] text-[var(--color-sr-muted)]">
              Already have an account?{' '}
              <Link
                to={loginHref}
                className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
