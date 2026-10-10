#!/usr/bin/env node
/* Farmacia di turno Mesagne: lettura e controllo dei calendari dell'Ordine dei Farmacisti.

   Uso (serve Node 20 o più recente; per leggere i PDF serve anche pdftotext,
   sul Mac: brew install poppler):

     node turni.mjs leggi <file.pdf|file.txt>        legge il PDF dei notturni e mostra cosa ha capito
     node turni.mjs aggiorna <file.pdf> [--nome mesagne_..._agg_GGMMAAAA.pdf]
                                                     riscrive turni-AAAA.json con i turni del PDF
     node turni.mjs confronta [AAAA]                 confronta turni-AAAA.json con la trascrizione dei festivi
     node turni.mjs tabella AAAA-MM-GG AAAA-MM-GG    tabella di controllo in Markdown
     node turni.mjs scarica [--report file.md]       scarica i PDF dei notturni dal sito e aggiorna i file
     node turni.mjs controlla [--report file.md]     controlla il sito dell'Ordine (usato dalla GitHub Action)

   Regola d'oro: un giorno che lo strumento non riconosce con sicurezza resta vuoto
   (null) e viene segnalato. Non si indovina mai. */

import { readFileSync, writeFileSync, existsSync, mkdtempSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FARMACIE = JSON.parse(readFileSync(join(APP, "farmacie.json"), "utf8")).farmacie;
const SITO = "https://www.ordinefarmacistibrindisi.it";
const PAGINA_TURNI = SITO + "/farmacie/turni-delle-farmacie.html?page=2";
const PAGINA_ELENCO = SITO + "/farmacie/elenco-delle-farmacie.html";
const PAGINA_FERIE = SITO + "/farmacie/ferie-farmacie.html";

const MESI = ["GENNAIO", "FEBBRAIO", "MARZO", "APRILE", "MAGGIO", "GIUGNO", "LUGLIO", "AGOSTO", "SETTEMBRE", "OTTOBRE", "NOVEMBRE", "DICEMBRE"];
const SETT = { DOM: 0, LUN: 1, MAR: 2, MER: 3, GIO: 4, GIOV: 4, VEN: 5, SAB: 6 };
const NOMI_SETT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI_IT = MESI.map((m) => m.toLowerCase());

/* ---------- utilità ---------- */
const pad = (n) => String(n).padStart(2, "0");
const iso = (a, m, g) => a + "-" + pad(m) + "-" + pad(g);
const giornoSett = (s) => { const [a, m, g] = s.split("-").map(Number); return new Date(Date.UTC(a, m - 1, g)).getUTCDay(); };
const piuGiorni = (s, n) => { const [a, m, g] = s.split("-").map(Number); const d = new Date(Date.UTC(a, m - 1, g + n)); return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); };
const inParole = (s) => { const [a, m, g] = s.split("-").map(Number); return NOMI_SETT[giornoSett(s)] + " " + g + " " + MESI_IT[m - 1] + (a !== 2026 ? " " + a : ""); };
const oggiRoma = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
/* per gli indirizzi contano anche i numeri civici */
const normInd = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function distanza(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/* Riconosce il nome di una farmacia scritto nel PDF. Restituisce { id, dist } oppure { id: null }.
   Distanza 0 = uguale; 1 = refuso (es. ANTONUCCCI); 2 o più = non accettato. */
export function riconosci(testo) {
  const n = norm(testo);
  if (!n) return { id: null, dist: Infinity };
  let migliore = null, secondo = Infinity;
  for (const f of FARMACIE) for (const c of f.calendario) {
    const dist = distanza(n, norm(c));
    if (!migliore || dist < migliore.dist) { if (migliore && migliore.id !== f.id) secondo = migliore.dist; migliore = { id: f.id, dist }; }
    else if (f.id !== migliore.id && dist < secondo) secondo = dist;
  }
  if (migliore.dist <= 1 && secondo > migliore.dist) return migliore;
  return { id: null, dist: migliore.dist, simile: migliore.id };
}

/* ---------- lettura del testo di pdftotext -layout ---------- */
const RE_MESE = new RegExp("\\b(" + MESI.join("|") + ")\\s+(\\d{4})\\b", "g");
const RE_GIORNO = /\b(Lun|Mar|Mer|Giov|Gio|Ven|Sab|Dom)\b\.?\s+(\d{1,2})\b/g;
const RE_FESTA = /^(Fest\.?|FEST\.?|Pa-?\s*squa|squa|Pasqua|Natale)\s*/i;

export function leggiTesto(txt) {
  const righe = txt.replace(/\f/g, "\n\f\n").split("\n");
  const giorni = [];      /* { data, sett, letto, festa } */
  const avvisi = [];
  let colonne = null;     /* [{ anno, mese, ultimo }, { ... }] e il punto di divisione */
  let attesa = [];        /* giorni senza nome sulla stessa riga: il nome è sulla riga dopo */

  for (let i = 0; i < righe.length; i++) {
    const r = righe[i];
    if (r === "\f") { colonne = null; attesa = []; continue; }
    if (/Ordine dei Farmacisti della Provincia|VIA F\. CONSIGLIO|CODICE FISCALE/i.test(r)) continue;
    const mesi = [...r.matchAll(RE_MESE)];
    if (mesi.length) {
      colonne = mesi.map((m) => ({ anno: +m[2], mese: MESI.indexOf(m[1]) + 1, ultimo: 0, pos: m.index }));
      colonne.taglio = colonne.length > 1 ? Math.floor(colonne[1].pos * 0.75) : Infinity;
      attesa = [];
      continue;
    }
    if (!colonne) continue;
    const trovati = [...r.matchAll(RE_GIORNO)];

    /* riga senza giorni: può contenere il nome di un giorno rimasto in attesa (es. Pasqua) */
    if (!trovati.length) {
      if (attesa.length && r.trim()) {
        for (const a of attesa.slice()) {
          const da = a.col === 0 ? 0 : colonne.taglio, a_ = a.col === 0 ? colonne.taglio : r.length;
          const pezzo = r.slice(da, a_).trim();
          if (pezzo && !/^(Pa-|squa)$/i.test(pezzo)) { a.giorno.letto = pezzo; attesa.splice(attesa.indexOf(a), 1); }
          else if (/^Pa-$/i.test(pezzo)) a.giorno.festa = a.giorno.festa || "Pasqua";
        }
      }
      continue;
    }
    attesa = attesa.filter((a) => !trovati.some((t) => (t.index >= colonne.taglio ? 1 : 0) === a.col));

    trovati.forEach((t, k) => {
      const col = t.index >= colonne.taglio ? 1 : 0;
      const c = colonne[Math.min(col, colonne.length - 1)];
      const g = +t[2];
      if (g <= c.ultimo) { c.mese++; if (c.mese > 12) { c.mese = 1; c.anno++; } }
      c.ultimo = g;
      const fine = k + 1 < trovati.length ? trovati[k + 1].index : r.length;
      let resto = r.slice(t.index + t[0].length, fine).trim();
      let festa = null;
      const mf = RE_FESTA.exec(resto);
      if (mf) { festa = /squa/i.test(mf[1]) ? "Pasqua" : /natale/i.test(mf[1]) ? "Natale" : "festivo"; resto = resto.slice(mf[0].length).trim(); }
      /* "Pa-" sulla riga sopra, nella stessa colonna */
      const sopra = righe[i - 1] || "";
      if (!festa && /\bPa-\s*$/.test(col === 0 ? sopra.slice(0, colonne.taglio) : sopra.slice(colonne.taglio))) festa = "Pasqua";
      const giorno = { data: iso(c.anno, c.mese, g), sett: t[1], letto: resto, festa };
      giorni.push(giorno);
      if (!resto) attesa.push({ col, giorno });
    });
  }

  /* controlli: giorno della settimana, date valide, nessun buco e nessun doppione */
  const visti = new Map();
  for (const g of giorni) {
    const [a, m, d] = g.data.split("-").map(Number);
    const dt = new Date(Date.UTC(a, m - 1, d));
    if (dt.getUTCMonth() !== m - 1) { avvisi.push(g.data + ": data inesistente nel PDF"); g.scarta = true; continue; }
    if (SETT[g.sett.toUpperCase()] !== dt.getUTCDay()) avvisi.push(g.data + ": nel PDF c'è «" + g.sett + "» ma il " + inParole(g.data) + " non torna");
    if (visti.has(g.data)) avvisi.push(g.data + ": il giorno compare due volte nel PDF");
    visti.set(g.data, g);
  }
  const lista = giorni.filter((g) => !g.scarta).sort((x, y) => x.data.localeCompare(y.data));
  if (lista.length) {
    for (let d = lista[0].data; d <= lista[lista.length - 1].data; d = piuGiorni(d, 1))
      if (!visti.has(d)) avvisi.push(d + ": giorno mancante nel PDF");
  }
  return { giorni: lista, avvisi };
}

export function pdfInTesto(file) {
  if (/\.txt$/i.test(file)) return readFileSync(file, "utf8");
  try { return execFileSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8", maxBuffer: 1 << 26 }); }
  catch (e) { throw new Error("Non riesco a usare pdftotext (sul Mac: brew install poppler). " + e.message); }
}

/* Trasforma i giorni letti in turni. correzioni = { data: { id, motivo } } dal file attuale. */
export function costruisciTurni(letti, correzioni = {}) {
  const turni = {}, festivi = {}, refusi = [], dubbi = [];
  for (const g of letti.giorni) {
    const r = riconosci(g.letto);
    if (g.festa) festivi[g.data] = g.festa;
    if (r.id) {
      turni[g.data] = r.id;
      if (r.dist > 0) refusi.push({ data: g.data, letto: g.letto, id: r.id });
    } else if (correzioni[g.data]) {
      turni[g.data] = correzioni[g.data].id;
      dubbi.push({ data: g.data, letto: g.letto, id: correzioni[g.data].id, motivo: "non riconosciuto: usata la correzione a mano («" + correzioni[g.data].motivo + "»)" });
    } else {
      turni[g.data] = null;
      dubbi.push({ data: g.data, letto: g.letto, id: null, motivo: "non riconosciuto" + (r.simile ? " (forse " + r.simile + "?)" : "") + ": lasciato vuoto, da leggere sull'immagine del PDF" });
    }
  }
  return { turni, festivi, refusi, dubbi };
}

/* Festività nazionali, per controllare i giorni segnati «Fest.» nel PDF */
function pasqua(a) {
  const f = Math.floor, G = a % 19, C = f(a / 100), H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)), J = (a + f(a / 4) + I + 2 - C + f(C / 4)) % 7, L = I - J;
  const m = 3 + f((L + 40) / 44), g = L + 28 - 31 * f(m / 4);
  return iso(a, m, g);
}
export function festeNazionali(a) {
  const p = pasqua(a);
  const f = { [iso(a, 1, 1)]: "Capodanno", [iso(a, 1, 6)]: "Epifania", [p]: "Pasqua", [piuGiorni(p, 1)]: "Lunedì dell'Angelo",
    [iso(a, 4, 25)]: "Festa della Liberazione", [iso(a, 5, 1)]: "Festa del Lavoro", [iso(a, 6, 2)]: "Festa della Repubblica",
    [iso(a, 8, 15)]: "Ferragosto", [iso(a, 11, 1)]: "Ognissanti", [iso(a, 12, 8)]: "Immacolata", [iso(a, 12, 25)]: "Natale", [iso(a, 12, 26)]: "Santo Stefano" };
  if (a >= 2026) f[iso(a, 10, 4)] = "San Francesco";
  return f;
}

