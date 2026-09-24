/* Rip Portal — offline shell + Web Push (honest prices: never fake live data) */
const CACHE_VERSION = "rip-portal-v8-monetize-buy-www";
const SHELL_URLS = [
  "/",
  "/open",
  "/deals",
  "/log",
  "/privacy",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/portal-app-icon.png",
  "/icons/splash-swirl-1024.png",
  "/cards/rip-portal-card-back.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API / prices as "live" — network only; fail closed offline
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("prices") ||
    url.pathname.endsWith(".json")
  ) {
    return;
  }

  // Network-first for navigations; cache fallback for offline shell
  // Cache each route path so /open /deals /log deep links work from home screen
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            const path =
              url.pathname === "/" ||
              url.pathname === "/open" ||
              url.pathname === "/deals" ||
              url.pathname === "/log" ||
              url.pathname === "/privacy"
                ? url.pathname
                : "/";
            caches.open(CACHE_VERSION).then((cache) => cache.put(path, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(url.pathname).then(
            (cached) =>
              cached ||
              caches.match("/").then((home) => home || Response.error())
          )
        )
    );
    return;
  }

  // Cache-first for static public assets (icons, brand, products, next static)
  const isStatic =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname.startsWith("/products/") ||
    url.pathname.startsWith("/_next/static/");

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Rip Portal",
    body: "New under-EV deals",
    url: "/deals",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      if (parsed && typeof parsed === "object") {
        data = { ...data, ...parsed };
      }
    }
  } catch {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch {
      /* keep defaults */
    }
  }

  const targetUrl = data.url || "/deals";
  event.waitUntil(
    self.registration.showNotification(data.title || "Rip Portal", {
      body: data.body || "Under-EV deals updated",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "rip-portal-under-ev",
      renotify: true,
      data: { url: targetUrl },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw =
    (event.notification.data && event.notification.data.url) || "/deals";
  const path =
    typeof raw === "string" && raw.startsWith("http")
      ? raw
      : new URL(raw || "/deals", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            if ("navigate" in client) {
              try {
                return client
                  .navigate(path)
                  .then((c) => (c && c.focus ? c.focus() : client.focus()));
              } catch {
                return client.focus();
              }
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(path);
        return undefined;
      })
  );
});
