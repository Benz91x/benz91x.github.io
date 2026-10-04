/* =====================================================================
   Alessandro Chiri — digital résumé v4 · comportamento della pagina
   Lingua IT/EN, tema, menu, scene guidate dallo scroll, comparse,
   galleria, contatori, analytics (GoatCounter opzionale).
   Tutto è progressivo: senza JS la pagina è completa e leggibile.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Configurazione ---------- */
  var GC_CODE = "TUOCODICE"; // <-- codice GoatCounter (vedi ISTRUZIONI-ANALYTICS.md)
  var COUNTER = "https://api.counterapi.dev/v1/benz91x-alessandro-chiri/visite";
  var PREVIEW = /\/anteprima\//.test(location.pathname);

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = mqReduce.matches;
  /* animazioni guidate dallo scroll calcolate dal browser (vedi <head> e site.css) */
  var sda = root.classList.contains("sda");
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Testi inglesi (l'italiano è nell'HTML) ---------- */
  var EN = {
    "a11y.skip": "Skip to content",
    "a11y.sections": "Sections",
    "a11y.lang": "Passa all'italiano",
    "a11y.theme": "Toggle light or dark theme",
    "a11y.menuOpen": "Open menu",
    "a11y.numbers": "Key figures",
    "a11y.gallery": "Projects: scroll horizontally",
    "a11y.prev": "Previous project",
    "a11y.next": "Next project",
    "a11y.cities": "Choose a city",
    "a11y.langs": "Languages",
    "a11y.areas": "Areas",
    "nav.profile": "Profile", "nav.journey": "Experience", "nav.projects": "Projects",
    "nav.where": "Cities", "nav.side": "Side projects", "nav.pubs": "Publications", "nav.skills": "Skills", "nav.contact": "Contact",
    "nav.cta": "Get in touch", "nav.lang": "IT",
    "menu.lang": "Italiano", "menu.theme": "Light / dark theme",
    "hero.badge": "Open to new opportunities",
    "hero.sub": "I support companies and public bodies in innovation and digital transformation projects.",
    "hero.cta1": "Get in touch",
    "hero.cta2": "Download CV",
    "hero.alt": "Portrait of Alessandro Chiri",
    "hero.cap": "Milan / Bari · 2026",
    "hero.k1": "Since 2018", "hero.k1s": "on enterprise projects",
    "hero.k2": "Big 4, utilities, public sector", "hero.k2s": "project environments",
    "hero.k3": "Business and IT", "hero.k3s": "from requirements to release",
    "hero.k4s": "scouting and technology transfer",
    "st.eyebrow": "Profile",
    "st.text": "Since 2018 I have worked on enterprise projects, across consulting and software: Accenture, Micro Focus and now Deloitte NextHub. My role is to connect business and technology, from understanding needs through to results.",
    "n.1": "years of professional experience",
    "n.2": "international organizations: Accenture, Micro Focus and Deloitte",
    "n.3": "Micro Focus professional certifications",
    "n.4": "working languages: Italian and English",
    "p.label": "Strengths",
    "p.title": "Three areas where I add value.",
    "p.intro": "A profile that combines business and technology: a consulting approach, attention to data, and the ability to bring business stakeholders, IT teams and vendors together.",
    "p.c1.s": "End-to-end management",
    "p.c1.t": "Projects followed from kickoff to release.",
    "p.c1.b": "Planning and tracking of activities, coordination of cross-functional teams, KPIs and reporting that provide continuous visibility on progress, risks and priorities.",
    "p.c2.s": "From requirement to release",
    "p.c2.t": "The link between business and IT.",
    "p.c2.b": "Gathering and formalizing requirements, configuring platforms, validating releases. I translate stakeholder needs into clear specifications for technical teams, and vice versa.",
    "p.c3.s": "Decision support",
    "p.c3.t": "Communication for management.",
    "p.c3.b": "One-pagers, business cases, presentations and dashboards: clear summaries, verified data and action-oriented recommendations.",
    "x.label": "Experience",
    "x.title": "From 2018 to today.",
    "x.intro": "From functional analysis at Accenture to application support at Micro Focus, to consulting at Deloitte NextHub.",
    "x.1.p": "2024 — today",
    "x.cur": "Current role",
    "x.1.b": "Open innovation and technology transfer projects on the xTech / NextHub platform, built around an AI-based recommendation engine: scouting of innovative solutions, matchmaking with client needs, one-pagers and analysis for management. Support for business development and public funding activities.",
    "x.1.c2": "Scouting and matchmaking", "x.1.c3": "Public funding",
    "x.2.m": "Enterprise software",
    "x.2.at": "Micro Focus · via Experis Italia",
    "x.2.b": "Specialist support on Micro Focus ADM solutions (ALM, UFT One, UFT Mobile), including the custom Spring Q-Cent platform at Enel: configuration and customization, technical troubleshooting, release testing and validation, documentation and user training.",
    "x.3.m": "Consulting",
    "x.3.b": "Analysis of user needs and translation into functional requirements, process modelling, KPI analysis and coordination with developers, project managers and subject-matter experts on Agile projects for large clients.",
    "x.3.c1": "Requirements analysis", "x.3.c3": "Process modelling",
    "j.label": "Selected projects",
    "j.title": "Three representative projects.",
    "j.k1": "Context", "j.k2": "Activities", "j.k3": "Results",
    "j.c1.tag": "Open innovation",
    "j.c1.t": "xTech / NextHub: startup scouting for companies and the public sector",
    "j.c1.v1": "Identifying, among many candidate startups, the solutions that best fit the needs of companies and public bodies.",
    "j.c1.v2": "Platform management, definition of evaluation criteria, matchmaking with the AI-based recommendation engine, one-pagers for management.",
    "j.c1.v3": "Structured, traceable scouting; faster and better-documented decisions.",
    "j.c2.tag": "Software quality",
    "j.c2.t": "ALM and testing platform for a major energy utility",
    "j.c2.v1": "Ensuring quality and operational continuity across a critical application portfolio.",
    "j.c2.v2": "Configuration of the Micro Focus suite (ALM, UFT One, LoadRunner), incident management, support for test cycles.",
    "j.c2.v3": "More stable releases and greater stakeholder confidence in change processes.",
    "j.c3.tag": "Data and automation",
    "j.c3.t": "Project reporting automation",
    "j.c3.v1": "Time-consuming manual analyses supporting project decisions.",
    "j.c3.v2": "Automated Excel and VBA reports, standard templates for KPIs and milestones.",
    "j.c3.v3": "Less manual work, consistent reporting and greater visibility for project managers and sponsors.",
    "g.label": "Locations and projects",
    "g.title": "Where I have worked.",
    "g.sub": "Milan, Rome and Bari: open innovation, enterprise software and applied research.",
    "g.c0": "Milan", "g.c1": "Rome",
    "g.n0": "Open innovation · Ventures",
    "g.n1": "Utilities · Energy · Public funding",
    "g.n2": "Research · Technology transfer",
    "g.cl": "Organizations",
    "g.hint": "Scroll to explore",
    "sp.label": "Side projects",
    "sp.title": "Two apps for local residents.",
    "sp.intro": "In my spare time I designed and built two free web apps that tell residents of San Vito dei Normanni and Mesagne what to put out for collection each day. They are made for everyone, including people who are less comfortable with smartphones.",
    "sp.type": "Free web app in&nbsp;Italian&nbsp;· Apulia, Italy",
    "sp.k1": "Sources", "sp.k2": "Live since",
    "sp.open": "Open the app",
    "sp.code": "Source code",
    "sp.sv.alt": "The Differenziata San Vito dei Normanni app on a smartphone: the choice between town and countryside and, front and centre, the waste to put out tonight.",
    "sp.sv.lede": "In the countryside, Friday’s collection depends on the week of the month. The app starts from the question that matters most: what to put out tonight, in town or in the countryside.",
    "sp.sv.f1t": "“Where does it go?”", "sp.sv.f1": "More than 400 items: search for one and the app tells you which collection it goes in.",
    "sp.sv.f2t": "Collection centre.", "sp.sv.f2": "Opening hours, and whether it is open right now.",
    "sp.sv.f3t": "Monthly calendar.", "sp.sv.f3": "Every collection, with public holidays flagged.",
    "sp.sv.f4t": "Larger text.", "sp.sv.f4": "One button enlarges the text, set in a highly legible typeface.",
    "sp.sv.v1": "Teknoservice and the municipality", "sp.sv.v2": "4 October 2026",
    "sp.me.alt": "The Differenziata Mesagne app on a smartphone: today’s collection front and centre, yesterday’s and tomorrow’s, and this week’s calendar.",
    "sp.me.lede": "On Thursdays, glass and metals alternate with paper and cardboard depending on the week of the month. The app shows today’s, yesterday’s and tomorrow’s collections at a glance.",
    "sp.me.f1t": "This week.", "sp.me.f1": "Every collection, day by day.",
    "sp.me.f2t": "What goes where.", "sp.me.f2": "A list for each collection, from organic to residual waste.",
    "sp.me.f3t": "Collection centre.", "sp.me.f3": "Address on Via Marangio and opening hours for every day.",
    "sp.me.f4t": "Bulky waste.", "sp.me.f4": "The numbers to book a pickup, one of them also on WhatsApp.",
    "sp.me.v1": "Gial&nbsp;Ambiente and the municipality", "sp.me.v2": "2 October 2026",
    "sp.c.s": "How they are built",
    "sp.c.t": "Lean by design.",
    "sp.c.1t": "Official data sources.", "sp.c.1": "Schedules, opening hours and phone numbers from the waste collection operators and the municipalities.",
    "sp.c.2t": "Offline and installable.", "sp.c.2": "They work without a connection and can be added to the home screen like an app (PWA).",
    "sp.c.3t": "Free, no account needed.", "sp.c.3": "No ads, no sign-up, no analytics scripts.",
    "sp.c.4t": "Lightweight.", "sp.c.4": "HTML, CSS and JavaScript in a single file, with no frameworks, hosted on GitHub Pages.",
    "sp.lh.1": "Performance", "sp.lh.2": "Accessibility", "sp.lh.3": "Best Practices",
    "sp.lh.cap": "Measured on the live site on 4 October 2026, median of three runs.",
    "sp.lh.vit": "LCP 1.2&nbsp;s · CLS&nbsp;0",
    "sp.note": "Unofficial information services, built in a personal capacity: for any schedule changes, each municipality’s announcements take precedence.",
    "u.label": "Publications",
    "u.title": "Research and writing.",
    "u.intro": "A scientific article on the platform I work on, and a book written out of passion.",
    "u.p.type": "Scientific article · Open access",
    "u.p.meta": "<cite>Information</cite> (MDPI), vol. 17, issue 10, art. 950 · published on 25 September 2026",
    "u.p.body": "The article presents NextHub, the open innovation platform that uses artificial intelligence to match corporate initiatives with the most relevant innovative solutions, through a semantic, multilingual recommendation engine.",
    "u.p.mine": "My contribution",
    "u.p.s1t": "Performance testing.",
    "u.p.s1": "Frontend measured with Google Lighthouse across eight user journeys and backend with Apache JMeter: all 1,794 HTTP requests passed, with mean response times under 2 seconds.",
    "u.p.s3t": "Cross-lingual stability.",
    "u.p.s3": "Checking that recommendations stay consistent when descriptions are written in different languages: the analysis confirms high semantic consistency across multilingual datasets.",
    "u.p.link": "Read the article",
    "u.b.type": "Book · Ebook",
    "u.b.body": "My first book, written out of passion: seventy years of video game history, from the beginnings to today.",
    "u.b.k1": "Format", "u.b.v1": "Kindle ebook",
    "u.b.k2": "Language", "u.b.v2": "Italian",
    "u.b.k3": "Available on",
    "u.b.link": "View on Amazon",
    "s.label": "Skills",
    "s.title": "Technical and consulting skills.",
    "s.h": "Technology",
    "s.h.note": "Platforms, data, software quality",
    "s.t1t": "Testing and QA",
    "s.t2": "Configuration and support",
    "s.t3": "Open innovation platform with an AI-based recommendation engine",
    "s.t4t": "Data and automation",
    "s.t4": "Advanced Excel, VBA, SQL, Python",
    "s.t5t": "Project management",
    "s.c": "Consulting",
    "s.c.note": "Method, relationships, communication",
    "s.c1t": "Requirements analysis", "s.c1": "Gathering, formalization and process analysis",
    "s.c2t": "Stakeholder management", "s.c2": "Communication with management",
    "s.c3": "Working in cross-functional teams",
    "s.c4t": "Decision-ready deliverables", "s.c4": "One-pagers, presentations, executive summaries",
    "s.c6t": "Public funding", "s.c6": "Analysis of calls for proposals and funding opportunities",
    "s.c5": "Workshops and training",
    "s.l1k": "Italian", "s.l1v": "Native", "s.l2k": "English",
    "e.label": "Education",
    "e.title": "Education and certifications.",
    "e.c1.k": "Studies",
    "e.c1.a": "Bachelor’s degree in Industrial Engineering (L-9)",
    "e.c1.b": "Technical high school diploma, mechanical specialization",
    "e.c2.x": "Continuing education in Agile, cybersecurity, Power BI, public speaking and digital writing.",
    "c.label": "Contact",
    "c.title": "Open to new professional opportunities.",
    "c.text": "I am interested in Senior Consultant or Manager roles in management consulting and digital transformation, at consulting firms, companies or scale&#8209;ups. The sectors where I have the most experience are energy &amp; utilities, industry and the public sector.",
    "c.b1": "Contact me by email",
    "c.cv": "Download CV (PDF)",
    "c.a.1k": "Roles", "c.a.2k": "Sectors", "c.a.3k": "Location",
    "c.a.2v": "Energy &amp; utilities · Industry · Public sector · Technology",
    "c.a.3v": "Italy (Bari or Milan) · hybrid or remote work, including across the EU",
    "f.crumb": "Professional profile",
    "f.h1": "Sections", "f.h2": "Contact", "f.h3": "Profile", "f.h4": "Apps for residents",
    "f.app1": "San Vito dei Normanni waste collection calendar",
    "f.app1t": "Free app with the waste collection calendar for San Vito dei Normanni (in Italian)",
    "f.app2": "Mesagne waste collection calendar",
    "f.app2t": "Free app with the waste collection calendar for Mesagne (in Italian)",
    "f.cv": "CV (PDF)", "f.where": "Italy · hybrid or remote work",
    "f.ver": "Last updated: October 2026.",
    "f.top": "Back to top"
  };
  /* testi generati da JS, in entrambe le lingue */
  var DYN = {
    it: { menuOpen: "Apri il menu", menuClose: "Chiudi il menu", visits: "Visite" },
    en: { menuOpen: "Open menu", menuClose: "Close menu", visits: "Visits" }
  };

  var lang = root.getAttribute("data-lang") === "en" ? "en" : "it";
  function t(k) { return DYN[lang][k]; }
  var listeners = { lang: [], theme: [] };
  function emit(n) { listeners[n].forEach(function (f) { try { f(); } catch (e) {} }); }

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function splitWords() {
    $$("[data-words]").forEach(function (el) {
      var text = el.textContent.replace(/\s+/g, " ").trim();
      var words = text.split(" "), tot = words.length + 7;
      el.innerHTML = '<span class="sr-only"></span><span aria-hidden="true"></span>';
      el.firstChild.textContent = text;
      el.lastChild.innerHTML = words.map(function (w, i) {
        /* con le animazioni guidate dallo scroll ogni parola ha il suo tratto
           (stessa curva della formula CSS usata con --p) */
        var range = sda ? ";animation-range:contain " + ((i + 1.66) / tot * 100).toFixed(2) +
          "% contain " + ((i + 2.5) / tot * 100).toFixed(2) + "%" : "";
        return '<span class="w" style="--i:' + i + range + '">' + esc(w) + "</span>";
      }).join(" ");
      el.style.setProperty("--n", words.length);
    });
  }

  function applyLang(l) {
    lang = l;
    root.lang = l;
    root.setAttribute("data-lang", l);
    $$("[data-i18n]").forEach(function (el) {
      if (el.__it === undefined) el.__it = el.innerHTML;
      var v = l === "en" ? EN[el.getAttribute("data-i18n")] : undefined;
      el.innerHTML = v !== undefined ? v : el.__it;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var kv = pair.split(":"), attr = kv[0], key = kv[1], k = "__it_" + attr;
        if (el[k] === undefined) el[k] = el.getAttribute(attr) || "";
        var v = l === "en" ? EN[key] : undefined;
        el.setAttribute(attr, v !== undefined ? v : el[k]);
      });
    });
    splitWords();
    if (root.__title === undefined) root.__title = document.title;
    document.title = l === "en" ? "Alessandro Chiri — Consultant in digital transformation" : root.__title;
    var mb = $(".nav__menu");
    if (mb) mb.setAttribute("aria-label", t(mb.getAttribute("aria-expanded") === "true" ? "menuClose" : "menuOpen"));
    emit("lang");
  }
  function toggleLang() {
    applyLang(lang === "it" ? "en" : "it");
    store("ac-lang", lang);
    try {
      var u = new URL(location.href);
      if (u.searchParams.has("lang")) { u.searchParams.set("lang", lang); history.replaceState(null, "", u); }
    } catch (e) {}
  }

  /* ---------- Tema ---------- */
  var mqDark = matchMedia("(prefers-color-scheme: dark)");
  function theme() { return root.getAttribute("data-theme") || (mqDark.matches ? "dark" : "light"); }
  function paintThemeColor() {
    var c = theme() === "dark" ? "#000000" : "#ffffff";
    $$('meta[name="theme-color"]').forEach(function (m) {
      if (root.getAttribute("data-theme")) m.setAttribute("content", c);
    });
  }
  function toggleTheme() {
    var next = theme() === "dark" ? "light" : "dark";
    var go = function () { root.setAttribute("data-theme", next); store("ac-theme", next); paintThemeColor(); emit("theme"); };
    if (document.startViewTransition && !reduced) document.startViewTransition(go); else go();
  }

  /* ---------- Scene guidate dallo scroll ----------
     Un solo requestAnimationFrame per fotogramma coordina tutto ciò che
     segue lo scroll: barra di navigazione, scene e globo, nell'ordine
     giusto e senza doppioni. Le posizioni delle sezioni si misurano solo
     quando il layout cambia (dimensioni, font, lingua): durante lo scroll
     si legge soltanto scrollY, quindi nessun ricalcolo di layout forzato,
     e si scrive solo ciò che è cambiato. Dove il browser supporta le
     animazioni guidate dallo scroll (classe "sda") ritratto, testo del
     profilo e linea del percorso li calcola il CSS sul compositore. */
  var scenes = [], loops = [], darks = [], navEl = null, stuck = null, navDark = null;
  var vh = window.innerHeight, docH = 0, geoDirty = true, ticking = false;
  var sceneIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      for (var i = 0; i < scenes.length; i++) if (scenes[i].el === e.target) scenes[i].on = e.isIntersecting;
    });
    requestTick();
  }, { rootMargin: "25% 0px 25% 0px" }) : null;

  function scrollTop() { return window.scrollY || window.pageYOffset || 0; }
  function measureAll() {
    var sy = scrollTop(), i, r, s;
    vh = window.innerHeight;
    for (i = 0; i < scenes.length; i++) { s = scenes[i]; r = s.el.getBoundingClientRect(); s.top = r.top + sy; s.h = r.height; }
    for (i = 0; i < darks.length; i++) { s = darks[i]; r = s.el.getBoundingClientRect(); s.top = r.top + sy; s.bottom = r.bottom + sy; }
    docH = root.scrollHeight;
    geoDirty = false;
  }
  function progress(s, y) {
    var top = s.top - y, p;
    if (s.mode === "pin") p = -top / Math.max(1, s.h - vh);
    else if (s.mode === "enter") p = (vh - top) / (vh * 0.85);
    else if (s.mode === "center") p = (vh * 0.55 - top) / Math.max(1, s.h);
    else p = (vh - top) / (vh + s.h);
    return clamp(p, 0, 1);
  }
  function tick(now) {
    ticking = false;
    if (geoDirty) measureAll();
    var y = scrollTop(), i, s, p, again = false;
    if (navEl) {
      var st = y > 8;
      if (st !== stuck) { stuck = st; navEl.classList.toggle("is-stuck", st); }
      /* il vetro si adatta al contenuto sotto: scuro sopra i capitoli scuri */
      var yy = y + 24, d = false;
      for (i = 0; i < darks.length; i++) if (darks[i].top <= yy && darks[i].bottom >= yy) { d = true; break; }
      if (d !== navDark) { navDark = d; navEl.classList.toggle("nav--dark", d); }
    }
    for (i = 0; i < scenes.length; i++) {
      s = scenes[i];
      if (sceneIO && !s.on) continue;
      p = progress(s, y);
      if (p !== s.p && (s.p < 0 || p === 0 || p === 1 || Math.abs(p - s.p) > 0.0002)) {
        s.p = p;
        if (s.css) s.el.style.setProperty("--p", p.toFixed(4));
        if (s.cb) s.cb(p);
      }
    }
    for (i = 0; i < loops.length; i++) if (loops[i](now)) again = true;
    if (again) requestTick();
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  function relayout() { geoDirty = true; requestTick(); }
  function addScene(el, mode, cb, css) {
    var s = { el: el, mode: mode, cb: cb, css: css !== false, p: -1, on: true, top: 0, h: 0 };
    scenes.push(s);
    if (sceneIO) sceneIO.observe(el);
    relayout();
    return s;
  }
  addEventListener("scroll", requestTick, { passive: true });
  addEventListener("resize", relayout, { passive: true });
  addEventListener("load", relayout);
  if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* ---------- Avvio ---------- */
  function init() {
    applyLang(lang);
    paintThemeColor();
    mqDark.addEventListener && mqDark.addEventListener("change", function () { paintThemeColor(); emit("theme"); });

    $$('[data-action="lang"]').forEach(function (b) { b.addEventListener("click", toggleLang); });
    $$('[data-action="theme"]').forEach(function (b) { b.addEventListener("click", toggleTheme); });

    initNav();
    initMenu();

    /* senza animazioni guidate dallo scroll nel browser, le scene le muove il JS */
    if (!reduced && !sda) {
      $$("[data-scene]").forEach(function (el) {
        if (el.classList.contains("where__scroller")) return; /* gestita dal globo */
        addScene(el, el.getAttribute("data-scene"));
      });
    }
    tick(performance.now()); /* valori iniziali prima del primo disegno */

    initReveal();
    initCounters();
    initJourney();
    initGallery();
    idle(initAnalytics);
    idle(initVisits);
  }

  function idle(fn) { ("requestIdleCallback" in window) ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1200); }

  /* ---------- Nav: bordo quando incollata + sezione corrente ---------- */
  function initNav() {
    /* bordo e vetro scuro si aggiornano nel fotogramma comune (tick) */
    navEl = $("#nav");
    darks = $$(".section--dark").map(function (el) { return { el: el, top: 0, bottom: 0 }; });
    relayout();

    if (!("IntersectionObserver" in window)) return;
    var map = { top: null, profilo: "profilo", perche: "profilo", percorso: "percorso", progetti: "progetti",
                dove: "dove", "side-project": "side-project", pubblicazioni: "pubblicazioni", competenze: "competenze", formazione: "competenze", contatti: "contatti" };
    var links = $$(".nav__links a");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = map[e.target.id];
        links.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var btn = $(".nav__menu"), menu = $("#menu");
    if (!btn || !menu) return;
    $$(".menu__links a", menu).forEach(function (a, i) { a.style.setProperty("--i", i); });
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
        root.style.overflow = "hidden";
        var first = $("a", menu); if (first) first.focus({ preventScroll: true });
      } else {
        menu.classList.remove("is-open");
        menu.hidden = true;
        root.style.overflow = "";
      }
    }
    btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); }
    });
    matchMedia("(min-width: 64em)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  /* ---------- Comparse allo scroll ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduced || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contatori ---------- */
  function initCounters() {
    var els = $$("[data-count]");
    if (reduced || !("IntersectionObserver" in window)) return;
    els.forEach(function (el) { el.textContent = "0"; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, to = +el.getAttribute("data-count"), t0 = performance.now(), dur = 1400, shown = 0;
        (function step(now) {
          var k = clamp((now - t0) / dur, 0, 1), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (v !== shown) { shown = v; el.textContent = String(v); } /* testo toccato solo quando cambia la cifra */
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Percorso: anno in evidenza ---------- */
  function initJourney() {
    var roles = $$(".role"), years = $$(".journey__year");
    if (!roles.length) return;
    function setCurrent(role) {
      roles.forEach(function (r) { r.classList.toggle("is-current", r === role); });
      var y = role.getAttribute("data-year");
      years.forEach(function (el) { el.classList.toggle("is-active", el.getAttribute("data-year") === y); });
    }
    setCurrent(roles[0]);
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target); });
    }, { rootMargin: "-42% 0px -52% 0px" });
    roles.forEach(function (r) { io.observe(r); });
  }

  /* ---------- Galleria progetti ---------- */
  function initGallery() {
    $$("[data-gallery]").forEach(function (g) {
      var track = $(".gallery__track", g), cards = $$(".gcard", g), dots = $$(".gallery__dots span", g);
      var prev = $('.paddle[data-dir="-1"]', g), next = $('.paddle[data-dir="1"]', g);
      function step() { return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
      var raf = 0;
      function update() {
        raf = 0;
        var x = track.scrollLeft, max = track.scrollWidth - track.clientWidth;
        var i = clamp(Math.round(x / step()), 0, cards.length - 1);
        if (x >= max - 4) i = cards.length - 1;
        dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
        prev.disabled = x <= 4;
        next.disabled = x >= max - 4;
      }
      track.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      addEventListener("resize", update, { passive: true });
      [prev, next].forEach(function (b) {
        b.addEventListener("click", function () {
          track.scrollBy({ left: +b.getAttribute("data-dir") * step(), behavior: reduced ? "auto" : "smooth" });
        });
      });
      update();
    });
  }

  /* ---------- Analytics (GoatCounter, solo sul sito pubblicato) ---------- */
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
      var max = docH - vh; if (max <= 0) return; /* misure già in cache: nessun layout forzato */
      var pct = scrollTop() / max * 100;
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
      else if (h.indexOf("github.") > -1) ev("click-github", "Click GitHub");
      else if (h.indexOf("amazon.") > -1) ev("click-libro", "Click libro su Amazon");
      else if (h.indexOf("mdpi.com") > -1 || h.indexOf("doi.org") > -1) ev("click-articolo", "Click articolo MDPI");
    }, true);
    try {
      var sp = new URLSearchParams(location.search), src = sp.get("ref") || sp.get("utm_source");
      if (src) { src = src.toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 40); if (src) ev("fonte-" + src, "Candidatura: " + src); }
    } catch (err) {}
  }

  /* ---------- Contatore visite (compare oltre le 1000) ---------- */
  function initVisits() {
    var el = $(".visits"); if (!el || !window.fetch) return;
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 5000);
    var count = null;
    function paint() {
      if (count === null) return;
      el.textContent = t("visits") + ": " + count.toLocaleString(lang === "en" ? "en-US" : "it-IT");
      el.hidden = false;
    }
    fetch(COUNTER + (PREVIEW ? "" : "/up"), ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(to); if (typeof j.count === "number" && j.count >= 1000) { count = j.count; paint(); } })
      .catch(function () {});
    listeners.lang.push(paint);
  }

  /* ---------- API minima per il globo ---------- */
  window.AC = {
    scene: addScene,                                   /* progresso di una sezione */
    loop: function (f) { loops.push(f); requestTick(); }, /* disegno nel fotogramma comune; true = continua */
    kick: requestTick,
    sda: sda,
    reduced: function () { return reduced; },
    lang: function () { return lang; },
    on: function (n, f) { if (listeners[n]) listeners[n].push(f); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