function fileTurni(anno) { return join(APP, "turni-" + anno + ".json"); }
function caricaTurni(anno) { const p = fileTurni(anno); return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; }
const nomeDi = (id) => id ? (FARMACIE.find((f) => f.id === id) || {}).nomeBreve || id : "—";

/* ---------- comandi ---------- */
function argomento(nome) { const i = process.argv.indexOf("--" + nome); return i > 0 ? process.argv[i + 1] : undefined; }

function stampaLettura(letti, costruiti) {
  const out = [];
  out.push("Giorni letti: " + letti.giorni.length + " (dal " + letti.giorni[0].data + " al " + letti.giorni[letti.giorni.length - 1].data + ")");
  if (letti.avvisi.length) out.push("\nAVVISI SUL CALENDARIO:\n" + letti.avvisi.map((a) => "  - " + a).join("\n"));
  if (costruiti.dubbi.length) out.push("\nGIORNI NON RICONOSCIUTI (da controllare sul PDF):\n" + costruiti.dubbi.map((d) => "  - " + d.data + " (" + inParole(d.data) + "): letto «" + d.letto + "» → " + d.motivo).join("\n"));
  if (costruiti.refusi.length) out.push("\nRefusi corretti da soli (distanza 1):\n" + costruiti.refusi.map((d) => "  - " + d.data + ": «" + d.letto + "» → " + nomeDi(d.id)).join("\n"));
  return out.join("\n");
}

