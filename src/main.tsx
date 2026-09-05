import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Android Web & Mobile runtime safety guards and Service Worker registration
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Immediately check for service worker updates to sync mobile client
          registration.update().catch(() => {});

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available, post message to skip waiting
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.dispatchEvent(new CustomEvent('pwa-update-available'));
                  }
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    });

    // Auto-reload once when a new service worker takes control
    let isRefreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isRefreshing) {
        isRefreshing = true;
        window.location.reload();
      }
    });
  }

  window.addEventListener('unhandledrejection', (event) => {
    // Prevent unhandled promise rejections from killing the UI thread
    if (event.reason?.message?.includes('ResizeObserver') || event.reason?.message?.includes('network')) {
      event.preventDefault();
    }
    console.warn('Unhandled promise rejection captured gracefully:', event.reason);
  });

  window.addEventListener('error', (event) => {
    if (event.message?.includes('ResizeObserver loop') || event.message?.includes('Script error')) {
      event.preventDefault();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}


