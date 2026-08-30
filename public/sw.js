/* SocioSphere Service Worker
 * - Runtime caching for app shell + static assets (offline support)
 * - Push event handling -> displays notifications
 * - Notification click -> focuses/open tab
 * - Subscription change -> re-subscribes via the API
 */
const VERSION = 'v2';
const APP_SHELL_CACHE = `sociosphere-shell-${VERSION}`;
const RUNTIME_CACHE = `sociosphere-runtime-${VERSION}`;
const APP_SHELL_URLS = ['/', '/overview', '/icon.svg', '/icon-maskable.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => !k.includes(VERSION))
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Bypass service worker for Inertia, API calls, Vite HMR, and dynamic backend actions
    if (
        request.headers.get('X-Inertia') ||
        request.headers.get('X-Requested-With') === 'XMLHttpRequest' ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/@') ||
        url.pathname.startsWith('/resources/') ||
        url.pathname.startsWith('/node_modules/') ||
        url.pathname.includes('hot')
    ) {
        return;
    }

    // Navigations: network-first, fall back to cached shell when offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    if (cached) return cached;
                    const shell = await caches.match('/');
                    if (shell) return shell;
                    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                })
        );
        return;
    }

    // Static assets (images, fonts, stylesheets, scripts)
    const isStaticAsset = /\.(png|jpg|jpeg|svg|webp|gif|ico|woff|woff2|ttf|eot|css|js)$/i.test(url.pathname);
    if (isStaticAsset) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request)
                    .then((response) => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            const copy = response.clone();
                            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                        }
                        return response;
                    });
            })
        );
    }
});

self.addEventListener('push', (event) => {
    let payload = { title: 'SocioSphere', body: '', url: '/' };
    try {
        if (event.data) {
            const data = event.data.json();
            payload = {
                title: data.title || 'SocioSphere',
                body: data.body || data.message || '',
                url: data.url || '/',
                tag: data.tag || undefined,
            };
        }
    } catch (e) {
        payload.body = event.data ? event.data.text() : '';
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: payload.tag,
            data: { url: payload.url },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        })
    );
});

self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil(
        fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ subscription: event.oldSubscription }),
        }).catch(() => {})
    );
});
