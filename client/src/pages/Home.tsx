import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HeroSection from '@/components/sr/HeroSection';
import PostCard from '@/components/sr/PostCard';
import {
  getFeaturedScholarships,
  getLatestScholarships,
  getPostsByCategory,
  lookingFor,
  popularCountries,
} from '@/data/srContent';

export default function Home() {
  const featured = getFeaturedScholarships();
  const guides = getPostsByCategory('guide').slice(0, 3);
  const lists = getPostsByCategory('list').slice(0, 3);
  const latest = getLatestScholarships().slice(0, 18);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {featured.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {latest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
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
