import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import PostCard from '@/components/sr/PostCard';
import api from '@/lib/api';
import { formatDate, getLevelLabel } from '@/lib/utils';
import { getPostsByCategory, popularCountries, type SrPost } from '@/data/srContent';
import type { ContentItem, Scholarship } from '@/types';

type ListingProps = {
  title: string;
  description?: string;
  category?: SrPost['category'];
  filterFn?: (post: SrPost) => boolean;
  /** When true, only render the results grid (parent owns the page chrome). */
  hideChrome?: boolean;
};

const PLACEHOLDER_IMAGE = '/sr/posts/chevening.png';

function scholarshipToPost(s: Scholarship): SrPost {
  return {
    id: s._id,
    slug: s.slug,
    title: s.title,
    date: formatDate(s.createdAt || s.deadline),
    category: 'scholarship',
    level: getLevelLabel(s.level),
    country: s.country,
    image: s.coverImage || PLACEHOLDER_IMAGE,
    excerpt: s.shortDescription || s.description?.slice(0, 180) || '',
    featured: Boolean(s.isFeatured),
  };
}

function contentToPost(item: ContentItem): SrPost {
  const category =
    item.category === 'job'
      ? 'list'
      : (item.category as SrPost['category']);
  return {
    id: item._id,
    slug: item.slug,
    title: item.title,
    date: formatDate(item.publishedAt || item.createdAt),
    category,
    country: item.country,
    image: item.coverImage || PLACEHOLDER_IMAGE,
    excerpt: item.excerpt || item.body?.slice(0, 180) || '',
  };
}

function mergeUnique(primary: SrPost[], secondary: SrPost[]) {
  const seen = new Set(primary.map((p) => p.slug));
  const extras = secondary.filter((p) => !seen.has(p.slug));
  return [...primary, ...extras];
}

function ListingPage({ title, description, category, filterFn, hideChrome }: ListingProps) {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const level = (params.get('level') || '').toLowerCase();
  const country = (params.get('country') || '').trim();
  const funding = (params.get('funding') || params.get('fundingType') || '').trim();
  const deadline = (params.get('deadline') || '').trim();
  const closing = (params.get('closing') || '').trim();
  const sort = (params.get('sort') || '-createdAt').trim();

  const loadScholarships = category === 'scholarship' || !category;
  const contentCategory =
    category === 'guide' || category === 'internship' || category === 'list'
      ? category
      : null;

  const { data: apiScholarships = [], isLoading: loadingScholarships } = useQuery({
    queryKey: ['public-scholarships', q, level, country, funding, deadline, closing, sort],
    queryFn: async () => {
      const { data } = await api.get('/scholarships', {
        params: {
          limit: 60,
          search: q || undefined,
          level: level || undefined,
          country: country || undefined,
          fundingType: funding || undefined,
          deadline: deadline || undefined,
          closing: closing || undefined,
          sort: sort || '-createdAt',
          open: 'true',
        },
      });
      return (data.data.scholarships || []) as Scholarship[];
    },
    enabled: loadScholarships,
    staleTime: 60_000,
  });

  const { data: apiContent = [], isLoading: loadingContent } = useQuery({
    queryKey: ['public-content', contentCategory, q],
    queryFn: async () => {
      const { data } = await api.get('/content', {
        params: {
          limit: 60,
          category: contentCategory || undefined,
          search: q || undefined,
        },
      });
      return (data.data.items || []) as ContentItem[];
    },
    enabled: Boolean(contentCategory),
    staleTime: 60_000,
  });

  let items: SrPost[] = [];

  if (category === 'scholarship') {
    items = apiScholarships.map(scholarshipToPost);
  } else if (contentCategory) {
    const mapped = apiContent.map(contentToPost);
    // Editorial static guides/lists/internships remain until moved into CMS.
    items = mergeUnique(mapped, getPostsByCategory(contentCategory));
  } else if (!category) {
    items = mergeUnique(
      apiScholarships.map(scholarshipToPost),
      [...getPostsByCategory('guide'), ...getPostsByCategory('list'), ...getPostsByCategory('internship')],
    );
  } else {
    items = getPostsByCategory(category);
  }

  if (filterFn) items = items.filter(filterFn);
  // Level/country/funding/deadline are applied server-side for scholarships.
  // Keep a soft client filter for mixed/static listings only.
  if (level && category !== 'scholarship') {
    items = items.filter((p) => (p.level || '').toLowerCase().includes(level.slice(0, 4)));
  }
  if (q && category !== 'scholarship') {
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q),
    );
  }

  const isLoading =
    (loadScholarships && loadingScholarships) || (Boolean(contentCategory) && loadingContent);

  const results = isLoading ? (
    <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[var(--color-sr-muted)]">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading listings…
    </div>
  ) : items.length === 0 ? (
    <div className="border border-[var(--color-sr-border)] bg-white p-8 text-center">
      <p className="mb-2 font-semibold">No results found</p>
      <p className="mb-4 text-sm text-[var(--color-sr-muted)]">
        Try another keyword or browse all scholarships.
      </p>
      <Link to="/scholarships" className="sr-load-more">
        Browse Scholarships
      </Link>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  if (hideChrome) return results;

  return (
    <>
      <Helmet>
        <title>{title} | AfriRoar</title>
        {description ? <meta name="description" content={description} /> : null}
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-8">
          <p className="mb-2 text-sm text-white/70">
            <Link to="/" className="hover:text-[var(--color-sr-yellow)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{title}</span>
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-white/85">{description}</p> : null}
        </div>
      </div>

      <section className="sr-container py-8">{results}</section>
    </>
  );
}

