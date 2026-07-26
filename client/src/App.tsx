import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';
import AppToaster from '@/components/AppToaster';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PostDetail from '@/pages/PostDetail';
import {
  ScholarshipsPage,
  InternshipsPage,
  GuidesPage,
  ListsPage,
  CountriesPage,
  CountryDetailPage,
} from '@/pages/SrListing';
import Pricing from '@/pages/Pricing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Disclaimer from '@/pages/Disclaimer';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Applications from '@/pages/Applications';
import VerifyEmail from '@/pages/VerifyEmail';
import ForgotPassword from '@/pages/ForgotPassword';
import ApplicationWizard from '@/pages/ApplicationWizard';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import JobApplications from '@/pages/JobApplications';
import JobApplicationWizard from '@/pages/JobApplicationWizard';
import SavedScholarships from '@/pages/SavedScholarships';
import Notifications from '@/pages/Notifications';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminScholarships from '@/pages/admin/AdminScholarships';
import AdminScholarshipForm from '@/pages/admin/AdminScholarshipForm';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminApplicationDetail from '@/pages/admin/AdminApplicationDetail';
import AdminJobs from '@/pages/admin/AdminJobs';
import AdminJobForm from '@/pages/admin/AdminJobForm';
import AdminJobApplications from '@/pages/admin/AdminJobApplications';
import AdminJobApplicationDetail from '@/pages/admin/AdminJobApplicationDetail';
import AdminContent from '@/pages/admin/AdminContent';
import AdminContentForm from '@/pages/admin/AdminContentForm';
import AdminActivity from '@/pages/admin/AdminActivity';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <AppToaster />

          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/scholarships/:slug" element={<PostDetail />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:slug" element={<JobDetail />} />
              <Route path="/internships" element={<InternshipsPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:slug" element={<CountryDetailPage />} />
              <Route path="/post/:slug" element={<PostDetail />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/applications" element={<Applications />} />
                <Route path="/dashboard/applications/new" element={<ApplicationWizard />} />
                <Route path="/dashboard/applications/:id" element={<ApplicationWizard />} />
                <Route path="/dashboard/job-applications" element={<JobApplications />} />
                <Route path="/dashboard/job-applications/new" element={<JobApplicationWizard />} />
                <Route path="/dashboard/job-applications/:id" element={<JobApplicationWizard />} />
                <Route path="/dashboard/saved" element={<SavedScholarships />} />
                <Route path="/dashboard/notifications" element={<Notifications />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/dashboard/admin" element={<AdminOverview />} />
                <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/dashboard/admin/users" element={<AdminUsers />} />
                <Route path="/dashboard/admin/scholarships" element={<AdminScholarships />} />
                <Route path="/dashboard/admin/scholarships/new" element={<AdminScholarshipForm />} />
                <Route
                  path="/dashboard/admin/scholarships/:id/edit"
                  element={<AdminScholarshipForm />}
                />
                <Route path="/dashboard/admin/applications" element={<AdminApplications />} />
                <Route
                  path="/dashboard/admin/applications/:id"
                  element={<AdminApplicationDetail />}
                />
                <Route path="/dashboard/admin/jobs" element={<AdminJobs />} />
                <Route path="/dashboard/admin/jobs/new" element={<AdminJobForm />} />
                <Route path="/dashboard/admin/jobs/:id/edit" element={<AdminJobForm />} />
                <Route path="/dashboard/admin/job-applications" element={<AdminJobApplications />} />
                <Route
                  path="/dashboard/admin/job-applications/:id"
                  element={<AdminJobApplicationDetail />}
                />
                <Route path="/dashboard/admin/content" element={<AdminContent />} />
                <Route path="/dashboard/admin/content/new" element={<AdminContentForm />} />
                <Route path="/dashboard/admin/content/:id/edit" element={<AdminContentForm />} />
                <Route path="/dashboard/admin/activity" element={<AdminActivity />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
