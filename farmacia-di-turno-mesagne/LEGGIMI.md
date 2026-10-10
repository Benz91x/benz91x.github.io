# Farmacia di turno Mesagne: istruzioni

Web app gratuita che dice quale farmacia è di turno adesso a Mesagne, domani e la prossima
domenica o festivo, con i numeri utili per la salute e il foglio del mese da stampare.
Parte a pagamento: pacchetto per le farmacie, spazi in fondo al foglio, foglio per la famiglia.

Indirizzo: https://benz91x.github.io/farmacia-di-turno-mesagne/

## File

| File | A cosa serve |
|---|---|
| `index.html` | L'app: HTML, CSS e JavaScript in un solo file. In cima allo script c'è `CONFIG` (prezzi, link di pagamento, email, chiave pubblica). |
| `turni-2026.json` | **I turni del 2026** (e del 1° gennaio 2027), letti dal PDF dell'Ordine. Contiene anche la fonte, gli orari di legge e le correzioni a mano. |
| `calendari.json` | Gli anni per cui esiste un file dei turni. |
| `farmacie.json` | Le 8 farmacie: insegna, titolare, indirizzo, telefono, orari, copiati dall'albo dell'Ordine. |
| `numeri.json` | Emergenza, guardia medica, pronto soccorso, CUP, centro prelievi. Qui c'è l'interruttore del 116117. |
| `abbonamenti.json` | Farmacie con il pacchetto e spazi in fondo al foglio. All'inizio è vuoto (c'è solo un esempio). |
| `sw.js` | Copia per l'uso senza internet. Cambia `CACHE` quando modifichi `index.html`. |
| `strumenti/turni.mjs` | Legge il PDF dei turni, controlla il sito dell'Ordine, prepara gli aggiornamenti. |
| `strumenti/licenze.mjs` | Crea le chiavi e i codici del foglio per la famiglia. |
| `strumenti/festivi-2026-trascrizione.json` | Il PDF dei festivi ricopiato a mano, per il controllo incrociato. |
| `CONTROLLO-DATI.md` | La tabella di controllo dei dati fatta il 10 ottobre 2026. |
| `manifest.webmanifest`, `icons/`, `fonts/`, `loghi/` | Installazione come app, icone, font, loghi delle farmacie. |

Fuori dalla cartella ci sono le due GitHub Action, in `.github/workflows/`:
`turni-mesagne-controllo.yml` (ogni lunedì) e `turni-mesagne-aggiorna.yml` (la lanci tu).

## Quando arriva una segnalazione (circa 15 minuti)

Ogni lunedì GitHub controlla il sito dell'Ordine dei Farmacisti. Se il PDF dei turni di Mesagne
cambia (la data dopo `agg_` nel nome del file), se cambia l'albo o se ci sono ferie, ti arriva una
**segnalazione** (issue) con l'etichetta `turni-mesagne`, e di solito anche un'email da GitHub.
Se il sito dell'Ordine non risponde, il controllo «fallisce» e GitHub ti manda un'email: basta
aspettare il lunedì dopo, o lanciarlo a mano (Actions → «Controllo turni Mesagne» → Run workflow).

Non serve il Mac: si fa tutto dal sito di GitHub, anche dal telefono.

1. **Leggi la segnalazione.** Dice quale file è nuovo e quali giorni cambiano da oggi in poi.
2. **Prepara l'aggiornamento.** Su GitHub apri il repository → scheda **Actions** →
   a sinistra **«Aggiorna i turni di Mesagne»** → pulsante **Run workflow** → **Run workflow**.
   Dopo un minuto il pallino diventa verde.
3. **Apri la pull request** che si è creata (scheda **Pull requests**). Se non c'è, apri il
   lavoro appena finito in Actions: in fondo alla pagina c'è il link per crearla con un clic.
   (Per farla creare da sola: Settings → Actions → General → spunta «Allow GitHub Actions to
   create and approve pull requests».)
