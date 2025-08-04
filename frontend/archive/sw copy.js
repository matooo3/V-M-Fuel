const CACHE_NAME = 'v1';
const PRECACHE = [
  '/',                     // root
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
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE))
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

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
      .catch(() => caches.match('/frontend/offline.html'))
  );
});
