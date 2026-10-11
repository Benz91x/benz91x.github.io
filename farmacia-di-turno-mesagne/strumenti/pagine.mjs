#!/usr/bin/env node
/* Farmacia di turno Mesagne: pagine statiche per i motori di ricerca.

   Dagli stessi file dell'app (turni-AAAA.json, farmacie.json, calendari.json) scrive:
     turni/                     i turni dell'anno, con i festivi e i mesi
     turni/ottobre-2026/        il calendario di un mese, giorno per giorno
     farmacie/                  l'elenco delle farmacie di Mesagne
     farmacie/<id>/             la scheda di una farmacia, con tutti i suoi turni
     numeri-utili/              guardia medica, pronto soccorso, CUP, centro prelievi
     informazioni/              chi fa il sito, da dove vengono i dati, come si aggiorna
     sitemap.xml                tutte le pagine
   e aggiorna in index.html i blocchi fra i segnaposti <!--PAGINE-…--> (elenco statico delle
   farmacie e collegamenti ai mesi), che si vedono anche senza JavaScript.

   Le pagine contengono solo date precise (mai «oggi»), così un risultato di Google vecchio
   di qualche giorno resta giusto. Il risultato dipende solo dai dati: se i dati non cambiano,
   le pagine restano identiche.

   Uso:  node strumenti/pagine.mjs            scrive le pagine
         node strumenti/pagine.mjs --controlla  esce con errore se le pagine non sono aggiornate */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const URL_APP = "https://benz91x.github.io/farmacia-di-turno-mesagne/";
