import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const q = params.get('email');
    if (q) setEmail(q);
  }, [params]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code });
      toast.success('Email verified. You can now log in.');
      const redirect = params.get('redirect');
      const loginParams = new URLSearchParams({ email });
      if (redirect) loginParams.set('redirect', redirect);
      navigate(`/login?${loginParams.toString()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first.');
      return;
    }
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      if (data.data?.devCode) {
        toast.success(`New code (dev): ${data.data.devCode}`, { duration: 12000 });
      } else {
        toast.success(data.data?.message || 'Verification code resent.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify email | AfriRoar</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[var(--color-sr-bg)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-5">
              <img src="/sr/logo.png" alt="AfriRoar" className="h-12 mx-auto object-contain" />
            </Link>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-sr-navy)] text-[var(--color-sr-yellow)] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-[26px] font-bold text-[var(--color-sr-navy)] mb-2">Verify your email</h1>
            <p className="text-[18px] text-[var(--color-sr-muted)]">
              Enter the 6-digit code we sent to your inbox
            </p>
          </div>

          <div className="bg-white border border-[var(--color-sr-border)] p-8">
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[var(--color-sr-border)] px-3 py-3 outline-none focus:border-[var(--color-sr-navy)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Verification code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full border border-[var(--color-sr-border)] px-3 py-3 outline-none focus:border-[var(--color-sr-navy)] tracking-[0.35em] text-center text-2xl font-bold"
                  inputMode="numeric"
                  required
                  minLength={6}
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-sr-navy)] text-white font-semibold py-3 hover:bg-[var(--color-sr-navy-dark)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify email
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full mt-4 text-sm font-semibold text-[var(--color-sr-link)] hover:underline disabled:opacity-60"
            >
              {resending ? 'Sending…' : 'Resend verification code'}
            </button>

            <p className="text-center text-sm mt-6 text-[var(--color-sr-muted)]">
              Already verified?{' '}
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
