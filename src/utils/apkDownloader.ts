import { supabaseService, syncOfflineDataWithSupabase } from '@/services/supabaseService';
import { storage, STORAGE_KEYS } from '@/lib/storage';

/**
 * Android APK & Mobile App Package Utility for NEO GastroPlus HMS
 */

// Global state for beforeinstallprompt event
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export function hasInstallPrompt(): boolean {
  return !!deferredPrompt;
}

/**
 * Triggers native Android PWA / WebAPK Installation
 */
export async function installMobileApp(): Promise<'installed' | 'dismissed' | 'manual'> {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return outcome === 'accepted' ? 'installed' : 'dismissed';
    } catch (e) {
      console.warn('Install prompt error:', e);
    }
  }
  return 'manual';
}

/**
 * Full synchronization routine for Mobile App & WebAPK:
 * - Checks & updates Service Worker caches
 * - Synchronizes offline queues with Supabase cloud
 * - Fetches fresh doctors, staff, and hospital configuration
 * - Triggers reactive state refetches across all mounted components
 */
export async function syncMobileAppWithServer(): Promise<{
  success: boolean;
  offlineSynced: number;
  swUpdated: boolean;
  timestamp: string;
}> {
  let swUpdated = false;
  let offlineSynced = 0;

  try {
    // 1. Force Service Worker update check & clear outdated caches
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
          if (reg.active) {
            reg.active.postMessage({ type: 'SKIP_WAITING' });
          }
        }
        swUpdated = true;
      } catch (swErr) {
        console.warn('Service worker sync check warning:', swErr);
      }
    }

    // 2. Clear old caches if caches API is available
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          if (!key.includes('v2.5-sync')) {
            await caches.delete(key);
          }
        }
      } catch (cErr) {
        console.warn('Cache purge notice:', cErr);
      }
    }

    // 3. Synchronize offline records with live Supabase database
    try {
      const syncResult = await syncOfflineDataWithSupabase();
      if (syncResult && syncResult.success) {
        offlineSynced = syncResult.syncCount || 0;
      }
    } catch (dbErr) {
      console.warn('Offline records sync notice:', dbErr);
    }

    // 4. Fetch latest staff (strictly clinical doctors, no admins/receptionists)
    try {
      const freshStaff = await supabaseService.getStaff();
      if (Array.isArray(freshStaff) && freshStaff.length > 0) {
        storage.set(STORAGE_KEYS.USERS, freshStaff);
      }
    } catch (staffErr) {
      console.warn('Staff refresh notice:', staffErr);
    }

    // 5. Fetch latest hospital info
    try {
      const freshHospital = await supabaseService.getHospitalInfo();
      if (freshHospital) {
        storage.set(STORAGE_KEYS.HOSPITAL_INFO, freshHospital);
      }
    } catch (hospErr) {
      console.warn('Hospital info refresh notice:', hospErr);
    }

    // 6. Broadcast sync event to all open tabs and active components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('supabase-data-sync', { detail: { action: 'mobile-app-sync' } }));
    }

    return {
      success: true,
      offlineSynced,
      swUpdated,
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error('Fatal error during mobile sync:', error);
    return {
      success: false,
      offlineSynced: 0,
      swUpdated: false,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

/**
 * Generates and triggers download of the installable Android Mobile package or setup guide
 */
export function downloadHospitalApk(hospitalName: string = 'NEO GASTRO PLUS HOSPITAL') {
  try {
    // If the browser supports native app installation (WebAPK), trigger it directly
    if (deferredPrompt) {
      installMobileApp();
      return true;
    }

    const fileName = `${hospitalName.replace(/[^a-zA-Z0-9]/g, '')}-Android-App-v2.5.html`;
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : '/';
    
    const htmlGuide = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${hospitalName} - Android App Installer & Sync</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px; text-align: center; margin: 0; }
    .card { background: #1E293B; border-radius: 24px; padding: 28px; max-width: 480px; margin: 24px auto; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #334155; }
    .badge { display: inline-block; background: #0284C7; color: #E0F2FE; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    h1 { color: #38BDF8; font-size: 22px; margin: 0 0 6px 0; }
    p { color: #94A3B8; font-size: 13px; line-height: 1.5; margin: 4px 0 16px 0; }
    .btn { display: block; background: #0284C7; color: white; padding: 14px 20px; border-radius: 14px; font-weight: 800; font-size: 15px; text-decoration: none; margin: 16px 0 10px 0; box-shadow: 0 4px 12px rgba(2,132,199,0.4); }
    .btn:hover { background: #0369a1; }
    .btn-sync { background: #0D9488; box-shadow: 0 4px 12px rgba(13,148,136,0.4); }
    .btn-sync:hover { background: #0f766e; }
    .steps { text-align: left; background: #0F172A; padding: 18px; border-radius: 16px; margin-top: 20px; font-size: 13px; border: 1px solid #1E293B; }
    .steps strong { color: #F1F5F9; display: block; margin-bottom: 8px; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin-bottom: 8px; color: #CBD5E1; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left; margin: 16px 0; font-size: 12px; color: #94A3B8; }
    .features div { background: #0F172A; padding: 8px 12px; border-radius: 8px; border: 1px solid #1E293B; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 44px; margin-bottom: 8px;">🏥</div>
    <div class="badge">v2.5 • Fully Synchronized</div>
    <h1>${hospitalName}</h1>
    <p>Android Mobile Application & Cloud Client</p>
    
    <div class="features">
      <div>✅ Filtered Doctor Lists</div>
      <div>✅ Real-Time Cloud Sync</div>
      <div>✅ Complete OPD / IPD</div>
      <div>✅ Offline Queue & Cash</div>
    </div>

    <a href="${appOrigin}" class="btn">🚀 Open & Launch Hospital App</a>
    <a href="${appOrigin}?force_sync=1" class="btn btn-sync">🔄 Open with Fresh Cloud Sync</a>

    <div class="steps">
      <strong>To install directly into your Android app drawer:</strong>
      <ol>
        <li>Open the app link in <strong>Google Chrome</strong> on your Android device.</li>
        <li>Tap Chrome's <strong>three dots (⋮)</strong> menu in the top right.</li>
        <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
        <li>Android OS installs the app with native performance, full screen, and automatic continuous updates!</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlGuide], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    }, 2000);

    return true;
  } catch (err) {
    console.error('Error initiating APK package download:', err);
    return false;
  }
}

