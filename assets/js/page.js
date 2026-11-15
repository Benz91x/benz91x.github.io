/* =====================================================================
   Alessandro Chiri · comportamento della pagina (oltre al kit della taste-skill)
   - lingua IT/EN: l'italiano è nell'HTML, l'inglese qui sotto. Il testo
     inglese si applica prima che partano i moduli del kit (questo script è
     "defer" e viene prima di loro), così i momenti animati leggono già le
     parole giuste; il cambio di lingua ricarica la pagina con ?lang=.
   - analytics GoatCounter (spento finché GC_CODE è "TUOCODICE")
   - contatore visite Abacus, mostrato oltre le 1000
   Senza JavaScript la pagina è completa, in italiano.
   ===================================================================== */
(function () {
  "use strict";

  var GC_CODE = "TUOCODICE"; // <-- codice GoatCounter (vedi ISTRUZIONI-ANALYTICS.md)
  var COUNTER = "https://abacus.jasoncameron.dev";
  var COUNTER_KEY = "benz91x.github.io/visite";
  var PREVIEW = /\/anteprima\//.test(location.pathname) || /netlify\.app$/.test(location.hostname);

  var root = document.documentElement;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Testi inglesi ---------- */
  var EN = {
    "skip": "Skip to content",
    "nav.label": "Main",
    "nav.work": "Work",
    "nav.g1": "Consulting",
    "nav.g1a": "AI-assisted startup scouting",
    "nav.g1b": "Career",
    "nav.g1bs": "Deloitte, Micro Focus, Accenture",
    "nav.g1c": "Skills",
    "nav.g1cs": "Tools and certifications",
    "nav.g2": "Projects",
    "nav.g2a": "Apps for local residents",
    "nav.g2as": "Three free web apps",
    "nav.g2b": "Publications",
    "nav.g2bs": "Paper, book, talk",
    "nav.cardAlt": "The Farmacia di turno Mesagne app in dark mode, showing the pharmacy on duty right now",
    "nav.cardLine": "Live since 11 October 2026",
    "nav.app": "Apps",
    "nav.pub": "Publications",
    "nav.skills": "Skills",
    "nav.lang": "Italiano",
    "nav.langLabel": "Leggi la pagina in italiano",
    "nav.langCode": "it",
    "nav.langHref": "?lang=it",
    "cta": "Send me an email",

    "hero.kicker": "<span class=\"dot\" aria-hidden=\"true\"></span>Alessandro Chiri, open to new opportunities",
    "hero.h1": "Digital transformation consultant",
    "hero.lead": "I support companies and public bodies in innovation projects, from requirements to release. Since 2018 at Accenture, Micro Focus and now Deloitte NextHub.",
    "hero.cv": "Download my CV",
    "hero.alt": "Portrait of Alessandro Chiri",
    "hero.fRow": "Available",
    "hero.fWhere": "Bari or Milan",
    "hero.fTitle": "Senior Consultant or Manager roles",

    "pr.label": "Profile",
    "pr.text": "I get business and technology talking: I gather what decision-makers need, turn it into specifications for technical teams and follow every project through to the <strong>results</strong>.",

    "nh.h2": "Startup scouting on NextHub",
    "nh.s1t": "Gather client needs",
    "nh.s1": "Each need of a company or public body becomes an initiative, which the platform matches against its database of startups.",
    "nh.s1a": "Diagram of NextHub: data preparation, semantic matching and decision support",
    "nh.s2t": "Assess the proposed startups",
    "nh.s2": "The recommendation engine gives every startup an affinity score; I analyse and validate the most relevant solutions.",
    "nh.s2a": "NextHub matchmaking table with affinity score, explanation and feedback status",
    "nh.s3t": "Explain the choices to management",
    "nh.s3": "For every match the platform writes an explanation, which I turn into one-pagers and analyses for decision-makers.",
    "nh.s3a": "NextHub window explaining why a startup is relevant to an initiative",

    "xp.h2": "Career since 2018",
    "xp.lead": "Always between business and IT, from functional analysis to consulting.",
    "xp.1n": "Consultant, Deloitte NextHub",
    "xp.1": "Open innovation on xTech/NextHub: scouting, matchmaking and public funding.",
    "xp.1v": "2024 – now",
    "xp.2": "Through Experis Italia: ALM, UFT One and UFT Mobile, including at Enel.",
    "xp.3": "Requirements, processes and KPIs in Agile projects, in Rome.",
    "xp.4n": "BSc in Industrial Engineering",
    "xp.4": "University of Salento.",
    "xp.5n": "Technical diploma in industrial engineering",
    "xp.5": "I.T.I.S. “G. Giorgi”, mechanics.",

    "app.h2": "Three free apps for local residents",
    "app.lead": "I designed and built them in my spare time, using official data sources: no account needed, and they work offline.",
    "app.1": "What to put out tonight, in town or in the countryside, and more than 400 items to search. <a class=\"link\" href=\"https://benz91x.github.io/differenziata-san-vito-dei-normanni/\">Open the app</a>",
    "app.2": "Today’s, yesterday’s and tomorrow’s collection, with Thursday’s switch between glass and paper. <a class=\"link\" href=\"https://benz91x.github.io/differenziata-mesagne/\">Open the app</a>",
    "app.3": "Which of the eight pharmacies is on duty right now, one tap away from a call. <a class=\"link\" href=\"https://benz91x.github.io/farmacia-di-turno-mesagne/\">Open the app</a>",
    "app.open": "Open the app",
    "app.1v": "October 2026",
    "app.2v": "October 2026",
    "app.3v": "October 2026",
    "app.1a": "The Differenziata San Vito dei Normanni app: the choice between town and countryside and the waste to put out tonight",
    "app.2a": "The Differenziata Mesagne app: today’s, yesterday’s and tomorrow’s collection",
    "app.3a": "The Farmacia di turno Mesagne app: the pharmacy on duty now, with its address and a button to call it",
    "app.press": "In the press (in Italian)",
    "app.p1": "Qui Mesagne, article of 6 October 2026",
    "app.p2": "BrindisiReport, article of 7 October 2026",

    "pub.h2": "Publications and talks",
    "pub.lead": "A research paper on the platform I work on, a book written out of passion and a talk as a speaker.",
    "pub.1a": "Information, an MDPI journal",
    "pub.1t": "Paper on NextHub in Information",
    "pub.1": "MDPI, September 2026, open access. I ran the performance tests and the cross-language consistency tests.",
    "pub.1l": "Read the paper",
    "pub.2a": "Cover of the book Storia dei Videogiochi",
    "pub.2t": "Book: “Storia dei Videogiochi”",
    "pub.2": "Seventy years of video games, from the beginnings to today: my first book, a Kindle ebook in Italian.",
    "pub.2l": "See the book on Amazon",
    "pub.3t": "Talk at MicroCyber, Bari",
    "pub.3": "20 March 2026, for Deloitte: digital innovation and cybersecurity for SMEs, before business owners and experts.",
    "pub.3l": "Read the news (in Italian)",
    "pub.qd": "March 2026",

    "sk.h2": "Skills and certifications",
    "sk.lead": "The tools I use on projects, how I work and four Micro Focus certifications.",
    "sk.1n": "Software quality",
    "sk.1": "Certified on UFT One 15, LoadRunner 2020, ALM/Quality Center 15 and Mobile Center 2.",
    "sk.2n": "Analysis and processes",
    "sk.2": "Requirements, process modelling, Agile and Scrum.",
    "sk.3n": "Communication for management",
    "sk.3": "One-pagers, business cases and presentations.",
    "sk.4n": "Public funding",
    "sk.4": "Analysis of calls for funding and financing opportunities.",
    "sk.5n": "Languages",
    "sk.5": "Italian native, English B2 (EF SET).",
    "ab.label": "Quick actions",

    "close.h2": "Looking for a new consulting role",
    "close.line": "Senior Consultant, Manager or Senior Business Analyst, in Bari or Milan, hybrid or remote.",
    "f.work": "Work",
    "f.xp": "Career",
    "f.proj": "Projects",
    "f.app": "Apps for local residents",
    "f.pub": "Publications",
    "f.prof": "Profile",
    "f.skills": "Skills",
    "f.cv": "CV as PDF",
    "f.contact": "Contact",
    "f.note": "The apps are unofficial services: the municipalities and the Brindisi Order of Pharmacists are the official sources.",
    "f.credits": "NextHub figures from Fasciano et al., Information 2026 (CC BY 4.0). Names and logos are trademarks of their owners."
  };
  var DYN = { it: { visits: "Visite" }, en: { visits: "Visits" } };
  var TITLE_EN = "Alessandro Chiri, digital transformation consultant";
  var DESC_EN = "Consultant at Deloitte NextHub. Since 2018 on enterprise and innovation projects at Accenture, Micro Focus and Deloitte: career, projects, publications and CV.";

  var lang = root.getAttribute("data-lang") === "en" ? "en" : "it";

  function applyEnglish() {
    $$("[data-i18n]").forEach(function (el) {
      var v = EN[el.getAttribute("data-i18n")];
      if (v !== undefined) el.innerHTML = v;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var kv = pair.split(":"), v = EN[kv[1]];
        if (v !== undefined) el.setAttribute(kv[0], v);
      });
    });
    /* the tools diagram reads its labels from its JSON when diagrams/mount.js runs, after this script */
    $$('.dg[data-diagram] > script[type="application/json"]').forEach(function (s) {
      s.textContent = s.textContent
        .replace("Gli strumenti che uso nei progetti: Jira, Confluence, Excel, SQL, Python e Apache JMeter", "The tools I use on projects: Jira, Confluence, Excel, SQL, Python and Apache JMeter")
        .replace('"Progetti"', '"Projects"').replace('"Excel e VBA"', '"Excel and VBA"');
    });
    document.title = TITLE_EN;
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", DESC_EN);
  }

  /* il cambio di lingua ricarica la pagina: i momenti animati (parole divise
     in <span>, passi fissati allo scroll) ripartono con il testo giusto */
  function toggleLang() {
    var next = lang === "it" ? "en" : "it";
    store("ac-lang", next);
    try {
      var u = new URL(location.href);
      u.searchParams.set("lang", next);
      location.replace(u.href);
    } catch (e) { location.reload(); }
  }

  /* ---------- Analytics (GoatCounter, opzionale) ---------- */
  function initAnalytics() {
    if (PREVIEW || GC_CODE === "TUOCODICE") return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + GC_CODE + ".goatcounter.com/count");
    document.head.appendChild(s);

    var q = [], ready = false;
    function flush() { if (!window.goatcounter || !window.goatcounter.count) return; ready = true; while (q.length) window.goatcounter.count(q.shift()); }
    var poll = setInterval(function () { flush(); if (ready) clearInterval(poll); }, 400);
    setTimeout(function () { clearInterval(poll); }, 15000);
    function ev(p, title) { var o = { path: p, title: title || p, event: true }; if (ready) window.goatcounter.count(o); else q.push(o); }

    var hit = {};
    addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - innerHeight; if (max <= 0) return;
      var pct = (window.scrollY || 0) / max * 100;
      [25, 50, 75, 100].forEach(function (m) { if (!hit[m] && pct >= m - 0.5) { hit[m] = true; ev("scroll-" + m, "Scroll " + m + "%"); } });
    }, { passive: true });
    [[15, "15s"], [30, "30s"], [60, "1min"], [180, "3min"]].forEach(function (x) {
      setTimeout(function () { ev("tempo-" + x[1], "Permanenza " + x[1]); }, x[0] * 1000);
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null; if (!a) return;
      var h = (a.getAttribute("href") || "").toLowerCase();
      if (h.indexOf(".pdf") > -1) ev("download-cv", "Download CV PDF");
      else if (h.indexOf("mailto:") === 0) ev("click-email", "Click Email");
      else if (h.indexOf("linkedin.") > -1) ev("click-linkedin", "Click LinkedIn");
      /* prima di "github.": le app stanno su benz91x.github.io */
      else if (h.indexOf("github.io/differenziata-") > -1) ev("click-app-" + (h.indexOf("mesagne") > -1 ? "mesagne" : "sanvito"), "Click app Differenziata");
      else if (h.indexOf("github.io/farmacia-di-turno-") > -1) ev("click-app-farmacia", "Click app Farmacia di turno");
      else if (h.indexOf("github.") > -1) ev("click-github", "Click GitHub");
      else if (h.indexOf("amazon.") > -1) ev("click-libro", "Click libro su Amazon");
      else if (h.indexOf("mdpi.com") > -1 || h.indexOf("doi.org") > -1) ev("click-articolo", "Click articolo MDPI");
      else if (h.indexOf("quimesagne.it") > -1) ev("click-stampa", "Click articolo Qui Mesagne");
      else if (h.indexOf("brindisireport.it") > -1) ev("click-stampa-brindisireport", "Click articolo BrindisiReport");
      else if (h.indexOf("confapi") > -1) ev("click-confapi", "Click intervento Confapi");
    }, true);
    try {
      var sp = new URLSearchParams(location.search), src = sp.get("ref") || sp.get("utm_source");
      if (src) { src = src.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 40); if (src) ev("fonte-" + src, "Candidatura: " + src); }
    } catch (err) {}
  }

  /* ---------- Contatore visite (compare oltre le 1000) ---------- */
  function initVisits() {
    var el = document.querySelector(".visits"); if (!el || !window.fetch) return;
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    fetch(COUNTER + (PREVIEW ? "/get/" : "/hit/") + COUNTER_KEY, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { clearTimeout(to); return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || typeof j.value !== "number" || j.value < 1000) return;
        el.textContent = DYN[lang].visits + ": " + j.value.toLocaleString(lang === "en" ? "en-US" : "it-IT");
        el.hidden = false;
      })
      .catch(function () {});
  }

  /* le schermate delle app nascoste (peek-list) partono lazy; a pagina caricata si
     scaricano, così il cambio di immagine al passaggio sulla riga è immediato */
  addEventListener("load", function () {
    setTimeout(function () {
      $$('img[data-peek-for][loading="lazy"]').forEach(function (im) { im.loading = "eager"; });
    }, 1500);
  });

  if (lang === "en") applyEnglish();
  $$('[data-action="lang"]').forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); toggleLang(); }); });
  initAnalytics();
  initVisits();
})();
