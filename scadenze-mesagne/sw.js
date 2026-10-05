/* Scadenze Mesagne: copia dell'app per l'uso senza internet.
   Cambia CACHE a ogni pubblicazione: così i telefoni scaricano davvero la versione nuova. */
var PREFISSO = "scadenze-mesagne-";
var CACHE = PREFISSO + "20261005b";
var SHELL = ["./", "./index.html", "./avvisi.json", "./manifest.webmanifest",
             "./fonts/atkinson-hyperlegible-next-latin.woff2",
             "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* solo le cache vecchie di questa app: sullo stesso dominio ci sono altre app con le loro */
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFISSO) === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  /* Pagina ed elenco dei bandi si scaricano sempre dalla rete, così gli aggiornamenti
     si vedono subito; la copia salvata serve solo quando manca la connessione. */
  var scope = new URL(self.registration.scope).pathname;
  var pagina = e.request.mode === "navigate" && (url.pathname === scope || url.pathname === scope + "index.html");
  if (pagina || url.pathname === scope + "avvisi.json") {
    var chiave = pagina ? "./index.html" : "./avvisi.json";
    e.respondWith(fetch(e.request).then(function (res) {
      var tipo = res.headers.get("content-type") || "";
      if (res.ok && (pagina ? tipo.indexOf("text/html") === 0 : tipo.indexOf("json") >= 0)) {
        var copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(chiave, copia); });
      }
      return res;
    }).catch(function () { return caches.match(chiave); }));
    return;
  }

  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res && res.status === 200 && e.request.mode !== "navigate" && url.pathname.indexOf(scope) === 0) {
        var copia = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return res;
    });
  }));
});
