const CACHE_NAME = "dse-shell-v2";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/dse-logo.png",
  "/dse-logo-heads.png",
  "/hero-cups-lineup.jpeg",
  "/mqzbv8qe-Berry_thai.jpeg",
  "/mqzbv8h2-Cinna-mom.jpeg",
  "/mqzbv8c8-Miso_sweet.jpeg",
  "/mqzbv8mf-roswmary_s_baby.jpeg",
  "/mqz9i5ep-Reverse_the_composition_of_the_202606290636.jpeg",
  "/mqzc2dix-_b08da7af-df73-4c23-b01b-2afb3eadde20.png",
  "/mr0msqib-Create_a_montage_image._Of_202606300534.jpeg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;
  if (request.url.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put("/", res.clone()));
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, res.clone()));
          return res;
        })
    )
  );
});