4. **Controlla i giorni cambiati.** Nella descrizione della pull request c'è l'elenco
   «GIORNI CAMBIATI». Apri il PDF dal sito dell'Ordine
   (https://www.ordinefarmacistibrindisi.it/farmacie/turni-delle-farmacie.html?page=2) e guarda
   che ogni giorno dell'elenco sia scritto così anche nel PDF. Se c'è la voce «GIORNI NON
   RICONOSCIUTI», leggi tu quei giorni sul PDF (vedi «Correzioni a mano» qui sotto).
5. **Festivi.** Se la segnalazione dice che è cambiato anche il PDF dei festivi (è un'immagine),
   aprilo e confronta ogni domenica e festivo dei prossimi mesi con il foglio del mese dell'app
   (`?foglio=AAAA-MM`). Se tutto torna, nella pull request apri `turni-2026.json`, cerca
   `"festivi": {` dentro `"fonte"` e scrivi il nome nuovo del file (per esempio
   `mesagne_turni_festivi_2026_agg_01112026.pdf`) e la data in `"aggiornato"`.
   Se una domenica non torna, **non fare il merge** e chiama l'Ordine (0831 562141).
6. **Pubblica.** Nella pull request premi **Merge pull request**. Dopo uno o due minuti l'app
   online è aggiornata. Chiudi la segnalazione.

### Correzioni a mano

A volte il PDF ha il testo rovinato (per esempio «N ERA» al posto di NOCERA). Lo strumento non
indovina: lascia il giorno vuoto e lo segnala. L'app allora dice «non abbiamo il turno di questo
giorno». Per correggere, in `turni-2026.json` trova `"correzioni"` e aggiungi una riga come queste:

```json
"2026-04-04": { "id": "nocera", "motivo": "nel PDF il nome è rovinato; sull'immagine si legge NOCERA" }
```

Gli `id` delle farmacie sono: `alioth`, `antonucci`, `cavaliere`, `ricupero`, `rutigliano`
(Materdomini), `nocera`, `santandrea`, `spalletta`. Poi rilancia «Aggiorna i turni di Mesagne».
Le correzioni valgono solo per i giorni che lo strumento non riesce a leggere.

## Il calendario del nuovo anno

Il calendario 2026 arriva fino al 1° gennaio 2027. Dal 15 novembre, se l'Ordine non ha ancora
pubblicato il calendario 2027, la segnalazione del lunedì te lo ricorda. Quando lo pubblica,
la segnalazione dice «nuovo PDF»: segui gli stessi passi. Lo strumento crea `turni-2027.json`,
lo aggiunge a `calendari.json` e alla copia offline. Fai anche la trascrizione dei festivi 2027
(copia `strumenti/festivi-2026-trascrizione.json`, cambia le date e i nomi guardando il PDF).

## Cambiare un indirizzo, un telefono o un orario

Apri `farmacie.json` su GitHub, premi la matita, cambia il testo, poi «Commit changes».
Il campo `mappa` deve restare uguale all'indirizzo scritto nell'albo dell'Ordine: il controllo
del lunedì li confronta. Aggiorna anche `"controllato"` con la data di oggi (AAAA-MM-GG).

## Numeri utili

In `numeri.json`:

- **116117.** Quando il nuovo numero della guardia medica sarà attivo anche per Brindisi,
  cambia `"usa116117": false` in `"usa116117": true`. L'app mostrerà il 116117 al posto del
  numero di Mesagne, anche sul foglio stampato.
- **Orari della guardia medica.** Quando li conosci, scrivili in `"orari"` al posto di `null`,
  tra virgolette, come si parla: `"Dalle 20 alle 8 di tutte le notti; ..."`.
- Ogni numero ha `"controllato"`: aggiornalo quando ricontrolli.

**Orario del cambio del turno.** In `turni-2026.json`, parte `"orario"`: per legge regionale
il turno di notte va dalle 20 alle 8:30. Finché `"confermato"` è `false`, tra mezzanotte e le
8:30 l'app mostra sia la farmacia di ieri sia quella di oggi. Quando l'Ordine ti conferma che
il turno di un giorno copre la notte che segue fino alle 8:30, metti `"confermato": true`.
Se l'ora del cambio è diversa, cambia `"cambio": "08:30"`.

## Pacchetto farmacia (circa 10 € al mese o 100 € all'anno)

I prezzi sono in cima allo script di `index.html`, in `CONFIG.prezzi`.

Quando una farmacia paga, apri `abbonamenti.json` e aggiungi dentro `"farmacie"`:

```json
"nocera": { "fino": "2027-10-31", "logo": "loghi/nocera.png", "servizi": ["cup", "pressione", "domicilio"] }
```

- La chiave (`"nocera"`) è l'`id` della farmacia. `fino` è l'ultimo giorno pagato.
- Il logo va nella cartella `loghi/` (PNG, JPG, SVG o WebP, largo e basso, sotto i 100 KB).
- `servizi` sceglie solo tra queste parole: `cup`, `vaccini`, `pressione`, `glicemia`, `ecg`,
  `holter`, `domicilio`, `tamponi`. Non ci sono testi liberi apposta: niente prezzi, sconti o
  frasi pubblicitarie (regole deontologiche delle farmacie).

Poi manda alla farmacia il suo indirizzo personale, da salvare nei preferiti:
`https://benz91x.github.io/farmacia-di-turno-mesagne/?da=nocera`. Lì trova il foglio del mese
con «Distribuito da» e il logo, e il cartello per la vetrina. Il turno nell'app resta uguale per
tutte le farmacie. Per far vedere un esempio: `?da=esempio` (esce la scritta ESEMPIO).

## Spazi in fondo al foglio (al massimo 3)

In `abbonamenti.json`, dentro `"spazi"`:

```json
{ "nome": "Ottica Rossi", "categoria": "ottico", "indirizzo": "via Roma 1", "telefono": "0831 000000", "fino": "2027-01-31" }
```

`categoria` è una di: `sanitaria`, `ottico`, `audioprotesista`, `caf`, `patronato`. Gli spazi
compaiono solo in fondo al foglio stampato normale: mai nell'app, mai sul foglio di una farmacia
o su quello della famiglia. Esempio: `?foglio=2026-11&esempio=1`.

## Foglio per la famiglia (12 € all'anno): chiavi e codici

I codici sono firmati con una chiave privata che resta solo sul tuo Mac; l'app contiene la chiave
pubblica e controlla la firma. Un codice inventato non funziona. Le chiavi sono diverse da quelle
di Scadenze Mesagne.

**Una volta sola**, prima di vendere il primo codice. Serve Node: scaricalo da
https://nodejs.org (versione LTS, il file per macOS) e installalo come un normale programma.
Poi apri il **Terminale** e copia questi comandi (la prima volta il Mac può chiederti di
installare gli «strumenti per sviluppatori»: accetta):

```sh
cd ~/Documents
git clone https://github.com/Benz91x/benz91x.github.io.git
cd benz91x.github.io
node farmacia-di-turno-mesagne/strumenti/licenze.mjs chiavi
git add farmacia-di-turno-mesagne/index.html
git commit -m "Farmacia di turno: chiave dei codici per la famiglia"
git push
```

La chiave privata finisce in `~/.farmacia-di-turno-mesagne/chiave-privata.jwk`. **Fanne una
copia di sicurezza** (per esempio su una chiavetta): se la perdi non puoi più creare codici.

**Per ogni cliente:**

```sh
cd ~/Documents/benz91x.github.io
node farmacia-di-turno-mesagne/strumenti/licenze.mjs codice --nome "Luca R." --mesi 12
```

Stampa il codice e il link di attivazione: manda il link al cliente, che lo apre dal telefono.
Poi scrive il nome del genitore e i numeri, e stampa il foglio. I dati restano solo su quel
telefono. Per controllare un codice: `licenze.mjs verifica <codice>`.

## Pagamento

In `CONFIG.pagaFamiglia` e `CONFIG.pagaFarmacia` metti i link di pagamento (Stripe Payment Link,
Satispay o PayPal). Se sono vuoti, i pulsanti aprono un'email a `CONFIG.email` già scritta.

## Prove

Nell'indirizzo puoi aggiungere:

- `?data=2026-12-25&ora=03:00` simula un giorno e un'ora (in alto compare una striscia gialla).
  Il foglio per la famiglia e gli abbonamenti usano sempre la data vera.
- `?foglio=2026-11` il foglio di novembre; `&da=nocera` la versione della farmacia;
  `&famiglia=1` quella della famiglia; `&esempio=1` con gli spazi di esempio.
- `?cartello=1&da=esempio` il cartello per la vetrina.
- `?leggi=1` legge il turno ad alta voce all'apertura (e se lo ricorda su quel telefono).
  Molti telefoni non lasciano parlare una pagina prima di un tocco: in quel caso compare un
  grande pulsante «Tocca qui per ascoltare il turno».

Per stampare il foglio dal computer: scegli A4, verticale, margini «nessuno» o predefiniti,
e togli «intestazioni e piè di pagina».

## Dopo una modifica a `index.html`

Cambia in `sw.js` la riga `var CACHE = PREFISSO + "20261010a";` (per esempio con la data
di oggi): così i telefoni scaricano la versione nuova. Per i file `.json` non serve.

## Limiti da conoscere

- Il foglio per la famiglia è controllato nel browser: chi sa programmare potrebbe aggirarlo.
  Per 12 € all'anno va bene.
- Il controllo del lunedì legge il sito dell'Ordine: se l'Ordine cambia il sito, la segnalazione
  dirà «pagina dei turni cambiata» e lo strumento andrà aggiornato.
- Il PDF dei festivi è un'immagine: il controllo incrociato si fa a occhio.

## Fase 2 (non fatta: servono un server e costi da verificare)

- SMS o telefonata automatica al genitore la sera prima dei festivi.
- Un numero da chiamare dal telefono di casa che legge il turno.
- Messaggi WhatsApp automatici.