const BASE = "/farmacia-di-turno-mesagne/";
const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const leggi = (f) => JSON.parse(readFileSync(join(APP, f), "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const maiusc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n) => String(n).padStart(2, "0");
const sett = (d) => new Date(d + "T12:00:00Z").getUTCDay();
const giorniNelMese = (a, m) => new Date(Date.UTC(a, m, 0)).getUTCDate();
const dataLunga = (d) => (+d.slice(8)) + " " + MESI[+d.slice(5, 7) - 1] + " " + d.slice(0, 4);
const elide = (d) => [8, 11].includes(+d.slice(8));
const ilData = (d) => (elide(d) ? "l'" : "il ") + dataLunga(d);
const conGiorno = (d) => GIORNI[sett(d)] + " " + dataLunga(d);
const slugMese = (am) => MESI[+am.slice(5) - 1] + "-" + am.slice(0, 4);
const nomeMese = (am) => MESI[+am.slice(5) - 1] + " " + am.slice(0, 4);
const telHref = (t) => { const n = String(t).replace(/\D/g, ""); return "tel:" + (/^0|^3/.test(n) ? "+39" + n : n); };
const telIntl = (t) => "+39 " + String(t).trim();
const mappaHref = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const perEsteso = (s) => String(s || "").replace(/\bdr\.ssa\s*/gi, "dottoressa ").replace(/\bdott\.ssa\s*/gi, "dottoressa ").replace(/\bdott\.\s*/gi, "dottor ").replace(/\bdr\.\s*/gi, "dottor ");
const max = (a) => a.filter(Boolean).sort().pop();

/* ======== dati ======== */
export function caricaDati() {
  const albo = leggi("farmacie.json");
  const FARM = Object.fromEntries(albo.farmacie.map((x) => [x.id, x]));
  const anni = leggi("calendari.json").anni.map(Number).sort();
  const TURNI = {}, FESTIVI = {}, META = {}, DI = {};
  for (const a of anni) {
    const t = leggi("turni-" + a + ".json");
    META[a] = { aggiornato: t.fonte?.notturni?.aggiornato || null, festivi: t.fonte?.festivi?.aggiornato || null, controllato: t.controllato || null, pagina: t.fonte?.pagina || "" };
    for (const [d, id] of Object.entries(t.turni || {})) {
      /* un giorno presente in due file (es. il 1° gennaio): vale il file del suo anno, come nell'app */
      if (DI[d] && d.slice(0, 4) !== String(t.anno)) continue;
      DI[d] = t.anno;
      if (id && FARM[id]) TURNI[d] = id; else delete TURNI[d];
    }
    Object.assign(FESTIVI, t.festivi || {});
  }
  /* un mese ha la sua pagina solo se il calendario c'è per tutti i giorni */
  const mesi = [];
  for (const a of anni) for (let m = 1; m <= 12; m++) {
    const am = a + "-" + pad(m), n = giorniNelMese(a, m);
    let tutti = true;
    for (let g = 1; g <= n; g++) if (!TURNI[am + "-" + pad(g)]) { tutti = false; break; }
    if (tutti) mesi.push(am);
  }
  const controllato = max([...Object.values(META).map((m) => m.controllato), albo.fonte?.controllato]);
  const NUMERI = leggi("numeri.json");
  const email = (/email:\s*"([^"]+)"/.exec(readFileSync(join(APP, "index.html"), "utf8")) || [])[1] || "";
  return { albo, FARM, anni, TURNI, FESTIVI, META, DI, mesi, controllato, NUMERI, email };
}

const festivo = (D, d) => sett(d) === 0 || !!D.FESTIVI[d];
const nomeFesta = (D, d) => { const n = D.FESTIVI[d]; return n && n !== "Giorno festivo" ? n : (n ? "giorno festivo" : ""); };
const diverso = (x) => !norm(x.insegna).includes(norm(x.calendario[0]));
const nomeCal = (x) => maiusc(x.calendario[0].toLowerCase());
const ordinate = (D) => Object.values(D.FARM).sort((a, b) => a.nomeBreve.localeCompare(b.nomeBreve, "it"));
const cap = (x) => (/(\d{5})/.exec(x.mappa || "") || [])[1] || "72023";

/* ======== modello comune ======== */
const LOGO = '<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><rect x="1" y="1" width="46" height="46" rx="11" fill="#fff"/><path d="M19 8h10v10h10v10H29v10H19V28H9V18h10z" fill="#1F9D55"/><path d="M39.6 4.6a5.2 5.2 0 1 0 4.4 7.6 4.2 4.2 0 1 1-4.4-7.6Z" fill="#123A5E"/></svg>';
const CSS = `@font-face{font-family:"Atkinson Hyperlegible Next";font-style:normal;font-weight:400 800;font-display:swap;src:url(${BASE}fonts/atkinson-hyperlegible-next-latin.woff2) format("woff2")}
:root{--bg:#F3F5F7;--surface:#fff;--sunk:#E6EAEE;--ink:#10161D;--ink-2:#2F3A46;--line:#C9D1DA;--brand:#123A5E;--brand-2:#D5E2EF;--btn:#123A5E;--btn-ink:#fff;--link:#0B4F8A;--ring:#1F6FB8;--oggi:#FFF4D6;--oggi-line:#8A6100;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#0C1117;--surface:#141B23;--sunk:#202B37;--ink:#F1F4F7;--ink-2:#CDD6DF;--line:#33414F;--brand:#0C2236;--brand-2:#C9D8E8;--btn:#24527D;--btn-ink:#fff;--link:#9CCBFF;--ring:#8CC4FF;--oggi:#33280C;--oggi-line:#D9A928}}
*,*::before,*::after{box-sizing:border-box}
html{font-size:131.25%;background:var(--brand);-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Atkinson Hyperlegible Next",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:1rem;line-height:1.5;overflow-wrap:break-word}
h1,h2,h3,p,ul,ol{margin:0}
a{color:var(--link);text-underline-offset:.15em}
:focus-visible{outline:3px solid var(--ring);outline-offset:3px}
.wrap{max-width:46rem;margin:0 auto;padding-inline:16px}
.top{background:var(--brand);color:#fff}
.top a{color:#fff;text-decoration:none;display:flex;align-items:center;gap:12px;min-height:76px;padding-block:10px;font-weight:800;font-size:1.15rem;line-height:1.15}
.top a span{display:block;color:var(--brand-2);font-weight:700}
.top :focus-visible{outline-color:#FFD166}
.logo{width:44px;height:44px;flex:none}
.bric{font-size:.9rem;padding-top:14px;color:var(--ink-2)}
.bric ol{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:4px 8px}
.bric li+li::before{content:"›";margin-right:8px}
main{padding-block:12px 32px}
h1{font-size:1.6rem;line-height:1.2;margin-top:10px}
h2{font-size:1.25rem;line-height:1.25;margin-top:30px}
p,ul,ol{margin-top:12px}
ul.punti{padding-left:1.2em}
ul.punti li+li{margin-top:6px}
.lead{font-size:1.05rem;color:var(--ink-2)}
.agg{font-size:.9rem;color:var(--ink-2);margin-top:6px}
.fonte{font-size:.9rem;color:var(--ink-2)}
.btn{display:flex;align-items:center;justify-content:center;min-height:64px;margin-top:16px;padding:10px 18px;border-radius:14px;background:var(--btn);color:var(--btn-ink);font-weight:800;text-decoration:none;text-align:center}
.btn.sec{background:var(--surface);color:var(--ink);border:2px solid var(--ink-2)}
.btn.emerg{background:#9B1C1C;color:#fff}
.scheda{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:14px}
.scheda h2,.scheda h3{margin-top:0;font-size:1.15rem}
.avviso{background:var(--oggi);border-left:6px solid var(--oggi-line);border-radius:12px;padding:12px 16px;margin-top:16px}
.num{white-space:nowrap;font-weight:800}
.turni{width:100%;border-collapse:collapse;margin-top:14px;background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.turni caption{text-align:left;font-weight:800;padding:12px 12px 8px}
.turni th,.turni td{text-align:left;vertical-align:top;padding:10px 12px;border-bottom:1px solid var(--line)}
.turni thead th{background:var(--sunk);font-size:.9rem}
.turni td.g{font-weight:800;white-space:nowrap}
.turni .ind{display:block;font-size:.9rem;color:var(--ink-2)}
.turni tr.fest td{background:var(--sunk)}
.turni .festa{display:block;font-size:.85rem;font-weight:700}
.turni tr.oggi td{background:var(--oggi)}
.oggi-et{display:inline-block;margin-left:8px;padding:0 8px;border-radius:8px;background:var(--oggi-line);color:#fff;font-size:.8rem;font-weight:800}
@media (prefers-color-scheme:dark){.oggi-et{color:#000}}
@media (max-width:40rem){.turni thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.turni,.turni caption,.turni tbody,.turni tr,.turni td{display:block;width:100%}.turni tr{border-bottom:1px solid var(--line);padding:10px 12px}.turni td{border:0;padding:2px 0}.turni tr.fest td,.turni tr.oggi td{background:none}.turni tr.fest{background:var(--sunk)}.turni tr.oggi{background:var(--oggi)}}
.mesi{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(6.5rem,1fr));gap:10px}
.mesi a{display:flex;align-items:center;justify-content:center;min-height:56px;border:2px solid var(--line);border-radius:12px;background:var(--surface);font-weight:700;text-decoration:none;color:var(--ink)}
.vai{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;margin-top:20px}
.vai a{font-weight:700}
.piede{background:var(--surface);border-top:1px solid var(--line);padding-block:20px 32px;font-size:.9rem;color:var(--ink-2)}
.piede p{margin-top:10px}
@media print{.top,.btn,.vai,.bric{display:none}html,body{background:#fff;color:#000}}`;

function pagina({ percorso, titolo, descrizione, briciole, corpo, jsonld, D }) {
  const url = URL_APP + percorso;
  const bric = briciole.map((b, i) => '<li>' + (i < briciole.length - 1 ? '<a href="' + esc(BASE + b.p) + '">' + esc(b.n) + '</a>' : '<span aria-current="page">' + esc(b.n) + '</span>') + '</li>').join("");
  const ld = [{
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: briciole.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.n, item: URL_APP + b.p }))
  }, ...jsonld];
  return `<!doctype html>
<html lang="it-IT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#123A5E">
<link rel="icon" href="${BASE}icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="${BASE}icons/apple-touch-icon.png">
<link rel="preload" href="${BASE}fonts/atkinson-hyperlegible-next-latin.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Farmacia di turno Mesagne">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${URL_APP}icons/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<style>${CSS}</style>
${ld.map((x) => '<script type="application/ld+json">' + JSON.stringify(x).replace(/</g, "\\u003c") + '</script>').join("\n")}
</head>
<body>
<header class="top"><div class="wrap"><a href="${BASE}">${LOGO}<div>Farmacia di turno<span>Mesagne</span></div></a></div></header>
<nav class="bric wrap" aria-label="Sei qui"><ol>${bric}</ol></nav>
<main class="wrap">
${corpo}
<p class="avviso"><b>Se una persona sta male in modo grave chiama il <a class="num" href="tel:112">112</a> o il <a class="num" href="tel:118">118</a>.</b> Altri numeri utili: <a href="${BASE}numeri-utili/">guardia medica, pronto soccorso e CUP</a>.</p>
</main>
<footer class="piede"><div class="wrap">
<p><b>Servizio informativo non ufficiale.</b> Fanno fede i turni pubblicati dall'<a href="${esc(D.META[D.anni[D.anni.length - 1]].pagina)}" rel="noopener">Ordine dei Farmacisti della Provincia di Brindisi</a>. Indirizzi, telefoni e orari vengono dall'<a href="${esc(D.albo.fonte.url)}" rel="noopener">albo dell'Ordine</a>. Dati controllati ${esc(ilData(D.controllato))}.</p>
<p>Prima di andare, soprattutto di notte, telefona alla farmacia.</p>
<p><a href="${BASE}">Farmacia di turno adesso</a> · <a href="${BASE}turni/">Turni mese per mese</a> · <a href="${BASE}farmacie/">Le farmacie di Mesagne</a> · <a href="${BASE}numeri-utili/">Guardia medica e numeri utili</a> · <a href="${BASE}informazioni/">Chi siamo e da dove vengono i dati</a></p>
<p>Realizzata da <a href="https://benz91x.github.io/">Alessandro Chiri</a>. Nessun account, nessun cookie, nessun tracciamento.</p>
</div></footer>
</body>
</html>
`;
}

