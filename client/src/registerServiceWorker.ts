/**
 * Production PWA updates: check often, activate immediately, reload once new SW controls the page.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const checkForUpdates = (registration: ServiceWorkerRegistration) => {
    registration.update().catch(() => {});
  };

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        checkForUpdates(registration);

        // Background checks while the app stays open (browser or installed PWA)
        window.setInterval(() => checkForUpdates(registration), 60_000);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdates(registration);
        });

        window.addEventListener('focus', () => checkForUpdates(registration));
        window.addEventListener('online', () => checkForUpdates(registration));

        // New worker downloaded → activate immediately (no waiting for tab close)
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(() => {
        // Manifest installability still works without SW on some browsers.
      });
  });

  // After skipWaiting + claim, reload once so the new shell/assets load
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
