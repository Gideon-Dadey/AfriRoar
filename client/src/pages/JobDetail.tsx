import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import {
  formatDate,
  formatDeadline,
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
} from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Job } from '@/types';

function paras(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function formatSalary(job: Job) {
  const s = job.salary;
  if (!s || (s.min == null && s.max == null)) return null;
  const currency = s.currency || 'USD';
  const period =
    s.period === 'hour'
      ? '/ hour'
      : s.period === 'month'
        ? '/ month'
        : s.period === 'year'
          ? '/ year'
          : '';
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: s.period === 'hour' ? 2 : 0,
    }).format(n);

  if (s.min != null && s.max != null) return `${fmt(s.min)} – ${fmt(s.max)} ${period}`.trim();
  if (s.min != null) return `From ${fmt(s.min)} ${period}`.trim();
  if (s.max != null) return `Up to ${fmt(s.max)} ${period}`.trim();
  return null;
}

function educationFlexible(job: Job) {
  const tags = (job.tags || []).map((t) => t.toLowerCase());
  return (
    tags.some((t) => t.includes('no-degree') || t.includes('flexible-education') || t.includes('diploma')) ||
    /no (bachelor|degree)|degree (optional|not required)|bachelor.?s (optional|not required)/i.test(
      `${job.requirements || ''} ${job.description || ''}`,
    )
  );
}

const APPLY_MATERIALS = [
  {
    title: 'Personal & contact details',
    detail: 'Legal name, email, phone, and country of residence.',
  },
  {
    title: 'Cover letter',
    detail: 'At least 80 characters explaining why you fit this role.',
  },
  {
    title: 'CV / resume',
    detail: 'PDF preferred. Optional: certificates or portfolio.',
  },
] as const;

