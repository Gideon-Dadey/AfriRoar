import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

/** Endpoints that return 401 for bad credentials, not for expired sessions. */
const PUBLIC_AUTH_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
];

function requestUrl(config?: { url?: string; baseURL?: string }) {
  return `${config?.url || ''}`;
}

function isPublicAuthRequest(config?: { url?: string }) {
  const url = requestUrl(config);
  return PUBLIC_AUTH_URLS.some((path) => url.includes(path));
}

function redirectToLogin() {
  useAuthStore.getState().logout();

  const path = `${window.location.pathname}${window.location.search}`;
  // Already on an auth screen, don't hard-reload into an "expired" loop
  if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/verify-email')) {
    return;
  }

  const redirect = path || '/dashboard';
  window.location.href = `/login?redirect=${encodeURIComponent(redirect)}&reason=expired`;
}

function isAuthFailure(error: unknown) {
  const err = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };
  const status = err.response?.status;
  const message = String(err.response?.data?.message || err.message || '').toLowerCase();
  if (status === 401) return true;
  return (
    message.includes('jwt expired') ||
    message.includes('token has expired') ||
    message.includes('invalid token') ||
    message.includes('not logged in')
  );
}

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // Let the browser set multipart boundary
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - refresh once for protected calls, then send user to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never treat login/register/google credential failures as "session expired"
    if (!originalRequest || isPublicAuthRequest(originalRequest) || !isAuthFailure(error)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);

export default api;
