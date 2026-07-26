import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDeadline(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Expired';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days left`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
  return formatDate(date);
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'badge-warning',
    submitted: 'badge-primary',
    under_review: 'badge-primary',
    pending: 'badge-warning',
    accepted: 'badge-success',
    approved: 'badge-success',
    rejected: 'badge-error',
    withdrawn: 'badge-error',
    active: 'badge-success',
    inactive: 'badge-error',
    past_due: 'badge-warning',
    cancelled: 'badge-error',
  };
  return colors[status] || 'badge-primary';
}

export function getFundingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full: 'Fully Funded',
    partial: 'Partial',
    tuition: 'Tuition Only',
    stipend: 'Stipend',
    travel: 'Travel Grant',
    research: 'Research Grant',
  };
  return labels[type] || type;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    'high-school': 'High School',
    bachelors: "Bachelor's",
    masters: "Master's",
    phd: 'PhD',
    postdoc: 'Postdoc',
    any: 'All Levels',
  };
  return labels[level] || level;
}

export function getEmploymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    temporary: 'Temporary',
  };
  return labels[type] || type;
}

export function getWorkplaceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    onsite: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
  };
  return labels[type] || type;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}
