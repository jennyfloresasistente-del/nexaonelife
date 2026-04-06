// NexaOne Life Service Worker v4 — NO cachea páginas HTML
// Actualizado: fuerza actualización automática en todos los clientes
const CACHE_NAME = "nexaonelife-v4";
const STATIC_ASSETS = ["/manifest.json", "/logo.png", "/logo-sm.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim().then(() => {
    // Notificar a todos los clientes que recarguen para ver los cambios
    return self.clients.matchAll({ type: "window" }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "SW_UPDATED", version: "v4" });
      });
    });
  });
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Nunca interceptar: peticiones no-GET, API, páginas HTML, rutas Next.js
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname === "/" ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/pago") ||
    url.pathname.startsWith("/preview") ||
    (event.request.headers.get("accept") || "").includes("text/html")
  ) {
    return; // El navegador maneja normalmente, sin caché
  }

  // Solo cachear imágenes y assets estáticos
  const isStaticAsset =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json";

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
