import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/sr/HeroSection';
import PostCard from '@/components/sr/PostCard';
import api from '@/lib/api';
import { formatDate, getLevelLabel } from '@/lib/utils';
import { getPostsByCategory, lookingFor, popularCountries, type SrPost } from '@/data/srContent';
import type { ApiResponse, Scholarship } from '@/types';

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

export default function Home() {
  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['home-scholarships'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ scholarships: Scholarship[] }>>('/scholarships', {
        params: { limit: 60, sort: '-createdAt' },
      });
      return (data.data?.scholarships || []) as Scholarship[];
    },
    staleTime: 60_000,
  });

  const posts = scholarships.map(scholarshipToPost);
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const latest = posts.slice(0, 18);
  const featuredOrLatest = featured.length > 0 ? featured : latest.slice(0, 3);
  const guides = getPostsByCategory('guide').slice(0, 3);
  const lists = getPostsByCategory('list').slice(0, 3);

  return (
    <>
      <Helmet>
        <title>AfriRoar – Worldwide Scholarships and Internships at One Place</title>
        <meta
          name="description"
          content="Worldwide fully funded scholarships and internships. Browse by country, level, deadlines, and guides."
        />
      </Helmet>

      <HeroSection />

      {/* Featured */}
      <section className="sr-container py-8">
        <h2 className="sr-section-bar">Featured Scholarships</h2>
        {isLoading ? (
          <div className="mt-5 flex items-center justify-center gap-2 py-10 text-[14px] text-[var(--color-sr-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading scholarships…
          </div>
        ) : featuredOrLatest.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--color-sr-muted)]">No scholarships published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {featuredOrLatest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
        <div className="text-center">
          <Link to="/scholarships" className="sr-load-more">
            Load More
          </Link>
        </div>
      </section>

      {/* Popular Countries */}
      <section className="sr-container py-4">
        <h2 className="sr-section-bar">Popular Countries for Scholarships</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-5">
          {popularCountries.map((c) => (
            <Link key={c.slug} to={`/countries/${c.slug}`} className="sr-country-card">
              <img src={c.flag} alt={c.name} />
              <div className="sr-country-label">{c.name}</div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/countries" className="sr-load-more">
            Load More
          </Link>
        </div>
      </section>

      {/* Guides */}
      <section className="sr-container py-4">
        <h2 className="sr-section-bar">Scholarship Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {guides.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="text-center">
          <Link to="/guides" className="sr-load-more">
            Load More
          </Link>
        </div>
      </section>

      {/* Lists */}
      <section className="sr-container py-4">
        <h2 className="sr-section-bar">Scholarship Lists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {lists.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="text-center">
          <Link to="/lists" className="sr-load-more">
            Load More
          </Link>
        </div>
      </section>

      {/* Latest */}
      <section className="sr-container py-4">
        <h2 className="sr-section-bar">Latest Scholarships</h2>
        {isLoading ? (
          <div className="mt-5 flex items-center justify-center gap-2 py-10 text-[14px] text-[var(--color-sr-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading scholarships…
          </div>
        ) : latest.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--color-sr-muted)]">No scholarships published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {latest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Looking for */}
      <section className="sr-container py-8 mb-4">
        <h2 className="sr-section-bar mb-5">What are you looking for?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lookingFor.map((item) => (
            <Link key={item.label} to={item.to} className="sr-look-link">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
