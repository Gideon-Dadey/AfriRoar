import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Globe2, GraduationCap } from 'lucide-react';
import { getLatestScholarships, getPostBySlug } from '@/data/srContent';
import PostCard from '@/components/sr/PostCard';

export default function PostDetail() {
  const { slug = '' } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="sr-container py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Post not found</h1>
        <Link to="/" className="sr-load-more">
          Back to Home
        </Link>
      </div>
    );
  }

  const related = getLatestScholarships()
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{post.title} | AfriRoar</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <article>
        <div className="bg-[var(--color-sr-navy)] text-white">
          <div className="sr-container py-8 md:py-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-[var(--color-sr-yellow)] mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <p className="text-xs uppercase tracking-wider text-[var(--color-sr-yellow)] font-bold mb-2">
              {post.category}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight max-w-4xl">{post.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              {post.country ? (
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" />
                  {post.country}
                </span>
              ) : null}
              {post.level ? (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  {post.level}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="sr-container py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <img
              src={post.image}
              alt={post.title}
              className="w-full aspect-video object-cover border border-[var(--color-sr-border)] mb-6 bg-[#e8eef4]"
            />
            <div className="bg-white border border-[var(--color-sr-border)] p-6 md:p-8 prose-sr">
              <p className="text-lg leading-relaxed mb-5">{post.excerpt}</p>
              <h2 className="text-xl font-bold mb-3 text-[var(--color-sr-navy)]">Overview</h2>
              <p className="mb-4 text-[var(--color-sr-text)] leading-relaxed">
                This MVP listing mirrors the AfriRoar article layout. In production, this page would
                include eligibility criteria, benefits, required documents, application steps, and a verified
                link to the official programme website.
              </p>
              <h2 className="text-xl font-bold mb-3 text-[var(--color-sr-navy)]">Key Details</h2>
              <ul className="list-disc pl-5 space-y-2 mb-6 text-[var(--color-sr-text)]">
                <li>Hosting country: {post.country || 'International'}</li>
                <li>Study level: {post.level || 'Multiple levels'}</li>
                <li>Funding type: Fully funded / Partial (verify on official source)</li>
                <li>Published: {post.date}</li>
              </ul>
              <a
                href="/dashboard/applications/new"
                className="inline-block sr-load-more"
              >
                Apply on AfriRoar
              </a>
            </div>
          </div>

          <aside>
            <h2 className="sr-section-bar mb-4">Related Scholarships</h2>
            <div className="space-y-4">
              {related.map((item) => (
                <PostCard key={item.id} post={item} compact />
              ))}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
