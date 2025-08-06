// =====================================================================
// === Caching-Logik (unverändert) ===
// =====================================================================

const CACHE_KEY_PREFIX = 'fetchWithCache_';

/**
 * Erstellt einen eindeutigen Cache-Schlüssel basierend auf URL und Optionen.
 * @param {string} url - Die URL der Anfrage.
 * @param {object} options - Die Fetch-Optionen (Methode, Body, etc.).
 * @returns {string} Der generierte Cache-Schlüssel.
 */
export function getCacheKey(url, options) {
  const method = (options?.method || 'GET').toUpperCase();
  if (method === 'GET') {
    return CACHE_KEY_PREFIX + url;
  } else {
    // Für Nicht-GET-Anfragen, Body in den Cache-Schlüssel aufnehmen
    let body = options.body || '';
    if (typeof body === 'object') {
      try {
        body = JSON.stringify(body);
      } catch {
        body = '';
      }
    }
    return CACHE_KEY_PREFIX + url + '::' + body;
  }
}

/**
 * Erstellt eine falsche, aber fetch-ähnliche Antwort aus gecachten Daten.
 * @param {*} data - Die gecachten Daten.
 * @returns {object} Ein Objekt mit `ok`, `status`, und einer `json()`-Methode.
 */
function createFakeResponseFromCache(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data
  };
}

// =====================================================================
// === fetchWithCache - Kapselt die gesamte Caching-Logik ===
// =====================================================================

/**
 * Ruft Daten ab und verwaltet den Cache.
 * - Bei GET: Prüft zuerst Cache, dann Netzwerk-Update.
 * - Bei POST/PUT/DELETE: Führt immer einen Netzwerk-Fetch aus und invalidiert den GET-Cache.
 * @param {string} url - Die URL der Anfrage.
 * @param {object} options - Die Fetch-Optionen.
 * @returns {Promise<Response>} Eine Promise, die eine `Response` oder eine Fake-Response auflöst.
 */
export async function fetchWithCache(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const cacheKey = getCacheKey(url, options);

  function readCache() {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  function writeCache(data) {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }

  async function updateCache() {
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error('Network response not ok');
      const data = await resp.clone().json();
      writeCache(data);
      return resp;
    } catch (err) {
      console.warn('Fetch failed during cache update:', err);
      return null;
    }
  }

  if (method === 'GET') {
    const cachedData = readCache();
    if (cachedData) {
      // start asynchronous update
      setTimeout(() => updateCache(), 0);
      if (!cacheUpdateIntervals[cacheKey]) {
        cacheUpdateIntervals[cacheKey] = setInterval(() => updateCache(), 60000);
      }
      return createFakeResponseFromCache(cachedData);
    } else {
      const resp = await updateCache();
      return resp ?? createFakeResponseFromCache(null);
    }
  } else {
    // === KORREKTUR: FÜR POST/PUT/DELETE immer Netzwerk-Fetch ===
    try {
      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error('Network response not ok');

      // Invalidiere den GET-Cache für diese URL nach einer erfolgreichen Schreiboperation
      const getCacheKeyForUrl = getCacheKey(url, { method: 'GET' });
      localStorage.removeItem(getCacheKeyForUrl);
      console.log(`✅ Cache für GET-Endpunkt ${getCacheKeyForUrl} invalidiert.`);
      
      return resp;
    } catch (err) {
      console.warn('Fetch failed for non-GET request:', err);
      return null;
    }
  }
}
