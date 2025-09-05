const CACHE_NAME = 'v1';
const PRECACHE = [
  '/',                     
  '/frontend/index.html',
  '/frontend/login.html',
  '/frontend/offline.html',
  '/frontend/manifest.json',

  // HTML Pages
  '/frontend/html-pages/home.html',
  '/frontend/html-pages/list.html',
  '/frontend/html-pages/meals.html',
  '/frontend/html-pages/plan.html',

  // CSS
  '/frontend/css/home.css',
  '/frontend/css/list.css',
  '/frontend/css/plan.css',
  '/frontend/css/style.css',

  // JS
  '/frontend/scripts/api.js',
  '/frontend/scripts/script.js',
  '/frontend/scripts/storage.js',
  '/frontend/scripts/templateLoader.js',
  '/frontend/scripts/js-pages/home.js',
  '/frontend/scripts/js-pages/list.js',
  '/frontend/scripts/js-pages/meals.js',
  '/frontend/scripts/js-pages/plan.js',

  // Images
  '/frontend/assets/img/home_icon.png',
  '/frontend/assets/img/logo.png',
  '/frontend/assets/img/restaurant_icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  event.respondWith(
    isOnline().then(online => {
      if (!online) {
        // Kein Internet – direkt aus Cache oder offline.html
        return caches.match(req).then(cacheRes => {
          return cacheRes || caches.match('/frontend/offline.html');
        });
      }

      // Internet verfügbar – versuche fetch
      return fetch(req)
        .then(networkRes => {
          // Bei Erfolg → im Cache speichern + zurückgeben
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => {
          // Fetch fehlgeschlagen → versuche Cache, sonst offline
          return caches.match(req).then(cacheRes => {
            return cacheRes || caches.match('/frontend/offline.html');
          });
        });
    })
  );
});

// Hilfsfunktion: Internetverbindung testen
function isOnline() {
  return fetch('https://nutripilot.ddns.net:443/ping', { method: 'HEAD', cache: 'no-store', mode: 'no-cors' })
    .then(() => true)
    .catch(() => false);
}
