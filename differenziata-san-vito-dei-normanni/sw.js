/* Differenziata San Vito dei Normanni: copia dell'app per l'uso senza internet.
   Cambia CACHE a ogni pubblicazione: così i telefoni scaricano davvero la versione nuova. */
var CACHE = "sanvito-differenziata-20261004-icone";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/logo.png",
             "./fonts/atkinson-hyperlegible-next-latin.woff2",
             "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* solo le cache vecchie di questa app: sullo stesso dominio ci sono altre app con le loro */
    return Promise.all(keys.filter(function (k) { return k.indexOf("sanvito-differenziata-") === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = e.request.url;

  /* La pagina si scarica sempre dalla rete, così gli aggiornamenti si vedono
     subito; la copia salvata serve solo quando manca la connessione. */
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(function (res) {
      var copia = res.clone();
      caches.open(CACHE).then(function (c) { c.put("./index.html", copia); });
      return res;
    }).catch(function () {
      return caches.match("./index.html").then(function (hit) { return hit || caches.match("./"); });
    }));
    return;
  }

  var salvabile = url.indexOf(self.registration.scope) === 0 ||
                  url.indexOf("https://fonts.googleapis.com") === 0 ||
                  url.indexOf("https://fonts.gstatic.com") === 0;
  e.respondWith(caches.match(e.request).then(function (hit) {
    if (hit) return hit;
    return fetch(e.request).then(function (res) {
      if (salvabile && res && (res.status === 200 || res.type === "opaque")) {
        var copia = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return res;
    }).catch(function () { return caches.match("./index.html"); });
  }));
});