/* evidenzia la riga di oggi nel calendario (solo per chi legge: il testo della pagina non cambia) */
const SCRIPT_OGGI = '<script>(function(){try{var d=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());var r=document.querySelector(\'tr[data-giorno="\'+d+\'"]\');if(!r)return;r.classList.add("oggi");var s=document.createElement("span");s.className="oggi-et";s.setAttribute("data-nosnippet","");s.textContent="Oggi";r.cells[0].appendChild(s)}catch(e){}})();</script>';

function nomeHtml(x, link) {
  const n = esc(x.insegna) + (diverso(x) ? " <small>(" + esc(nomeCal(x)) + " nel calendario)</small>" : "");
  return link ? '<a href="' + BASE + "farmacie/" + esc(x.id) + '/">' + n + "</a>" : n;
}
function rigaGiorno(D, d) {
  const x = D.FARM[D.TURNI[d]], f = festivo(D, d), festa = nomeFesta(D, d);
  return '<tr data-giorno="' + d + '"' + (f ? ' class="fest"' : "") + '><td class="g">' + esc(maiusc(GIORNI[sett(d)])) + " " + (+d.slice(8)) +
    (festa ? '<span class="festa">' + esc(maiusc(festa)) + "</span>" : "") + "</td>" +
    "<td>" + nomeHtml(x, true) + '<span class="ind">' + esc(maiusc(x.indirizzo)) + "</span></td>" +
    '<td><a class="num" href="' + telHref(x.telefono) + '">' + esc(x.telefono) + "</a></td></tr>";
}
const NOTA_TURNO = "Chiama sempre prima di andare: di notte il farmacista arriva dopo la telefonata. Dopo mezzanotte, fino alle 8:30, di solito è ancora di turno la farmacia del giorno prima.";
function fonteAnno(D, a) {
  const m = D.META[a] || {};
  return "Fonte: calendari dei turni di Mesagne dell'Ordine dei Farmacisti della Provincia di Brindisi" +
    (m.aggiornato ? " (turni del pomeriggio e della notte aggiornati " + ilData(m.aggiornato) + (m.festivi ? ", turni festivi aggiornati " + ilData(m.festivi) : "") + ")" : "") +
    (m.controllato ? ", controllati " + ilData(m.controllato) : "") + ".";
}