function cmdLeggi() {
  const file = process.argv[3];
  if (!file) throw new Error("Indica il file: node turni.mjs leggi file.pdf");
  const letti = leggiTesto(pdfInTesto(file));
  const anno = +letti.giorni[0].data.slice(0, 4);
  const attuale = caricaTurni(anno);
  const c = costruisciTurni(letti, attuale ? attuale.correzioni : {});
  console.log(stampaLettura(letti, c));
  const conta = {};
  Object.values(c.turni).forEach((id) => { conta[id] = (conta[id] || 0) + 1; });
  console.log("\nTurni per farmacia: " + Object.entries(conta).map(([k, v]) => nomeDi(k === "null" ? null : k) + " " + v).join(", "));
}

function differenze(vecchi, nuovi) {
  const date = [...new Set([...Object.keys(vecchi || {}), ...Object.keys(nuovi || {})])].sort();
  return date.filter((d) => (vecchi || {})[d] !== (nuovi || {})[d]).map((d) => ({ data: d, prima: (vecchi || {})[d] ?? null, dopo: (nuovi || {})[d] ?? null }));
}

/* Riscrive turni-AAAA.json dal PDF dei notturni. Restituisce il testo del riepilogo (Markdown semplice). */
export function aggiornaDa(file, nomeFile) {
  const letti = leggiTesto(pdfInTesto(file));
  if (letti.giorni.length < 300) throw new Error("Ho letto solo " + letti.giorni.length + " giorni: il PDF è cambiato forma, controllalo a mano.");
  const anni = [...new Set(letti.giorni.map((g) => +g.data.slice(0, 4)))];
  const anno = Math.min(...anni);
  const prima = caricaTurni(anno - 1) || {};
  /* per un anno nuovo si riprendono gli orari dell'anno prima; le correzioni a mano no (valgono per un PDF preciso) */
  const vecchio = caricaTurni(anno) || { correzioni: {}, orario: prima.orario, fonte: {} };
  const c = costruisciTurni(letti, vecchio.correzioni || {});
  const agg = /agg_(\d{2})(\d{2})(\d{4})/.exec(nomeFile);
  const naz = Object.assign({}, festeNazionali(anno), festeNazionali(anno + 1));
  const festivi = {};
  for (const d of Object.keys(c.turni)) {
    if (c.festivi[d] || naz[d]) festivi[d] = naz[d] || (c.festivi[d] === "festivo" ? "Giorno festivo" : c.festivi[d]);
  }
  const nuovo = {
    comune: "Mesagne",
    anno,
    controllato: oggiRoma(),
    fonte: Object.assign({}, vecchio.fonte || {}, {
      ente: "Ordine dei Farmacisti della Provincia di Brindisi",
      pagina: PAGINA_TURNI,
      notturni: { file: nomeFile, aggiornato: agg ? agg[3] + "-" + agg[2] + "-" + agg[1] : null }
    }),
    orario: vecchio.orario,
    festivi,
    turni: c.turni,
    correzioni: vecchio.correzioni || {}
  };
  const diff = differenze(vecchio.turni, nuovo.turni);
  writeFileSync(fileTurni(anno), JSON.stringify(nuovo, null, 1) + "\n");
  const out = [stampaLettura(letti, c), "", "Scritto turni-" + anno + ".json"];
  const pc = join(APP, "calendari.json"), cal = existsSync(pc) ? JSON.parse(readFileSync(pc, "utf8")) : { anni: [] };
  if (!cal.anni.includes(anno)) { cal.anni = [...cal.anni, anno].sort(); writeFileSync(pc, JSON.stringify(cal, null, 2) + "\n"); out.push("Aggiunto il " + anno + " a calendari.json"); }
  /* un anno nuovo va anche nella copia offline */
  const ps = join(APP, "sw.js"), sw = readFileSync(ps, "utf8");
  if (!sw.includes('"./turni-' + anno + '.json"')) {
    writeFileSync(ps, sw.replace('"./turni-', '"./turni-' + anno + '.json", "./turni-').replace(/(PREFISSO \+ ")\d{8}\w?(")/, "$1" + oggiRoma().replace(/-/g, "") + "t$2"));
    out.push("Aggiunto turni-" + anno + ".json alla copia offline (sw.js)");
  }
  out.push(diff.length ? "\nGIORNI CAMBIATI RISPETTO A PRIMA (" + diff.length + "):\n" + diff.map((d) => "  - " + inParole(d.data) + ": " + nomeDi(d.prima) + " → " + nomeDi(d.dopo)).join("\n") : "\nNessun turno cambiato rispetto al file di prima.");
  const pdfFeste = Object.keys(c.festivi).filter((d) => !naz[d] && giornoSett(d) !== 0);
  if (pdfFeste.length) out.push("\nGiorni segnati festivi nel PDF che non sono feste nazionali: " + pdfFeste.join(", ") + " (per esempio la festa patronale)");
  const mancanti = Object.keys(naz).filter((d) => c.turni[d] !== undefined && !c.festivi[d] && giornoSett(d) !== 0);
  if (mancanti.length) out.push("Feste nazionali non segnate «Fest.» nel PDF: " + mancanti.join(", "));
  return { testo: out.join("\n"), diff, c, anno, dubbi: c.dubbi.filter((d) => !d.id || d.data >= oggiRoma()).length };
}

