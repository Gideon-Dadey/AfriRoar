import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import type { Application, Scholarship } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Filter } from 'lucide-react';

const STATUS_OPTIONS = ['', 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'];

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['applications', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/applications?${params.toString()}`);
      return data.data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-[var(--color-error)]" />;
      case 'submitted':
      case 'under_review': return <Clock className="w-4 h-4 text-[var(--color-warning)]" />;
      default: return <AlertCircle className="w-4 h-4 text-[var(--color-text-muted)]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-sr-navy)]">My Applications</h1>
        <Link to="/dashboard/applications/new" className="sr-load-more !mt-0">
          Start application
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status || 'all'}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (status) params.set('status', status); else params.delete('status');
              params.set('page', '1');
              setSearchParams(params);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'gradient-bg text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {status ? status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1) : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.applications?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications found</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {statusFilter ? 'No applications with this status' : "You haven't applied to any scholarships yet"}
          </p>
          <Link to="/dashboard/applications/new" className="sr-load-more !mt-0">
            Start an application
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.applications?.map((app: Application) => {
            const scholarship = app.scholarshipId as Partial<Scholarship>;
            return (
              <Link
                key={app._id}
                to={`/dashboard/applications/${app._id}`}
                className="glass-card p-5 flex items-center gap-4 hover:border-[var(--color-primary)] transition-colors"
              >
                {getStatusIcon(app.status)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{scholarship?.title || 'Scholarship'}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                    <span>{scholarship?.country}</span>
                    <span>•</span>
                    <span>Applied {app.submittedAt ? formatDate(app.submittedAt) : formatDate(app.createdAt)}</span>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(app.status)} text-xs`}>
                  {app.status.replace('_', ' ')}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
