/* Rip Portal — offline shell + Web Push (honest prices: never fake live data) */
const CACHE_VERSION = "rip-portal-v23-verified-ev";
const SHELL_URLS = [
  "/",
  "/open",
  "/deals",
  "/log",
  "/shop",
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

/** Only open Rip Portal pages from a notification. */
function safeTarget(raw) {
  try {
    const u = new URL(typeof raw === "string" && raw ? raw : "/deals", self.location.origin);
    if (u.origin !== self.location.origin) return new URL("/deals", self.location.origin).href;
    return u.href;
  } catch {
    return new URL("/deals", self.location.origin).href;
  }
}

self.addEventListener("push", (event) => {
  let data = {
    title: "Rip Portal",
    body: "Under-EV Watch changed",
    url: "/deals",
    tag: "rip-portal-under-ev",
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

  event.waitUntil(
    self.registration.showNotification(data.title || "Rip Portal", {
      body: data.body || "Under-EV Watch changed",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "rip-portal-under-ev",
      renotify: true,
      data: { url: safeTarget(data.url) },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = safeTarget(
    event.notification.data && event.notification.data.url
  );

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin !== self.location.origin) continue;
          if ("navigate" in client) {
            return client
              .navigate(target)
              .then((c) => (c ? c.focus() : client.focus()))
              .catch(() => client.focus());
          }
          if ("focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
        return undefined;
      })
  );
});
