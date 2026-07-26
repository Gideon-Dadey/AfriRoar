import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Desktop: top-right, clear of chrome.
 * Mobile: bottom-center snackbar — avoids status bar, notch, and fixed nav.
 */
export default function AppToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <Toaster
      position={isMobile ? 'bottom-center' : 'top-right'}
      gutter={10}
      containerStyle={
        isMobile
          ? {
              top: undefined,
              bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
              left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
              right: 'max(0.75rem, env(safe-area-inset-right, 0px))',
            }
          : {
              top: '1rem',
              right: '1rem',
            }
      }
      toastOptions={{
        duration: 4000,
        className: 'sr-toast',
        style: {
          background: '#ffffff',
          color: '#1e1e1e',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          maxWidth: 'min(420px, calc(100vw - 1.5rem))',
          padding: '12px 14px',
          fontSize: '14px',
          lineHeight: '1.35',
        },
        success: {
          iconTheme: {
            primary: '#2f4468',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#b91c1c',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