/* ======== pagine ======== */
function paginaMese(D, am, i) {
  const a = +am.slice(0, 4), n = giorniNelMese(a, +am.slice(5)), nm = nomeMese(am);
  const giorni = Array.from({ length: n }, (_, k) => am + "-" + pad(k + 1));
  const prima = D.mesi[i - 1], dopo = D.mesi[i + 1];
  const feste = giorni.filter((d) => D.FESTIVI[d]);
  const conta = {};
  giorni.forEach((d) => { conta[D.TURNI[d]] = (conta[D.TURNI[d]] || 0) + 1; });
  const corpo = `<h1>Farmacie di turno a Mesagne: ${esc(nm)}</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(D.META[a]?.controllato || D.controllato))} con il calendario dell'Ordine dei Farmacisti.</p>
<p class="lead">Il calendario dei turni delle farmacie di Mesagne per ${esc(nm)}, giorno per giorno, con l'indirizzo e il telefono della farmacia di turno.</p>
<a class="btn" href="${BASE}">Chi è di turno adesso</a>
<p class="avviso">${esc(NOTA_TURNO)}</p>
<table class="turni">
<caption>Turni di ${esc(nm)}. Le righe in grigio sono domeniche e festivi.</caption>
<thead><tr><th scope="col">Giorno</th><th scope="col">Farmacia di turno</th><th scope="col">Telefono</th></tr></thead>
<tbody>
${giorni.map((d) => rigaGiorno(D, d)).join("\n")}
</tbody>
</table>
<p class="fonte">${esc(fonteAnno(D, a))}</p>
${feste.length ? "<h2>Festivi di " + esc(nm) + "</h2><ul class=\"punti\">" + feste.map((d) => "<li>" + esc(maiusc(conGiorno(d))) + (nomeFesta(D, d) !== "giorno festivo" ? " (" + esc(nomeFesta(D, d)) + ")" : "") + ": " + nomeHtml(D.FARM[D.TURNI[d]], true) + ', tel. <a class="num" href="' + telHref(D.FARM[D.TURNI[d]].telefono) + '">' + esc(D.FARM[D.TURNI[d]].telefono) + "</a></li>").join("") + "</ul>" : ""}
<h2>Quante volte è di turno ogni farmacia a ${esc(nm)}</h2>
<ul class="punti">${ordinate(D).map((x) => "<li>" + nomeHtml(x, true) + ": " + (conta[x.id] || 0) + " " + ((conta[x.id] || 0) === 1 ? "giorno" : "giorni") + "</li>").join("")}</ul>
<a class="btn sec" href="${BASE}?foglio=${am}" rel="nofollow">Stampa il foglio di ${esc(nm)} (A4)</a>
<nav class="vai" aria-label="Altri mesi">${prima ? '<a href="' + BASE + "turni/" + slugMese(prima) + '/">‹ ' + esc(maiusc(nomeMese(prima))) + "</a>" : "<span></span>"}<a href="${BASE}turni/">Tutti i mesi</a>${dopo ? '<a href="' + BASE + "turni/" + slugMese(dopo) + '/">' + esc(maiusc(nomeMese(dopo))) + " ›</a>" : "<span></span>"}</nav>
${SCRIPT_OGGI}`;
  return pagina({
    D, percorso: "turni/" + slugMese(am) + "/",
    titolo: "Farmacie di turno Mesagne " + nm + ": calendario dei turni",
    descrizione: "Calendario delle farmacie di turno a Mesagne per " + nm + ": giorno per giorno la farmacia aperta di turno, con indirizzo e telefono." + (feste.length ? " Festivi compresi." : "") + " Dati dell'Ordine dei Farmacisti di Brindisi.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Turni", p: "turni/" }, { n: maiusc(nm), p: "turni/" + slugMese(am) + "/" }],
    corpo,
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Farmacie di turno a Mesagne: " + nm, url: URL_APP + "turni/" + slugMese(am) + "/", inLanguage: "it-IT", dateModified: D.META[a]?.controllato || D.controllato, isPartOf: { "@id": URL_APP + "#app" }, about: { "@type": "City", name: "Mesagne" } }]
  });
}

function paginaTurni(D) {
  const anni = D.anni.filter((a) => D.mesi.some((m) => m.startsWith(a + "-")));
  const corpo = `<h1>Turni delle farmacie di Mesagne</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(D.controllato))} con il calendario dell'Ordine dei Farmacisti.</p>
<p class="lead">Il calendario completo delle farmacie di turno a Mesagne, mese per mese, e la farmacia di turno in ogni domenica e giorno di festa.</p>
<a class="btn" href="${BASE}">Chi è di turno adesso</a>
${anni.map((a) => {
  const feste = Object.keys(D.FESTIVI).filter((d) => d.startsWith(a + "-") && D.TURNI[d]).sort();
  return `<h2>Calendario ${a}</h2>
<ul class="mesi">${D.mesi.filter((m) => m.startsWith(a + "-")).map((m) => '<li><a href="' + BASE + "turni/" + slugMese(m) + '/">' + esc(maiusc(MESI[+m.slice(5) - 1])) + "</a></li>").join("")}</ul>
<h2>Feste del ${a}: chi è di turno</h2>
<table class="turni">
<caption>Farmacie di turno nei giorni di festa del ${a} (le domeniche sono nei calendari dei mesi).</caption>
<thead><tr><th scope="col">Giorno</th><th scope="col">Farmacia di turno</th><th scope="col">Telefono</th></tr></thead>
<tbody>
${feste.map((d) => { const x = D.FARM[D.TURNI[d]], festa = nomeFesta(D, d); return '<tr data-giorno="' + d + '" class="fest"><td class="g">' + esc(maiusc(GIORNI[sett(d)])) + " " + esc(dataLunga(d).replace(/ \d{4}$/, "")) + (festa ? '<span class="festa">' + esc(maiusc(festa)) + "</span>" : "") + "</td><td>" + nomeHtml(x, true) + '<span class="ind">' + esc(maiusc(x.indirizzo)) + '</span></td><td><a class="num" href="' + telHref(x.telefono) + '">' + esc(x.telefono) + "</a></td></tr>"; }).join("\n")}
</tbody>
</table>
<p class="fonte">${esc(fonteAnno(D, a))}</p>`;
}).join("\n")}
<h2>Come funzionano i turni a Mesagne</h2>
<ul class="punti">
<li>A Mesagne ci sono ${Object.keys(D.FARM).length} farmacie. Ogni giorno una è di turno: resta aperta oltre il normale orario, anche nella pausa di pranzo, la sera e la notte.</li>
<li>Per la legge regionale della Puglia (n. 5 del 2014) il servizio di notte va dalle 20 alle 8:30 del mattino dopo; d'estate, dal 21 giugno al 21 settembre, il pomeriggio va dalle 17 alle 20:30.</li>
<li>${esc(NOTA_TURNO)}</li>
<li>La domenica e nei giorni di festa di regola è aperta solo la farmacia di turno.</li>
</ul>
${SCRIPT_OGGI}`;
  return pagina({
    D, percorso: "turni/",
    titolo: "Turni farmacie Mesagne " + anni.join("-") + ": calendario mensile e festivi",
    descrizione: "Turni delle farmacie di Mesagne: il calendario di ogni mese e la farmacia di turno a Natale, Capodanno, Pasqua, Ferragosto e in tutti i festivi, con telefono e indirizzo.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Turni", p: "turni/" }],
    corpo,
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Turni delle farmacie di Mesagne", url: URL_APP + "turni/", inLanguage: "it-IT", dateModified: D.controllato, isPartOf: { "@id": URL_APP + "#app" }, about: { "@type": "City", name: "Mesagne" } }]
  });
}