function cmdAggiorna() {
  const file = process.argv[3];
  if (!file) throw new Error("Indica il PDF: node turni.mjs aggiorna file.pdf --nome mesagne_turni_..._agg_GGMMAAAA.pdf");
  console.log(aggiornaDa(file, argomento("nome") || basename(file)).testo);
}

/* Scarica dal sito dell'Ordine i PDF dei notturni di Mesagne e aggiorna i file (usato dalla GitHub Action «Aggiorna»). */
function cmdScarica() {
  const report = argomento("report");
  const cartella = mkdtempSync(join(tmpdir(), "turni-"));
  const jar = join(cartella, "jar");
  const html = scarica(PAGINA_TURNI, jar).toString("utf8");
  const voci = elencoPdf(html);
  const out = ["# Aggiornamento dei turni di Mesagne", ""];
  const notturni = voci.filter((v) => /notturni/i.test(v.nome));
  if (!notturni.length) throw new Error("Nella pagina dei turni non trovo il PDF dei notturni di Mesagne: controlla a mano " + PAGINA_TURNI);
  for (const v of notturni) {
    const pdf = join(cartella, v.nome);
    writeFileSync(pdf, scarica(v.url, jar));
    const r = aggiornaDa(pdf, v.nome);
    out.push("## " + v.nome, "", "```", r.testo, "```", "");
    if (r.dubbi) out.push("**Attenzione:** " + (r.dubbi === 1 ? "1 giorno non riconosciuto" : r.dubbi + " giorni non riconosciuti") + " (vedi sopra). Guardali sul PDF e aggiungi una correzione in `correzioni` (vedi LEGGIMI).", "");
  }
  for (const v of voci.filter((x) => /festivi/i.test(x.nome))) {
    const anno = +(/_(\d{4})(?:_agg|\.pdf)/.exec(v.nome) || [, 0])[1];
    const t = caricaTurni(anno);
    if (!t || !t.fonte.festivi || t.fonte.festivi.file !== v.nome)
      out.push("Il PDF dei **festivi** è `" + v.nome + "`: è un'immagine, va controllato a mano (LEGGIMI, punto «Festivi»).", "");
  }
  const testo = out.join("\n");
  if (report) writeFileSync(report, testo);
  console.log(testo);
}