export default function JobDetail() {
  const { slug = '' } = useParams();
  const { isAuthenticated } = useAuthStore();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job-by-slug', slug],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/slug/${slug}`);
      return data.data.job as Job;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="sr-container flex items-center justify-center gap-2 py-20 text-[14px] text-[var(--color-sr-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading role…
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="sr-container py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Job not found</h1>
        <Link to="/jobs" className="sr-load-more">
          Browse jobs
        </Link>
      </div>
    );
  }

  const expired = new Date(job.deadline) < new Date();
  const applyHref = isAuthenticated
    ? `/dashboard/job-applications/new?jobId=${job._id}`
    : `/login?redirect=${encodeURIComponent(`/dashboard/job-applications/new?jobId=${job._id}`)}`;
  const salaryLabel = formatSalary(job);
  const flexible = educationFlexible(job);
  const aboutParas = paras(job.description);
  const responsibilities = paras(job.responsibilities);
  const requirements = paras(job.requirements);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.shortDescription || job.description?.slice(0, 400),
    datePosted: job.createdAt,
    validThrough: job.deadline,
    employmentType: job.employmentType?.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      sameAs: job.companyWebsite || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: job.country,
        addressLocality: job.location || job.country,
      },
    },
    ...(salaryLabel && job.salary?.min != null
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency || 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.min,
              maxValue: job.salary.max,
              unitText:
                job.salary.period === 'hour'
                  ? 'HOUR'
                  : job.salary.period === 'month'
                    ? 'MONTH'
                    : 'YEAR',
            },
          },
        }
      : {}),
  };

  return (
    <>
      <Helmet>
        <title>{`${job.title} at ${job.company} | AfriRoar`}</title>
        <meta name="description" content={job.shortDescription || job.title} />
        <meta property="og:title" content={`${job.title} | AfriRoar Jobs`} />
        <meta property="og:description" content={job.shortDescription || job.title} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article>
        <div className="bg-[var(--color-sr-navy)] text-white">
          <div className="sr-container py-8 md:py-10">
            <Link
              to="/jobs"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-[var(--color-sr-yellow)]"
            >
              <ArrowLeft className="h-4 w-4" />
              All jobs
            </Link>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sr-yellow)]">
                Verified job
              </span>
              <span className="inline-flex items-center gap-1 border border-white/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                <ShieldCheck className="h-3 w-3 text-[var(--color-sr-yellow)]" />
                Employer-reviewed listing
              </span>
              {flexible ? (
                <span className="border border-white/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                  Degree not mandatory
                </span>
              ) : null}
            </div>
            <h1 className="max-w-4xl text-2xl font-bold leading-tight md:text-4xl">{job.title}</h1>
            <p className="mt-3 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-white/90">
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {job.company}
              </span>
              {job.field ? <span className="text-white/70">· {job.field}</span> : null}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || job.country}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-4 w-4" />
                {job.country}
              </span>
              <span>{getEmploymentTypeLabel(job.employmentType)}</span>
              <span>{getWorkplaceTypeLabel(job.workplaceType)}</span>
              {salaryLabel ? (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  {salaryLabel}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Apply by {formatDeadline(job.deadline)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                Posted {formatDate(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="sr-container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {job.shortDescription ? (
              <p className="border border-[var(--color-sr-border)] bg-white p-5 text-lg leading-relaxed text-[var(--color-sr-text)] md:p-6">
                {job.shortDescription}
              </p>
            ) : null}

            <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              <h2 className="mb-1 text-xl font-bold text-[var(--color-sr-navy)]">About the role</h2>
              <p className="mb-5 text-[13px] text-[var(--color-sr-muted)]">
                Role overview from the hiring organisation
              </p>
              <div className="space-y-4 leading-relaxed text-[var(--color-sr-text)]">
                {aboutParas.map((p, i) => (
                  <p key={`about-${i}`}>{p}</p>
                ))}
              </div>
            </section>

            {responsibilities.length ? (
              <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
                <h2 className="mb-1 text-xl font-bold text-[var(--color-sr-navy)]">
                  What you will do
                </h2>
                <p className="mb-5 text-[13px] text-[var(--color-sr-muted)]">
                  Day-to-day responsibilities
                </p>
                <ul className="space-y-3">
                  {responsibilities.map((p, i) => (
                    <li key={`resp-${i}`} className="flex gap-3 text-[var(--color-sr-text)]">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sr-navy)]" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {requirements.length ? (
              <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
                <h2 className="mb-1 text-xl font-bold text-[var(--color-sr-navy)]">
                  Who should apply
                </h2>
                <p className="mb-5 text-[13px] text-[var(--color-sr-muted)]">
                  Minimum qualifications - experience and certificates often count
                </p>
                <ul className="space-y-3">
                  {requirements.map((p, i) => (
                    <li key={`req-${i}`} className="flex gap-3 text-[var(--color-sr-text)]">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sr-navy)]" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                {flexible ? (
                  <p className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] leading-relaxed text-emerald-950">
                    This role is open to candidates without a bachelor’s degree when you meet the
                    experience, diploma/HND, or certificate pathways listed above.
                  </p>
                ) : null}
              </section>
            ) : null}

            <section className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              <h2 className="mb-1 text-xl font-bold text-[var(--color-sr-navy)]">
                How to apply on AfriRoar
              </h2>
              <p className="mb-5 text-[13px] text-[var(--color-sr-muted)]">
                Prepare these materials before you start - the form will not submit without them
              </p>
              <ol className="space-y-4">
                {APPLY_MATERIALS.map((item, index) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--color-sr-navy)] text-[13px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--color-sr-navy-deeper)]">{item.title}</p>
                      <p className="mt-0.5 text-[14px] text-[var(--color-sr-muted)]">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-5 flex gap-2 border-t border-[var(--color-sr-border)] pt-4 text-[13px] text-[var(--color-sr-muted)]">
                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                Drafts save as you go. You can withdraw after submit if your plans change.
              </p>
            </section>

            <p className="text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
              Always verify final terms with the employer. AfriRoar lists opportunities to help you
              prepare documents, track applications, and apply with confidence.
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                Role snapshot
              </p>
              <dl className="mt-3 space-y-3 text-[14px]">
                <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                  <dt className="text-[var(--color-sr-muted)]">Company</dt>
                  <dd className="text-right font-semibold text-[var(--color-sr-navy)]">{job.company}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                  <dt className="text-[var(--color-sr-muted)]">Location</dt>
                  <dd className="text-right font-medium">{job.location || job.country}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                  <dt className="text-[var(--color-sr-muted)]">Type</dt>
                  <dd className="text-right font-medium">
                    {getEmploymentTypeLabel(job.employmentType)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                  <dt className="text-[var(--color-sr-muted)]">Workplace</dt>
                  <dd className="text-right font-medium">
                    {getWorkplaceTypeLabel(job.workplaceType)}
                  </dd>
                </div>
                {job.field ? (
                  <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                    <dt className="text-[var(--color-sr-muted)]">Function</dt>
                    <dd className="text-right font-medium">{job.field}</dd>
                  </div>
                ) : null}
                {salaryLabel ? (
                  <div className="flex justify-between gap-3 border-b border-[var(--color-sr-border)] pb-2">
                    <dt className="text-[var(--color-sr-muted)]">Pay range</dt>
                    <dd className="text-right font-semibold text-[var(--color-sr-navy)]">
                      {salaryLabel}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--color-sr-muted)]">Deadline</dt>
                  <dd className="text-right font-medium">{formatDeadline(job.deadline)}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                Apply
              </p>
              {expired ? (
                <p className="mt-2 text-[14px] text-amber-800">This deadline has passed.</p>
              ) : (
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                  {job.allowInternalApply
                    ? 'Complete personal details, cover letter, and CV upload to submit.'
                    : 'Applications are accepted on the employer site.'}
                </p>
              )}

              {!expired && job.allowInternalApply ? (
                <Link
                  to={applyHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] hover:bg-[var(--color-sr-yellow-hover)]"
                >
                  Start application
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}

              {job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
                >
                  Employer site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}

              {job.companyWebsite ? (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[var(--color-sr-link)] hover:underline"
                >
                  Company website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>

            <div className="border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] p-5 text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
              <p className="font-semibold text-[var(--color-sr-navy)]">Trust checklist</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-4">
                <li>Listing reviewed before publish</li>
                <li>Clear pay band when provided by employer</li>
                <li>Tracked application with status updates</li>
                <li>No application fee on AfriRoar</li>
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
