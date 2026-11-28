/*!
 * Magikarp Tycoon - Cookie-Clicker-Stil, aber mit Fisch.
 * Eigenstaendiges Modul: keine Abhaengigkeit auf Inline-Skripte der Seite.
 * Alle DOM-IDs sind ty-... damit nichts mit der restlichen Seite kollidiert.
 */
(function () {
  "use strict";

  /* ============================================================
     0. HILFSFUNKTIONEN
     ============================================================ */
  var $ = function (id) { return document.getElementById(id); };

  /** Zahl kompakt formatieren: 1.234.567 -> "1,23 Mio" */
  var UNITS = [
    [1e15, "Brd"], [1e12, "Bio"], [1e9, "Mrd"], [1e6, "Mio"]
  ];
  function fmt(n) {
    if (typeof n !== "number" || !isFinite(n)) return "0";
    var neg = n < 0;
    n = Math.abs(n);
    var out;
    if (n < 1000) {
      out = (n < 10 && Math.floor(n) !== n) ? n.toFixed(1).replace(".", ",") : String(Math.floor(n));
    } else if (n < 1e6) {
      out = Math.floor(n).toLocaleString("de-DE");
    } else if (n < 1e18) {
      out = null;
      for (var i = 0; i < UNITS.length; i++) {
        if (n >= UNITS[i][0]) {
          out = (n / UNITS[i][0]).toFixed(2).replace(".", ",") + " " + UNITS[i][1];
          break;
        }
      }
    } else {
      /* Ab 1e18 wird jede Einheit unlesbar - dann wissenschaftlich mit Komma. */
      out = n.toExponential(2).replace(".", ",").replace("e+", " \u00D7 10^");
    }
    if (out === null || out === undefined) out = Math.floor(n).toLocaleString("de-DE");
    return (neg ? "-" : "") + out;
  }

  /** Kaufmaengen-Zyklus wie in Cookie Clicker: 1 / 10 / 100 / Maximieren */
  function cyc(n) {
    var m = { 1: 10, 10: 100, 100: "max", max: 1 };
    return m[n] || 1;
  }

  var pad2 = function (v) { return (v < 10 ? "0" : "") + v; };

  /** Sekunden -> "2h 14m 03s" */
  function fmtDur(s) {
    if (!isFinite(s) || s < 0) return "-";
    s = Math.floor(s);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return h + "h " + pad2(m) + "m";
    if (m > 0) return m + "m " + pad2(sec) + "s";
    return sec + "s";
  }

  /* ============================================================
     1. SPIELDATEN - Cookie-Clicker-Formeln
     Cost(n) = base * 1.15^n
     ============================================================ */
  var COST_RATE = 1.15;

  /* Gebaeude: produzieren passiv. Kosten steigen um 15 % pro Stueck. */
  var BUILDINGS = [
    { id: "flosse",   icon: "\u{1F590}", name: "Flossen-Betrieb",     base: 15,        cps: 0.1,     desc: "Ein Magikarp wedelt zart. +0,1/s" },
    { id: "algen",    icon: "\u{1F33F}", name: "Algen-Farm",          base: 100,       cps: 1,       desc: "Grüne Sole, grünes Geld. +1/s" },
    { id: "teich",    icon: "\u{1F4A7}", name: "Schaum-Teich",        base: 1100,      cps: 8,       desc: "Sprudelt vor sich hin. +8/s" },
    { id: "rudel",    icon: "\u{1F420}", name: "Fisch-Rudel",         base: 12000,     cps: 47,      desc: "Schwarmarbeit lohnt sich. +47/s" },
    { id: "aquarium", icon: "\u{1FAD7}", name: "Glas-Aquarium",       base: 130000,    cps: 260,     desc: "Schau-Fisch mit Zuschauern. +260/s" },
    { id: "koralle",  icon: "\u{1FAB8}", name: "Korallen-Riff",       base: 1.4e6,     cps: 1400,    desc: "Hart, bunt, profitabel. +1,4K/s" },
    { id: "tiefsee",  icon: "\u{1F30A}", name: "Tiefsee-Anlage",      base: 1.4e7,     cps: 7800,    desc: "Druckfest und rentabel. +7,8K/s" },
    { id: "legende",  icon: "\u{1F409}", name: "Gyarados-Legende",    base: 1.4e8,     cps: 44000,   desc: "Ein Mythos arbeitet für dich. +44K/s" },
    { id: "ozean",    icon: "\u{1F30D}", name: "Welt-Ozean",          base: 1.4e9,     cps: 260000,  desc: "Sieben Meere, ein Besitzer. +260K/s" },
    { id: "kosmos",   icon: "\u{1F680}", name: "Kosmos-Teich",        base: 1.4e10,    cps: 1.6e6,   desc: "Fische im Orbit. Absurd. +1,6Mio/s" }
  ];
  var BUILDING_BY_ID = {};
  BUILDINGS.forEach(function (b) { BUILDING_BY_ID[b.id] = b; });

  /* Klick-Upgrades: einmalig, multiplizieren den Klickwert. */
  var CLICK_UPGRADES = [
    { id: "c1",  icon: "\u{1F58C}", name: "Fester Flossenschlag",  base: 100,      mult: 2, desc: "Klickwert ×2" },
    { id: "c2",  icon: "\u{1FAA3}", name: "Stabile Schwimmblase",  base: 500,      mult: 2, desc: "Klickwert ×2" },
    { id: "c3",  icon: "\u{1F9F2}", name: "Magnetische Schuppen",  base: 10000,    mult: 2, desc: "Klickwert ×2" },
    { id: "c4",  icon: "\u{2699}",  name: "Turbo-Kiemen",          base: 500000,   mult: 2, desc: "Klickwert ×2" },
    { id: "c5",  icon: "\u{1F48E}", name: "Diamant-Flossen",       base: 50000000, mult: 2, desc: "Klickwert ×2" },
    { id: "c6",  icon: "\u{1F31F}", name: "Sternen-Karpfen",       base: 5e9,      mult: 3, desc: "Klickwert ×3" }
  ];

  /* Katzen-Upgrades: verdoppeln die Produktion eines Gebaeudes.
     Verfuegbar ab je 10/25/50 Stueck - wie in Cookie Clicker. */
  var BUILDING_UPGRADES = [];
  BUILDINGS.forEach(function (b) {
    [10, 25, 50, 100].forEach(function (need, idx) {
      var cost = Math.round(b.base * Math.pow(COST_RATE, need) * 0.9);
      BUILDING_UPGRADES.push({
        id: b.id + "_u" + idx,
        icon: b.icon,
        name: b.name + " " + ["I", "II", "III", "IV"][idx],
        base: cost,
        target: b.id,
        need: need,
        desc: "×2 Produktion von " + b.name
      });
    });
  });

  var UPGRADE_BY_ID = {};
  CLICK_UPGRADES.concat(BUILDING_UPGRADES).forEach(function (u) { UPGRADE_BY_ID[u.id] = u; });

  /* Erfolge: jeweils mit Belohnung in Prozent (Bonus auf CPS). */
  /* Jeder Erfolg hat:
     test(s)  -> ist er geschafft?
     metric   -> aktueller Wert fuer den Fortschrittsbalken (optional)
     goal     -> Zielwert fuer den Fortschrittsbalken (optional) */
  var ACHIEVEMENTS = [
    { id: "a_first",   icon: "\u{1F41F}", name: "Erster Blubber", desc: "Klicke 1-mal", bonus: 0,
      test: function (s) { return s.clicks >= 1; }, metric: function (s) { return s.clicks; }, goal: 1 },
    { id: "a_100",     icon: "\u{1F44B}", name: "Klick-Fisch", desc: "100 Klicks", bonus: 0.01,
      test: function (s) { return s.clicks >= 100; }, metric: function (s) { return s.clicks; }, goal: 100 },
    { id: "a_1000",    icon: "\u{1F4AA}", name: "Finger-Athlet", desc: "1.000 Klicks", bonus: 0.02,
      test: function (s) { return s.clicks >= 1000; }, metric: function (s) { return s.clicks; }, goal: 1000 },
    { id: "a_10k",     icon: "\u{1F525}", name: "Karpaltunnel-Profi", desc: "10.000 Klicks", bonus: 0.05,
      test: function (s) { return s.clicks >= 10000; }, metric: function (s) { return s.clicks; }, goal: 10000 },
    { id: "a_total1",  icon: "\u{1F4B0}", name: "Taschengeld", desc: "1.000 Blubber gesammelt", bonus: 0.01,
      test: function (s) { return s.total >= 1e3; }, metric: function (s) { return s.total; }, goal: 1e3 },
    { id: "a_total2",  icon: "\u{1F4B8}", name: "Kleiner Teich", desc: "10.000 Blubber gesammelt", bonus: 0.02,
      test: function (s) { return s.total >= 1e4; }, metric: function (s) { return s.total; }, goal: 1e4 },
    { id: "a_total3",  icon: "\u{1F4B5}", name: "Fisch-Tycoon", desc: "1 Mio. Blubber gesammelt", bonus: 0.03,
      test: function (s) { return s.total >= 1e6; }, metric: function (s) { return s.total; }, goal: 1e6 },
    { id: "a_total4",  icon: "\u{1F3E6}", name: "Blubber-Magnat", desc: "1 Mrd. Blubber gesammelt", bonus: 0.07,
      test: function (s) { return s.total >= 1e9; }, metric: function (s) { return s.total; }, goal: 1e9 },
    { id: "a_b10",     icon: "\u{1F3D7}", name: "Baumeister", desc: "50 Gebaeude besitzen", bonus: 0.02,
      test: function (s) { return totalBuildings(s) >= 50; }, metric: totalBuildings, goal: 50 },
    { id: "a_b100",    icon: "\u{1F3D9}", name: "Teich-Konzern", desc: "150 Gebaeude besitzen", bonus: 0.04,
      test: function (s) { return totalBuildings(s) >= 150; }, metric: totalBuildings, goal: 150 },
    { id: "a_cps1",    icon: "\u{26A1}",  name: "Laeuft von selbst", desc: "10 Blubber/s", bonus: 0.01,
      test: function (s) { return s.cps >= 10; }, metric: function (s) { return s.cps || 0; }, goal: 10 },
    { id: "a_cps2",    icon: "\u{1F50C}", name: "Dauerbetrieb", desc: "1.000 Blubber/s", bonus: 0.03,
      test: function (s) { return s.cps >= 1000; }, metric: function (s) { return s.cps || 0; }, goal: 1000 },
    { id: "a_evo",     icon: "\u{1F409}", name: "Evolution", desc: "Magikarp zu Gyarados", bonus: 0.05,
      test: function (s) { return !!s.evolved; } },
    { id: "a_gold",    icon: "\u{1F31F}", name: "Glueckstropfen", desc: "Ein Blubber-Ball gefangen", bonus: 0.02,
      test: function (s) { return s.stats.golden >= 1; }, metric: function (s) { return s.stats.golden; }, goal: 1 },
    { id: "a_gold5",   icon: "\u{2728}",  name: "Goldrausch", desc: "5 Blubber-Baelle gefangen", bonus: 0.03,
      test: function (s) { return s.stats.golden >= 5; }, metric: function (s) { return s.stats.golden; }, goal: 5 },
    { id: "a_gold25",  icon: "\u{1F7E1}", name: "Ball-Jaeger", desc: "25 Blubber-Baelle gefangen", bonus: 0.05,
      test: function (s) { return s.stats.golden >= 25; }, metric: function (s) { return s.stats.golden; }, goal: 25 },
    { id: "a_season",  icon: "\u{1F327}", name: "Wetterfest", desc: "5 Jahreszeiten erlebt", bonus: 0.02,
      test: function (s) { return s.stats.seasons >= 5; }, metric: function (s) { return s.stats.seasons; }, goal: 5 },
    { id: "a_ascend",  icon: "\u{1F300}", name: "Reinkarnation", desc: "1-mal aufgestiegen", bonus: 0.02,
      test: function (s) { return s.ascensions >= 1; }, metric: function (s) { return s.ascensions; }, goal: 1 },
    { id: "a_ascend5", icon: "\u{1F52E}", name: "Kreislauf des Teichs", desc: "5-mal aufgestiegen", bonus: 0.05,
      test: function (s) { return s.ascensions >= 5; }, metric: function (s) { return s.ascensions; }, goal: 5 },
    { id: "a_upg",     icon: "\u{1F381}", name: "Sammler", desc: "10 Upgrades gekauft", bonus: 0.02,
      test: function (s) { return s.stats.upgradesBought >= 10; }, metric: function (s) { return s.stats.upgradesBought; }, goal: 10 },
    { id: "a_sell",    icon: "\u{1F4B8}", name: "Fisch-Haendler", desc: "10 Gebaeude verkauft", bonus: 0.02,
      test: function (s) { return s.stats.sold >= 10; }, metric: function (s) { return s.stats.sold || 0; }, goal: 10 },
    { id: "a_ms10",    icon: "\u{1F3C6}", name: "Meilenstein-Jaeger", desc: "10 Meilensteine erreicht", bonus: 0.04,
      test: function (s) { return totalMilestones(s) >= 10; }, metric: totalMilestones, goal: 10 },
    { id: "a_mini",    icon: "\u{1F41B}", name: "Auch kleine Fische", desc: "Alle 10 Gebaeudearten besitzen", bonus: 0.03,
      test: function (s) { return BUILDINGS.every(function (b) { return (s.buildings[b.id] || 0) > 0; }); },
      metric: function (s) { return BUILDINGS.filter(function (b) { return (s.buildings[b.id] || 0) > 0; }).length; },
      goal: 10 },
    /* --- Prestige --- */
    { id: "a_core1",   icon: "\u{1F48E}", name: "Erster Kern", desc: "Ersten Mega-Kern verdient", bonus: 0.02,
      test: function (s) { return s.cores >= 1 || s.ascensions >= 1; } },
    { id: "a_core25",  icon: "\u{1F4A0}", name: "Kern-Schmiede", desc: "25 Mega-Kerne auf dem Konto", bonus: 0.03,
      test: function (s) { return s.cores >= 25; },
      metric: function (s) { return s.cores; }, goal: 25 },
    { id: "a_gyara",   icon: "\u{1F409}", name: "Aufstieg der Legende", desc: "Gyarados-Erbe gekauft", bonus: 0.05,
      test: function (s) { return !!s.pUpgrades.p_gyara; } },
    { id: "a_mega",    icon: "\u{1F451}", name: "Mega!", desc: "Mega Gyarados freigeschaltet", bonus: 0.10,
      test: function (s) { return !!s.pUpgrades.p_mega; } }
  ];

  /** Summe aller erreichten Gebaeude-Meilensteine (fuer Erfolge). */
  function totalMilestones(s) {
    var n = 0;
    Object.keys(s.buildings).forEach(function (id) {
      var owned = s.buildings[id] || 0;
      MILESTONES.forEach(function (m) { if (owned >= m) n++; });
    });
    return n;
  }

  /* Jahreszeiten: alle 20 Minuten (nur aktive Spielzeit), je mit Effekt. */
  var SEASONS = [
    { id: "fruehling", icon: "\u{1F337}", name: "Frühling", cpsMult: 1.0,
      text: "Frühling: alles blüht. Kein Bonus." },
    { id: "sommer",    icon: "\u{2600}",  name: "Sommer",    cpsMult: 1.25,
      text: "Sommer: Die Sonne knallt. +25 % Produktion, aber Klicks zählen nur ×0,9." },
    { id: "herbst",    icon: "\u{1F342}", name: "Herbst",    cpsMult: 0.85,
      text: "Herbst: Blätter im Teich. Produktion −15 %, dafür Blubber-Bälle häufiger." },
    { id: "winter",    icon: "\u{2744}",  name: "Winter",    cpsMult: 1.0,
      text: "Winter: Der Teich friert zu. Produktion normal, aber Ball-Belohnungen ×1,3." }
  ];
  var SEASON_LEN = 120;                /* Sekunden aktive Spielzeit */
  var SEASON_GAP = 240;                /* danach 4 Minuten Ruhe */

  /* ============================================================
     2. SPIELZUSTAND
     ============================================================ */
  var SAVE_KEY = "onlyfish.tycoon.v3";
  var LEGACY_KEYS = ["onlyfish.save.v2"];
  var SAVE_VERSION = 4;

  /* ============================================================
     PRESTIGE (wie Cookie Clickers Heavenly Chips)
     - ascPoints = Prestige-LEVEL. Bleiben dauerhaft und geben
       +1 % Produktion pro Level. Sie werden NIE ausgegeben.
     - cores = Mega-Kerne. Die ausgabbare Waehrung, mit der man im
       Prestige-Baum dauerhafte Verbesserungen kauft. Ausgeben senkt
       den Level-Bonus NICHT (genau wie in Cookie Clicker).
     - Beim Aufstieg bekommt man so viele Kerne wie Level dazu.
     ============================================================ */
  var CORE_START = 2;          /* Aufstieg ab 10 Mio. gibt direkt 2 Kerne */
  var CORE_RATIO = 0.6;        /* Wachstum der Kerne pro Level */

  /* ---------- Prestige-Baum (die "Heavenly Upgrades") ----------
     mode:
       "add"  -> bonus += value            (additiv, in Prozentpunkten)
       "mult" -> mult *= value             (Faktor, z. B. 1.25)
       "flag" -> setzt state.pFlags[id]    (Sonderverhalten im Code)
     Jeder Knoten hat ein festes level. Nur gueltige Werte werden
     geladen, damit fremde Saves keinen Unsinn einschleusen. */
  var PRESTIGE_LIFE = 1;   /* "Guenstige Flossen": dauerhaft +50 % mehr Blubber pro Klick */

  var PRESTIGE_UPGRADES = [
    { id: "p_start",    tier: 1, icon: "\u{1F331}", name: "Samenkorn",          cost: 2,    mode: "add",  value: 20,    desc: "+20 % Produktion" },
    { id: "p_click",    tier: 1, icon: "\u{1F590}", name: "Guenstige Flossen",   cost: 3,    mode: "flag", desc: "+50 % Blubber pro Klick" },
    { id: "p_gold",     tier: 2, icon: "\u{1F7E1}", name: "Goldene Schuppen",    cost: 4,    mode: "add",  value: 25,    desc: "+25 % Produktion" },
    { id: "p_evolve",   tier: 2, icon: "\u{1F409}", name: "Schnelle Evolution",  cost: 5,    mode: "flag", desc: "Evolution braucht nur 1 Mio. statt 4 Mio." },
    { id: "p_cheap",    tier: 3, icon: "\u{1F3F7}", name: "Fisch-Mengenrabatt",  cost: 8,   mode: "flag", desc: "Gebaeude kosten nur 12 % mehr statt 15 %" },
    { id: "p_sell",     tier: 3, icon: "\u{1F4B8}", name: "Treue Haendler",      cost: 10,   mode: "flag", desc: "Verkauf bringt 100 % statt 50 %" },
    { id: "p_crit",     tier: 4, icon: "\u{26A1}",  name: "Blitz-Flossen",       cost: 14,   mode: "flag", desc: "Doppelte Krit-Chance" },
    { id: "p_offline",  tier: 4, icon: "\u{1F319}", name: "Mondlicht",           cost: 18,   mode: "flag", desc: "Offline doppelt so effizient (100 %)" },
    { id: "p_ms",       tier: 5, icon: "\u{2B50}",  name: "Meilenstein-Praemie", cost: 25,   mode: "flag", desc: "Meilensteine geben doppelt so viel" },
    { id: "p_gyara",    tier: 5, icon: "\u{1F409}", name: "Gyarados-Erbe",       cost: 35,   mode: "add",  value: 50,    desc: "+50 % Produktion" },
    { id: "p_mega",     tier: 6, icon: "\u{1F451}", name: "MEGA GYARADOS",       cost: 70,   mode: "mult", value: 3,     desc: "x3 auf ALLES - und der Fisch wird Mega" }
  ];
  var PRESTIGE_BY_ID = {};
  PRESTIGE_UPGRADES.forEach(function (u) { PRESTIGE_BY_ID[u.id] = u; });

  var state = newState();

  function newState() {
    return {
      bank: 0,          /* verfuegbarer Blubber */
      total: 0,         /* in dieser Runde gesammelt */
      allTime: 0,       /* ueber alle Runden */
      clicks: 0,
      evolved: false,
      buildings: { flosse: 0, algen: 0, teich: 0, rudel: 0, aquarium: 0, koralle: 0, tiefsee: 0, legende: 0, ozean: 0, kosmos: 0 },
      upgrades: {},
      achievements: {},
      buffs: [],
      stats: { golden: 0, seasons: 0, upgradesBought: 0, sold: 0 },
      ascensions: 0,
      ascPoints: 0,     /* Prestige-LEVEL: +1 % pro Level, wird nie ausgegeben */
      cores: 0,         /* Mega-Kerne: ausgabbare Waehrung fuer den Baum */
      pUpgrades: {},    /* gekaufte Prestige-Knoten */
      pFlags: {},       /* abgeleitete Sonderfaehigkeiten */
      seasonIdx: 0,
      seasonTime: 0,
      seasonActive: false,
      lastSeen: Date.now(),
      cps: 0,
      perClick: 1
    };
  }

  function totalBuildings(s) {
    var n = 0;
    for (var k in s.buildings) n += s.buildings[k];
    return n;
  }

  /* ============================================================
     3. ABGELEITETE WERTE
     ============================================================ */
  function buildingCost(b, owned) {
    return Math.ceil(b.base * Math.pow(costRate(), owned || 0));
  }

  /** Summe fuer n weitere Stuecke (geometrische Reihe). */
  function bulkCost(b, owned, n) {
    var sum = 0;
    for (var i = 0; i < n; i++) sum += buildingCost(b, owned + i);
    return sum;
  }

  /** Wie viele kann man sich mit dem aktuellen Guthaben leisten? */
  function maxAffordable(b, owned, bank) {
    var n = 0, pot = 0;
    while (n < 1000) {
      pot += buildingCost(b, owned + n);
      if (pot > bank) break;
      n++;
    }
    return n;
  }

  function hasUpgrade(id) { return !!state.upgrades[id]; }

  var MILESTONES = [25, 50, 100, 150, 200];
  var MILESTONE_BONUS = 0.01;      /* je Meilenstein +1 % auf DIESES Gebaeude */

  /** Wie viele Meilensteine hat dieses Gebaeude bereits erreicht? */
  function milestoneCount(bid) {
    var owned = state.buildings[bid] || 0;
    var n = 0;
    MILESTONES.forEach(function (m) { if (owned >= m) n++; });
    return n;
  }

  /** Naechster unerreichter Meilenstein oder null. */
  function nextMilestone(bid) {
    var owned = state.buildings[bid] || 0;
    for (var i = 0; i < MILESTONES.length; i++) {
      if (owned < MILESTONES[i]) return MILESTONES[i];
    }
    return null;
  }

  function buildingMultiplier(bid) {
    var m = 1;
    BUILDING_UPGRADES.forEach(function (u) {
      if (u.target === bid && hasUpgrade(u.id)) m *= 2;
    });
    var msBonus = MILESTONE_BONUS * (hasPrestigeFlag("p_ms") ? 2 : 1);
    m *= (1 + milestoneCount(bid) * msBonus);
    return m;
  }

  function clickMultiplier() {
    var m = 1;
    CLICK_UPGRADES.forEach(function (u) { if (hasUpgrade(u.id)) m *= u.mult; });
    return m;
  }

  function achievementBonus() {
    var sum = 0;
    ACHIEVEMENTS.forEach(function (a) { if (state.achievements[a.id]) sum += a.bonus; });
    return sum;
  }

  /** Nur Buffs der Kategorie "cps" wirken auf die passive Produktion. */
  function buffMultiplier() {
    var m = 1;
    var now = Date.now();
    state.buffs.forEach(function (b) {
      if (b.until > now && b.kind === "cps") m *= b.mult;
    });
    return m;
  }

  /** Nur Buffs der Kategorie "click" wirken auf den Klickwert. */
  function clickBuffMultiplier() {
    var m = 1;
    var now = Date.now();
    state.buffs.forEach(function (b) {
      if (b.until > now && b.kind === "click") m *= b.mult;
    });
    return m;
  }

  function seasonMultiplier() {
    if (!state.seasonActive) return 1;
    return SEASONS[state.seasonIdx].cpsMult;
  }

  /* Level-Bonus: +1 % pro Prestige-Level, unabhaengig von gekauften Knoten. */
  function prestigeMultiplier() { return 1 + state.ascPoints / 100; }

  /** Additiver Bonus aus allen "add"-Knoten, als Faktor. */
  function prestigeBonusMultiplier() {
    var add = 0;
    PRESTIGE_UPGRADES.forEach(function (u) {
      if (u.mode === "add" && state.pUpgrades[u.id]) add += u.value;
    });
    return 1 + add / 100;
  }

  /** Faktor aus allen "mult"-Knoten. */
  function prestigeFlatMultiplier() {
    var m = 1;
    PRESTIGE_UPGRADES.forEach(function (u) {
      if (u.mode === "mult" && state.pUpgrades[u.id]) m *= u.value;
    });
    return m;
  }

  function hasPrestigeFlag(id) { return !!state.pFlags[id]; }

  /* Der Gebaeude-Preis steigt pro Stueck; "Mengenrabatt" senkt die Rate. */
  function costRate() { return hasPrestigeFlag("p_cheap") ? 1.12 : 1.15; }

  /* Evolution gibt einen dauerhaften Bonus von +25 %, nicht nur Optik. */
  function evolutionMultiplier() { return state.evolved ? 1.25 : 1; }

  /** Blubber pro Sekunde */
  function computeCps() {
    var base = 0;
    BUILDINGS.forEach(function (b) {
      base += b.cps * state.buildings[b.id] * buildingMultiplier(b.id);
    });
    var m = (1 + achievementBonus()) * buffMultiplier() * seasonMultiplier() *
            prestigeMultiplier() * evolutionMultiplier() *
            prestigeBonusMultiplier() * prestigeFlatMultiplier();
    return base * m;
  }

  /** Blubber pro Klick */
  function computePerClick() {
    var base = 1 + state.buildings.flosse * 1;          /* Flossen-Betrieb staerkt Klicks */
    var m = clickMultiplier() * (1 + achievementBonus()) * prestigeMultiplier() *
            evolutionMultiplier() * clickBuffMultiplier() *
            prestigeBonusMultiplier() * prestigeFlatMultiplier();
    if (hasPrestigeFlag("p_click")) m *= 1.5;
    if (state.seasonActive && SEASONS[state.seasonIdx].id === "sommer") m *= 0.9;
    return base * m;
  }

  function critChance() {
    /* Krit-Chance waechst mit Flossen-Stueckzahl, max 35 % */
    var c = state.buildings.flosse * 0.002 * (hasPrestigeFlag("p_crit") ? 2 : 1);
    return Math.min(0.70, c);
  }

  /* ============================================================
     4. ERFOLGE PRUEFEN
     ============================================================ */
  function checkAchievements() {
    var fresh = [];
    ACHIEVEMENTS.forEach(function (a) {
      if (!state.achievements[a.id] && a.test(state)) {
        state.achievements[a.id] = true;
        fresh.push(a);
      }
    });
    if (fresh.length) {
      fresh.forEach(function (a) {
        if (a.bonus > 0) {
          toast(a.icon + " " + a.name + " freigeschaltet! +" + Math.round(a.bonus * 100) + " % Bonus");
        } else {
          toast(a.icon + " " + a.name + " freigeschaltet!");
        }
      });
      renderAchievements();
      renderUpgrades();
      save();
    }
    return fresh.length;
  }

  /* ============================================================
     5. BLUBBER-BALL (goldener Keks)
     ============================================================ */
  var golden = { el: null, timer: null, spawnAt: 0 };

  function scheduleGolden() {
    var base = 90 + Math.random() * 90;                 /* 90-180 s */
    if (state.seasonActive && SEASONS[state.seasonIdx].id === "herbst") base *= 0.6;
    golden.spawnAt = Date.now() + base * 1000;
  }

  function spawnGolden() {
    if (golden.el) return;
    var el = document.createElement("button");
    el.type = "button";
    el.className = "ty-golden";
    el.setAttribute("aria-label", "Blubber-Ball einsammeln");
    el.textContent = "\u{1F7E1}";
    el.style.left = (10 + Math.random() * 75) + "%";
    el.style.top = (15 + Math.random() * 60) + "%";
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      catchGolden();
    });
    document.body.appendChild(el);
    golden.el = el;
    /* verschwindet nach 13 s */
    golden.timer = setTimeout(removeGolden, 13000);
  }

  function removeGolden() {
    clearTimeout(golden.timer);
    if (golden.el && golden.el.parentNode) golden.el.parentNode.removeChild(golden.el);
    golden.el = null;
    golden.timer = null;
    scheduleGolden();
  }

  function catchGolden() {
    removeGolden();
    state.stats.golden++;
    var roll = Math.random();
    var winter = state.seasonActive && SEASONS[state.seasonIdx].id === "winter";
    var gain;

    if (roll < 0.45) {
      /* Sofort-Blubber: 15 % des Kontos oder 13x Klick, je nachdem was mehr ist */
      gain = Math.max(computePerClick() * 13, state.bank * 0.15);
      gain = Math.max(gain, 25);
      if (winter) gain *= 1.3;
      state.bank += gain; state.total += gain; state.allTime += gain;
      toast("\u{1F7E1} Blubber-Ball! +" + fmt(gain) + " Blubber aufs Konto");
    } else if (roll < 0.75) {
      /* Klick-Frenzy: 77x Klick fuer 15 s */
      state.buffs.push({ id: "frenzy", name: "Klick-Frenzy", mult: 77, until: Date.now() + 15000, kind: "click" });
      toast("\u{26A1} KLICK-FRENZY! 15 Sekunden lang 77-fache Klicks!");
    } else if (roll < 0.95) {
      /* Drachenrausch: 7x Produktion fuer 30 s */
      state.buffs.push({ id: "frenzyCps", name: "Drachenrausch", mult: 7, until: Date.now() + 30000, kind: "cps" });
      toast("\u{1F409} DRACHENRAUSCH! 30 Sekunden lang 7x Produktion!");
    } else {
      /* Fehlschlag - wie in Cookie Clicker moeglich */
      toast("\u{1F7E1} Blubber-Ball war schon abgelaufen. Nächstes Mal!");
    }
    renderTop();
    renderBuffs();
    checkAchievements();
    save();
  }

  /* ============================================================
     6. RENDERING
     ============================================================ */
  var shopping = "1";              /* 1 | 10 | 100 | max */
  var tab = "buildings";           /* buildings | upgrades | achievements | stats */

  function renderTop() {
    state.cps = computeCps();
    state.perClick = computePerClick();

    var bank = $("tyBank");
    if (bank) bank.textContent = fmt(Math.max(0, state.bank));
    var cps = $("tyCps");
    if (cps) cps.textContent = fmt(state.cps) + "/s";
    var pc = $("tyPerClick");
    if (pc) pc.textContent = fmt(state.perClick);

    /* Kritische Treffer: Chance kommt aus den Flossen, muss sichtbar sein */
    var critEl = $("tyCrit");
    if (critEl) {
      var cc = critChance();
      critEl.textContent = Math.round(cc * 100) + " %";
      critEl.classList.toggle("off", cc <= 0);
      var critRow = $("tyCritRow");
      if (critRow) critRow.classList.toggle("off", cc <= 0);
    }

    /* Evolutions-Fortschritt */
    var evoEl = $("tyEvoFill");
    var evoPct = Math.min(100, state.allTime / evolveAt() * 100);
    if (evoEl) evoEl.style.width = evoPct + "%";
    var evoLbl = $("tyEvoLabel");
    if (evoLbl) {
      evoLbl.textContent = state.evolved
        ? "\u{1F409} Gyarados (entwickelt)"
        : "Evolution bei " + fmt(evolveAt()) + " Blubber · " + Math.floor(evoPct) + " %";
    }

    /* Jahreszeit / Wetter */
    var seaEl = $("tySeason");
    if (seaEl) {
      if (state.seasonActive) {
        var s = SEASONS[state.seasonIdx];
        var left = SEASON_LEN - state.seasonTime;
        seaEl.textContent = s.icon + " " + s.name + " · " + fmtDur(left);
        seaEl.title = s.text;
      } else {
        seaEl.textContent = "\u{1F324} ruhiges Wetter";
        seaEl.title = "Jahreszeiten kommen automatisch, während du spielst.";
      }
    }

    var ascEl = $("tyAscBonus");
    if (ascEl) ascEl.textContent = "+" + state.ascPoints + " %";
  }

  function renderBuffs() {
    var box = $("tyBuffs");
    if (!box) return;
    var now = Date.now();
    var live = state.buffs.filter(function (b) { return b.until > now; });
    if (live.length !== state.buffs.length) state.buffs = live;

    if (!live.length) { box.innerHTML = ""; box.classList.add("empty"); return; }
    box.classList.remove("empty");
    box.innerHTML = "";
    live.forEach(function (b) {
      var s = document.createElement("span");
      s.className = "ty-buff";
      s.textContent = b.name + " · " + Math.ceil((b.until - now) / 1000) + "s";
      box.appendChild(s);
    });
  }

  var bldNodes = null;      /* einmal gebaute DOM-Knoten, danach nur Text/Status updaten */

  function buildBuildingRows() {
    var box = $("tyBuildings");
    if (!box) return;
    box.innerHTML = "";
    bldNodes = {};
    BUILDINGS.forEach(function (b) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "ty-bld";
      row.setAttribute("data-bid", b.id);

      var ic = document.createElement("span");
      ic.className = "ty-bld-icon";
      ic.textContent = b.icon;

      var body = document.createElement("span");
      body.className = "ty-bld-body";
      var nm = document.createElement("strong");
      nm.textContent = b.name;
      var ds = document.createElement("small");
      ds.className = "ty-bld-desc";
      body.appendChild(nm);
      body.appendChild(ds);

      var right = document.createElement("span");
      right.className = "ty-bld-right";
      var price = document.createElement("b");
      price.className = "ty-bld-cost";
      var cnt = document.createElement("span");
      cnt.className = "ty-bld-count";
      right.appendChild(price);
      right.appendChild(cnt);

      /* Verkaufen-Knopf: nur sichtbar, wenn man das Gebaeude besitzt */
      var sell = document.createElement("button");
      sell.type = "button";
      sell.className = "ty-bld-sell";
      sell.textContent = "\u{1F4B8}";
      sell.title = "1 Stueck verkaufen (50 % zurueck)";
      sell.setAttribute("aria-label", b.name + " verkaufen");
      sell.addEventListener("click", function (e) {
        e.stopPropagation();          /* nicht das Gebaeude kaufen */
        sellBuilding(b.id, 1);
      });

      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(right);
      row.appendChild(sell);
      row.addEventListener("click", function () { buyBuilding(b.id, shopping === "max" ? "max" : Number(shopping)); });
      box.appendChild(row);

      bldNodes[b.id] = { row: row, desc: ds, price: price, count: cnt, sell: sell, last: "" };
    });
  }

  function renderBuildings() {
    var box = $("tyBuildings");
    if (!box) return;
    if (!bldNodes) buildBuildingRows();

    BUILDINGS.forEach(function (b) {
      var node = bldNodes[b.id];
      if (!node) return;
      var owned = state.buildings[b.id];
      var n = shopping === "max" ? Math.max(1, maxAffordable(b, owned, state.bank)) : Number(shopping);
      var cost = bulkCost(b, owned, n);
      var afford = state.bank >= cost;

      var nxtMs = nextMilestone(b.id);
      var ms = milestoneCount(b.id);
      /* Nur schreiben, wenn sich etwas geaendert hat -> kein Flackern */
      var sig = owned + "|" + cost + "|" + n + "|" + ms;
      if (node.last !== sig) {
        node.last = sig;
        var extra = "";
        /* "3/5 Boni (+3 %)" ist selbsterklaerend; "Ziel 100" zeigt den naechsten Sprung. */
        if (ms > 0) {
          extra += " \u00B7 Boni " + ms + "/" + MILESTONES.length +
                   " (+" + (ms * MILESTONE_BONUS * 100).toFixed(0) + " %)";
        }
        if (nxtMs !== null) extra += " \u00B7 n\u00E4chster Bonus bei " + nxtMs;
        node.desc.textContent = b.desc + " \u00B7 je " + fmt(b.cps * buildingMultiplier(b.id)) + "/s" +
          (n > 1 ? " \u00B7 " + n + "x" : "") + extra;
        node.price.textContent = fmt(cost);
        node.price.classList.toggle("tooMuch", !afford);
        node.count.textContent = owned > 0 ? String(owned) : "";
        node.count.classList.toggle("empty", owned === 0);
      }
      node.row.classList.toggle("locked", !afford);
      node.row.classList.toggle("owned", owned > 0);
      if (node.sell) node.sell.hidden = owned <= 0;
    });
  }

  function upgradeVisible(u) {
    if (hasUpgrade(u.id)) return false;
    if (u.need) return state.buildings[u.target] >= u.need;
    return true;
  }

  function renderUpgrades() {
    var box = $("tyUpgrades");
    if (!box) return;
    box.innerHTML = "";

    var list = CLICK_UPGRADES.concat(BUILDING_UPGRADES).filter(upgradeVisible);
    var countEl = $("tyUpgCount");
    if (countEl) countEl.textContent = list.length ? list.length + " verfügbar" : "keine offen";

    if (!list.length) {
      var p = document.createElement("p");
      p.className = "ty-empty";
      p.textContent = "Gerade nichts im Angebot. Bau mehr Gebäude, dann tauchen neue Upgrades auf.";
      box.appendChild(p);
      return;
    }

    list.sort(function (a, b) { return a.base - b.base; });

    list.forEach(function (u) {
      var afford = state.bank >= u.base;
      var row = document.createElement("button");
      row.type = "button";
      row.className = "ty-upg" + (afford ? "" : " locked");

      var ic = document.createElement("span");
      ic.className = "ty-upg-icon"; ic.textContent = u.icon;
      var body = document.createElement("span");
      body.className = "ty-upg-body";
      var nm = document.createElement("strong"); nm.textContent = u.name;
      var ds = document.createElement("small"); ds.textContent = u.desc;
      body.appendChild(nm); body.appendChild(ds);
      var price = document.createElement("b");
      price.className = "ty-upg-cost"; price.textContent = fmt(u.base);

      row.appendChild(ic); row.appendChild(body); row.appendChild(price);
      row.addEventListener("click", function () { buyUpgrade(u.id); });
      box.appendChild(row);
    });
  }

  /** Fortschritt eines Erfolgs als "x/y" - null, wenn nicht messbar. */
  function achProgress(a) {
    if (!a.goal || !a.metric) return null;
    var cur = 0;
    try { cur = Number(a.metric(state)) || 0; } catch (e) { return null; }
    cur = Math.min(cur, a.goal);
    return { cur: cur, goal: a.goal };
  }

  function renderAchievements() {
    var box = $("tyAchievements");
    if (!box) return;
    box.innerHTML = "";
    var got = 0;
    ACHIEVEMENTS.forEach(function (a) {
      var has = !!state.achievements[a.id];
      if (has) got++;
      var prog = has ? null : achProgress(a);

      var el = document.createElement("div");
      el.className = "ty-ach" + (has ? " got" : "") + (prog ? " tracked" : "");
      el.title = a.name + " - " + a.desc + (a.bonus ? " (+" + Math.round(a.bonus * 100) + " % Produktion)" : "");

      var i = document.createElement("span");
      i.className = "ty-ach-icon";
      i.textContent = has ? a.icon : "\u{1F512}";

      var t = document.createElement("span");
      t.className = "ty-ach-name";
      t.textContent = a.name;

      el.appendChild(i);
      el.appendChild(t);

      if (prog) {
        var p = document.createElement("span");
        p.className = "ty-ach-prog";
        p.textContent = fmt(prog.cur) + " / " + fmt(prog.goal);
        el.appendChild(p);
      }
      box.appendChild(el);
    });
    var cnt = $("tyAchCount");
    if (cnt) cnt.textContent = got + "/" + ACHIEVEMENTS.length;
  }

  var statNodes = null;   /* einmal gebaut, danach nur Werte tauschen */

  function statRows() {
    return [
      ["Blubber im Konto", fmt(Math.max(0, state.bank))],
      ["Diese Runde gesammelt", fmt(state.total)],
      ["Insgesamt (alle Runden)", fmt(state.allTime)],
      ["Pro Sekunde", fmt(computeCps())],
      ["Pro Klick", fmt(computePerClick())],
      ["Klicks insgesamt", state.clicks.toLocaleString("de-DE")],
      ["Geb\u00E4ude insgesamt", totalBuildings(state).toLocaleString("de-DE")],
      ["Upgrades gekauft", String(state.stats.upgradesBought)],
      ["Erfolge", Object.keys(state.achievements).length + " / " + ACHIEVEMENTS.length],
      ["Blubber-B\u00E4lle gefangen", String(state.stats.golden)],
      ["Aufstiege", String(state.ascensions)],
      ["Prestige-Level", String(state.ascPoints)],
      ["Prestige-Bonus", "+" + state.ascPoints + " %"],
      ["Mega-Kerne", fmt(state.cores)],
      ["Prestige-Baum", Object.keys(state.pUpgrades).length + " / " + PRESTIGE_UPGRADES.length],
      ["Jahreszeiten erlebt", String(state.stats.seasons)],
      ["Geb\u00E4ude verkauft", String(state.stats.sold || 0)],
      ["Meilensteine", totalMilestones(state) + " / " + (BUILDINGS.length * MILESTONES.length)]
    ];
  }

  function renderStats() {
    var box = $("tyStats");
    if (!box) return;

    var rows = statRows();

    if (!statNodes || statNodes.length !== rows.length) {
      box.innerHTML = "";
      statNodes = [];
      rows.forEach(function (r) {
        var d = document.createElement("div");
        d.className = "ty-stat";
        var k = document.createElement("span"); k.textContent = r[0];
        var v = document.createElement("b");
        d.appendChild(k); d.appendChild(v);
        box.appendChild(d);
        statNodes.push({ val: v, last: "" });
      });
    }

    rows.forEach(function (r, i) {
      var n = statNodes[i];
      if (n.last !== r[1]) {
        n.last = r[1];
        n.val.textContent = r[1];
      }
    });
  }

  function renderAscend() {
    var btn = $("tyAscendBtn");
    var info = $("tyAscendInfo");
    var pts = ascendPointsFor(state.total);
    var cores = coresForLevels(pts);
    if (btn) {
      btn.disabled = pts < 1;
      btn.textContent = "\u{1F300} Aufsteigen (+" + pts + " Level, +" + cores + " Kerne)";
    }
    if (info) {
      info.textContent = pts < 1
        ? "Ab " + fmt(ASCEND_MIN) + " Blubber in dieser Runde kannst du aufsteigen. Du hast " + fmt(state.total) + "."
        : "Bringt +" + pts + " Prestige-Level (+" + pts + " % dauerhaft) und " + cores +
          " Mega-Kerne für den Prestige-Baum. Gebäude und Konto werden zurückgesetzt.";
    }
    /* Level, Kerne und Abzeichen im Prestige-Tab */
    var lvlEl = $("tyPrestLvl");
    if (lvlEl) lvlEl.textContent = state.ascPoints;
    var coreEl = $("tyCores");
    if (coreEl) coreEl.textContent = state.cores;
    /* Abzeichen am Tab: wie viele Baum-Knoten man sich gerade leisten kann */
    var badge = $("tyPrestBadge");
    if (badge) {
      var kaufbar = 0;
      PRESTIGE_UPGRADES.forEach(function (u) {
        if (!state.pUpgrades[u.id] && state.cores >= u.cost) kaufbar++;
      });
      badge.hidden = kaufbar === 0;
      badge.textContent = kaufbar ? "💠" + kaufbar : "";
      badge.title = kaufbar ? kaufbar + " Verbesserung(en) bezahlbar" : "";
    }
  }

  /** 0 = kein Abzeichen, 1 = Gyarados-Erbe, 2 = Mega Gyarados. */
  function prestigeBadgeLevel() {
    if (state.pUpgrades.p_mega) return 2;
    if (state.pUpgrades.p_gyara) return 1;
    return 0;
  }

  function buyPrestige(id) {
    var u = PRESTIGE_BY_ID[id];
    if (!u || !Object.prototype.hasOwnProperty.call(PRESTIGE_BY_ID, id)) return false;
    if (state.pUpgrades[id]) { toast("Hast du schon."); return false; }
    if (state.cores < u.cost) {
      toast("Zu wenig Mega-Kerne: " + fmt(u.cost) + " nötig, du hast " + fmt(state.cores) + ".");
      return false;
    }
    state.cores -= u.cost;
    state.pUpgrades[id] = true;
    rebuildPrestigeFlags();
    syncFishLook();
    renderAll();
    checkAchievements();
    save();
    if (id === "p_mega") {
      toast("\u{1F451} MEGA GYARADOS! Ab jetzt x3 auf alles.");
      if (window.confettiBurst) window.confettiBurst();
      flashMsg("\u{1F451} MEGA GYARADOS erwacht!");
    } else {
      toast("\u{2728} " + u.name + " gekauft: " + u.desc);
    }
    return true;
  }

  /** Leitet die Sonderfaehigkeiten aus den gekauften Knoten ab. */
  function rebuildPrestigeFlags() {
    state.pFlags = {};
    PRESTIGE_UPGRADES.forEach(function (u) {
      if (u.mode === "flag" && state.pUpgrades[u.id]) state.pFlags[u.id] = true;
    });
  }

  function renderPrestige() {
    var box = $("tyPrestige");
    if (!box) return;
    box.innerHTML = "";

    var open = 0;
    PRESTIGE_UPGRADES.forEach(function (u) {
      var owned = !!state.pUpgrades[u.id];
      var afford = !owned && state.cores >= u.cost;
      if (owned) return;

      var row = document.createElement("button");
      row.type = "button";
      row.className = "ty-core" + (afford ? "" : " locked");
      row.title = u.name + " - " + u.desc;

      var ic = document.createElement("span");
      ic.className = "ty-core-icon";
      ic.textContent = u.icon;

      var body = document.createElement("span");
      body.className = "ty-core-body";
      var nm = document.createElement("strong");
      nm.textContent = u.name;
      var ds = document.createElement("small");
      ds.textContent = u.desc;
      body.appendChild(nm);
      body.appendChild(ds);

      var price = document.createElement("b");
      price.className = "ty-core-cost";
      price.textContent = u.cost + " Kerne";

      row.appendChild(ic);
      row.appendChild(body);
      row.appendChild(price);
      row.addEventListener("click", function () { buyPrestige(u.id); });
      box.appendChild(row);
      open++;
    });

    if (!open) {
      var p = document.createElement("p");
      p.className = "ty-empty";
      p.textContent = "Alles gekauft. Der Teich ist vollendet.";
      box.appendChild(p);
    }

    var mega = PRESTIGE_BY_ID.p_mega;
    var note = $("tyMegaNote");
    if (note && mega) {
      note.textContent = state.pUpgrades.p_mega
        ? "\u{1F451} Mega Gyarados ist erwacht. x3 auf alles."
        : "Ziel: MEGA GYARADOS (" + mega.cost + " Kerne) - x3 auf alles und ein neuer Fisch.";
    }
  }

  function renderAll() {
    renderTop();
    renderBuildings();
    renderUpgrades();
    renderAchievements();
    renderStats();
    renderAscend();
    renderPrestige();
    renderBuffs();
  }

  /* ============================================================
     7. AKTIONEN
     ============================================================ */
  function clickFish(e) {
    var crit = Math.random() < critChance();
    var amount = computePerClick() * (crit ? 7 : 1);   /* Buffs stecken schon in computePerClick() */
    state.bank += amount;
    state.total += amount;
    state.allTime += amount;
    state.clicks++;

    if (crit) {
      flashMsg("\u{26A1} KRITISCH! +" + fmt(amount));
    }
    floatText(e, "+" + fmt(amount), crit);
    renderTop();
    applyEvolution();
    checkAchievements();
    saveThrottled();
    return amount;
  }

  function buyBuilding(id, n) {
    var b = BUILDING_BY_ID[id];
    if (!b) return false;
    var owned = state.buildings[id];
    var count = n === "max" ? maxAffordable(b, owned, state.bank) : Number(n);
    if (!count || count < 1) { flashMsg("Zu wenig Blubber für " + b.name + "."); return false; }
    var cost = bulkCost(b, owned, count);
    if (state.bank < cost) { flashMsg("Zu wenig Blubber. Es fehlen " + fmt(cost - state.bank) + "."); return false; }
    state.bank -= cost;
    state.buildings[id] += count;
    flashMsg(b.icon + " " + count + "x " + b.name + " gekauft");
    renderAll();
    checkAchievements();
    saveThrottled();
    return true;
  }

  function buyUpgrade(id) {
    var u = UPGRADE_BY_ID[id];
    if (!u) return false;
    if (hasUpgrade(id)) return false;
    if (!upgradeVisible(u)) { flashMsg("Noch nicht verfügbar."); return false; }
    if (state.bank < u.base) { flashMsg("Zu wenig Blubber. Es fehlen " + fmt(u.base - state.bank) + "."); return false; }
    state.bank -= u.base;
    state.upgrades[id] = true;
    state.stats.upgradesBought++;
    flashMsg(u.icon + " " + u.name + " gekauft");
    renderAll();
    checkAchievements();
    save();
    return true;
  }

  var SELL_RATIO = 0.5;            /* Cookie Clicker gibt 50 % zurueck */
  function sellRatio() { return hasPrestigeFlag("p_sell") ? 1 : SELL_RATIO; }

  /** Verkauft n Stueck eines Gebaeudes (Rueckerstattung 50 %). */
  function sellBuilding(id, n) {
    var b = BUILDING_BY_ID[id];
    if (!b) return false;
    var owned = state.buildings[id];
    if (owned <= 0) { flashMsg("Du besitzt kein " + b.name + "."); return false; }
    var count = (n === "max" || n === undefined) ? owned : Math.min(owned, Number(n));
    if (!count || count < 1) return false;

    var refund = 0;
    for (var i = 0; i < count; i++) {
      /* das zuletzt gekaufte Stueck hat die hoechsten Kosten -> von hinten abrechnen */
      refund += buildingCost(b, owned - 1 - i) * sellRatio();
    }
    refund = Math.floor(refund);

    state.buildings[id] = owned - count;
    state.bank += refund;
    state.stats.sold = (state.stats.sold || 0) + count;
    flashMsg("\u{1F4B8} " + count + "x " + b.name + " verkauft · +" + fmt(refund) + " Blubber");
    renderAll();
    save();
    return true;
  }

  /* ---- Evolution: einmalig, bei EVOLVE_AT Gesamtblubber ---- */
  var EVOLVE_AT = 4e6;

  /** Evolutions-Schwelle; "Schnelle Evolution" senkt sie auf 1 Mio. */
  function evolveAt() { return hasPrestigeFlag("p_evolve") ? 1e6 : EVOLVE_AT; }

  /** Bild und Rahmen passend zum Evolutionszustand setzen (idempotent). */
  function syncFishLook() {
    var img = $("tyFishImg");
    var skin = $("tyFish");
    if (!img) return;
    var mega = !!state.pUpgrades.p_mega;
    var target = mega ? "assets/mega-gyarados-avatar.jpg"
      : state.evolved ? "assets/gyarados-avatar.jpg" : "assets/magikarp-avatar.jpg";
    if (img.getAttribute("src") !== target) img.src = target;
    img.alt = mega ? "Mega Gyarados" : state.evolved ? "Gyarados" : "Magikarp";
    if (skin) {
      skin.classList.toggle("evolved", !!state.evolved && !mega);
      skin.classList.toggle("mega", mega);
    }
  }

  function applyEvolution() {
    if (state.evolved) return false;
    if (state.allTime < evolveAt()) return false;
    state.evolved = true;
    syncFishLook();
    flashMsg("\u{1F409} EVOLUTION! Gyarados bringt ab jetzt +25 % auf alles.");
    toast("\u{1F409} EVOLUTION! Magikarp ist jetzt Gyarados!");
    if (window.confettiBurst) window.confettiBurst();
    renderAll();
    checkAchievements();
    save();
    return true;
  }

  /* ---- Aufstieg / Prestige ---- */
  var ASCEND_MIN = 1e7;

  /** Wie viele Prestige-LEVEL gibt es fuer diese Runde? */
  function ascendPointsFor(total) {
    if (total < ASCEND_MIN) return 0;
    return Math.floor(Math.pow(total / ASCEND_MIN, CORE_RATIO));
  }

  /** Wie viele Mega-Kerne gibt es fuer diese Runde?
      Ein Aufstieg gibt immer mehr Kerne als Level, damit man im
      Baum vorankommt. Die Waehrung ist bewusst grosszuegiger als
      der Level-Bonus, genau wie Cookie Clickers Chips. */
  function coresForLevels(levels) {
    if (levels < 1) return 0;
    return CORE_START + Math.floor(Math.pow(levels, 1.15));
  }

  function coresForAscend() {
    return coresForLevels(ascendPointsFor(state.total));
  }

  function ascend() {
    var pts = ascendPointsFor(state.total);
    if (pts < 1) {
      toast("Für einen Aufstieg brauchst du mindestens " + fmt(ASCEND_MIN) + " Blubber in dieser Runde.");
      return false;
    }
    var newCores = coresForLevels(pts);
    if (!window.confirm("Aufsteigen? Konto, Gebäude und Upgrades werden zurückgesetzt.\n\n" +
      "Du bekommst +" + pts + " Prestige-Level (dauerhaft +" + (state.ascPoints + pts) +
      " % Bonus) und " + newCores + " Mega-Kerne für den Prestige-Baum.\n" +
      "Erfolge und der Baum bleiben erhalten.")) return false;
    state.bank = 0;
    state.total = 0;
    state.ascPoints += pts;
    state.cores += newCores;
    state.ascensions++;
    BUILDINGS.forEach(function (b) { state.buildings[b.id] = 0; });
    state.upgrades = {};
    state.buffs = [];
    state.seasonTime = 0;
    state.seasonActive = false;
    /* Evolution haengt an allTime, bleibt also erhalten. Bild danach ausrichten. */
    state.evolved = state.allTime >= evolveAt();
    syncFishLook();
    renderAll();
    checkAchievements();
    save();
    toast("\u{1F300} Aufgestiegen! +" + pts + " Level, +" + newCores + " Mega-Kerne. Bonus: +" + state.ascPoints + " %");
    return true;
  }

  function doReset() {
    if (!window.confirm("Alles löschen? Konto, Gebäude, Upgrades, Erfolge, Aufstiege, Mega-Kerne und der komplette Prestige-Baum verschwinden endgültig.")) return false;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    state = newState();
    syncFishLook();
    renderAll();
    save();
    toast("\u{1F9F9} Teich geleert. Neuanfang!");
    return true;
  }

  function cycleShopping() {
    shopping = String(cyc(shopping));
    var btn = $("tyShopBtn");
    if (btn) btn.textContent = shopping === "max" ? "Kaufen: MAX" : "Kaufen: " + shopping;
    renderBuildings();
  }

  function switchTab(name) {
    tab = name;
    document.querySelectorAll(".ty-tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === name);
    });
    ["buildings", "upgrades", "achievements", "prestige", "stats"].forEach(function (n) {
      var pane = $("tyPane-" + n);
      if (pane) pane.classList.toggle("hidden", n !== name);
    });
  }

  /* ============================================================
     8. FEEDBACK
     ============================================================ */
  function floatText(e, txt, crit) {
    var host = $("tyFishWrap");
    if (!host) return;
    var el = document.createElement("span");
    el.className = "ty-float" + (crit ? " crit" : "");
    el.textContent = txt;
    var r = host.getBoundingClientRect();
    var x, y;
    if (e && e.clientX) { x = e.clientX - r.left; y = e.clientY - r.top; }
    else { x = r.width / 2; y = r.height / 3; }
    el.style.left = Math.max(8, Math.min(r.width - 8, x)) + "px";
    el.style.top = Math.max(8, y) + "px";
    host.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
  }

  var msgTimer;
  function flashMsg(txt) {
    var el = $("tyMsg");
    if (!el) return;
    el.textContent = txt;
    el.classList.add("on");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      el.classList.remove("on");
      el.textContent = "";
    }, 2600);
  }

  var toastTimer;
  function toast(txt) {
    var el = $("tyToast");
    if (!el) return;
    el.textContent = txt;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3600);
  }

  /* ============================================================
     9. SPEICHERN / LADEN
     ============================================================ */
  function save() {
    try {
      state.lastSeen = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: SAVE_VERSION,
        bank: state.bank,
        total: state.total,
        allTime: state.allTime,
        clicks: state.clicks,
        evolved: state.evolved,
        buildings: state.buildings,
        upgrades: state.upgrades,
        achievements: state.achievements,
        buffs: state.buffs,
        stats: state.stats,
        ascensions: state.ascensions,
        ascPoints: state.ascPoints,
        cores: state.cores,
        pUpgrades: state.pUpgrades,
        seasonIdx: state.seasonIdx,
        seasonTime: state.seasonTime,
        seasonActive: state.seasonActive,
        lastSeen: state.lastSeen
      }));
    } catch (e) { /* Speicher voll oder gesperrt - Spiel laeuft weiter */ }
  }

  var saveTimer;
  function saveThrottled() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () { saveTimer = null; save(); }, 500);
  }

  function num(v, def) {
    var n = Number(v);
    return isFinite(n) && n >= 0 ? n : (def || 0);
  }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { }
    if (!raw) { loadLegacy(); return; }

    var d;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || typeof d !== "object") return;

    state.bank = num(d.bank);
    state.total = num(d.total);
    state.allTime = Math.max(num(d.allTime), state.total);
    state.clicks = Math.floor(num(d.clicks));
    state.evolved = !!d.evolved;
    state.ascensions = Math.floor(num(d.ascensions));
    state.ascPoints = Math.floor(num(d.ascPoints));
    state.cores = Math.floor(num(d.cores));
    if (d.pUpgrades && typeof d.pUpgrades === "object") {
      Object.keys(d.pUpgrades).forEach(function (k) {
        /* Nur echte Baum-IDs und nur echte true-Werte uebernehmen. */
        if (Object.prototype.hasOwnProperty.call(PRESTIGE_BY_ID, k) && d.pUpgrades[k] === true) {
          state.pUpgrades[k] = true;
        }
      });
    }
    rebuildPrestigeFlags();
    state.seasonIdx = Math.min(SEASONS.length - 1, Math.floor(num(d.seasonIdx)));
    state.seasonTime = Math.min(SEASON_LEN, num(d.seasonTime));
    state.seasonActive = !!d.seasonActive;
    state.lastSeen = num(d.lastSeen, Date.now());

    if (d.buildings && typeof d.buildings === "object") {
      BUILDINGS.forEach(function (b) {
        state.buildings[b.id] = Math.min(1e6, Math.floor(num(d.buildings[b.id])));
      });
    }
    if (d.upgrades && typeof d.upgrades === "object") {
      Object.keys(d.upgrades).forEach(function (k) {
        /* hasOwnProperty: "constructor"/"__proto__" aus fremden Saves duerfen
           nicht ueber die Prototypenkette als gueltiges Upgrade durchgehen. */
        if (Object.prototype.hasOwnProperty.call(UPGRADE_BY_ID, k) && d.upgrades[k] === true) {
          state.upgrades[k] = true;
        }
      });
    }
    if (d.achievements && typeof d.achievements === "object") {
      ACHIEVEMENTS.forEach(function (a) {
        if (d.achievements[a.id]) state.achievements[a.id] = true;
      });
    }
    if (Array.isArray(d.buffs)) {
      var now = Date.now();
      state.buffs = d.buffs.filter(function (b) {
        return b && typeof b === "object" && isFinite(b.mult) && b.mult > 0 &&
          isFinite(b.until) && b.until > now && b.until < now + 120000;
      }).slice(0, 10);
    }
    if (d.stats && typeof d.stats === "object") {
      state.stats.golden = Math.floor(num(d.stats.golden));
      state.stats.seasons = Math.floor(num(d.stats.seasons));
      state.stats.upgradesBought = Math.floor(num(d.stats.upgradesBought));
      state.stats.sold = Math.floor(num(d.stats.sold));
    }

    /* Offline-Produktion: max. 3 Stunden nachtragen.
       lastSeen muss plausibel sein - fehlt es oder liegt es in der Zukunft,
       gibt es keinen Bonus (sonst waeren 3 Stunden gratis). */
    var nowMs = Date.now();
    var hasStamp = state.lastSeen > 0 && state.lastSeen <= nowMs;
    var idle = hasStamp ? (nowMs - state.lastSeen) / 1000 : 0;
    if (idle > 60) {
      var capped = Math.min(idle, 3 * 3600);
      var eff = hasPrestigeFlag("p_offline") ? 1 : 0.5;
      var gain = computeCps() * capped * eff;
      if (gain > 1) {
        state.bank += gain;
        state.total += gain;
        state.allTime += gain;
        setTimeout(function () {
          toast("\u{1F319} Willkommen zurück! Deine Fische haben " + fmt(gain) + " Blubber gesammelt.");
        }, 900);
      }
    }
  }

  /** Altes v2-Save uebernehmen, damit niemand seinen Fortschritt verliert. */
  function loadLegacy() {
    var raw = null;
    try { raw = localStorage.getItem(LEGACY_KEYS[0]); } catch (e) { }
    if (!raw) return;
    var d;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || typeof d !== "object") return;

    var oldTotal = num(d.total);
    var oldBank = num(d.bank);
    state.ascPoints = 0;
    state.bank = oldBank;
    state.total = oldTotal;
    state.allTime = oldTotal;
    state.clicks = Math.floor(num(d.clicks));
    state.evolved = !!d.evolved;

    /* Alte Levels grosszuegig in neue Gebaeude umrechnen. */
    var map = { flosse: "flosse", alge: "algen", rudel: "rudel", aquarium: "aquarium" };
    if (d.ups && typeof d.ups === "object") {
      Object.keys(map).forEach(function (old) {
        var lv = Math.floor(num(d.ups[old]));
        if (lv > 0) state.buildings[map[old]] += lv;
      });
    }
    save();
    setTimeout(function () {
      toast("\u{1F4E6} Altes Save übernommen – dein Fortschritt ist da.");
    }, 800);
  }

  /* ============================================================
     10. TICK-LOOP
     ============================================================ */
  var lastTick = Date.now();
  var TICK_MS = 100;

  function tick() {
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    if (dt < 0) dt = 0;
    if (dt > 5) dt = 5;             /* Tab im Hintergrund nicht ueberbelohnen */

    var cps = computeCps();
    if (cps > 0) {
      var gain = cps * dt;
      state.bank += gain;
      state.total += gain;
      state.allTime += gain;
    }

    /* Jahreszeiten */
    state.seasonTime += dt;
    if (state.seasonActive) {
      if (state.seasonTime >= SEASON_LEN) {
        state.seasonActive = false;
        state.seasonTime = 0;
        toast("\u{1F324} Die Jahreszeit ist vorbei. Der Teich beruhigt sich.");
      }
    } else if (state.seasonTime >= SEASON_GAP) {
      state.seasonIdx = (state.seasonIdx + 1) % SEASONS.length;
      state.seasonActive = true;
      state.seasonTime = 0;
      state.stats.seasons++;
      toast(SEASONS[state.seasonIdx].text);
      checkAchievements();
    }

    /* Blubber-Ball spawnen */
    if (!golden.el && golden.spawnAt && now >= golden.spawnAt) spawnGolden();

    applyEvolution();

    renderTop();
    renderBuffs();
    if (tab === "buildings") renderBuildings();
    if (tab === "stats") renderStats();
    if (tab === "upgrades") renderUpgrades();
    renderAscend();

    /* Buffs abgelaufen? Dann Liste neu zeichnen */
    if (state.buffs.some(function (b) { return b.until <= now; })) {
      state.buffs = state.buffs.filter(function (b) { return b.until > now; });
      renderBuffs();
    }

    saveThrottled();
  }

  /* ============================================================
     11. INIT
     ============================================================ */
  function bind() {
    var fish = $("tyFish");
    if (fish) {
      fish.addEventListener("click", function (e) { clickFish(e); });
      fish.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); clickFish(null); }
      });
    }
    var shop = $("tyShopBtn");
    if (shop) shop.addEventListener("click", cycleShopping);

    document.querySelectorAll(".ty-tab").forEach(function (btn) {
      btn.addEventListener("click", function () { switchTab(btn.getAttribute("data-tab")); });
    });

    var asc = $("tyAscendBtn");
    if (asc) asc.addEventListener("click", ascend);
    var reset = $("tyResetBtn");
    if (reset) reset.addEventListener("click", doReset);
    var help = $("tyHelpBtn");
    if (help) help.addEventListener("click", function () {
      if (window.openUpgradeHelp) window.openUpgradeHelp();
    });

    window.addEventListener("beforeunload", save);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) save();
    });
  }

  function init() {
    if (!$("tyGame")) return;          /* Spiel ist nicht auf der Seite */
    /* Skript evtl. doppelt eingebunden: dann nicht zwei Tick-Loops starten */
    if (window.__magikarpTycoonBooted) return;
    window.__magikarpTycoonBooted = true;
    load();
    bind();
    scheduleGolden();
    lastTick = Date.now();
    renderAll();
    syncFishLook();
    applyEvolution();
    checkAchievements();
    setInterval(tick, TICK_MS);
    setInterval(save, 10000);
  }

  /* Oeffentliche API - auch fuer Tests */
  window.MagikarpTycoon = {
    state: function () { return state; },
    click: clickFish,
    buyBuilding: buyBuilding,
    buyUpgrade: buyUpgrade,
    ascend: ascend,
    ascendPointsFor: ascendPointsFor,
    coresForLevels: coresForLevels,
    coresForAscend: coresForAscend,
    buyPrestige: buyPrestige,
    prestigeUpgrades: PRESTIGE_UPGRADES,
    hasPrestigeFlag: hasPrestigeFlag,
    prestigeBadgeLevel: prestigeBadgeLevel,
    reset: doReset,
    save: save,
    load: load,
    computeCps: computeCps,
    computePerClick: computePerClick,
    buildingCost: buildingCost,
    bulkCost: bulkCost,
    maxAffordable: maxAffordable,
    buildings: BUILDINGS,
    upgrades: CLICK_UPGRADES.concat(BUILDING_UPGRADES),
    achievements: ACHIEVEMENTS,
    seasons: SEASONS,
    fmt: fmt,
    render: renderAll,
    sellBuilding: sellBuilding,
    milestoneCount: milestoneCount,
    nextMilestone: nextMilestone,
    totalMilestones: totalMilestones,
    critChance: critChance,
    spawnGolden: spawnGolden,
    catchGolden: catchGolden,
    tick: tick,
    tab: switchTab,
    shop: cycleShopping,
    EVOLVE_AT: function () { return EVOLVE_AT; },
    ASCEND_MIN: function () { return ASCEND_MIN; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
