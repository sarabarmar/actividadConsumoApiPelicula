const CACHE_NAME = "peliculas-v1";

// Archivos que quieres cachear
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});