// public/sw.js
const CACHE = "cotizador-pwa-v1";

self.addEventListener("install", (event) => {
  // toma control rápido del SW
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // limpia caches viejos y toma control de las páginas abiertas
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) Navegación SPA: fallback a index.html si hay error offline
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          // usa el scope del SW para resolver /cotizador-pwa/index.html
          const fallbackUrl = new URL(
            "index.html",
            self.registration.scope
          ).toString();
          const cached = await cache.match(fallbackUrl);
          if (cached) return cached;
          // si aún no está cacheado, intenta traerlo de cache general por path relativo
          return caches.match("index.html");
        }
      })()
    );
    return;
  }

  // 2) Archivos estáticos del mismo origen: cache-first
  const isSameOrigin = url.origin === self.location.origin;
  const isStatic = /\.(?:js|css|svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/i.test(
    url.pathname
  );

  if (isSameOrigin && isStatic) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          // solo cachea si respuesta OK
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 3) Resto: red normal (deja pasar)
});