/* i PDF di Mesagne nella pagina dei turni: nome del file e link (con il token del momento) */
function elencoPdf(html) {
  const out = [];
  const re = /href="(\/farmacie\/turni-delle-farmacie\.html\?file=(\d+-mesagne-[^&"]+)&(?:amp;)?token=[0-9a-f]+)"[^>]*>\s*(mesagne_[^<\s]+\.pdf)\s*</gi;
  for (const m of html.matchAll(re)) if (!out.some((x) => x.nome === m[3])) out.push({ url: SITO + m[1].replace(/&amp;/g, "&"), id: m[2], nome: m[3] });
  return out;
}

function cmdConfronta() {
  const anno = +(process.argv[3] || 2026);
  const t = caricaTurni(anno);
  const trascr = JSON.parse(readFileSync(join(APP, "strumenti", "festivi-" + anno + "-trascrizione.json"), "utf8"));
  const righe = [];
  let ok = 0;
  for (const [d, nome] of Object.entries(trascr.giorni)) {
    const r = riconosci(nome);
    const nel = t.turni[d];
    if (r.id === nel) ok++; else righe.push("  - " + inParole(d) + ": festivi «" + nome + "», notturni " + nomeDi(nel));
    if (giornoSett(d) !== 0 && !t.festivi[d]) righe.push("  - " + inParole(d) + ": nei festivi c'è, ma non è segnato festivo in turni-" + anno + ".json");
  }
  console.log("Domeniche e festivi confrontati: " + Object.keys(trascr.giorni).length + ", uguali: " + ok);
  console.log(righe.length ? "DIFFERENZE:\n" + righe.join("\n") : "Nessuna differenza tra il PDF dei festivi e quello dei notturni.");
  if (righe.length) process.exitCode = 2;
}