function orariHtml(x) {
  const o = x.orari || {};
  const r = [];
  if (o.estate) r.push("<li><b>Orario d'estate.</b> " + esc(o.estate) + "</li>");
  if (o.inverno) r.push("<li><b>Orario d'inverno.</b> " + esc(o.inverno) + (o.invernoDaVerificare ? " <b>Orario non confermato: chiama prima di andare.</b>" : "") + "</li>");
  if (o.chiusura || o.ferie) r.push("<li>" + esc([o.chiusura, o.ferie].filter(Boolean).join(" ")) + "</li>");
  return r.length ? '<ul class="punti">' + r.join("") + "</ul>" : "<p>Orari non indicati nell'albo.</p>";
}

function paginaFarmacia(D, x) {
  const date = Object.keys(D.TURNI).filter((d) => D.TURNI[d] === x.id && D.mesi.includes(d.slice(0, 7))).sort();
  const perMese = {};
  date.forEach((d) => { (perMese[d.slice(0, 7)] = perMese[d.slice(0, 7)] || []).push(d); });
  const altre = ordinate(D).filter((y) => y.id !== x.id);
  const corpo = `<h1>${esc(x.insegna)} a Mesagne</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(D.controllato))} con l'albo e i calendari dell'Ordine dei Farmacisti.</p>
<div class="scheda">
<p class="lead" style="margin-top:0">${esc(maiusc(x.indirizzo))}, 72023 Mesagne (BR)</p>
${x.titolare ? "<p>Titolare: " + esc(perEsteso(x.titolare)) + "</p>" : ""}
${diverso(x) ? "<p>Nel calendario dei turni si chiama <b>" + esc(nomeCal(x)) + "</b>.</p>" : ""}
<p>Telefono: <a class="num" href="${telHref(x.telefono)}">${esc(x.telefono)}</a></p>
<a class="btn" href="${telHref(x.telefono)}">Chiama la farmacia ${esc(x.nomeBreve)}</a>
<a class="btn sec" href="${esc(mappaHref(x.mappa))}" rel="noopener">Come arrivarci (mappa)</a>
</div>
${x.altriNomi ? "<h2>In altri elenchi</h2><p>" + esc(x.altriNomi.testo) + "</p>" + fonteNumero(D, x.altriNomi) : ""}
<h2>Orari</h2>
${orariHtml(x)}
<p>Gli orari vengono dall'albo dell'Ordine dei Farmacisti e possono cambiare: chiama prima di andare.</p>
<h2>Quando è di turno la ${esc(x.insegna)}</h2>
<p>Nei giorni di turno la farmacia resta aperta anche nella pausa di pranzo, la sera e la notte. ${esc(NOTA_TURNO)}</p>
${Object.keys(perMese).map((am) => "<h3 style=\"margin-top:18px\">" + esc(maiusc(nomeMese(am))) + "</h3><p>" + perMese[am].map((d) => esc(GIORNI[sett(d)] + " " + (+d.slice(8))) + (festivo(D, d) && D.FESTIVI[d] ? " (" + esc(nomeFesta(D, d)) + ")" : "")).join(", ") + '. <a href="' + BASE + "turni/" + slugMese(am) + '/">Calendario di ' + esc(nomeMese(am)) + "</a></p>").join("\n")}
<p class="fonte">${esc(D.anni.map((a) => fonteAnno(D, a)).join(" "))}</p>
<h2>Le altre farmacie di Mesagne</h2>
<ul class="punti">${altre.map((y) => "<li>" + nomeHtml(y, true) + ", " + esc(y.indirizzoBreve || y.indirizzo) + "</li>").join("")}</ul>`;
  return pagina({
    D, percorso: "farmacie/" + x.id + "/",
    titolo: x.insegna + " Mesagne: indirizzo, telefono, orari e turni",
    descrizione: x.insegna + " a Mesagne, " + maiusc(x.indirizzo) + ": telefono " + x.telefono + ", orari e tutti i giorni in cui è di turno, anche di notte e nei festivi.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Farmacie", p: "farmacie/" }, { n: x.insegna, p: "farmacie/" + x.id + "/" }],
    corpo,
    jsonld: [{
      "@context": "https://schema.org", "@type": "WebPage", name: x.insegna + " a Mesagne", url: URL_APP + "farmacie/" + x.id + "/", inLanguage: "it-IT", dateModified: D.controllato, isPartOf: { "@id": URL_APP + "#app" },
      mainEntity: { "@type": "Pharmacy", name: x.insegna, telephone: telIntl(x.telefono), address: { "@type": "PostalAddress", streetAddress: maiusc(x.indirizzo), addressLocality: "Mesagne", postalCode: cap(x), addressRegion: "BR", addressCountry: "IT" } }
    }]
  });
}

