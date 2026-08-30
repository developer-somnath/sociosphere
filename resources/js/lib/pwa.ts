/**
 * PWA helpers: service worker registration and WebPush subscription management.
 *
 * The service worker lives at /sw.js (public root) so it controls the whole
 * origin. Push subscriptions are stored server-side via /api/push/subscribe and
 * /api/push/unsubscribe (see SubscriptionController).
 */

import { route } from 'ziggy-js';

const SW_URL = '/sw.js';

export function registerServiceWorker(): void {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Unregister any active service worker during Vite dev HMR to avoid caching surprises.
    if (import.meta.env.DEV) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
                registration.unregister();
            }
        });
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register(SW_URL).catch((err) => {
            console.warn('[pwa] service worker registration failed', err);
        });
    });
}

export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
}

/**
 * Request permission, create a push subscription against the VAPID public key,
 * and persist it to the backend. Returns the subscription or null if denied.
 */
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!isPushSupported()) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
        const key = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key as BufferSource,
        });
    }

    await fetch(route('push.subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        body: JSON.stringify({ subscription }),
    });

    return subscription;
}

export async function unsubscribeFromPush(): Promise<boolean> {
    const subscription = await getExistingSubscription();
    if (!subscription) return true;

    await fetch(route('push.unsubscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        body: JSON.stringify({ subscription }),
    });

    return subscription.unsubscribe();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        output[i] = rawData.charCodeAt(i);
    }
    return output;
}
