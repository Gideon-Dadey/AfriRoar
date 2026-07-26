import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import PostCard from '@/components/sr/PostCard';
import api from '@/lib/api';
import { formatDate, getLevelLabel } from '@/lib/utils';
import { getPostsByCategory, popularCountries, posts, type SrPost } from '@/data/srContent';
import type { ContentItem, Scholarship } from '@/types';

type ListingProps = {
  title: string;
  description?: string;
  category?: SrPost['category'];
  filterFn?: (post: SrPost) => boolean;
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

function ListingPage({ title, description, category, filterFn }: ListingProps) {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const level = (params.get('level') || '').toLowerCase();

  const loadScholarships = category === 'scholarship' || !category;
  const contentCategory =
    category === 'guide' || category === 'internship' || category === 'list'
      ? category
      : null;

  const { data: apiScholarships = [], isLoading: loadingScholarships } = useQuery({
    queryKey: ['public-scholarships', q],
    queryFn: async () => {
      const { data } = await api.get('/scholarships', {
        params: { limit: 60, search: q || undefined, sort: '-createdAt' },
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

  let items = category ? getPostsByCategory(category) : [...posts];

  if (loadScholarships) {
    items = mergeUnique(
      apiScholarships.map(scholarshipToPost),
      category === 'scholarship' ? getPostsByCategory('scholarship') : items,
    );
  }

  if (contentCategory) {
    const mapped = apiContent.map(contentToPost);
    if (contentCategory === 'list') {
      // Jobs from CMS surface under lists for MVP
      items = mergeUnique(mapped, getPostsByCategory('list'));
    } else {
      items = mergeUnique(mapped, getPostsByCategory(contentCategory));
    }
  }

  if (filterFn) items = items.filter(filterFn);
  if (level) {
    items = items.filter((p) => (p.level || '').toLowerCase().includes(level.slice(0, 4)));
  }
  if (q) {
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q),
    );
  }

  const isLoading =
    (loadScholarships && loadingScholarships) || (Boolean(contentCategory) && loadingContent);

  return (
    <>
      <Helmet>
        <title>{title} | AfriRoar</title>
        {description ? <meta name="description" content={description} /> : null}
      </Helmet>

      <div className="bg-[var(--color-sr-navy)] text-white">
        <div className="sr-container py-8">
          <p className="text-sm text-white/70 mb-2">
            <Link to="/" className="hover:text-[var(--color-sr-yellow)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{title}</span>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description ? <p className="mt-2 text-white/85 max-w-3xl">{description}</p> : null}
        </div>
      </div>

      <section className="sr-container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[14px] text-[var(--color-sr-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading listings…
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[var(--color-sr-border)] p-8 text-center">
            <p className="font-semibold mb-2">No results found</p>
            <p className="text-[var(--color-sr-muted)] text-sm mb-4">
              Try another keyword or browse all scholarships.
            </p>
            <Link to="/scholarships" className="sr-load-more">
              Browse Scholarships
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function ScholarshipsPage() {
  return (
    <ListingPage
      title="Scholarships"
      description="Browse worldwide fully funded and partial scholarships for undergraduate, masters, PhD and training programmes."
      category="scholarship"
    />
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
        const matched = keys.some((k) => hay.includes(k));
        return matched || p.featured === true;
      }}
    />
  );
}
