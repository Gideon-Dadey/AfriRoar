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

function GoogleButtonInner({ onSuccessNavigate, label = 'signin' }: GoogleSignInButtonProps) {
  const { login } = useAuthStore();
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full">
      <div
        className={[
          'flex w-full justify-center overflow-hidden [&_iframe]:!max-w-full',
          busy ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
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
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Google sign-in failed.';
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
          width="380"
        />
      </div>
      {busy ? (
        <p className="mt-2 text-center text-[12px] text-[var(--color-sr-muted)]">Signing in with Google…</p>
      ) : null}
    </div>
  );
}

/** Returns true when Google Sign-In Client ID is present. */
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
