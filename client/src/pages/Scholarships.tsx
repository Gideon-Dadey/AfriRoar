import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import type { Scholarship, Pagination } from '@/types';
import { Search, SlidersHorizontal, X, Loader2, BookOpen } from 'lucide-react';

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'France', 'Japan', 'Singapore', 'Netherlands', 'Sweden'];
const LEVELS = [
  { value: 'high-school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'any', label: 'All Levels' },
];
const FUNDING_TYPES = [
  { value: 'full', label: 'Fully Funded' },
  { value: 'partial', label: 'Partial' },
  { value: 'tuition', label: 'Tuition Only' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'travel', label: 'Travel Grant' },
  { value: 'research', label: 'Research Grant' },
];

export default function Scholarships() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const country = searchParams.get('country') || '';
  const level = searchParams.get('level') || '';
  const fundingType = searchParams.get('fundingType') || '';
  const sort = searchParams.get('sort') || '-createdAt';

  const { data, isLoading } = useQuery({
    queryKey: ['scholarships', page, keyword, country, level, fundingType, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      params.set('sort', sort);
      if (keyword) params.set('keyword', keyword);
      if (country) params.set('country', country);
      if (level) params.set('level', level);
      if (fundingType) params.set('fundingType', fundingType);

      const { data } = await api.get(`/scholarships?${params.toString()}`);
      return data.data as { scholarships: Scholarship[]; pagination: Pagination };
    },
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setKeyword('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('keyword', keyword);
  };

  const hasFilters = country || level || fundingType || keyword;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Scholarships</h1>
        <p className="text-[var(--color-text-secondary)]">
          {data ? `${data.pagination.total} scholarships available` : 'Loading...'}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search scholarships..."
            className="input pl-10 pr-4"
            id="scholarship-search"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'border-[var(--color-primary)]' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
          )}
        </button>
        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="input max-w-[200px]"
          id="scholarship-sort"
        >
          <option value="-createdAt">Newest First</option>
          <option value="deadline">Deadline (Soonest)</option>
          <option value="-viewCount">Most Popular</option>
          <option value="title">A to Z</option>
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[var(--color-primary-light)] hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Country</label>
              <select value={country} onChange={(e) => updateFilter('country', e.target.value)} className="input" id="filter-country">
                <option value="">All Countries</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Level</label>
              <select value={level} onChange={(e) => updateFilter('level', e.target.value)} className="input" id="filter-level">
                <option value="">All Levels</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Funding Type</label>
              <select value={fundingType} onChange={(e) => updateFilter('fundingType', e.target.value)} className="input" id="filter-funding">
                <option value="">All Types</option>
                {FUNDING_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-5 w-full mb-2" />
              <div className="skeleton h-4 w-3/4 mb-4" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : data?.scholarships.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-xl font-semibold mb-2">No scholarships found</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">Try adjusting your filters or search terms</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.scholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship._id} scholarship={scholarship} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateFilter('page', (page - 1).toString())}
                disabled={page <= 1}
                className="btn-secondary text-sm"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(data.pagination.pages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilter('page', pageNum.toString())}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'gradient-bg text-white'
                          : 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => updateFilter('page', (page + 1).toString())}
                disabled={page >= (data?.pagination.pages || 1)}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
