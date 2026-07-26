import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  GraduationCap,
  Loader2,
  Wallet,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatDeadline, getFundingTypeLabel, getLevelLabel } from '@/lib/utils';
import { getGuideArticle } from '@/data/guideArticles';
import { getLatestScholarships, getPostBySlug, getPostsByCategory } from '@/data/srContent';
import { useAuthStore } from '@/stores/authStore';
import PostCard from '@/components/sr/PostCard';
import type { ContentItem, Scholarship } from '@/types';

function splitParagraphs(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function categoryHome(category?: string) {
  if (category === 'guide') return '/guides';
  if (category === 'list') return '/lists';
  if (category === 'internship') return '/internships';
  return '/scholarships';
}

export default function PostDetail() {
  const { slug = '' } = useParams();
  const staticPost = getPostBySlug(slug);
  const article = getGuideArticle(slug);
  const { isAuthenticated } = useAuthStore();

  const { data: cmsItem, isLoading: loadingCms } = useQuery({
    queryKey: ['content-by-slug', slug],
    queryFn: async () => {
      const { data } = await api.get(`/content/slug/${slug}`);
      return data.data.item as ContentItem;
    },
    enabled: Boolean(slug) && !staticPost && !article,
    retry: 1,
    staleTime: 60_000,
  });

  const post =
    staticPost ||
    (cmsItem
      ? {
          id: cmsItem._id,
          slug: cmsItem.slug,
          title: cmsItem.title,
          date: formatDate(cmsItem.publishedAt || cmsItem.createdAt),
          category:
            cmsItem.category === 'job'
              ? ('list' as const)
              : (cmsItem.category as 'guide' | 'internship' | 'list' | 'scholarship'),
          country: cmsItem.country,
          image: cmsItem.coverImage || '/sr/posts/chevening.png',
          excerpt: cmsItem.excerpt || '',
        }
      : undefined);

  const isGuideLike =
    Boolean(article) ||
    Boolean(cmsItem) ||
    post?.category === 'guide' ||
    post?.category === 'list' ||
    post?.category === 'internship';

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
    enabled: Boolean(slug) && !isGuideLike && (post?.category === 'scholarship' || !post),
    retry: 1,
    staleTime: 60_000,
  });

  if (!post && (loadingScholarship || loadingCms)) {
    return (
      <div className="sr-container flex items-center justify-center gap-2 py-20 text-[14px] text-[var(--color-sr-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!post && !scholarship) {
    return (
      <div className="sr-container py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Page not found</h1>
        <Link to="/guides" className="sr-load-more">
          Browse guides
        </Link>
      </div>
    );
  }

  const title = scholarship?.title || post?.title || 'AfriRoar';
  const image = scholarship?.coverImage || post?.image || '/sr/posts/chevening.png';
  const country = scholarship?.country || post?.country;
  const levelLabel = scholarship?.level
    ? getLevelLabel(scholarship.level)
    : post?.level || undefined;
  const excerpt = scholarship?.shortDescription || cmsItem?.excerpt || post?.excerpt || '';
  const isScholarship = !isGuideLike && (post?.category === 'scholarship' || Boolean(scholarship));

  const relatedGuides = getPostsByCategory(post?.category === 'list' ? 'list' : 'guide')
    .filter((p) => p.slug !== slug)
    .slice(0, 3);
  const relatedScholarships = getLatestScholarships()
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
  const cmsParagraphs = splitParagraphs(cmsItem?.body);
  const backTo = categoryHome(post?.category);

  // ── Guide / list / internship article layout ─────────────────────────────
  if (isGuideLike && post) {
    return (
      <>
        <Helmet>
          <title>{title} | AfriRoar</title>
          <meta name="description" content={excerpt} />
        </Helmet>

        <article>
          <header className="border-b border-[var(--color-sr-border)] bg-white">
            <div className="sr-container py-8 md:py-10">
              <Link
                to={backTo}
                className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-sr-navy)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {post.category === 'list' ? 'lists' : post.category === 'internship' ? 'internships' : 'guides'}
              </Link>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                {post.category}
              </p>
              <h1
                className="max-w-3xl text-[1.85rem] font-bold leading-tight text-[var(--color-sr-navy-deeper)] md:text-[2.35rem]"
                style={{ fontFamily: 'var(--font-hero)' }}
              >
                {title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-[var(--color-sr-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                {article?.readingTime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {article.readingTime}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    AfriRoar Guide
                  </span>
                )}
                {country ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5" />
                    {country}
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <div className="sr-container grid gap-10 py-8 md:grid-cols-[minmax(0,1fr)_240px] md:py-12 lg:gap-14">
            <div>
              <img
                src={image}
                alt=""
                className="mb-8 aspect-[2/1] w-full border border-[var(--color-sr-border)] object-cover"
                width={1280}
                height={640}
              />

              <div className="border border-[var(--color-sr-border)] bg-white px-5 py-2 sm:px-8">
                <p className="border-b border-[var(--color-sr-border)] py-6 text-[17px] leading-relaxed text-[var(--color-sr-text)]">
                  {article?.intro || excerpt}
                </p>

                {article ? (
                  article.sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 border-b border-[var(--color-sr-border)] py-8 last:border-b-0"
                    >
                      <h2 className="text-[1.2rem] font-bold text-[var(--color-sr-navy-deeper)]">
                        {section.heading}
                      </h2>
                      {section.paragraphs?.map((para) => (
                        <p
                          key={para.slice(0, 48)}
                          className="mt-3 text-[15px] leading-relaxed text-[var(--color-sr-muted)]"
                        >
                          {para}
                        </p>
                      ))}
                      {section.bullets?.length ? (
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                          {section.bullets.map((item) => (
                            <li key={item.slice(0, 48)}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                      {section.note ? (
                        <p className="mt-4 border border-[var(--color-sr-border)] bg-[var(--color-sr-bg)] px-4 py-3 text-[13px] leading-relaxed text-[var(--color-sr-text)]">
                          {section.note}
                        </p>
                      ) : null}
                    </section>
                  ))
                ) : cmsParagraphs.length > 0 ? (
                  <div className="space-y-4 py-8">
                    {cmsParagraphs.map((para) => (
                      <p
                        key={para.slice(0, 48)}
                        className="text-[15px] leading-relaxed text-[var(--color-sr-muted)]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="py-8">
                    <p className="text-[15px] leading-relaxed text-[var(--color-sr-muted)]">{excerpt}</p>
                    <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-sr-muted)]">
                      Full article content is being prepared. Meanwhile, browse scholarships or start an
                      application draft on AfriRoar.
                    </p>
                  </div>
                )}

                {article?.checklist?.length ? (
                  <section className="border-t border-[var(--color-sr-border)] py-8">
                    <h2 className="text-[1.2rem] font-bold text-[var(--color-sr-navy-deeper)]">
                      Checklist before you submit
                    </h2>
                    <ul className="mt-4 space-y-2">
                      {article.checklist.map((item) => (
                        <li key={item} className="flex gap-2 text-[15px] text-[var(--color-sr-text)]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sr-navy)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className="border-t border-[var(--color-sr-border)] py-8">
                  <p className="text-[13px] leading-relaxed text-[var(--color-sr-muted)]">
                    Always verify requirements on official programme pages. See our{' '}
                    <Link to="/disclaimer" className="font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline">
                      Disclaimer
                    </Link>
                    .
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/scholarships"
                      className="inline-flex items-center gap-2 bg-[var(--color-sr-yellow)] px-5 py-2.5 text-[14px] font-bold text-[var(--color-sr-navy-deeper)] transition hover:bg-[var(--color-sr-yellow-hover)]"
                    >
                      Browse scholarships
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={isAuthenticated ? '/dashboard/applications/new' : '/login?redirect=/dashboard/applications/new'}
                      className="inline-flex items-center gap-2 border border-[var(--color-sr-border)] px-5 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] transition hover:border-[var(--color-sr-navy)]"
                    >
                      Start an application
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <aside className="md:sticky md:top-24 md:self-start">
              {article?.sections?.length ? (
                <nav aria-label="On this page" className="mb-8">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                    On this page
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {article.sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="border-l-2 border-transparent px-3 py-1.5 text-[13px] font-medium text-[var(--color-sr-muted)] transition hover:border-[var(--color-sr-navy)] hover:text-[var(--color-sr-navy-deeper)]"
                      >
                        {section.heading}
                      </a>
                    ))}
                  </div>
                </nav>
              ) : null}

              {article?.relatedLinks?.length ? (
                <div className="mb-8 border border-[var(--color-sr-border)] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sr-muted)]">
                    Related
                  </p>
                  <ul className="mt-3 space-y-2">
                    {article.relatedLinks.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-[13px] font-semibold text-[var(--color-sr-navy)] underline-offset-2 hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
                  More {post.category === 'internship' ? 'internships' : 'guides'}
                </h2>
                <div className="space-y-4">
                  {(post.category === 'internship'
                    ? getPostsByCategory('internship')
                    : relatedGuides
                  )
                    .filter((p) => p.slug !== slug)
                    .slice(0, 3)
                    .map((item) => (
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

  // ── Scholarship layout ───────────────────────────────────────────────────
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
              to={backTo}
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
                  Live application data is temporarily unavailable. You can still read this page and try
                  Apply again shortly.
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
                  <span>Study level: {levelLabel || 'Multiple levels'}</span>
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
                  Open a tracked draft, upload documents, and submit when ready. Your progress saves
                  automatically.
                </p>
                <Link
                  to={applyHref}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-sr-navy-dark)]"
                >
                  {scholarship?._id ? 'Continue to application' : 'Choose a scholarship'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            <div>
              <h2 className="sr-section-bar mb-4">Related Scholarships</h2>
              <div className="space-y-4">
                {relatedScholarships.map((item) => (
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
