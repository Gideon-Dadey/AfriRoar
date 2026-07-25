import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

type GoogleSignInButtonProps = {
  onSuccessNavigate: (isNewUser: boolean) => void;
  label?: 'signin' | 'signup';
};

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7 12.9 19.6C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-1.1 3.1-3.5 5.5-6.1 7.1l.1.1 6.2 5.2C39.2 37.3 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

function GoogleButtonInner({ onSuccessNavigate, label = 'signin' }: GoogleSignInButtonProps) {
  const { login } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const buttonText = label === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <div className="w-full">
      <div
        className={[
          'relative flex h-12 w-full items-center justify-center overflow-hidden border border-[var(--color-sr-border)] bg-white transition-colors',
          busy ? 'pointer-events-none opacity-60' : 'hover:border-[var(--color-sr-navy)]',
        ].join(' ')}
      >
        <span className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center gap-3 text-[15px] font-semibold text-[var(--color-sr-navy-deeper)]">
          <GoogleMark className="h-5 w-5 shrink-0" />
          {buttonText}
        </span>

        <div className="absolute inset-0 z-10 opacity-0 [&_div]:!h-full [&_div]:!w-full [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-w-none">
          <GoogleLogin
            onSuccess={async (response) => {
              if (!response.credential) {
                toast.error('Google did not return a credential.');
                return;
              }
              setBusy(true);
              try {
                const { data } = await api.post('/auth/google', {
                  credential: response.credential,
                });
                login(data.data.user, data.data.accessToken);
                toast.success(
                  data.data.isNewUser
                    ? `Welcome to AfriRoar, ${data.data.user.name.split(' ')[0]}.`
                    : `Welcome back, ${data.data.user.name.split(' ')[0]}.`,
                );
                onSuccessNavigate(Boolean(data.data.isNewUser));
              } catch (err: unknown) {
                const message =
                  (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || 'Google sign-in failed.';
                toast.error(message);
              } finally {
                setBusy(false);
              }
            }}
            onError={() => toast.error('Google sign-in was cancelled or failed.')}
            useOneTap={false}
            theme="outline"
            size="large"
            text={label === 'signup' ? 'signup_with' : 'continue_with'}
            shape="rectangular"
            width="400"
          />
        </div>
      </div>

      {busy ? (
        <p className="mt-2 text-center text-[12px] text-[var(--color-sr-muted)]">
          Signing in with Google…
        </p>
      ) : null}
    </div>
  );
}

export function isGoogleSignInConfigured() {
  return Boolean(clientId);
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (!clientId) return null;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleButtonInner {...props} />
    </GoogleOAuthProvider>
  );
}

export function AuthDivider() {
  if (!clientId) return null;

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--color-sr-border)]" />
      </div>
      <div className="relative flex justify-center text-[12px]">
        <span className="bg-[var(--color-sr-bg)] px-3 font-semibold uppercase tracking-[0.14em] text-[var(--color-sr-muted)]">
          Or continue with email
        </span>
      </div>
    </div>
  );
}