function cmdTabella() {
  const da = process.argv[3], a = process.argv[4];
  const anni = [+da.slice(0, 4), +a.slice(0, 4)];
  const turni = {}, festivi = {};
  for (const y of new Set(anni)) { const t = caricaTurni(y); if (t) { Object.assign(turni, t.turni); Object.assign(festivi, t.festivi); } }
  const trascr = (() => { try { return JSON.parse(readFileSync(join(APP, "strumenti", "festivi-" + anni[0] + "-trascrizione.json"), "utf8")).giorni; } catch { return {}; } })();
  console.log("| Data | Giorno | Farmacia di turno (PDF notturni) | PDF festivi | Esito |\n|---|---|---|---|---|");
  for (let d = da; d <= a; d = piuGiorni(d, 1)) {
    const f = FARMACIE.find((x) => x.id === turni[d]);
    const fe = trascr[d] ? riconosci(trascr[d]).id : undefined;
    const esito = !f ? "**MANCA**" : fe === undefined ? "ok" : fe === turni[d] ? "ok, uguale" : "**DIVERSO**";
    console.log("| " + d + " | " + NOMI_SETT[giornoSett(d)] + (festivi[d] ? " (" + festivi[d] + ")" : "") + " | " + (f ? f.nomeBreve : "—") + " | " + (trascr[d] ? nomeDi(fe) : "") + " | " + esito + " |");
  }
}

/* --- controllo settimanale del sito (GitHub Action) --- */
function scarica(url, jar, dati) {
  /* --fail: se il sito risponde con un errore (es. 403, 500) il comando si ferma, invece di leggere una pagina vuota */
  const a = ["-sS", "-L", "--fail", "--retry", "2", "--retry-delay", "5", "--max-time", "60", "-A", "Mozilla/5.0", "-c", jar, "-b", jar];
  if (dati) a.push("--data", dati);
  a.push(url);
  return execFileSync("curl", a, { maxBuffer: 1 << 26 });
}
function testoDaHtml(h) {
  return h.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<td[^>]*>/g, " | ").replace(/<\/tr>/g, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#039;|&#39;/g, "'").replace(/&igrave;/g, "ì").replace(/&ndash;/g, "–").replace(/[ \t]+/g, " ");
}