function paginaFarmacie(D) {
  const l = ordinate(D);
  const corpo = `<h1>Farmacie a Mesagne</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(D.albo.fonte.controllato || D.controllato))} con l'albo dell'Ordine dei Farmacisti.</p>
<p class="lead">Le ${l.length} farmacie di Mesagne con indirizzo, telefono e orari. Per sapere quale è aperta adesso, anche di notte e nei festivi, apri l'app.</p>
<a class="btn" href="${BASE}">Quale farmacia è di turno adesso</a>
${l.map((x) => `<article class="scheda"><h2><a href="${BASE}farmacie/${esc(x.id)}/">${esc(x.insegna)}</a></h2>
<p>${esc(maiusc(x.indirizzo))}${diverso(x) ? ". Nel calendario dei turni si chiama <b>" + esc(nomeCal(x)) + "</b>" : ""}</p>
<p>Telefono: <a class="num" href="${telHref(x.telefono)}">${esc(x.telefono)}</a></p>
<p><a href="${BASE}farmacie/${esc(x.id)}/">Orari e giorni di turno della ${esc(x.insegna)}</a></p></article>`).join("\n")}
<p class="fonte">Fonte: ${esc(D.albo.fonte.nome)}, controllato ${esc(ilData(D.albo.fonte.controllato))}.</p>
<h2>Domande frequenti</h2>
<h3 style="margin-top:16px">Quante farmacie ci sono a Mesagne?</h3>
<p>Nell'albo dell'Ordine dei Farmacisti della Provincia di Brindisi ci sono ${l.length} farmacie con sede a Mesagne.</p>
<h3 style="margin-top:16px">Come so quale farmacia è di turno?</h3>
<p>Apri <a href="${BASE}">Farmacia di turno Mesagne</a>: mostra la farmacia di turno adesso, domani e nel prossimo festivo. C'è anche il <a href="${BASE}turni/">calendario dei turni mese per mese</a>, che si può stampare.</p>
<h3 style="margin-top:16px">Di notte la farmacia di turno è aperta?</h3>
<p>${esc(NOTA_TURNO)}</p>`;
  return pagina({
    D, percorso: "farmacie/",
    titolo: "Farmacie a Mesagne: elenco, indirizzi, telefoni e orari",
    descrizione: "Le " + l.length + " farmacie di Mesagne (BR): " + l.map((x) => x.nomeBreve).join(", ") + ". Indirizzo, telefono, orari e giorni di turno di ognuna.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Farmacie", p: "farmacie/" }],
    corpo,
    jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Farmacie a Mesagne", numberOfItems: l.length, itemListElement: l.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: URL_APP + "farmacie/" + x.id + "/", name: x.insegna })) }]
  });
}

/* ======== numeri utili (dagli stessi dati e con le stesse cautele dell'app) ======== */
function fonteNumero(D, x) {
  const s = (D.NUMERI.fonti || {})[x.fonte] || {};
  if (!s.nome) return "";
  return '<p class="fonte">Fonte: ' + (/^https:\/\//.test(s.url || "") ? '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.nome) + "</a>" : esc(s.nome)) + (x.controllato ? ". Controllato " + esc(ilData(x.controllato)) : "") + ".</p>";
}
/* un solo figlio dentro il pulsante (che è flex): il testo va a capo come una frase */
const bottoneTel = (t, testo, dopo, cls) => '<a class="btn' + (cls ? " " + cls : "") + '" href="' + telHref(t) + '"><span>' + esc(testo) + ' <span class="num">' + esc(t) + "</span>" + (dopo ? " · " + esc(dopo) : "") + "</span></a>";
function paginaNumeri(D) {
  const N = D.NUMERI, g = N.guardiaMedica, gm = g.usa116117 ? g.nuovo : g.mesagne, ps = N.prontoSoccorso, c = N.cup, p = N.prelievi;
  const corpo = `<h1>Guardia medica e numeri utili a Mesagne</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(N.aggiornato || D.controllato))}.</p>
<p class="lead">I numeri da chiamare a Mesagne quando serve un medico: emergenza, guardia medica, pronto soccorso, prenotazione di visite ed esami (CUP) e centro prelievi.</p>
<div class="scheda"><h2>Emergenza</h2>
<p><b>Questo sito non è un servizio di emergenza.</b> Se una persona sta male in modo grave, chiama subito:</p>
${(N.emergenza?.numeri || []).map((e) => bottoneTel(e.numero, "Chiama il", e.nome, "emerg")).join("\n")}
</div>
<div class="scheda"><h2>${esc(gm.nome)}</h2>
${g.usa116117 ? "" : "<p>Il nome ufficiale è «" + esc(gm.nomeUfficiale || "Continuità assistenziale") + "».</p>"}
<p>${esc(gm.quando || "Quando il medico di famiglia non c'è: di notte, il sabato e i giorni prima delle feste, la domenica e i festivi.")}</p>
${g.usa116117 ? "<p>" + esc(gm.descrizione) + "</p>" : "<p>" + esc(maiusc(gm.indirizzo)) + "</p><p>" + (gm.orari ? esc(gm.orari) + (gm.orariDaConfermare ? " <b>Orari da confermare: chiama prima di andare.</b>" : "") : "Gli orari esatti non sono pubblicati: chiama prima di andare.") + "</p>"}
${bottoneTel(gm.telefono, "Chiama la guardia medica")}
${g.usa116117 ? "" : '<a class="btn sec" href="' + esc(mappaHref(gm.mappa)) + '" rel="noopener">Come arrivarci (mappa)</a>'}
${fonteNumero(D, gm)}${gm.orariFonte && gm.orari ? fonteNumero(D, { fonte: gm.orariFonte, controllato: gm.controllato }).replace("Fonte: ", "Fonte degli orari: ") : ""}
</div>
<div class="scheda"><h2>${esc(ps.nome)}</h2>
<p>${esc(ps.nota)}</p><p>${esc(ps.dove)}.</p>
<p><b>Per un'emergenza non metterti in viaggio da solo: chiama il 118.</b></p>
${bottoneTel(ps.telefono, "Chiama il pronto soccorso")}
<a class="btn sec" href="${esc(mappaHref(ps.mappa))}" rel="noopener">Come arrivarci (mappa)</a>
${fonteNumero(D, ps)}
</div>
<div class="scheda"><h2>${esc(c.nome)}</h2>
<p>Il numero cambia se chiami dal cellulare o dal telefono fisso di casa.</p><p>${esc(c.orari)}</p>
${bottoneTel(c.cellulare, "Dal cellulare")}
${bottoneTel(c.fisso, "Dal telefono fisso (numero verde)")}
<p>${esc(c.sportello)}</p>
${fonteNumero(D, c)}
</div>
<div class="scheda"><h2>${esc(p.nome)}</h2>
<p>${esc(p.dove)}.</p><p>${esc(p.orari)}</p>
${bottoneTel(p.telefono, "Chiama il centro prelievi")}
${fonteNumero(D, p)}
</div>
<h2>E la farmacia?</h2>
<p>Per un farmaco di notte o nei giorni di festa guarda <a href="${BASE}">quale farmacia è di turno adesso</a> oppure il <a href="${BASE}turni/">calendario dei turni</a>.</p>`;
  return pagina({
    D, percorso: "numeri-utili/",
    titolo: "Guardia medica Mesagne: telefono, orari e numeri utili",
    descrizione: "Guardia medica di Mesagne (" + (gm.telefono || "") + "), pronto soccorso dell'ospedale Perrino, CUP per prenotare visite ed esami e centro prelievi: numeri, indirizzi e orari, con la fonte.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Numeri utili", p: "numeri-utili/" }],
    corpo,
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Guardia medica e numeri utili a Mesagne", url: URL_APP + "numeri-utili/", inLanguage: "it-IT", dateModified: N.aggiornato || D.controllato, isPartOf: { "@id": URL_APP + "#app" }, about: { "@type": "City", name: "Mesagne" } }]
  });
}

