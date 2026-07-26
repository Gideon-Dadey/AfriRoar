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
  Loader2,
  MapPin,
  ShieldCheck,
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
                Job
              </span>
              <span className="inline-flex items-center gap-1 border border-white/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                <ShieldCheck className="h-3 w-3 text-[var(--color-sr-yellow)]" />
                Verified listing
              </span>
            </div>
            <h1 className="max-w-4xl text-2xl font-bold leading-tight md:text-4xl">{job.title}</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-white/90">
              <Building2 className="h-4 w-4" />
              {job.company}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || job.country}
              </span>
              <span>{getEmploymentTypeLabel(job.employmentType)}</span>
              <span>{getWorkplaceTypeLabel(job.workplaceType)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Deadline {formatDeadline(job.deadline)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                Posted {formatDate(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="sr-container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_320px]">
          <div className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
            {job.shortDescription ? (
              <p className="mb-6 text-lg leading-relaxed text-[var(--color-sr-text)]">
                {job.shortDescription}
              </p>
            ) : null}

            <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">About the role</h2>
            <div className="mb-6 space-y-3 leading-relaxed text-[var(--color-sr-text)]">
              {paras(job.description).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>

            {paras(job.responsibilities).length ? (
              <>
                <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">Responsibilities</h2>
                <ul className="mb-6 space-y-2">
                  {paras(job.responsibilities).map((p) => (
                    <li key={p.slice(0, 40)} className="flex gap-2 text-[var(--color-sr-text)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {paras(job.requirements).length ? (
              <>
                <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">Requirements</h2>
                <ul className="mb-6 space-y-2">
                  {paras(job.requirements).map((p) => (
                    <li key={p.slice(0, 40)} className="flex gap-2 text-[var(--color-sr-text)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <p className="border-t border-[var(--color-sr-border)] pt-4 text-[13px] text-[var(--color-sr-muted)]">
              Always verify final terms with the employer. AfriRoar lists opportunities to help you
              prepare and track applications.
            </p>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[var(--color-sr-border)] bg-white p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                Apply
              </p>
              {expired ? (
                <p className="mt-2 text-[14px] text-amber-800">This deadline has passed.</p>
              ) : (
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                  {job.allowInternalApply
                    ? 'Start a tracked application with your CV and cover letter.'
                    : 'Applications are accepted on the employer site.'}
                </p>
              )}

              {!expired && job.allowInternalApply ? (
                <Link
                  to={applyHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-yellow)] px-4 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] hover:bg-[var(--color-sr-yellow-hover)]"
                >
                  Apply on AfriRoar
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
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
