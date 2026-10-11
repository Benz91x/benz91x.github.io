#!/usr/bin/env node
/* Farmacia di turno Mesagne: codici di attivazione del foglio personale per la famiglia.
   (Copiato da scadenze-mesagne/strumenti/licenze.mjs e adattato: chiavi separate, tipo «famiglia».)

   Un codice è  <dati>.<firma>  in base64url: i dati dicono a chi è intestato e fino a
   quando vale, la firma (ECDSA P-256) la fa la tua chiave privata. L'app contiene solo
   la chiave pubblica: può controllare i codici ma non crearne di nuovi.

   Uso:
     node licenze.mjs chiavi [--forza]              crea le chiavi e aggiorna l'app
     node licenze.mjs codice --nome "Luca R." [--mesi 12 | --fino 2027-10-05]
     node licenze.mjs verifica <codice>

   La chiave privata sta in ~/.farmacia-di-turno-mesagne/chiave-privata.jwk (o nel percorso
   indicato da FTM_CHIAVE). Non metterla mai nel repository. */

import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync, renameSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { subtle } = globalThis.crypto;
const ALG = { name: "ECDSA", namedCurve: "P-256" };
const FIRMA = { name: "ECDSA", hash: "SHA-256" };
const APP = resolve(dirname(fileURLToPath(import.meta.url)), "..", "index.html");
const PRIVATA = process.env.FTM_CHIAVE || join(homedir(), ".farmacia-di-turno-mesagne", "chiave-privata.jwk");
const URL_APP = "https://benz91x.github.io/farmacia-di-turno-mesagne/";

const b64url = (buf) => Buffer.from(buf).toString("base64url");
/* date nel fuso del computer (in Italia: ora italiana), non in UTC */
const isoLocale = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const isoOggi = () => isoLocale(new Date());

function arg(nome) {
  const i = process.argv.indexOf("--" + nome);
  if (i < 0) return undefined;
  const v = process.argv[i + 1];
  if (v === undefined || v.trim() === "" || v.startsWith("--")) throw new Error("Manca il valore di --" + nome);
  return v;
}

function chiavePubblicaDellApp() {
  const html = readFileSync(APP, "utf8");
  const m = html.match(/\/\*CHIAVE\*\/(.*?)\/\*FINE-CHIAVE\*\//s);
  if (!m) throw new Error("Non trovo la chiave pubblica in " + APP);
  return JSON.parse(m[1]);
}

async function chiavi() {
  if (existsSync(PRIVATA) && !process.argv.includes("--forza")) {
    console.error("Esiste già " + PRIVATA + ".\nSe la sostituisci, i codici già venduti smettono di funzionare. Per farlo comunque: --forza");
    process.exit(1);
  }
  const coppia = await subtle.generateKey(ALG, true, ["sign", "verify"]);
  const priv = await subtle.exportKey("jwk", coppia.privateKey);
  const pub = await subtle.exportKey("jwk", coppia.publicKey);

  /* prima si prepara l'HTML: se qualcosa non va, non si tocca nessun file */
  const pubblica = JSON.stringify({ kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y });
  const html = readFileSync(APP, "utf8");
  const nuovo = html.replace(/\/\*CHIAVE\*\/.*?\/\*FINE-CHIAVE\*\//s, "/*CHIAVE*/" + pubblica + "/*FINE-CHIAVE*/");
  if (!/\/\*CHIAVE\*\/.*?\/\*FINE-CHIAVE\*\//s.test(html)) throw new Error("Segnaposto della chiave non trovato in " + APP);

  /* la nuova chiave privata prende il posto della vecchia solo dopo che l'HTML è stato scritto */
  const tmp = PRIVATA + ".nuova";
  mkdirSync(dirname(PRIVATA), { recursive: true, mode: 0o700 });
  writeFileSync(tmp, JSON.stringify(priv), { mode: 0o600 });
  chmodSync(tmp, 0o600);
  try { writeFileSync(APP, nuovo); } catch (e) { rmSync(tmp, { force: true }); throw e; }
  renameSync(tmp, PRIVATA);
  console.log("Chiave privata salvata in " + PRIVATA + " (tienila al sicuro, fuori dal repository).");
  console.log("Chiave pubblica scritta in " + APP + ". Pubblica l'app per renderla attiva.");
}

async function codice() {
  process.argv.slice(3).forEach((x) => {
    if (x.startsWith("--") && !["--nome", "--mesi", "--fino"].includes(x))
      throw new Error("Opzione sconosciuta: " + x + " (scrivi per esempio --fino 2027-10-05, con lo spazio)");
  });
  const nome = (arg("nome") || "").trim();
  if (!nome) throw new Error('Manca --nome, ad esempio --nome "Luca R."');
  let fino = arg("fino");
  if (!fino) {
    const mesi = Number(arg("mesi") || 12);
    if (!Number.isInteger(mesi) || mesi < 1) throw new Error("--mesi deve essere un numero intero positivo");
    const d = new Date();
    d.setMonth(d.getMonth() + mesi);
    fino = isoLocale(d);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fino)) throw new Error("--fino deve essere nel formato AAAA-MM-GG");
  const [a, m, g] = fino.split("-").map(Number), t = new Date(Date.UTC(a, m - 1, g));
  if (t.getUTCFullYear() !== a || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== g) throw new Error("Data inesistente: " + fino);

  const priv = JSON.parse(readFileSync(PRIVATA, "utf8"));
  const chiave = await subtle.importKey("jwk", priv, ALG, false, ["sign"]);
  const dati = b64url(JSON.stringify({ v: 1, t: "famiglia", n: nome.slice(0, 40), i: isoOggi(), x: fino }));
  const firma = await subtle.sign(FIRMA, chiave, new TextEncoder().encode(dati));
  const cod = dati + "." + b64url(firma);

  console.log("Codice per " + nome + ", valido fino al " + fino + ":\n\n" + cod + "\n");
  console.log("Link di attivazione (basta aprirlo dal telefono):\n\n" + URL_APP + "#codice=" + cod + "\n");
}

async function verifica() {
  const cod = (process.argv[3] || "").trim();
  const [dati, firma] = cod.split(".");
  if (!dati || !firma) throw new Error("Codice incompleto");
  const chiave = await subtle.importKey("jwk", chiavePubblicaDellApp(), ALG, false, ["verify"]);
  const ok = await subtle.verify(FIRMA, chiave, Buffer.from(firma, "base64url"), new TextEncoder().encode(dati));
  const info = JSON.parse(Buffer.from(dati, "base64url").toString("utf8"));
  console.log(ok ? "Firma valida." : "Firma NON valida per la chiave pubblica dell'app.");
  console.log("Intestato a: " + info.n + " · tipo " + (info.t || "?") + " · emesso il " + info.i + " · valido fino al " + info.x);
  if (!ok) process.exit(1);
}

const comandi = { chiavi, codice, verifica };
const cmd = comandi[process.argv[2]];
if (!cmd) {
  console.log('Uso:\n  node licenze.mjs chiavi [--forza]\n  node licenze.mjs codice --nome "Luca R." [--mesi 12 | --fino AAAA-MM-GG]\n  node licenze.mjs verifica <codice>');
  process.exit(process.argv[2] ? 1 : 0);
}
cmd().catch((e) => { console.error(e.message); process.exit(1); });