function cmdControlla() {
  const report = argomento("report");
  const cartella = mkdtempSync(join(tmpdir(), "turni-"));
  const jar = join(cartella, "jar");
  const anno = +oggiRoma().slice(0, 4);
  const righe = [];
  let cambiato = false;
  const titoloBreve = [];

  /* 1. i PDF di Mesagne nella pagina dei turni */
  const html = scarica(PAGINA_TURNI, jar).toString("utf8");
  const voci = elencoPdf(html);
  const nomiPdf = voci.map((v) => v.nome);
  if (!nomiPdf.length) {
    righe.push("## Attenzione\n\nNella pagina dei turni non trovo più i PDF di Mesagne. Forse il sito è cambiato: controlla a mano " + PAGINA_TURNI);
    cambiato = true; titoloBreve.push("pagina dei turni cambiata");
  }
  const conosciuti = [];
  for (const y of [anno - 1, anno, anno + 1]) { const t = caricaTurni(y); if (t && t.fonte) { if (t.fonte.notturni) conosciuti.push(t.fonte.notturni.file); if (t.fonte.festivi) conosciuti.push(t.fonte.festivi.file); } }
  const nuovi = voci.filter((v) => !conosciuti.includes(v.nome));
  if (nuovi.length) {
    cambiato = true;
    righe.push("## Calendario di Mesagne cambiato\n\nSul sito dell'Ordine ci sono file nuovi:\n\n" + nuovi.map((v) => "- `" + v.nome + "`").join("\n") + "\n\nFile che conosce l'app:\n\n" + conosciuti.map((n) => "- `" + n + "`").join("\n"));
    titoloBreve.push(nuovi.map((v) => { const m = /agg_(\d{2})(\d{2})(\d{4})/.exec(v.nome); return (/festivi/i.test(v.nome) ? "festivi" : "notturni") + (m ? " aggiornati il " + m[1] + "/" + m[2] + "/" + m[3] : " " + ((/_(\d{4})/.exec(v.nome) || [])[1] || "")); }).join(", "));
    /* scarico e leggo il nuovo PDF dei notturni, per mostrare le differenze */
    for (const v of nuovi.filter((x) => /notturni/i.test(x.nome))) {
      const annoPdf = +(/_(\d{4})(?:_agg|\.pdf)/.exec(v.nome) || [, anno])[1];
      const pdf = join(cartella, v.nome);
      writeFileSync(pdf, scarica(v.url, jar));
      try {
        const letti = leggiTesto(pdfInTesto(pdf));
        const attuale = caricaTurni(annoPdf);
        const c = costruisciTurni(letti, attuale ? attuale.correzioni : {});
        const diff = differenze(attuale ? attuale.turni : {}, c.turni).filter((d) => d.data >= oggiRoma());
        righe.push("\n### Cosa cambia da oggi in poi (`" + v.nome + "`)\n");
        righe.push(!attuale ? "È il calendario di un anno nuovo: " + Object.keys(c.turni).length + " giorni letti."
          : diff.length ? "| Giorno | Prima | Adesso |\n|---|---|---|\n" + diff.map((d) => "| " + inParole(d.data) + " | " + nomeDi(d.prima) + " | **" + nomeDi(d.dopo) + "** |").join("\n")
          : "Nessun turno cambiato da oggi in poi (forse sono cambiati solo giorni passati o la grafica).");
        const daGuardare = c.dubbi.filter((d) => !d.id || d.data >= oggiRoma());
        if (daGuardare.length) righe.push("\n**Giorni che lo strumento non ha riconosciuto** (guardali sul PDF):\n\n" + daGuardare.map((d) => "- " + inParole(d.data) + ": letto «" + d.letto + "»").join("\n"));
        if (letti.avvisi.length) righe.push("\n**Avvisi:**\n\n" + letti.avvisi.map((a) => "- " + a).join("\n"));
      } catch (e) { righe.push("\nErrore nella lettura del PDF: " + e.message); }
    }
    if (nuovi.some((v) => /festivi/i.test(v.nome))) righe.push("\nIl PDF dei **festivi** è un'immagine: va guardato a mano e confrontato con i notturni (LEGGIMI, punto «Festivi»).");
    righe.push("\n### Cosa fare\n\nSegui il `LEGGIMI.md` della cartella `farmacia-di-turno-mesagne`, parte «Quando arriva una segnalazione». In breve: Actions → «Aggiorna i turni di Mesagne» → Run workflow, poi controlla la pull request e confronta i giorni cambiati con il PDF.");
  }

  /* 2. l'albo: indirizzi e telefoni */
  try {
    const pag = scarica(PAGINA_ELENCO, jar).toString("utf8");
    const tok = (/name="([0-9a-f]{32})" value="1"/.exec(pag) || [])[1];
    const el = testoDaHtml(scarica(PAGINA_ELENCO, jar, "filter_search=MESAGNE&" + tok + "=1").toString("utf8"));
    const voci = [...el.matchAll(/\|\s*(FARMACIA[^|]*?)\s*\|\s*([^|]+?)\s*\|[^\n]*?\|\s*([0-9][0-9 /.-]{5,})\s*\|/g)].map((m) => ({ nome: m[1].trim(), ind: m[2].trim(), tel: m[3].replace(/\D/g, "") }));
    if (voci.length < 8) righe.push("\n## Albo delle farmacie\n\nHo letto solo " + voci.length + " farmacie di Mesagne nell'albo (attese 8): controlla a mano " + PAGINA_ELENCO);
    const diffAlbo = [];
    for (const f of FARMACIE) {
      const v = voci.find((x) => x.tel === f.telefono.replace(/\D/g, ""));
      if (!v) { diffAlbo.push("- " + f.insegna + ": il telefono " + f.telefono + " non c'è più nell'albo"); continue; }
      const indAlbo = f.mappa.replace(/, 72023 MESAGNE \(BR\)$/, "");
      if (normInd(v.ind) !== normInd(indAlbo)) diffAlbo.push("- " + f.insegna + ": indirizzo nell'albo «" + v.ind + "» (nell'app: «" + indAlbo + "»)");
    }
    for (const v of voci) if (!FARMACIE.some((f) => f.telefono.replace(/\D/g, "") === v.tel)) diffAlbo.push("- Nell'albo c'è una farmacia che l'app non conosce: " + v.nome + ", " + v.ind + ", tel. " + v.tel);
    if (diffAlbo.length) { cambiato = true; titoloBreve.push("albo cambiato"); righe.push("\n## Albo delle farmacie di Mesagne\n\n" + diffAlbo.join("\n") + "\n\nControlla su " + PAGINA_ELENCO + " e correggi `farmacie.json`."); }
  } catch (e) { righe.push("\n(Non sono riuscito a leggere l'albo: " + e.message + ")"); }

  /* 3. ferie dei prossimi mesi */
  try {
    const pag = scarica(PAGINA_FERIE, jar).toString("utf8");
    const tok = (/name="([0-9a-f]{32})" value="1"/.exec(pag) || [])[1];
    const mesi = [...pag.matchAll(/<option value="(\d{4}_\d{2})"/g)].map((m) => m[1]);
    const attuale = (/name="com_sdodf_holidays_actual_period" value="([^"]+)"/.exec(pag) || [])[1] || mesi[0];
    const ferie = [];
    for (const m of mesi) {
      const t = testoDaHtml(scarica(PAGINA_FERIE, jar, "com_sdodf_holidays_selectmonth=" + m + "&limit=100&" + tok + "=1&com_sdodf_holidays_actual_period=" + attuale).toString("utf8"));
      for (const r of t.split("\n")) if (/MESAGNE/i.test(r) && /\d{2}\/\d{2}\/\d{2}/.test(r)) ferie.push("- " + r.replace(/\s*\|\s*/g, " · ").replace(/^[ ·]+|[ ·]+$/g, ""));
    }
    if (ferie.length) { cambiato = true; titoloBreve.push("ferie"); righe.push("\n## Ferie di farmacie di Mesagne\n\n" + [...new Set(ferie)].join("\n") + "\n\nControlla se il calendario dei turni è stato cambiato e aggiungi le ferie in `farmacie.json`."); }
  } catch (e) { righe.push("\n(Non sono riuscito a leggere le ferie: " + e.message + ")"); }

  /* 4. calendario del nuovo anno */
  const oggi = oggiRoma();
  if (oggi.slice(5) >= "11-15" && !caricaTurni(anno + 1)) {
    const ultimo = Object.keys((caricaTurni(anno) || { turni: {} }).turni).sort().pop();
    if (!nomiPdf.some((n) => n.includes(String(anno + 1)))) {
      cambiato = true; titoloBreve.push("manca il calendario " + (anno + 1));
      righe.push("\n## Manca il calendario del " + (anno + 1) + "\n\nL'app ha i turni fino al " + (ultimo ? inParole(ultimo) : "?") + ". L'Ordine non ha ancora pubblicato il PDF del " + (anno + 1) + ": dopo quella data l'app dirà che il calendario non è disponibile. Ricontrolla la prossima settimana.");
    }
  }

  const titolo = "Turni Mesagne: " + (titoloBreve.join(", ") || "nessun cambiamento");
  const testo = "# " + titolo + "\n\nControllo automatico di " + inParole(oggi) + ".\n\n" + righe.join("\n") + "\n";
  if (report) writeFileSync(report, testo);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, "cambiato=" + cambiato + "\ntitolo=" + titolo.replace(/\n/g, " ") + "\n");
  console.log(testo);
}

const comandi = { leggi: cmdLeggi, aggiorna: cmdAggiorna, scarica: cmdScarica, confronta: cmdConfronta, tabella: cmdTabella, controlla: cmdControlla };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = comandi[process.argv[2]];
  if (!cmd) { console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*/, "")); process.exit(process.argv[2] ? 1 : 0); }
  try { cmd(); } catch (e) { console.error(e.message); process.exit(1); }
}