/* ======== chi fa il sito e da dove vengono i dati ======== */
function paginaInformazioni(D) {
  const ultimo = D.anni[D.anni.length - 1], m = D.META[ultimo] || {};
  const fonti = Object.values(D.NUMERI.fonti || {}).filter((s) => s.nome);
  const corpo = `<h1>Chi siamo e da dove vengono i dati</h1>
<p class="agg">Pagina aggiornata ${esc(ilData(D.controllato))}.</p>
<p class="lead">Farmacia di turno Mesagne è un servizio gratuito e <b>non ufficiale</b>, pensato soprattutto per le persone anziane e per chi le aiuta.</p>
<h2>Chi lo fa</h2>
<p>Lo ha realizzato e lo cura <a href="https://benz91x.github.io/">Alessandro Chiri</a>, di Mesagne. Non è un servizio dell'Ordine dei Farmacisti, delle farmacie, dell'ASL o del Comune.${D.email ? ' Per segnalare un errore o fare una domanda scrivi a <a href="mailto:' + esc(D.email) + '">' + esc(D.email) + "</a>." : ""}</p>
<h2>Da dove vengono i turni</h2>
<p>Dai calendari dei turni di Mesagne pubblicati dall'Ordine dei Farmacisti della Provincia di Brindisi, nella pagina <a href="${esc(m.pagina)}" rel="noopener">turni delle farmacie</a>. ${esc(fonteAnno(D, ultimo).replace(/^Fonte: /, "Ultimo calendario usato: "))}</p>
<p>Indirizzi, telefoni e orari delle farmacie vengono dall'<a href="${esc(D.albo.fonte.url)}" rel="noopener">albo dell'Ordine</a>, controllato ${esc(ilData(D.albo.fonte.controllato || D.controllato))}. Quando un dato non si può verificare, il sito lo dice («da confermare») oppure non lo mostra.</p>
<h2>Altre fonti</h2>
<ul class="punti">${fonti.map((s) => "<li>" + (/^https:\/\//.test(s.url || "") ? '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.nome) + "</a>" : esc(s.nome)) + "</li>").join("")}</ul>
<h2>Come si aggiorna</h2>
<ul class="punti">
<li>Ogni lunedì un controllo automatico guarda il sito dell'Ordine dei Farmacisti: se il calendario di Mesagne, l'albo o le ferie cambiano, arriva una segnalazione.</li>
<li>I turni nuovi vengono letti dal calendario ufficiale e ricontrollati prima di essere pubblicati. Ogni pagina dice quando i dati sono stati controllati.</li>
</ul>
<h2>Prudenza</h2>
<ul class="punti">
<li>Fanno fede i turni pubblicati dall'Ordine dei Farmacisti di Brindisi. Prima di andare, soprattutto di notte, telefona alla farmacia.</li>
<li>Il sito non è un servizio di emergenza: se una persona sta male in modo grave chiama il <a class="num" href="tel:112">112</a> o il <a class="num" href="tel:118">118</a>.</li>
</ul>
<h2>Privacy e costi</h2>
<ul class="punti">
<li>Nessun account, nessun cookie, nessun tracciamento. Le scelte fatte nell'app (testo grande, lettura a voce, foglio della famiglia) restano solo sul telefono di chi la usa.</li>
<li>Il turno è gratis e uguale per tutte le farmacie, anche per quelle che non partecipano. Per coprire i costi ci sono alcuni <a href="${BASE}?servizi=1" rel="nofollow">servizi a pagamento</a> che riguardano solo il foglio stampato. Tra le informazioni sulla salute non c'è pubblicità.</li>
</ul>`;
  return pagina({
    D, percorso: "informazioni/",
    titolo: "Chi siamo e da dove vengono i dati | Farmacia di turno Mesagne",
    descrizione: "Farmacia di turno Mesagne è un servizio gratuito e non ufficiale di Alessandro Chiri: le fonti dei turni (Ordine dei Farmacisti di Brindisi), come si aggiorna, privacy e contatti.",
    briciole: [{ n: "Farmacia di turno Mesagne", p: "" }, { n: "Chi siamo", p: "informazioni/" }],
    corpo,
    jsonld: [{ "@context": "https://schema.org", "@type": "AboutPage", name: "Chi siamo e da dove vengono i dati", url: URL_APP + "informazioni/", inLanguage: "it-IT", dateModified: D.controllato, isPartOf: { "@id": URL_APP + "#app" }, author: { "@type": "Person", name: "Alessandro Chiri", url: "https://benz91x.github.io/" } }]
  });
}

