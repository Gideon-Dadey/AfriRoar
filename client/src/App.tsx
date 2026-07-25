import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Disclaimer from '@/pages/Disclaimer';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Applications from '@/pages/Applications';
import VerifyEmail from '@/pages/VerifyEmail';
import ApplicationWizard from '@/pages/ApplicationWizard';

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
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e1e1e',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
              },
            }}
          />

          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/scholarships/:slug" element={<PostDetail />} />
              <Route path="/internships" element={<InternshipsPage />} />
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:slug" element={<CountryDetailPage />} />
              <Route path="/post/:slug" element={<PostDetail />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/applications" element={<Applications />} />
                <Route path="/dashboard/applications/new" element={<ApplicationWizard />} />
                <Route path="/dashboard/applications/:id" element={<ApplicationWizard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
