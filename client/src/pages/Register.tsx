import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student',
      });

      const email = data.data.email || form.email;
      if (data.data.devCode) {
        toast.success(`Verification code (dev): ${data.data.devCode}`, { duration: 12000 });
      } else {
        toast.success('Account created. Check your email for a verification code.');
      }

      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create account | AfriRoar</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[var(--color-sr-bg)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-5">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-12 mx-auto object-contain" />
            </Link>
            <h1 className="text-[26px] font-bold text-[var(--color-sr-navy)] mb-2">Create your student account</h1>
            <p className="text-[18px] text-[var(--color-sr-muted)]">
              Verify your email, then apply for scholarships with confidence
            </p>
          </div>

          <div className="bg-white border border-[var(--color-sr-border)] p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-sr-muted)]" />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-[var(--color-sr-border)] pl-10 pr-3 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                    placeholder="Ada Okonkwo"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-sr-muted)]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-[var(--color-sr-border)] pl-10 pr-3 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-sr-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-[var(--color-sr-border)] pl-10 pr-10 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    required
                    minLength={8}
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

              <div>
                <label className="block text-sm font-semibold mb-2">Confirm password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full border border-[var(--color-sr-border)] px-3 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                  required
                />
              </div>

              <p className="text-xs text-[var(--color-sr-muted)] leading-relaxed">
                By creating an account, you agree to receive a one-time verification code by email and to
                AfriRoar&apos;s Terms of Use.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-sr-navy)] text-white font-semibold py-3 hover:bg-[var(--color-sr-navy-dark)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create account
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-[var(--color-sr-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-sr-link)] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