/* ======== blocchi statici in index.html ======== */
function bloccoElenco(D) {
  return ordinate(D).map((x) => '<article class="scheda"><h3>' + esc(x.insegna) + "</h3>" +
    '<p class="riga">' + esc(maiusc(x.indirizzo)) + '</p><p class="riga">Telefono <a class="num" href="' + telHref(x.telefono) + '">' + esc(x.telefono) + "</a></p>" +
    '<p class="riga"><a href="farmacie/' + esc(x.id) + '/">Orari e giorni di turno</a></p></article>').join("");
}
function bloccoMesi(D) {
  return D.mesi.map((m) => '<li><a href="turni/' + slugMese(m) + '/">' + esc(maiusc(nomeMese(m))) + "</a></li>").join("");
}
function sostituisci(html, nome, dentro) {
  const re = new RegExp("(<!--PAGINE-" + nome + "-->)[\\s\\S]*?(<!--/PAGINE-" + nome + "-->)");
  if (!re.test(html)) throw new Error("Segnaposto PAGINE-" + nome + " non trovato in index.html");
  return html.replace(re, (_, a, b) => a + dentro + b);
}

/* ======== tutto insieme ======== */
export function generaPagine({ controlla = false } = {}) {
  const D = caricaDati();
  const file = {};
  file["turni/index.html"] = paginaTurni(D);
  D.mesi.forEach((m, i) => { file["turni/" + slugMese(m) + "/index.html"] = paginaMese(D, m, i); });
  file["farmacie/index.html"] = paginaFarmacie(D);
  for (const x of Object.values(D.FARM)) file["farmacie/" + x.id + "/index.html"] = paginaFarmacia(D, x);
  file["numeri-utili/index.html"] = paginaNumeri(D);
  file["informazioni/index.html"] = paginaInformazioni(D);

  const voci = [["", D.controllato], ["turni/", D.controllato], ["farmacie/", D.albo.fonte.controllato || D.controllato], ["numeri-utili/", D.NUMERI.aggiornato || D.controllato], ["informazioni/", D.controllato]]
    .concat(D.mesi.map((m) => ["turni/" + slugMese(m) + "/", D.META[m.slice(0, 4)]?.controllato || D.controllato]))
    .concat(ordinate(D).map((x) => ["farmacie/" + x.id + "/", D.controllato]));
  file["sitemap.xml"] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    voci.map(([p, d]) => "  <url>\n    <loc>" + URL_APP + p + "</loc>\n    <lastmod>" + d + "</lastmod>\n  </url>\n").join("") + "</urlset>\n";

  let html = readFileSync(join(APP, "index.html"), "utf8");
  html = sostituisci(html, "ELENCO", bloccoElenco(D));
  html = sostituisci(html, "MESI", bloccoMesi(D));
  file["index.html"] = html;

  /* pagine di mesi o farmacie che non esistono più */
  const vecchie = [];
  for (const dir of ["turni", "farmacie"]) {
    const p = join(APP, dir);
    if (!existsSync(p)) continue;
    for (const s of readdirSync(p, { withFileTypes: true })) if (s.isDirectory() && !file[dir + "/" + s.name + "/index.html"]) vecchie.push(dir + "/" + s.name);
  }
  const diverse = Object.keys(file).filter((f) => !existsSync(join(APP, f)) || readFileSync(join(APP, f), "utf8") !== file[f]);
  if (controlla) return { diverse, vecchie };
  for (const f of diverse) { mkdirSync(dirname(join(APP, f)), { recursive: true }); writeFileSync(join(APP, f), file[f]); }
  for (const v of vecchie) rmSync(join(APP, v), { recursive: true, force: true });
  return { diverse, vecchie, pagine: Object.keys(file).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const controlla = process.argv.includes("--controlla");
  const r = generaPagine({ controlla });
  if (controlla) {
    if (r.diverse.length || r.vecchie.length) { console.error("Pagine da aggiornare: " + [...r.diverse, ...r.vecchie].join(", ") + "\nLancia: node farmacia-di-turno-mesagne/strumenti/pagine.mjs"); process.exit(1); }
    console.log("Pagine aggiornate.");
  } else {
    console.log(r.diverse.length ? "Scritti " + r.diverse.length + " file: " + r.diverse.join(", ") : "Nessuna pagina da cambiare.");
    if (r.vecchie.length) console.log("Tolte le pagine vecchie: " + r.vecchie.join(", "));
  }
}
