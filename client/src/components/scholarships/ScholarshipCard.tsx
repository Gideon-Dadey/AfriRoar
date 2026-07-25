import { Link } from 'react-router-dom';
import type { Scholarship } from '@/types';
import { formatDeadline, getFundingTypeLabel, getLevelLabel, truncate, formatCurrency } from '@/lib/utils';
import { MapPin, Clock, GraduationCap, Bookmark, Star, Sparkles, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSaveToggle?: () => void;
}

export default function ScholarshipCard({ scholarship, onSaveToggle }: ScholarshipCardProps) {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const isSaved = user?.savedScholarships?.includes(scholarship._id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save scholarships');
      return;
    }
    try {
      const { data } = await api.post(`/auth/save-scholarship/${scholarship._id}`);
      updateUser({ savedScholarships: data.data.savedScholarships });
      toast.success(data.data.saved ? 'Scholarship saved!' : 'Removed from saved');
      onSaveToggle?.();
    } catch {
      toast.error('Failed to save scholarship');
    }
  };

  const providerName = typeof scholarship.providerId === 'object'
    ? scholarship.providerId.name
    : 'Unknown Provider';

  return (
    <Link
      to={`/scholarships/${scholarship.slug || scholarship._id}`}
      className="glass-card p-5 block group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {scholarship.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star className="w-3 h-3 fill-amber-500" /> Featured
              </span>
            )}
            {scholarship.isEarlyAccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600">
                <Sparkles className="w-3 h-3" /> Early Access
              </span>
            )}
            <span className={`badge ${scholarship.fundingType === 'full' ? 'badge-success' : 'badge-primary'}`}>
              {getFundingTypeLabel(scholarship.fundingType)}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary-light)] transition-colors line-clamp-2">
            {scholarship.title}
          </h3>
        </div>
        <button onClick={handleSave} className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors shrink-0">
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
        </button>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
        {scholarship.shortDescription || truncate(scholarship.description, 120)}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> {scholarship.country}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5" /> {getLevelLabel(scholarship.level)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span className={scholarship.isExpired ? 'text-[var(--color-error)]' : ''}>
            {formatDeadline(scholarship.deadline)}
          </span>
        </span>
        {scholarship.amount?.value && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            {formatCurrency(scholarship.amount.value, scholarship.amount.currency)}
          </span>
        )}
      </div>

      {scholarship.tags && scholarship.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {scholarship.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {scholarship.matchScore !== undefined && scholarship.matchScore > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
              <div
                className="h-full rounded-full gradient-bg"
                style={{ width: `${Math.min(scholarship.matchScore * 12.5, 100)}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-primary-light)] font-medium">
              {Math.min(scholarship.matchScore * 12.5, 100).toFixed(0)}% match
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
