import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Loader2, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const SUPPORT_EMAIL = 'afriroar.support@gmail.com';

const TOPICS = [
  { value: 'account', label: 'Account & sign-in' },
  { value: 'application', label: 'Application help' },
  { value: 'listing', label: 'Listing correction' },
  { value: 'privacy', label: 'Privacy request' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
] as const;

type Topic = (typeof TOPICS)[number]['value'];

const RELATED = [
  { to: '/about', label: 'About AfriRoar' },
  { to: '/guides', label: 'Guides' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
] as const;

const inputClass =
  'w-full border border-[var(--color-sr-border)] bg-white px-3 py-3 text-[15px] text-[var(--color-sr-text)] outline-none transition-colors placeholder:text-[var(--color-sr-muted)]/70 focus:border-[var(--color-sr-navy)] disabled:cursor-not-allowed disabled:bg-[var(--color-sr-bg)]';

type FieldErrors = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

export default function Contact() {
  const { user, isAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic | ''>('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!name && user.name) setName(user.name);
    if (!email && user.email) setEmail(user.email);
  }, [isAuthenticated, user, name, email]);

  const messageCount = message.trim().length;
  const messageHint = useMemo(() => {
    if (messageCount === 0) return '20 characters minimum';
    if (messageCount < 20) return `${20 - messageCount} more characters needed`;
    return `${messageCount} / 4000`;
  }, [messageCount]);

  const validate = () => {
    const next: FieldErrors = {};
    if (!name.trim() || name.trim().length < 2) next.name = 'Enter your full name.';
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = 'Enter a valid email address.';
    }
    if (!topic) next.topic = 'Choose a topic so we can route your message.';
    if (!message.trim() || message.trim().length < 20) {
      next.message = 'Please write at least 20 characters.';
    } else if (message.trim().length > 4000) {
      next.message = 'Keep your message under 4000 characters.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/contact', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        topic,
        message: message.trim(),
        company,
      });
      setSent(true);
      toast.success(data.data?.message || 'Message sent.');
    } catch (err: unknown) {
      const messageText =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not send your message. Please try again or email us directly.';
      setFormError(messageText);
      toast.error(messageText);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setMessage('');
    setTopic('');
    setFormError(null);
    setFieldErrors({});
    setCompany('');
  };

  return (
    <>
      <Helmet>
        <title>Contact | AfriRoar</title>
        <meta
          name="description"
          content="Contact AfriRoar for account help, application questions, listing corrections, and privacy requests."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-bg)]">
        <header className="border-b border-[var(--color-sr-border)] bg-white">
          <div className="sr-container py-10 md:py-14">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
              Support
            </p>
            <h1
              className="text-[2rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2.35rem]"
              style={{ fontFamily: 'var(--font-hero)' }}
            >
              Contact AfriRoar
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
              Questions about your account, applications, or a listing on the site? Send a message
              below. We read every note and aim to reply within 2-3 business days.
            </p>

            <nav
              aria-label="Related pages"
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-sr-border)] pt-5"
            >
              {RELATED.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <div className="sr-container grid gap-10 py-10 md:grid-cols-[minmax(0,1fr)_300px] md:gap-12 md:py-14">
          <section className="border border-[var(--color-sr-border)] bg-white">
            {sent ? (
              <div className="px-5 py-10 sm:px-8 md:px-10">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center bg-[var(--color-sr-navy)] text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="text-[1.35rem] font-bold text-[var(--color-sr-navy-deeper)]">
                  Message received
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                  Thanks. We sent a confirmation to <strong className="text-[var(--color-sr-text)]">{email}</strong>.
                  Our team will follow up at that address, usually within 2-3 business days.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 bg-[var(--color-sr-navy)] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-dark)]"
                  >
                    Send another message
                  </button>
                  <Link
                    to="/guides"
                    className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-5 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)]"
                  >
                    Browse guides
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="relative px-5 py-8 sm:px-8 md:px-10 md:py-10">
                <h2 className="text-[1.15rem] font-bold text-[var(--color-sr-navy-deeper)]">
                  Send a message
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-sr-muted)]">
                  Include enough detail for us to help on the first reply. Do not paste passwords or
                  one-time codes.
                </p>

                {formError ? (
                  <p
                    role="alert"
                    className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
                  >
                    {formError}
                  </p>
                ) : null}

                {/* Honeypot: hidden from users, filled by many bots */}
                <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-text)]">
                      Full name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className={inputClass}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      maxLength={100}
                      required
                    />
                    {fieldErrors.name ? (
                      <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.name}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-text)]">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      maxLength={254}
                      required
                    />
                    {fieldErrors.email ? (
                      <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.email}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="contact-topic" className="mb-1.5 block text-[13px] font-semibold text-[var(--color-sr-text)]">
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    name="topic"
                    className={`${inputClass} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%232f4468%22 d=%22M1 1l5 5 5-5%22/%3E%3C/svg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic | '')}
                    disabled={loading}
                    required
                  >
                    <option value="">Select a topic</option>
                    {TOPICS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.topic ? (
                    <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.topic}</p>
                  ) : null}
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex items-end justify-between gap-3">
                    <label htmlFor="contact-message" className="block text-[13px] font-semibold text-[var(--color-sr-text)]">
                      Message
                    </label>
                    <span className="text-[12px] text-[var(--color-sr-muted)]">{messageHint}</span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={7}
                    className={`${inputClass} min-h-[160px] resize-y`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    maxLength={4000}
                    placeholder="What do you need help with? Include relevant details such as the scholarship name, page URL, or error message."
                    required
                  />
                  {fieldErrors.message ? (
                    <p className="mt-1.5 text-[12px] text-red-700">{fieldErrors.message}</p>
                  ) : null}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-[var(--color-sr-border)] pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-6 py-3 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)] disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="max-w-sm text-[12px] leading-relaxed text-[var(--color-sr-muted)]">
                    By sending, you agree we may use this information to respond. See our{' '}
                    <Link to="/privacy" className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </section>

          <aside className="space-y-6 md:sticky md:top-24 md:self-start">
            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                Direct email
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {SUPPORT_EMAIL}
              </a>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                Prefer email? Write us directly. Include the same details you would put in the form.
              </p>
            </div>

            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                <Clock3 className="h-3.5 w-3.5" />
                Response time
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                We aim to reply within <strong>2-3 business days</strong>. Complex account or privacy
                requests may take longer.
              </p>
            </div>

            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                <Shield className="h-3.5 w-3.5" />
                What we can help with
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                <li>Sign-in, verification, and password issues</li>
                <li>Application drafts and document uploads on AfriRoar</li>
                <li>Corrections to listings we publish</li>
                <li>Privacy and data requests</li>
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                We cannot decide scholarship awards, change official deadlines, or guarantee
                admission. Always confirm requirements on the programme&apos;s official site.
              </p>
            </div>

            <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] p-5">
              <p className="text-[13px] font-semibold text-[var(--color-sr-navy-deeper)]">
                Need application tips first?
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                Motivation letters, document checklists, and deadlines are covered in Guides.
              </p>
              <Link
                to="/guides"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
              >
                Open guides
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
