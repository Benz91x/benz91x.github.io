# Scadenze Mesagne: istruzioni

Web app (PWA) con bonus, contributi e scadenze per chi vive a Mesagne.
L'elenco è gratis per tutti; **Plus** (12 € all'anno) aggiunge profilo della famiglia,
promemoria nel calendario, scadenze personali, archivio con le riaperture e checklist
dei documenti.

Indirizzo: https://benz91x.github.io/scadenze-mesagne/

## File

| File | A cosa serve |
|---|---|
| `index.html` | L'app: HTML, CSS e JavaScript in un solo file. In cima allo script c'è `CONFIG` (prezzo, link di pagamento, email, chiave pubblica). |
| `avvisi.json` | **L'elenco dei bandi.** Per aggiornare l'app di solito basta modificare questo file. |
| `sw.js` | Copia per l'uso senza internet. Cambia `CACHE` quando modifichi `index.html`. |
| `strumenti/licenze.mjs` | Crea le chiavi e i codici di attivazione di Plus (serve Node 20 o più recente). |
| `manifest.webmanifest`, `icons/`, `fonts/` | Installazione come app, icone, font Atkinson Hyperlegible Next. |

## Aggiungere o aggiornare un bando

Apri `avvisi.json`, copia una voce esistente e cambia i campi:

- `id`: breve, unico, senza spazi (finisce nei link `#a=id`).
- `categoria`: `tributi`, `famiglia`, `sociale`, `lavoro`, `imprese`, `citta`.
- `tipo`: `domanda` (bandi e contributi da chiedere), `pagamento` (TARI, IMU…) o `info`
  (cose che arrivano da sole, come il bonus TARI). Cambia i titoli della scheda e il
  messaggio di WhatsApp.
- `apre` / `scade`: date `AAAA-MM-GG`. `scade: null` = sempre disponibile.
- `breve`, `cosa`, `chi`, `come`, `documenti`, `nota`: testi semplici, frasi corte.
- `per`: a chi interessa (`tutti`, `figli-0-3`, `figli-scuola`, `figli-superiori`, `anziani`,
  `disabilita`, `affitto`, `proprietario`, `cartelle`, `lavoro`, `impresa`, `animali`).
- `isee_max`: soglia ISEE in euro, se c'è (serve al controllo di Plus).
- `isee_max_alt` e `isee_alt_per`: soglia più alta per alcune famiglie, per esempio
  `20000` e `"con almeno quattro figli a carico"`. Il profilo non sa quanti figli ci sono,
  quindi per quelle fasce l'app dice «controlla il tuo» invece di «sei sopra la soglia».
- `riapre_mese`: mese (1-12) in cui il bando torna di solito, per «Avvisami quando riapre».
- `fonti`: almeno un link (solo `https://`). Metti per prima la fonte ufficiale (Comune,
  Regione, INPS…) e segnala `"ufficiale": true`: il pulsante diventa «Leggi l'avviso
  ufficiale». Senza, il pulsante dice «Leggi la fonte».

Poi aggiorna `aggiornato` in cima al file. I bandi scaduti restano nel file: finiscono
da soli nell'archivio di Plus.

Dove cercare i bandi nuovi: sezione Novità del sito del Comune, albo pretorio,
sito del Consorzio ATS BR4 (ambitomesagne.it), portali della Regione Puglia.

## Plus: chiavi e codici

I codici sono firmati con una chiave privata che resta solo sul tuo computer; l'app
contiene la chiave pubblica e controlla la firma. Un codice inventato non funziona.

**Una volta sola**, prima di vendere il primo codice:

```sh
node scadenze-mesagne/strumenti/licenze.mjs chiavi --forza
```

Crea la chiave privata in `~/.scadenze-mesagne/chiave-privata.jwk` e scrive la chiave
pubblica in `index.html`: fai commit e pubblica. Fai una copia di sicurezza della chiave
privata: se la perdi non puoi più creare codici validi per quella chiave pubblica.

**Per ogni cliente:**

```sh
node scadenze-mesagne/strumenti/licenze.mjs codice --nome "Maria R." --mesi 12
```

Stampa il codice e il link di attivazione: manda il link al cliente, che lo apre
dal telefono. Per controllare un codice: `licenze.mjs verifica <codice>`.

Il nome del cliente compare nell'app («Plus attivo per Maria R.»): scoraggia chi
vorrebbe passare il codice ad altri.

## Pagamento

In `CONFIG.pagaUrl` metti il link di pagamento (per esempio un Payment Link di
Stripe, PayPal o Satispay). Se è vuoto, il pulsante «Attiva Plus» apre un'email
a `CONFIG.email` con la richiesta.

## Limiti da conoscere

- Plus è controllato nel browser: chi sa programmare potrebbe aggirarlo modificando
  la pagina. Per un servizio da 12 € l'anno va bene; i promemoria via email o
  Telegram (passo successivo) richiederanno un piccolo server, e lì il controllo
  sarà completo.
- I promemoria passano dal calendario del telefono (file `.ics` o Google Calendar),
  quindi arrivano anche senza aprire l'app.
- `?data=AAAA-MM-GG` nell'indirizzo simula un altro giorno per l'elenco (utile per le prove).
  La validità di Plus usa sempre la data vera.
- Profilo, scadenze personali e spunte restano nel browser del telefono: se si
  cancellano i dati del sito, vanno reinseriti (il codice Plus si riattiva con lo
  stesso link).
