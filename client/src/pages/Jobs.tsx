import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, Clock3, Loader2, MapPin } from 'lucide-react';
import api from '@/lib/api';
import {
  formatDeadline,
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
} from '@/lib/utils';
import type { Job } from '@/types';

const EMPLOYMENT = [
  { value: '', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

const WORKPLACE = [
  { value: '', label: 'Any workplace' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const employmentType = params.get('employmentType') || '';
  const workplaceType = params.get('workplaceType') || '';
  const country = params.get('country') || '';
  const closing = params.get('closing') || '';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', q, employmentType, workplaceType, country, closing],
    queryFn: async () => {
      const { data } = await api.get('/jobs', {
        params: {
          limit: 60,
          search: q || undefined,
          employmentType: employmentType || undefined,
          workplaceType: workplaceType || undefined,
          country: country || undefined,
          closing: closing || undefined,
          open: 'true',
          sort: 'deadline',
        },
      });
      return (data.data.jobs || []) as Job[];
    },
    staleTime: 60_000,
  });

  return (
    <>
      <Helmet>
        <title>Jobs | AfriRoar</title>
        <meta
          name="description"
          content="Browse verified jobs and internships for African graduates and professionals. Filter by type, workplace, and deadline."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-8 md:py-10">
          <p className="mb-2 text-sm text-white/70">
            <Link to="/" className="hover:text-[var(--color-sr-yellow)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Jobs</span>
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">Jobs & careers</h1>
          <p className="mt-2 max-w-3xl text-white/85">
            Professional roles and internships curated for African talent — apply on AfriRoar or
            continue on the employer site when listed.
          </p>
        </div>
      </div>

      <section className="sr-container py-6 md:py-8">
        <form
          className="mb-6 grid grid-cols-1 gap-3 border border-[var(--color-sr-border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = new URLSearchParams(params);
            const nextQ = String(fd.get('q') || '').trim();
            const nextCountry = String(fd.get('country') || '').trim();
            if (nextQ) next.set('q', nextQ);
            else next.delete('q');
            if (nextCountry) next.set('country', nextCountry);
            else next.delete('country');
            setParams(next, { replace: true });
          }}
        >
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Search
            </span>
            <input
              name="q"
              defaultValue={q}
              key={q}
              className="border border-[var(--color-sr-border)] px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Type
            </span>
            <select
              value={employmentType}
              onChange={(e) => setFilter('employmentType', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px]"
            >
              {EMPLOYMENT.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Workplace
            </span>
            <select
              value={workplaceType}
              onChange={(e) => setFilter('workplaceType', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px]"
            >
              {WORKPLACE.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Deadline
            </span>
            <select
              value={closing}
              onChange={(e) => setFilter('closing', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px]"
            >
              <option value="">Any</option>
              <option value="soon">Closing in 30 days</option>
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              className="bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white"
            >
              Apply search
            </button>
            <label className="ml-auto flex min-w-[160px] flex-1 flex-col gap-1 sm:max-w-[220px]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                Country
              </span>
              <input
                name="country"
                defaultValue={country}
                key={`c-${country}`}
                className="border border-[var(--color-sr-border)] px-3 py-2.5 text-[16px]"
              />
            </label>
          </div>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[var(--color-sr-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="border border-[var(--color-sr-border)] bg-white p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-[var(--color-sr-navy)]" />
            <p className="mt-3 font-semibold">No open roles match these filters</p>
            <p className="mt-1 text-sm text-[var(--color-sr-muted)]">
              Clear filters or check back soon — new jobs are published regularly.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job._id}>
                <Link
                  to={`/jobs/${job.slug}`}
                  className="flex flex-col gap-3 border border-[var(--color-sr-border)] bg-white p-4 transition hover:border-[var(--color-sr-navy)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[17px] font-bold text-[var(--color-sr-navy-deeper)]">
                        {job.title}
                      </h2>
                      {job.isFeatured ? (
                        <span className="bg-[var(--color-sr-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-sr-navy-deeper)]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-[var(--color-sr-text)]">
                      <Building2 className="h-3.5 w-3.5 text-[var(--color-sr-muted)]" />
                      {job.company}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[13px] text-[var(--color-sr-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || job.country}
                      </span>
                      <span>{getEmploymentTypeLabel(job.employmentType)}</span>
                      <span>{getWorkplaceTypeLabel(job.workplaceType)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDeadline(job.deadline)}
                      </span>
                    </div>
                    {job.shortDescription ? (
                      <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-sr-muted)]">
                        {job.shortDescription}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 self-start bg-[var(--color-sr-navy)] px-4 py-2 text-[13px] font-semibold text-white sm:self-center">
                    View role
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
