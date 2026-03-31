// =============================================
// SERVICE WORKER — Game of Thrones PWA
// =============================================

const CACHE_NAME = "got-pwa-v1";

// Recursos estáticos a cachear en instalación
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles/style.css",
  "./js/app.js",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap"
];

// APIs externas (cache-first con red como fallback)
const API_CACHE = "got-api-v1";
const API_URLS = [
  "https://api.tvmaze.com/shows/82/seasons",
  "https://api.tvmaze.com/shows/82/cast"
];

// =============================================
// INSTALL — cachear recursos estáticos
// =============================================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Cacheando recursos estáticos");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// =============================================
// ACTIVATE — limpiar caches viejos
// =============================================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== API_CACHE)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// =============================================
// FETCH — estrategia híbrida
// =============================================
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ── Recursos estáticos: Cache First ──
  if (event.request.destination === "document" ||
      event.request.destination === "style" ||
      event.request.destination === "script" ||
      url.hostname === "fonts.googleapis.com" ||
      url.hostname === "fonts.gstatic.com") {

    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // ── API TVmaze: Network First, cache como fallback ──
  if (url.hostname === "api.tvmaze.com") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          console.log("[SW] Offline — usando cache para:", event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }

  // ── Imágenes externas: Cache First ──
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => {
          // Sin imagen — retornar Response vacía
          return new Response("", { status: 200 });
        });
      })
    );
    return;
  }

  // Default: intento de red
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});