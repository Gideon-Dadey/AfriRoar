import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate(redirect);
    } catch (err: any) {
      const payload = err.response?.data;
      if (payload?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email before logging in.');
        navigate(`/verify-email?email=${encodeURIComponent(payload.data?.email || email)}`);
        return;
      }
      toast.error(payload?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Log in | AfriRoar</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[var(--color-sr-bg)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-5">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-12 mx-auto object-contain" />
            </Link>
            <h1 className="text-[26px] font-bold text-[var(--color-sr-navy)] mb-2">Welcome back</h1>
            <p className="text-[18px] text-[var(--color-sr-muted)]">
              Sign in to continue your scholarship applications
            </p>
          </div>

          <div className="bg-white border border-[var(--color-sr-border)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--color-sr-text)]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-sr-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-[var(--color-sr-border)] pl-10 pr-3 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-[var(--color-sr-text)]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-sr-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full border border-[var(--color-sr-border)] pl-10 pr-10 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-sr-muted)]"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-sr-navy)] text-white font-semibold py-3 hover:bg-[var(--color-sr-navy-dark)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Log in
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-[var(--color-sr-muted)]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[var(--color-sr-link)] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
