/* Rip Portal — offline shell + Web Push */
const CACHE_VERSION = "rip-portal-v2";
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
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

  // Network-first for navigations; cache fallback for offline shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() =>
          caches.match("/").then((cached) => cached || Response.error())
        )
    );
    return;
  }

  // Cache-first for static public assets (icons, products, next static)
  const isStatic =
    url.pathname.startsWith("/icons/") ||
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
  const path = typeof raw === "string" && raw.startsWith("http")
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
                return client.navigate(path).then((c) => (c && c.focus ? c.focus() : client.focus()));
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