const LEVEL_FILTERS = [
  { value: '', label: 'All levels' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD & Doctoral' },
  { value: 'postdoctoral', label: 'Postdoctoral' },
];

const FUNDING_FILTERS = [
  { value: '', label: 'Any funding' },
  { value: 'full', label: 'Fully funded' },
  { value: 'partial', label: 'Partial' },
  { value: 'tuition', label: 'Tuition' },
  { value: 'stipend', label: 'Stipend' },
];

const SORT_FILTERS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: '-deadline', label: 'Deadline (latest)' },
];

const DEADLINE_FILTERS = [
  { value: '', label: 'Any deadline' },
  { value: 'soon', label: 'Closing in 30 days' },
  { value: 'q1', label: 'Jan–Mar' },
  { value: 'q2', label: 'Apr–Jun' },
  { value: 'q3', label: 'Jul–Sep' },
  { value: 'q4', label: 'Oct–Dec' },
];

export function ScholarshipsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const level = params.get('level') || '';
  const country = params.get('country') || '';
  const funding = params.get('funding') || params.get('fundingType') || '';
  const deadline = params.get('deadline') || '';
  const sort = params.get('sort') || '-createdAt';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key === 'funding') next.delete('fundingType');
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    setParams({}, { replace: true });
  };

  const hasFilters = Boolean(q || level || country || funding || deadline || (sort && sort !== '-createdAt'));

  return (
    <>
      <Helmet>
        <title>Scholarships | AfriRoar</title>
        <meta
          name="description"
          content="Browse verified international scholarships for undergraduate, master's, PhD and postdoctoral study. Filter by country, funding, and deadline."
        />
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-8">
          <p className="mb-2 text-sm text-white/70">
            <Link to="/" className="hover:text-[var(--color-sr-yellow)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Scholarships</span>
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">Scholarships</h1>
          <p className="mt-2 max-w-3xl text-white/85">
            Browse worldwide fully funded and partial scholarships for undergraduate, master's, PhD
            and training programmes.
          </p>
        </div>
      </div>

      <section className="sr-container py-6 md:py-8">
        <form
          className="mb-6 grid grid-cols-1 gap-3 border border-[var(--color-sr-border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
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
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Search
            </span>
            <input
              name="q"
              defaultValue={q}
              key={q}
              placeholder="Keyword, field, programme…"
              className="border border-[var(--color-sr-border)] px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Level
            </span>
            <select
              value={level}
              onChange={(e) => setFilter('level', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            >
              {LEVEL_FILTERS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Funding
            </span>
            <select
              value={funding}
              onChange={(e) => setFilter('funding', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            >
              {FUNDING_FILTERS.map((opt) => (
                <option key={opt.value || 'any'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Deadline
            </span>
            <select
              value={deadline}
              onChange={(e) => setFilter('deadline', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            >
              {DEADLINE_FILTERS.map((opt) => (
                <option key={opt.value || 'any-d'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="border border-[var(--color-sr-border)] bg-white px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
            >
              {SORT_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
            <button
              type="submit"
              className="bg-[var(--color-sr-navy)] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[var(--color-sr-navy-dark)]"
            >
              Apply search
            </button>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="border border-[var(--color-sr-border)] px-4 py-2.5 text-[14px] font-semibold text-[var(--color-sr-navy)] hover:border-[var(--color-sr-navy)]"
              >
                Clear filters
              </button>
            ) : null}
            <label className="ml-auto flex min-w-[160px] flex-1 flex-col gap-1 sm:max-w-[220px]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-sr-muted)]">
                Country
              </span>
              <input
                name="country"
                defaultValue={country}
                key={`country-${country}`}
                placeholder="e.g. UK, China"
                className="border border-[var(--color-sr-border)] px-3 py-2.5 text-[16px] outline-none focus:border-[var(--color-sr-navy)]"
              />
            </label>
          </div>
        </form>

        <ListingPage title="Scholarships" category="scholarship" hideChrome />
      </section>
    </>
  );
}

export function InternshipsPage() {
  return (
    <ListingPage
      title="Internships"
      description="International internships and professional development opportunities for students and recent graduates."
      category="internship"
    />
  );
}

export function GuidesPage() {
  return (
    <ListingPage
      title="Scholarship Guides"
      description="Practical, step-by-step advice for African applicants: motivation letters, CSC acceptance letters, document checklists, deadlines, and common mistakes to avoid. Always verify final rules on official programme sites."
      category="guide"
    />
  );
}

export function ListsPage() {
  return (
    <ListingPage
      title="Scholarship Lists"
      description="Curated country and theme lists to help you shortlist programmes faster. Open any list for eligibility notes, typical funding, and where to confirm official deadlines."
      category="list"
    />
  );
}

export function CountriesPage() {
  return (
    <>
      <Helmet>
        <title>Scholarships by Countries | AfriRoar</title>
      </Helmet>
      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Popular Countries for Scholarships</h1>
          <p className="mt-2 text-white/85">Explore funding opportunities by destination country.</p>
        </div>
      </div>
      <section className="sr-container py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {popularCountries.map((c) => (
            <Link key={c.slug} to={`/countries/${c.slug}`} className="sr-country-card">
              <img src={c.flag} alt={c.name} />
              <div className="sr-country-label">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function CountryDetailPage() {
  const { slug = '' } = useParams();
  const country = popularCountries.find((c) => c.slug === slug);
  const name = country?.name || slug.toUpperCase();
  const aliases: Record<string, string[]> = {
    usa: ['usa', 'united states', 'america'],
    uk: ['uk', 'united kingdom', 'britain'],
    australia: ['australia'],
    germany: ['germany'],
    canada: ['canada'],
  };
  const keys = aliases[slug] || [name.toLowerCase()];

  return (
    <ListingPage
      title={`Scholarships in ${name}`}
      description={`Featured and latest scholarship opportunities related to ${name}.`}
      category="scholarship"
      filterFn={(p) => {
        if (p.category !== 'scholarship') return false;
        const hay = `${p.country || ''} ${p.title}`.toLowerCase();
        return keys.some((k) => hay.includes(k));
      }}
    />
  );
}
