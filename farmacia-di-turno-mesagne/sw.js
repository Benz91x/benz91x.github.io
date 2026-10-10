/* Farmacia di turno Mesagne: copia dell'app per l'uso senza internet.
   Cambia CACHE a ogni pubblicazione di index.html: così i telefoni scaricano davvero la versione nuova.
   I file dei turni (turni-AAAA.json) si scaricano sempre dalla rete quando c'è: non serve cambiare CACHE. */
var PREFISSO = "farmacia-di-turno-mesagne-";
var CACHE = PREFISSO + "20261010a";
var PAGINA = "./";
var FILE = ["./calendari.json", "./farmacie.json", "./numeri.json", "./abbonamenti.json", "./turni-2026.json", "./manifest.webmanifest",
            "./fonts/atkinson-hyperlegible-next-latin.woff2",
            "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
var ATTESA = 4000; /* con una rete lentissima, dopo 4 secondi si usa la copia salvata */

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll([PAGINA].concat(FILE)); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* solo le cache vecchie di questa app: sullo stesso sito ci sono altre app con le loro */
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFISSO) === 0 && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* prima la rete (per avere i dati freschi), poi la copia salvata */
function retePoiCopia(req, chiave, accetta) {
  return caches.open(CACHE).then(function (c) {
    var rete = fetch(req).then(function (res) {
      if (res.ok && accetta(res)) c.put(chiave, res.clone());
      return res;
    });
    var copia = new Promise(function (ok) { setTimeout(function () { c.match(chiave).then(ok); }, ATTESA); });
    return Promise.race([rete, copia.then(function (r) { return r || rete; })])
      .catch(function () { return c.match(chiave).then(function (r) { return r || Response.error(); }); });
  });
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  var scope = new URL(self.registration.scope).pathname;
  if (url.pathname.indexOf(scope) !== 0) return;
  var nome = url.pathname.slice(scope.length);

  /* la pagina dell'app (con qualsiasi ?parametro): è l'unica pagina salvata per l'uso offline */
  if (e.request.mode === "navigate") {
    if (nome !== "" && nome !== "index.html") return;
    e.respondWith(retePoiCopia(e.request, PAGINA, function (r) { return (r.headers.get("content-type") || "").indexOf("text/html") === 0; }));
    return;
  }
  /* i dati: sempre freschi se c'è la rete */
  if (/^[\w-]+\.json$/.test(nome)) {
    e.respondWith(retePoiCopia(e.request, "./" + nome, function (r) { return (r.headers.get("content-type") || "").indexOf("json") >= 0; }));
    return;
  }
  /* font, icone, loghi: prima la copia salvata */
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res && res.status === 200 && /^(fonts|icons|loghi)\//.test(nome)) {
        var copia = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      }
      return res;
    });
  }));
});
