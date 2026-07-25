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

function redirectToLogin() {
  useAuthStore.getState().logout();
  const path = `${window.location.pathname}${window.location.search}`;
  const redirect =
    path.startsWith('/login') || path.startsWith('/register')
      ? '/dashboard'
      : path || '/dashboard';
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
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - refresh once, then send user to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry || !isAuthFailure(error)) {
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
