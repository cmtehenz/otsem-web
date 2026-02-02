// OtsemPay Service Worker
// Provides: offline fallback, static asset caching, navigation caching

const CACHE_VERSION = "v1";
const STATIC_CACHE = `otsempay-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `otsempay-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// Assets to precache on install
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon-32.png",
  "/manifest.json",
];

// API paths that should NEVER be cached (financial data)
const API_PATHS = ["/auth/", "/pix/", "/accounts/", "/customers/", "/wallet/", "/fdbank/", "/inter/"];

function isApiRequest(url) {
  const path = new URL(url).pathname;
  return API_PATHS.some((p) => path.startsWith(p));
}

function isNavigationRequest(request) {
  return request.mode === "navigate";
}

function isStaticAsset(url) {
  const path = new URL(url).pathname;
  return /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico)$/i.test(path);
}

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  // Activate immediately instead of waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // API requests: network-only (never serve stale financial data)
  if (isApiRequest(request.url)) return;

  // Navigation requests: network-first with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses for faster revisits
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }
});

// ── Message handler (for skip-waiting from app update prompt) ────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
