# Controllo dei dati (10 ottobre 2026)

Controllo fatto prima di mettere online l'app. Regola: nessun dato inventato. Ogni dato ha una
fonte; quello che non si può verificare non è mostrato oppure è segnato «da verificare».

## Fonti usate

| Dato | Fonte | Versione |
|---|---|---|
| Turni pomeriggio e notte | Ordine dei Farmacisti della Provincia di Brindisi, `mesagne_turni_pomeridiani_e_notturni_2026_agg_05102026.pdf` | aggiornato il 5/10/2026 |
| Turni festivi (controllo) | Ordine dei Farmacisti, `mesagne_turni_festivi_2026_agg_16062026.pdf` (immagine, ricopiato a mano) | aggiornato il 16/06/2026 |
| Controllo esterno | farmaciediturno.org (non ufficiale), solo 10-24 ottobre: il sito non mostra date più lontane | letto il 10/10/2026 |
| Farmacie | Albo delle farmacie dell'Ordine (comune MESAGNE), riquadro «Info» | letto il 10/10/2026 |
| Ferie | Pagina «Ferie delle farmacie» dell'Ordine, ottobre-dicembre 2026 | nessuna farmacia di Mesagne in ferie |
| Orari del turno | Legge regionale Puglia 18/2/2014 n. 5, articoli 2, 3, 4, 6 (sul sito dell'Ordine) | — |
| Numeri della salute | Carta dei Servizi ASL Brindisi | prodotta l'8/1/2024 |
| 116117 | Comunicato della Regione Puglia, agosto 2026 | non ancora attivo a Brindisi |

## Come sono stati letti i turni

- Il PDF dei notturni è stato letto con `pdftotext -layout` dallo strumento `strumenti/turni.mjs`:
  366 giorni (dal 1° gennaio 2026 al 1° gennaio 2027), ogni giorno della settimana controllato
  con la data, nessun giorno mancante o doppio.
- Refusi riconosciuti da soli: 31/3 «ANTONUCCCI», 10/6 «ANTONUCI», 27/6 «SPALLETA», 11/11 «ANTONUCCOI».
- Tre giorni (già passati) hanno il testo rovinato nel PDF e sono stati letti sull'immagine della
  pagina: 4/4 «N ERA» = NOCERA, 9/7 «A T» = ALIOTH, 7/8 «S A ETTA» = SPALLETTA.
- Ottobre, novembre e dicembre sono stati anche confrontati **riga per riga a occhio** con
  l'immagine del PDF ufficiale: 93 righe uguali su 93.
- PDF dei festivi: 64 domeniche e festivi del 2026 (più il 1/1/2027) confrontati con i notturni:
  **64 uguali su 64**. La domenica e nei festivi la farmacia di turno è la stessa nei due calendari.
- **Secondo controllo indipendente** (stesso giorno, senza usare lo strumento dell'app): PDF
  riscaricati (identici byte per byte), lettore scritto da capo, 366 giorni confrontati: 363 uguali
  e 3 sono le correzioni a mano, confermate sulle immagini (anche decodificando i caratteri del PDF).
  Ottobre-dicembre e 1/1/2027 ricontrollati a occhio sulle immagini: uguali. Festivi: 64 su 64.
- Nel PDF dei festivi 5 nomi (12/7, 16/7, 19/7, 9/8, 4/10) sono **annotazioni aggiunte il
  17/06/2026**: un programma che nasconde le annotazioni mostra quelle celle vuote.
- Il 4 ottobre è segnato «San Francesco» perché dal 2026 è festa nazionale (legge 151/2025); il
  PDF non lo segna perché nel 2026 è domenica.
- I giorni di prova indicati da Alessandro corrispondono tutti: 10/10 Sant'Andrea, 11/10 Ricupero,
  12/10 Antonucci, 13/10 Nocera, 14/10 Spalletta, 15/10 Sant'Andrea, 16/10 Rutigliano,
  17/10 Alioth, 18/10 Cavaliere, 25/12 Spalletta, 1/1/2027 Rutigliano.

## Turni di ottobre, novembre e dicembre 2026

Giorni: 93 · con PDF festivi: 17 · con farmaciediturno.org: 15 · differenze: 0

### Ottobre 2026

| Giorno | PDF notturni (ufficiale) | PDF festivi (ufficiale) | farmaciediturno.org | Esito |
|---|---|---|---|---|
| gio 1 | Spalletta |  |  | uguale |
| ven 2 | Ricupero |  |  | uguale |
| sab 3 | Cavaliere |  |  | uguale |
| dom 4 (San Francesco) | Nocera | Nocera |  | uguale |
| lun 5 | Antonucci |  |  | uguale |
| mar 6 | Nocera |  |  | uguale |
| mer 7 | Spalletta |  |  | uguale |
| gio 8 | Materdomini |  |  | uguale |
| ven 9 | Cavaliere |  |  | uguale |
| sab 10 | Sant'Andrea |  | Sant'Andrea | uguale |
| dom 11 | Ricupero | Ricupero | Ricupero | uguale |
| lun 12 | Antonucci |  | Antonucci | uguale |
| mar 13 | Nocera |  | Nocera | uguale |
| mer 14 | Spalletta |  | Spalletta | uguale |
| gio 15 | Sant'Andrea |  | Sant'Andrea | uguale |
| ven 16 | Materdomini |  | Materdomini | uguale |
| sab 17 | Alioth |  | Alioth | uguale |
| dom 18 | Cavaliere | Cavaliere | Cavaliere | uguale |
| lun 19 | Ricupero |  | Ricupero | uguale |
| mar 20 | Materdomini |  | Materdomini | uguale |
| mer 21 | Sant'Andrea |  | Sant'Andrea | uguale |
| gio 22 | Antonucci |  | Antonucci | uguale |
| ven 23 | Alioth |  | Alioth | uguale |
| sab 24 | Spalletta |  | Spalletta | uguale |
| dom 25 | Nocera | Nocera |  | uguale |
| lun 26 | Cavaliere |  |  | uguale |
| mar 27 | Ricupero |  |  | uguale |
| mer 28 | Sant'Andrea |  |  | uguale |
| gio 29 | Materdomini |  |  | uguale |
| ven 30 | Nocera |  |  | uguale |
| sab 31 | Antonucci |  |  | uguale |

### Novembre 2026

| Giorno | PDF notturni (ufficiale) | PDF festivi (ufficiale) | farmaciediturno.org | Esito |
|---|---|---|---|---|
| dom 1 (Ognissanti) | Alioth | Alioth |  | uguale |
| lun 2 | Spalletta |  |  | uguale |
| mar 3 | Cavaliere |  |  | uguale |
| mer 4 | Sant'Andrea |  |  | uguale |
| gio 5 | Nocera |  |  | uguale |
| ven 6 | Antonucci |  |  | uguale |
| sab 7 | Ricupero |  |  | uguale |
| dom 8 | Materdomini | Materdomini |  | uguale |
| lun 9 | Alioth |  |  | uguale |
| mar 10 | Sant'Andrea |  |  | uguale |
| mer 11 | Antonucci |  |  | uguale |
| gio 12 | Ricupero |  |  | uguale |
| ven 13 | Cavaliere |  |  | uguale |
| sab 14 | Nocera |  |  | uguale |
| dom 15 | Spalletta | Spalletta |  | uguale |
| lun 16 | Materdomini |  |  | uguale |
| mar 17 | Alioth |  |  | uguale |
| mer 18 | Antonucci |  |  | uguale |
| gio 19 | Nocera |  |  | uguale |
| ven 20 | Ricupero |  |  | uguale |
| sab 21 | Cavaliere |  |  | uguale |
| dom 22 | Sant'Andrea | Sant'Andrea |  | uguale |
| lun 23 | Spalletta |  |  | uguale |
| mar 24 | Materdomini |  |  | uguale |
| mer 25 | Nocera |  |  | uguale |
| gio 26 | Ricupero |  |  | uguale |
| ven 27 | Cavaliere |  |  | uguale |
| sab 28 | Alioth |  |  | uguale |
| dom 29 | Antonucci | Antonucci |  | uguale |
| lun 30 | Spalletta |  |  | uguale |

### Dicembre 2026

| Giorno | PDF notturni (ufficiale) | PDF festivi (ufficiale) | farmaciediturno.org | Esito |
|---|---|---|---|---|
| mar 1 | Materdomini |  |  | uguale |
| mer 2 | Nocera |  |  | uguale |
| gio 3 | Spalletta |  |  | uguale |
| ven 4 | Cavaliere |  |  | uguale |
| sab 5 | Sant'Andrea |  |  | uguale |
| dom 6 | Ricupero | Ricupero |  | uguale |
| lun 7 | Alioth |  |  | uguale |
| mar 8 (Immacolata) | Nocera | Nocera |  | uguale |
| mer 9 | Materdomini |  |  | uguale |
| gio 10 | Spalletta |  |  | uguale |
| ven 11 | Sant'Andrea |  |  | uguale |
| sab 12 | Antonucci |  |  | uguale |
| dom 13 | Cavaliere | Cavaliere |  | uguale |
| lun 14 | Alioth |  |  | uguale |
| mar 15 | Materdomini |  |  | uguale |
| mer 16 | Ricupero |  |  | uguale |
| gio 17 | Sant'Andrea |  |  | uguale |
| ven 18 | Antonucci |  |  | uguale |
| sab 19 | Spalletta |  |  | uguale |
| dom 20 | Nocera | Nocera |  | uguale |
| lun 21 | Ricupero |  |  | uguale |
| mar 22 | Alioth |  |  | uguale |
| mer 23 | Antonucci |  |  | uguale |
| gio 24 | Cavaliere |  |  | uguale |
| ven 25 (Natale) | Spalletta | Spalletta |  | uguale |
| sab 26 (Santo Stefano) | Sant'Andrea | Sant'Andrea |  | uguale |
| dom 27 | Materdomini | Materdomini |  | uguale |
| lun 28 | Nocera |  |  | uguale |
| mar 29 | Alioth |  |  | uguale |
| mer 30 | Cavaliere |  |  | uguale |
| gio 31 | Ricupero |  |  | uguale |

### Gennaio 2027

| Giorno | PDF notturni (ufficiale) | PDF festivi (ufficiale) | farmaciediturno.org | Esito |
|---|---|---|---|---|
| ven 1 (Capodanno) | Materdomini | Materdomini |  | uguale |

## Farmacie: confronto tra le fonti

| Nel calendario | Nell'app (dall'albo dell'Ordine) | Telefono | Differenze trovate |
|---|---|---|---|
| ALIOTH | Farmacia Alioth (S.r.l.), via Brindisi 106, angolo vicolo San Lorenzo 4/6 | 0831 771118 | Nella Carta dei Servizi ASL 2024 lo stesso telefono è a «via Francesco Vita 3» (dr.ssa Carla De Luca): probabilmente un vecchio indirizzo. Orario invernale nell'albo con le date dell'anno scorso: segnato «da verificare». |
| ANTONUCCI | Farmacia Antonucci (dr.ssa Rita Antonucci), piazza Vittorio Emanuele 69 | 0831 771137 | Albo e ASL: 69. Altre fonti: 68. Usato 69. |
| CAVALIERE | Farmacia Cavaliere (S.a.s. della dott.ssa Francesca Cutrì), piazza Garibaldi 16 | 0831 771127 | La Carta dei Servizi ASL 2024 indica come titolare la dr.ssa Carla Rizzo: usato l'albo, più recente. |
| RICUPERO | Farmacia Ricupero (dr. Ricupero S.a.s.), via G. Marconi 75 | 0831 734724 | Albo e ASL: 75. Elenco vaccinazioni 2025-26 dell'Ordine e farmaciediturno.org: 73. Usato 75. |
| RUTIGLIANO | Farmacia Materdomini (dr. Giuseppe Rutigliano), viale Indipendenza 154 | 0831 776342 | Nessuna. Nel calendario si chiama RUTIGLIANO: l'app scrive «Materdomini (dr. Giuseppe Rutigliano)». |
| NOCERA | Farmacia Nocera (S.a.s.), via Basilicata 20/22/24 | 0831 737021 | ASL e vaccinazioni: «20/22»; farmaciediturno.org: «22». Usato l'albo. Nell'albo l'orario invernale vale «dal 25/10/2026 al 27/03/2026»: l'inizio è plausibile, la fine ha l'anno sbagliato. L'app scrive «Dal 25 ottobre 2026» e fino ad allora mostra prima l'orario estivo. |
| SANT'ANDREA | Farmacia Sant'Andrea (S.r.l.), via Mannarino 13 | 0831 773032 | La Carta dei Servizi ASL 2024 indica il dr. Livino Ramundo. Il nome nel calendario è uguale all'insegna, quindi l'app non mostra il titolare tra parentesi. |
| SPALLETTA | Farmacia Spalletta (S.n.c.), via Udine 2 e via Tenente R. Antonucci 134 | 0831 368631 | Orario invernale nell'albo «fino al 31/12/2025»: scaduto, segnato «da verificare». La Carta dei Servizi ASL 2024 (pag. 228) non ha Spalletta: al suo posto c'è «Savino dr.ssa Gabriella, via R. Antonucci 46, 0831 738155», probabilmente la stessa farmacia prima del cambio. Usato l'albo, più recente. |

Nessuna farmacia di Mesagne ha chiusura settimanale né ferie secondo l'albo; nessuna è in ferie
tra ottobre e dicembre 2026 secondo la pagina delle ferie.

## Numeri della salute

| Numero | Dato | Fonte | Stato |
|---|---|---|---|
| Emergenza | 112 e 118 | numeri nazionali | mostrati in cima a «Serve un medico?» |
| Guardia medica di Mesagne | via Panareo 10, 0831 739312 | Carta dei Servizi ASL 2024 | mostrato |
| Orari della guardia medica | notti 20-8 (di persona fino alle 22:30); sabato e prefestivi 10-13 e 15:30-20; domenica e festivi 8-13 e 15:30-20 | ASL Brindisi (PugliaSalute), riportati da Brindisi Time il 14/7/2024 | mostrati con «Orari da confermare» |
| 116117 | numero europeo per cure non urgenti | Regione Puglia, agosto 2026 | non mostrato finché non è attivo per Brindisi (`usa116117` in `numeri.json`) |
| Pronto soccorso | ospedale Perrino, Brindisi, 0831 537510 | Carta dei Servizi ASL 2024 | mostrato, da confermare con una telefonata |
| CUP | 800 888 388 da fisso, 080 9181603 da cellulare, lun-ven 8-19 | Carta dei Servizi ASL 2024 | mostrato; la Carta in alcune schede indica una pausa tra le 14 e le 15: l'app scrive «di solito» |
| Sportello CUP Mesagne | via Panareo 12, lun-ven 7:30-12:30 e 15-17:30 | Carta dei Servizi ASL 2024 | mostrato |
| Centro prelievi Mesagne | 0831 739403, prelievi lun-ven 7:30-9:45 | Carta dei Servizi ASL 2024 | mostrato |
| Punto di primo intervento Mesagne | via Panareo 8 (tramite 118) | Carta dei Servizi ASL 2024 | **non mostrato**: non sappiamo se è ancora attivo |

Esiste una Carta dei Servizi ASL Brindisi più recente, prodotta il 19/05/2025, ma il 10/10/2026 il
sito della Regione non rispondeva: i numeri sono confrontati con l'edizione 2024 e vanno
ricontrollati sulla nuova appena si riesce a scaricarla.

## Cose ancora incerte

1. **Ora del cambio del turno.** La legge regionale dice che il servizio notturno va dalle 20
   alle 8:30; farmaciediturno.org mostra il turno «dalle 8 fino a domani». Non è confermato
   dall'Ordine per Mesagne: tra mezzanotte e le 8:30 l'app mostra entrambe le farmacie.
2. **Notte «a chiamata».** Per la legge regionale, nei comuni sotto i 40.000 abitanti il servizio
   notturno è «a chiamata» (art. 6) e il farmacista arriva entro 30 minuti (art. 10). Anche nella
   pausa di pranzo, nei comuni da 25.000 a 40.000 abitanti, il turno è «a battenti chiusi o a
   chiamata» (art. 3). Da confermare quale numero risponde di notte (il fisso della farmacia o
   quello scritto sul cartello): l'app dice di provare il cartello se il fisso non risponde.
3. Orari della guardia medica (presi da un articolo che cita l'ASL) e data di partenza del 116117
   a Brindisi (la Regione parla di sperimentazione «in autunno», con la centrale all'ASL di Lecce).
4. Numero del pronto soccorso del Perrino (dalla Carta dei Servizi del 2024).
5. Civici di Antonucci (69 o 68) e Ricupero (75 o 73).
6. Orari invernali di Alioth e Spalletta (date scadute nell'albo) e data di fine di quello di
   Nocera (anno sbagliato). Spalletta: confermare che è la farmacia che nella Carta ASL 2024 era
   «Savino, via R. Antonucci 46, 0831 738155». Per le farmacie senza date nell'albo, l'app ordina gli
   orari con l'ora legale (cambio a fine marzo e a fine ottobre), come le date scritte nell'albo.
7. Riuso dei dati dell'Ordine in un servizio con parti a pagamento: da chiedere all'Ordine
   (info@ordinefarmacistibrindisi.it) prima di vendere i servizi a pagamento.
