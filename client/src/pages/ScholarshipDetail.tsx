import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import type { Scholarship } from '@/types';
import { formatDate, formatDeadline, getFundingTypeLabel, getLevelLabel, formatCurrency } from '@/lib/utils';
import {
  MapPin, Clock, GraduationCap, DollarSign, Bookmark, Share2,
  ArrowLeft, Eye, Users, Tag, Building, CalendarCheck
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function ScholarshipDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const { data: scholarship, isLoading } = useQuery({
    queryKey: ['scholarship', slug],
    queryFn: async () => {
      const { data } = await api.get(`/scholarships/slug/${slug}`);
      return data.data.scholarship as Scholarship;
    },
    enabled: !!slug,
  });

  const handleSave = async () => {
    if (!isAuthenticated || !scholarship) return;
    try {
      const { data } = await api.post(`/auth/save-scholarship/${scholarship._id}`);
      updateUser({ savedScholarships: data.data.savedScholarships });
      toast.success(data.data.saved ? 'Scholarship saved!' : 'Removed from saved');
    } catch {
      toast.error('Failed to save');
    }
  };

  const isSaved = user?.savedScholarships?.includes(scholarship?._id || '');
  const providerName = typeof scholarship?.providerId === 'object' ? scholarship.providerId.name : '';

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-5 w-full mb-2" />
        <div className="skeleton h-5 w-3/4 mb-6" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Scholarship Not Found</h1>
        <Link to="/scholarships" className="btn-primary">Browse Scholarships</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{scholarship.title} - AfriRoar</title>
        <meta name="description" content={scholarship.shortDescription || scholarship.description.substring(0, 160)} />
        <meta property="og:title" content={`${scholarship.title} - AfriRoar`} />
        <meta property="og:description" content={scholarship.shortDescription} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Scholarships
        </Link>

        {/* Main Card */}
        <div className="glass-card p-6 sm:p-8 mb-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {scholarship.isFeatured && (
              <span className="badge badge-warning">⭐ Featured</span>
            )}
            <span className={`badge ${scholarship.fundingType === 'full' ? 'badge-success' : 'badge-primary'}`}>
              {getFundingTypeLabel(scholarship.fundingType)}
            </span>
            <span className="badge badge-primary">{getLevelLabel(scholarship.level)}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{scholarship.title}</h1>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {scholarship.country}</span>
            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {scholarship.field}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDeadline(scholarship.deadline)}</span>
            {scholarship.amount?.value && (
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {formatCurrency(scholarship.amount.value, scholarship.amount.currency)}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to={isAuthenticated ? `/dashboard/applications/new?scholarship=${scholarship._id}` : '/login'} className="btn-primary">
              Apply Now
            </Link>
            <button onClick={handleSave} className="btn-secondary">
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="btn-ghost">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none">
            <h2 className="text-lg font-semibold mb-3">About this Scholarship</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>
          </div>

          {scholarship.eligibility && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Eligibility</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">{scholarship.eligibility}</p>
            </div>
          )}

          {/* Tags */}
          {scholarship.tags?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {scholarship.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-muted)] uppercase tracking-wider">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]"><CalendarCheck className="w-4 h-4 inline mr-1" /> Deadline</span>
                <span className="font-medium">{formatDate(scholarship.deadline)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]"><Building className="w-4 h-4 inline mr-1" /> Provider</span>
                <span className="font-medium">{providerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]"><Eye className="w-4 h-4 inline mr-1" /> Views</span>
                <span className="font-medium">{scholarship.viewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]"><Users className="w-4 h-4 inline mr-1" /> Applications</span>
                <span className="font-medium">{scholarship.applicationCount}</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-muted)] uppercase tracking-wider">Posted</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{formatDate(scholarship.createdAt)}</p>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)]">
                AfriRoar verifies all scholarship listings. Report any suspicious activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
