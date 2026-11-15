# Analytics — Istruzioni di attivazione (2 minuti)

La pagina ha **due livelli di analytics**, già integrati nel codice:

---

## 1) Contatore visite — già attivo, zero configurazione

In fondo alla pagina (footer) compare **Visite: N**, aggiornato a ogni apertura.
Il numero appare solo quando supera le 1.000 visite. Non richiede account né
configurazione (servizio: [Abacus](https://jasoncameron.dev/abacus/), codice in
`assets/js/page.js`).

- Valore attuale, senza contare una visita:
  https://abacus.jasoncameron.dev/get/benz91x.github.io/visite
- Il contatore è ripartito da zero il 6 ottobre 2026: il servizio precedente
  (counterapi.dev v1) è stato spento il 7 agosto 2026 senza migrare i conteggi.
- Il contatore resta attivo finché viene usato: scade solo dopo 6 mesi senza visite.

## 2) GoatCounter — dashboard completa (visite, lettura, click, provenienza)

La pagina è già cablata per **GoatCounter** (gratuito, privacy-friendly, senza cookie,
conforme GDPR senza banner). Traccia già questi eventi:

| Evento | Cosa ti dice |
|---|---|
| Visite pagina | quante volte è stata vista, da quali paesi/dispositivi/browser |
| `scroll-25/50/75/100` | quanto in fondo leggono la pagina |
| `tempo-15s/30s/1min/3min` | quanto tempo restano a leggere |
| `download-cv` | chi scarica il CV in PDF |
| `click-email` / `click-linkedin` / `click-github` | quali contatti usano |
| `click-app-sanvito` / `click-app-mesagne` / `click-app-farmacia` | chi apre le app per i cittadini dalla pagina |
| `click-articolo` / `click-libro` | chi apre l'articolo su MDPI o il libro su Amazon |
| `click-stampa` | chi apre l'articolo di Qui Mesagne su Differenziata Mesagne |
| `click-stampa-brindisireport` | chi apre l'articolo di BrindisiReport su Differenziata San Vito dei Normanni |
| `click-confapi` | chi apre la notizia o il programma dell'intervento a Confapi (MicroCyber, Bari) |
| `fonte-<nome>` | provenienza campagne: aggiungi `?ref=linkedin` (o `?ref=cv`, `?ref=email`…) al link che condividi, es. `https://benz91x.github.io/?ref=linkedin` |
| `/bot-nojs` | crawler e bot di anteprima (LinkedIn, WhatsApp…) |

### Attivazione

1. Vai su **https://www.goatcounter.com/signup** e crea l'account gratuito.
   Come *site code* scegli ad esempio `alessandrochiri`
   (diventerà `alessandrochiri.goatcounter.com`).
2. Apri **`assets/js/page.js`** e, nelle prime righe, sostituisci il valore di
   **`GC_CODE`** (ora `"TUOCODICE"`) con il tuo code, es. `"alessandrochiri"`.
3. *(Facoltativo, per contare anche i bot senza JavaScript)* In fondo a
   **`index.html`**, prima di `</body>`, trovi il pixel `<noscript>` commentato:
   sostituisci **`TUOCODICE`** con lo stesso code e togli i segni di commento
   `<!--` e `-->`.
4. Commit → la dashboard su **https://<tuocode>.goatcounter.com** inizia a
   popolarsi entro pochi minuti.

> Nota privacy: nessun sistema di analytics serio mostra l'identità dei singoli
> visitatori (nome/email) senza il loro consenso — è il GDPR. GoatCounter ti mostra
> tutto il resto: paese, dispositivo, pagine, referrer, durata e profondità di lettura.

## Come è fatto il sito (nota tecnica, v5)

- `index.html` è una **pagina statica completa**: tutti i contenuti (in italiano)
  e i meta tag SEO/social sono nell'HTML, leggibili anche senza JavaScript.
- Il design segue la taste-skill (v2.5.1): i suoi file sono copiati senza modifiche
  in `assets/` (`system.css`/`system.js`, `ui/`, `motion/`, `layout/`, `moments/`,
  `diagrams/`, `backgrounds/`, `icons/icon.css`). Non vanno modificati: le regole
  della pagina stanno nel `<style>` in testa a `index.html`.
- `assets/js/page.js` — lingua IT/EN (i **testi inglesi** sono nel dizionario `EN`
  in cima al file; il cambio di lingua ricarica la pagina con `?lang=en` o
  `?lang=it`), analytics e contatore visite.
- Due animazioni legate allo scroll, ognuna nella sua sezione: la frase del profilo
  (word-highlight) e i tre passi di NextHub (pinned-chapters). Con "riduci movimento"
  e sul telefono restano ferme.
- Dopo una modifica a CSS o JS, aggiorna il parametro `?v=` nei link di `index.html`
  (es. `page.js?v=20261115`), così i browser scaricano subito la versione nuova.
- `assets/img/` ritratti, schermate delle app, figure dell'articolo NextHub
  (`work/`, CC BY 4.0) · `assets/icons/` favicon e icone degli strumenti ·
  `assets/fonts/` Albert Sans (licenza OFL), servito dal sito senza Google Fonts.
- `share.jpg` è l'immagine delle anteprime social (link condivisi su LinkedIn, WhatsApp…).
- **Per cambiare un testo**: modifica l'italiano in `index.html` e, se serve, la
  traduzione con la stessa chiave `data-i18n` nel dizionario `EN` di `page.js`.

## Alternative a GoatCounter

- **Google Analytics 4**: crea una proprietà su https://analytics.google.com,
  prendi il `Measurement ID` (G-XXXXXXXXXX) e incolla lo snippet `gtag.js` nel
  `<head>` di `index.html`. Attenzione: GA4 usa cookie, quindi in UE serve un
  banner di consenso.
