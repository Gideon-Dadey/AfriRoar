import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe2,
  GraduationCap,
  Loader2,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDeadline, getFundingTypeLabel, getLevelLabel } from '@/lib/utils';
import { getLatestScholarships, getPostBySlug } from '@/data/srContent';
import { useAuthStore } from '@/stores/authStore';
import PostCard from '@/components/sr/PostCard';
import type { Scholarship } from '@/types';

function splitParagraphs(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function PostDetail() {
  const { slug = '' } = useParams();
  const post = getPostBySlug(slug);
  const { isAuthenticated } = useAuthStore();

  const {
    data: scholarship,
    isLoading: loadingScholarship,
    isError: scholarshipError,
  } = useQuery({
    queryKey: ['scholarship-by-slug', slug],
    queryFn: async () => {
      const { data } = await api.get(`/scholarships/slug/${slug}`);
      return data.data.scholarship as Scholarship;
    },
    enabled: Boolean(slug) && (post?.category === 'scholarship' || !post),
    retry: 1,
    staleTime: 60_000,
  });

  // API-only programme (e.g. Mastercard / DAAD) with no static marketing post
  if (!post && loadingScholarship) {
    return (
      <div className="sr-container flex items-center justify-center gap-2 py-20 text-[14px] text-[var(--color-sr-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading scholarship…
      </div>
    );
  }

  if (!post && !scholarship) {
    return (
      <div className="sr-container py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Scholarship not found</h1>
        <Link to="/scholarships" className="sr-load-more">
          Browse scholarships
        </Link>
      </div>
    );
  }

  const title = scholarship?.title || post?.title || 'Scholarship';
  const image = scholarship?.coverImage || post?.image || '/sr/posts/chevening.png';
  const country = scholarship?.country || post?.country;
  const levelLabel = scholarship?.level
    ? getLevelLabel(scholarship.level)
    : post?.level || 'Multiple levels';
  const excerpt = scholarship?.shortDescription || post?.excerpt || '';
  const isScholarship = post?.category === 'scholarship' || Boolean(scholarship);
  const related = getLatestScholarships()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const applyHref = scholarship?._id
    ? isAuthenticated
      ? `/dashboard/applications/new?scholarshipId=${scholarship._id}`
      : `/login?redirect=${encodeURIComponent(`/dashboard/applications/new?scholarshipId=${scholarship._id}`)}`
    : isAuthenticated
      ? '/dashboard/applications/new'
      : '/login?redirect=/dashboard/applications/new';

  const overviewParagraphs = splitParagraphs(scholarship?.description);
  const eligibilityParagraphs = splitParagraphs(scholarship?.eligibility);

  return (
    <>
      <Helmet>
        <title>{title} | AfriRoar</title>
        <meta name="description" content={excerpt} />
      </Helmet>

      <article>
        <div className="bg-[var(--color-sr-navy)] text-white">
          <div className="sr-container py-8 md:py-10">
            <Link
              to={post?.category === 'internship' ? '/internships' : '/scholarships'}
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/80 hover:text-[var(--color-sr-yellow)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-sr-yellow)]">
              {post?.category || 'scholarship'}
            </p>
            <h1 className="max-w-4xl text-2xl font-bold leading-tight md:text-4xl">{title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/85">
              {post?.date ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
              ) : scholarship?.deadline ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Deadline {formatDeadline(scholarship.deadline)}
                </span>
              ) : null}
              {country ? (
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4" />
                  {country}
                </span>
              ) : null}
              {levelLabel ? (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {levelLabel}
                </span>
              ) : null}
              {scholarship?.fundingType ? (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  {getFundingTypeLabel(scholarship.fundingType)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="sr-container grid grid-cols-1 gap-8 py-8 lg:grid-cols-[1fr_320px]">
          <div>
            <img
              src={image}
              alt={title}
              className="mb-6 aspect-video w-full border border-[var(--color-sr-border)] bg-[#e8eef4] object-cover"
            />

            <div className="border border-[var(--color-sr-border)] bg-white p-6 md:p-8">
              {excerpt ? (
                <p className="mb-6 text-lg leading-relaxed text-[var(--color-sr-text)]">{excerpt}</p>
              ) : null}

              {loadingScholarship && isScholarship ? (
                <p className="mb-4 inline-flex items-center gap-2 text-[14px] text-[var(--color-sr-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading full programme details…
                </p>
              ) : null}

              {scholarshipError && isScholarship && !scholarship ? (
                <p className="mb-4 text-[14px] text-amber-800">
                  Live application data is temporarily unavailable. You can still read this guide and try Apply again shortly.
                </p>
              ) : null}

              <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">Overview</h2>
              {overviewParagraphs.length > 0 ? (
                <div className="mb-6 space-y-4 text-[var(--color-sr-text)] leading-relaxed">
                  {overviewParagraphs.map((para) => (
                    <p key={para.slice(0, 40)}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="mb-6 leading-relaxed text-[var(--color-sr-text)]">
                  {excerpt ||
                    'This listing summarises a scholarship opportunity. Check eligibility, funding, and deadlines below, then apply through AfriRoar to start a tracked draft.'}
                </p>
              )}

              <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">Key details</h2>
              <ul className="mb-6 space-y-2 text-[var(--color-sr-text)]">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                  <span>Hosting country: {country || 'International'}</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                  <span>Study level: {levelLabel}</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                  <span>
                    Funding:{' '}
                    {scholarship?.fundingType
                      ? getFundingTypeLabel(scholarship.fundingType)
                      : 'Verify on official source'}
                  </span>
                </li>
                {scholarship?.amount?.value ? (
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                    <span>
                      Indicative award: {scholarship.amount.currency}{' '}
                      {scholarship.amount.value.toLocaleString()}
                    </span>
                  </li>
                ) : null}
                {scholarship?.deadline ? (
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                    <span>Deadline: {formatDeadline(scholarship.deadline)}</span>
                  </li>
                ) : post?.date ? (
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                    <span>Published: {post.date}</span>
                  </li>
                ) : null}
                {scholarship?.field ? (
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                    <span>Field focus: {scholarship.field}</span>
                  </li>
                ) : null}
              </ul>

              {eligibilityParagraphs.length > 0 ? (
                <>
                  <h2 className="mb-3 text-xl font-bold text-[var(--color-sr-navy)]">Eligibility</h2>
                  <div className="mb-6 space-y-3 text-[var(--color-sr-text)] leading-relaxed">
                    {eligibilityParagraphs.map((para) => (
                      <p key={para.slice(0, 40)}>{para}</p>
                    ))}
                  </div>
                </>
              ) : null}

              {isScholarship ? (
                <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-sr-border)] pt-6">
                  <Link
                    to={applyHref}
                    className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)]"
                  >
                    {scholarship?._id ? 'Apply on AfriRoar' : 'Start application'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {scholarship?.applicationUrl ? (
                    <a
                      href={scholarship.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)]"
                    >
                      Official programme site
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            {isScholarship ? (
              <div className="border border-[var(--color-sr-border)] bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                  Apply with AfriRoar
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-sr-text)]">
                  Open a tracked draft, upload documents, and submit when ready. Your progress saves automatically.
                </p>
                <Link
                  to={applyHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-dark)]"
                >
                  {scholarship?._id ? 'Continue to application' : 'Choose a scholarship'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {!scholarship?._id && loadingScholarship ? (
                  <p className="mt-2 text-[12px] text-[var(--color-sr-muted)]">Linking programme record…</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <h2 className="sr-section-bar mb-4">Related Scholarships</h2>
              <div className="space-y-4">
                {related.map((item) => (
                  <PostCard key={item.id} post={item} compact />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
