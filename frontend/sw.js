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

// Service Worker installieren & Ressourcen cachen
self.addEventListener('install', e => {
  console.log('[SW] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// Alte Caches entfernen
self.addEventListener('activate', e => {
  console.log('[SW] Activate');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch-Strategie: online first → fallback cache → offline.html
// self.addEventListener('fetch', event => {
//   const req = event.request;

//   // Only handle GET requests
//   if (req.method !== 'GET') {
//     return;
//   }
//   event.respondWith(
//     fetch(req).then(networkRes => {
//       // Cache aktualisieren
//       return caches.open(CACHE_NAME).then(cache => {
//         cache.put(req, networkRes.clone());
//         console.log('[SW] Updated cache:', req.url);
//         return networkRes;
//       });
//     }).catch(() => {
//       // Fehler beim Netzwerk-Fetch
//       console.warn('[SW] Fetch failed – trying cache:', req.url);
//       return caches.match(req).then(cacheRes => {
//         return cacheRes || caches.match('/frontend/offline.html');
//       });
//     })
//   );
// });
// offline first -> network later
// self.addEventListener('fetch', event => {
//   const req = event.request;

//   // Nur GET-Anfragen behandeln
//   if (req.method !== 'GET') return;

//   event.respondWith(
//     caches.match(req).then(cacheRes => {
//       if (cacheRes) {
//         // Sofortige Antwort aus Cache
//         console.log('[SW] From cache:', req.url);
//         return cacheRes;
//       }

//       // Falls nicht im Cache: aus dem Netz holen
//       return fetch(req).then(networkRes => {
//         return caches.open(CACHE_NAME).then(cache => {
//           cache.put(req, networkRes.clone());
//           console.log('[SW] Cached new:', req.url);
//           return networkRes;
//         });
//       }).catch(() => {
//         // Wenn fetch fehlschlägt (z. B. offline)
//         return caches.match('/frontend/offline.html');
//       });
//     })
//   );
// });

//hybrid!!! !  !!
// const CACHE_NAME = 'v1';
const CACHE_MAX_AGE = 100; // 15 Sekunden in Millisekunden

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cachedRes = await cache.match(req);
      const cacheTime = await cache.match(req.url + ':timestamp');

      const now = Date.now();

      // Prüfe, ob Cache veraltet ist
      const isExpired = cacheTime
        ? now - parseInt(await cacheTime.text()) > CACHE_MAX_AGE
        : true;
  
      // Wenn gecached und nicht veraltet → sofort zurückgeben
      if (cachedRes && !isExpired) {
        console.log('[SW] From cache:', req.url);
        return cachedRes;
      }

      // Versuche, vom Netzwerk zu laden
      return fetch(req).then(networkRes => {
        // Speichere neuen Timestamp
        cache.put(req, networkRes.clone());
        cache.put(
          req.url + ':timestamp',
          new Response(now.toString())
        );
        console.log('[SW] Cache updated:', req.url);
        return networkRes;
      }).catch(() => {
        // Fallback bei Netzwerkfehler
        console.warn('[SW] Network failed, fallback to cache:', req.url);
        return cachedRes || cache.match('/frontend/offline.html');
      });
    })
  );
});



// Hilfsfunktion: Internetverbindung prüfen über /ping
// function isOnline() {
//   return fetch('https://nutripilot.ddns.net:443/ping', {
//     method: 'HEAD',
//     cache: 'no-store',
//     mode: 'cors'
//   }).then(res => res.ok)
//     .catch(() => false);
async function isOnline() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

