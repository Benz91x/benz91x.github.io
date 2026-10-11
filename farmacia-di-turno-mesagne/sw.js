/* Farmacia di turno Mesagne: copia dell'app per l'uso senza internet.
   Cambia CACHE a ogni pubblicazione di index.html: così i telefoni scaricano davvero la versione nuova.
   I file dei turni (turni-AAAA.json) si scaricano sempre dalla rete quando c'è: non serve cambiare CACHE. */
var PREFISSO = "farmacia-di-turno-mesagne-";
var CACHE = PREFISSO + "20261011a";
var PAGINA = "./";
var FILE = ["./calendari.json", "./farmacie.json", "./numeri.json", "./abbonamenti.json", "./manifest.webmanifest",
            "./fonts/atkinson-hyperlegible-next-latin.woff2",
            "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
/* i turni si aggiungono a parte: se un file manca, l'installazione non si blocca */
var TURNI = ["./turni-2026.json"];
var ATTESA = 4000; /* con una rete lentissima, dopo 4 secondi si usa la copia salvata */

function fresco(u) { return new Request(u, { cache: "reload" }); } /* scavalca la cache del browser */

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll([PAGINA].concat(FILE).map(fresco)).then(function () {
      return Promise.all(TURNI.map(function (u) { return c.add(fresco(u)).catch(function () {}); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* solo le cache vecchie di questa app: sullo stesso sito ci sono altre app con le loro */
    var vecchie = keys.filter(function (k) { return k.indexOf(PREFISSO) === 0 && k !== CACHE; });
    return caches.open(CACHE).then(function (nuova) {
      return Promise.all(vecchie.map(function (k) {
        /* i loghi delle farmacie passano nella cache nuova, poi la vecchia si cancella */
        return caches.open(k).then(function (v) {
          return v.keys().then(function (reqs) {
            return Promise.all(reqs.filter(function (r) { return /\/loghi\//.test(r.url); }).map(function (r) {
              return v.match(r).then(function (res) { return res && nuova.put(r, res); });
            }));
          });
        }).catch(function () {}).then(function () { return caches.delete(k); });
      }));
    });
  }).then(function () { return self.clients.claim(); }));
});

/* prima la rete (per avere i dati freschi), poi la copia salvata. Conta la risposta intera, non solo
   l'inizio: con una rete che si interrompe a metà si usa la copia. Un errore del server (404, 503)
   vale come rete assente se la copia c'è. */
function retePoiCopia(req, chiave, accetta) {
  return caches.open(CACHE).then(function (c) {
    var grezza = fetch(req);
    var rete = grezza.then(function (res) {
      if (!res.ok) throw res;
      return res.arrayBuffer().then(function (b) {
        var r = new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers });
        if (accetta(res)) c.put(chiave, r.clone()).catch(function () {});
        return r;
      });
    });
    var copia = new Promise(function (ok) { setTimeout(ok, ATTESA); }).then(function () { return c.match(chiave); });
    return Promise.race([rete, copia.then(function (r) { return r || rete; })])
      .catch(function () { return c.match(chiave).then(function (r) { return r || grezza; }); })
      .catch(function () { return Response.error(); });
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
        caches.open(CACHE).then(function (c) { return c.put(e.request, copia); }).catch(function () {});
      }
      return res;
    });
  }));
});
