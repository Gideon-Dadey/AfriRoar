import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import type { Scholarship, Application } from '@/types';
import {
  BookOpen, FileText, Bookmark, TrendingUp, Crown, ArrowRight,
  CheckCircle2, Clock, XCircle, AlertCircle, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications?limit=5');
      return data.data.applications as Application[];
    },
    enabled: user?.role === 'student',
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const { data } = await api.get('/scholarships/user/recommendations');
      return data.data.scholarships as Scholarship[];
    },
    enabled: user?.role === 'student',
  });

  const { data: savedScholarships } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data.user?.savedScholarships as Scholarship[];
    },
    enabled: user?.role === 'student',
  });

  if (!user) return null;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="glass-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{user.name}</span>
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {user.role === 'student' && "Here's your scholarship overview"}
              {user.role === 'provider' && 'Manage your scholarship listings'}
              {user.role === 'admin' && 'Platform administration overview'}
            </p>
          </div>
          {user.role === 'student' && (
            <Link to="/dashboard/applications/new" className="sr-load-more !mt-0 shrink-0">
              Start application
            </Link>
          )}
          {user.role === 'student' && !user.isPremium && (
            <Link to="/pricing" className="btn-primary shrink-0">
              <Crown className="w-4 h-4" /> Upgrade to Premium
            </Link>
          )}
          {user.isPremium && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-500">Premium Active</span>
            </div>
          )}
        </div>

        {/* Profile completion */}
        {user.role === 'student' && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-bold gradient-text">{user.profileCompletionScore}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
              <div
                className="h-full rounded-full gradient-bg transition-all duration-500"
                style={{ width: `${user.profileCompletionScore}%` }}
              />
            </div>
            {user.profileCompletionScore < 80 && (
              <Link to="/dashboard/profile" className="text-xs text-[var(--color-primary-light)] hover:underline mt-2 inline-block">
                Complete your profile to get better recommendations →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Quick stats for student */}
      {user.role === 'student' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Applications', value: applications?.length || 0, link: '/dashboard/applications', color: 'text-[var(--color-primary-light)]' },
            { icon: Bookmark, label: 'Saved', value: savedScholarships?.length || 0, link: '/dashboard/saved', color: 'text-[var(--color-accent)]' },
            { icon: CheckCircle2, label: 'Accepted', value: applications?.filter(a => a.status === 'accepted').length || 0, link: '/dashboard/applications', color: 'text-[var(--color-success)]' },
            { icon: TrendingUp, label: 'Match Score', value: `${user.profileCompletionScore}%`, link: '/dashboard/profile', color: 'text-amber-500' },
          ].map((stat) => (
            <Link key={stat.label} to={stat.link} className="glass-card p-4 hover:border-[var(--color-primary)] transition-colors">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        {user.role === 'student' && (
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link to="/dashboard/applications" className="text-sm text-[var(--color-primary-light)] hover:underline">View all</Link>
            </div>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => {
                  const scholarship = app.scholarshipId as Partial<Scholarship>;
                  return (
                    <Link
                      key={app._id}
                      to={`/dashboard/applications/${app._id}`}
                      className="glass-card p-4 flex items-center gap-4 hover:border-[var(--color-primary)]"
                    >
                      {getStatusIcon(app.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{scholarship?.title || 'Scholarship'}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {app.status.replace('_', ' ').charAt(0).toUpperCase() + app.status.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <FileText className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">No applications yet</p>
                <Link to="/scholarships" className="btn-primary text-sm">Browse Scholarships</Link>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {user.role === 'student' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-primary-light)]" />
                For You
              </h2>
            </div>
            {recommendations && recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((s) => (
                  <ScholarshipCard key={s._id} scholarship={s} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-6 text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-3" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Complete your profile to get personalized recommendations
                </p>
              </div>
            )}
          </div>
        )}

        {/* Provider/Admin quick links */}
        {(user.role === 'provider' || user.role === 'admin') && (
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.role === 'provider' && (
                <>
                  <Link to="/dashboard/provider/listings" className="glass-card p-6 hover:border-[var(--color-primary)]">
                    <BookOpen className="w-6 h-6 text-[var(--color-primary-light)] mb-3" />
                    <h3 className="font-semibold mb-1">My Listings</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Manage your scholarship listings</p>
                  </Link>
                  <Link to="/dashboard/provider/applicants" className="glass-card p-6 hover:border-[var(--color-primary)]">
                    <FileText className="w-6 h-6 text-[var(--color-accent)] mb-3" />
                    <h3 className="font-semibold mb-1">Applicants</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Review scholarship applications</p>
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <Link to="/dashboard/admin/users" className="glass-card p-6 hover:border-[var(--color-primary)]">
                    <BookOpen className="w-6 h-6 text-[var(--color-primary-light)] mb-3" />
                    <h3 className="font-semibold mb-1">Users</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Manage platform users</p>
                  </Link>
                  <Link to="/dashboard/admin/scholarships" className="glass-card p-6 hover:border-[var(--color-primary)]">
                    <FileText className="w-6 h-6 text-[var(--color-accent)] mb-3" />
                    <h3 className="font-semibold mb-1">Scholarships</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">Moderate scholarship listings</p>
                  </Link>
                  <Link to="/dashboard/admin/analytics" className="glass-card p-6 hover:border-[var(--color-primary)]">
                    <BarChart3 className="w-6 h-6 text-[var(--color-success)] mb-3" />
                    <h3 className="font-semibold mb-1">Analytics</h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">View platform statistics</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
