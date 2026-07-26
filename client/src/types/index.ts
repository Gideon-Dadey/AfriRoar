export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'provider' | 'admin';
  profile: UserProfile;
  profileCompletionScore: number;
  savedScholarships: string[];
  subscriptionPlan: 'free' | 'premium_monthly' | 'premium_yearly';
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'cancelled' | 'trialing';
  subscriptionEndDate?: string;
  isPremium: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  country: string;
  dateOfBirth?: string;
  phone: string;
  bio: string;
  educationLevel: string;
  fieldOfStudy: string;
  institution: string;
  gpa?: number;
  interests: string[];
  languages: string[];
  resume: string;
  avatar: string;
}

export interface Scholarship {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  country: string;
  level: string;
  field: string;
  eligibility: string;
  fundingType: string;
  amount?: { value: number; currency: string };
  deadline: string;
  applicationUrl?: string;
  tags: string[];
  providerId: Partial<User> | string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  isEarlyAccess: boolean;
  isExpired: boolean;
  viewCount: number;
  applicationCount: number;
  saveCount: number;
  coverImage?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  userId: Partial<User> | string;
  scholarshipId: Partial<Scholarship> | string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  steps: ApplicationStep[];
  currentStep: number;
  personalStatement: string;
  motivation: string;
  documents: Document[];
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  lastSavedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  data: Record<string, unknown>;
  completed: boolean;
  completedAt?: string;
}

export interface Document {
  name: string;
  url: string;
  publicId?: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Payment {
  plan: string;
  status: string;
  isPremium: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  invoices: Invoice[];
}

export interface Invoice {
  invoiceId: string;
  amount: number;
  status: string;
  paidAt: string;
  invoiceUrl?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  category: 'guide' | 'internship' | 'list' | 'job';
  excerpt: string;
  body: string;
  coverImage?: string;
  country?: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdBy?: Partial<User> | string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  users: {
    total: number;
    students: number;
    providers: number;
    admins?: number;
    suspended?: number;
    verifiedStudents?: number;
    last7Days?: number;
    last30Days?: number;
  };
  scholarships: {
    total: number;
    approved: number;
    pending: number;
    rejected?: number;
    featured?: number;
  };
  applications: {
    total: number;
    byStatus: Record<string, number>;
    last7Days?: number;
    last30Days?: number;
  };
  content?: { total: number; published: number; draft?: number };
  revenue: {
    totalPremium: number;
    byPlan: Array<{ _id: string; count: number; totalRevenue: number }>;
  };
  recent: {
    users: Partial<User>[];
    scholarships: Partial<Scholarship>[];
    applications?: Partial<Application>[];
  };
  topScholarships?: Array<
    Partial<Scholarship> & { applicationCount?: number; title?: string; country?: string }
  >;
  generatedAt?: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  userId: Partial<User>;
  targetId: string;
  targetModel: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}
