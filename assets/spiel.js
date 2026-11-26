/*!
 * Seiten-Skript fuer spiel.html
 * Enthaelt nur, was die Seite selbst braucht: Toast, Modal, Leaderboard.
 * Die Spiellogik steckt komplett in assets/tycoon.js.
 */
(function () {
  "use strict";

  /* ---------- TOAST ---------- */
  var toastTimer;
  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }
  window.showToast = showToast;

  /* ---------- MODAL ---------- */
  var MODALS = {
    help: null   /* wird von openUpgradeHelp() gesetzt */
  };

  function openModal(type) {
    var d = MODALS[type];
    if (!d) return;
    var emojiEl = document.getElementById("modalEmoji");
    var textEl = document.getElementById("modalText");
    var titleEl = document.getElementById("modalTitle");
    var linkEl = document.getElementById("twitchLink");
    if (!emojiEl || !textEl || !titleEl) return;

    emojiEl.textContent = d.emoji || "";
    titleEl.textContent = d.title || "";
    /* Nur intern gesetzte, vertrauenswuerdige Strings - kein Nutzer-Input. */
    textEl.innerHTML = d.text || "";
    if (linkEl) linkEl.style.display = d.hideTwitch ? "none" : "block";
    var bd = document.getElementById("modalBackdrop");
    if (bd) bd.classList.add("open");
  }
  function closeModal() {
    var bd = document.getElementById("modalBackdrop");
    if (bd) bd.classList.remove("open");
  }
  function closeModalOnBg(e) {
    if (e.target && e.target.id === "modalBackdrop") closeModal();
  }
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.closeModalOnBg = closeModalOnBg;

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- HILFE-TEXT ---------- */
  function openUpgradeHelp() {
    MODALS.help = {
      emoji: "\u{1F3AE}",
      title: "Magikarp Tycoon",
      hideTwitch: true,
      text:
        "<strong>1. Klicken</strong> gibt Blubber. Der <em>Flossen-Betrieb</em> erhöht den Klickwert <em>und</em> produziert passiv. " +
        "Ab 50 Flossen hast du eine Krit-Chance auf 7-fache Klicks – sie steht oben unter dem Konto.<br><br>" +

        "<strong>2. Gebäude</strong> produzieren automatisch. Jedes Stück kostet 15 % mehr als das davor. " +
        "Mit <em>Kaufen: 1 / 10 / 100 / MAX</em> kaufst du in Stapeln; der 💰-Knopf rechts an jeder Zeile verkauft 1 Stück für 50 % zurück.<br><br>" +

        "<strong>3. Meilensteine:</strong> Ab 25, 50, 100, 150 und 200 Stück bekommt ein Gebäude dauerhaft +1 % auf die eigene Produktion. " +
        "Unter jedem Gebäude steht, wie viele Boni du hast und wann der nächste kommt.<br><br>" +

        "<strong>4. Upgrades</strong> sind einmalig: Klick-Upgrades verdoppeln den Klickwert, Gebäude-Upgrades verdoppeln die Produktion eines Gebäudes. " +
        "Sie tauchen erst auf, wenn du genug davon gebaut hast.<br><br>" +

        "<strong>5. Blubber-Ball:</strong> Ab und zu schwimmt ein goldener Ball vorbei. Klick ihn für Sofort-Blubber, " +
        "<em>Klick-Frenzy</em> (15 s lang 77-fache Klicks) oder <em>Drachenrausch</em> (30 s lang 7-fache Produktion).<br><br>" +

        "<strong>6. Jahreszeiten</strong> wechseln automatisch: Sommer +25 % Produktion (aber Klicks zählen ×0,9), " +
        "Herbst −15 % Produktion dafür mehr Bälle, Winter stärkere Ball-Belohnungen.<br><br>" +

        "<strong>7. Erfolge</strong> geben dauerhaft Produktionsbonus, jeder zeigt seinen Fortschritt. " +
        "<strong>Aufsteigen</strong> ab 10 Mio. setzt Gebäude und Konto zurück, gibt aber einen permanenten Prozent-Bonus, der bleibt – Erfolge bleiben auch.<br><br>" +

        "<strong>8. Evolution:</strong> Ab 4 Mio. gesammelten Blubber wird Magikarp zu Gyarados und produziert dauerhaft +25 %.<br><br>" +

        "<strong>9. Leaderboard:</strong> Max. 15 Zeichen, nur Buchstaben, Zahlen, _ und -. Alles bleibt lokal in deinem Browser."
    };
    openModal("help");
  }
  window.openUpgradeHelp = openUpgradeHelp;

  /* ---------- LEADERBOARD (lokal, XSS-sicher) ---------- */
  var LB_KEY = "onlyfish.leaderboard.v1";
  var LB_MAX = 15;
  var LB_MAX_SCORE = 1e15;

  var BAD_WORDS = ["arschloch", "arsch", "scheiss", "scheiße", "scheisse", "wichser", "wichs", "wixx",
    "ficken", "fick", "hurensohn", "hure", "fotze", "schwanz", "penis", "idiot", "volldepp", "depp",
    "trottel", "spast", "missgeburt", "nazi", "hitler", "porno", "bitch", "fuck", "shit", "cunt",
    "nigger", "nigga", "retard", "bastard", "asshole", "dickhead", "dick", "cock", "pussy", "whore",
    "slut", "schwuchtel", "faggot", "homo", "nutte", "kacke", "kack", "piss", "penner", "vollpfosten",
    "wanker", "boobs", "cum", "anal", "titten", "sex", "xxx"];
  var LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i" };

  function normalizeName(raw) {
    return String(raw == null ? "" : raw)
      .slice(0, 200)
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .split("").map(function (ch) { return LEET[ch] || ch; }).join("")
      .replace(/[^a-z]/g, "");
  }

  function validateName(raw) {
    var name = String(raw == null ? "" : raw).trim();
    if (!name) return { ok: false, msg: "Bitte gib einen Namen ein." };
    if (name.length > LB_MAX) return { ok: false, msg: "Maximal " + LB_MAX + " Zeichen." };
    if (!/^[A-Za-z0-9ÄÖÜäöüß_-]+$/.test(name))
      return { ok: false, msg: "Nur Buchstaben, Zahlen, _ und - erlaubt." };
    if (!/[A-Za-zÄÖÜäöüß]/.test(name))
      return { ok: false, msg: "Bitte mindestens einen Buchstaben verwenden." };
    if (/(.)\1{4,}/.test(name))
      return { ok: false, msg: "Zu viele gleiche Zeichen hintereinander." };

    var normLeet = normalizeName(name);
    var normPlain = name.toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    for (var i = 0; i < BAD_WORDS.length; i++) {
      var b = normalizeName(BAD_WORDS[i]);
      if (!b) continue;
      var re = new RegExp("(^|[^a-z])" + b + "([^a-z]|$)");
      if (re.test(normLeet) || re.test(normPlain))
        return { ok: false, msg: "Der Name enthält ein unpassendes Wort." };
    }
    return { ok: true, value: name };
  }

  function loadLB() {
    try {
      var raw = localStorage.getItem(LB_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      var out = [];
      var seen = {};
      for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (!e || typeof e.name !== "string") continue;
        var v = validateName(e.name);
        if (!v.ok) continue;
        var key = v.value.toLowerCase();
        if (seen[key]) continue;
        seen[key] = true;
        var score = Number(e.score);
        if (!Number.isFinite(score) || score < 0) score = 0;
        out.push({ name: v.value, score: Math.min(LB_MAX_SCORE, Math.floor(score)) });
        if (out.length >= 100) break;
      }
      return out;
    } catch (err) { return []; }
  }
  function saveLB(list) {
    try { localStorage.setItem(LB_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) { }
  }
  function sortedLB() {
    return loadLB().sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    });
  }
  function addScore(name, score) {
    var list = loadLB();
    var key = name.toLowerCase();
    var existing = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].name.toLowerCase() === key) { existing = list[i]; break; }
    }
    if (existing) { if (score > existing.score) existing.score = score; }
    else { list.push({ name: name, score: score }); }
    saveLB(list);
    return sortedLB();
  }

  function gameState() {
    return (window.MagikarpTycoon && window.MagikarpTycoon.state()) || { total: 0, bank: 0 };
  }

  function renderLeaderboard() {
    var listEl = document.getElementById("lbList");
    var countEl = document.getElementById("lbCount");
    if (!listEl) return;
    var list = sortedLB().slice(0, 20);
    var me = "";
    try { me = localStorage.getItem("onlyfish.me") || ""; } catch (e) { }

    if (countEl) {
      countEl.textContent = list.length
        ? list.length + (list.length === 1 ? " Eintrag" : " Einträge")
        : "leer";
    }
    if (!list.length) {
      listEl.innerHTML = '<li class="lb-empty">Noch niemand hier. Sei der erste Fisch! 🐟</li>';
      return;
    }
    var medals = ["🥇", "🥈", "🥉"];
    listEl.innerHTML = "";
    list.forEach(function (e, i) {
      var li = document.createElement("li");
      li.className = "lb-item" + (me && e.name === me ? " me" : "");

      var pos = document.createElement("span");
      pos.className = "lb-pos";
      pos.textContent = medals[i] || String(i + 1);

      var nm = document.createElement("span");
      nm.className = "lb-name";
      nm.textContent = e.name;          /* textContent -> kein HTML-Injection */
      nm.title = e.name;

      var sc = document.createElement("span");
      sc.className = "lb-score";
      sc.textContent = e.score.toLocaleString("de-DE") + " 🫧";

      li.appendChild(pos);
      li.appendChild(nm);
      li.appendChild(sc);
      listEl.appendChild(li);
    });
  }

  function submitScore(ev) {
    if (ev) ev.preventDefault();
    var input = document.getElementById("lbName");
    var hint = document.getElementById("lbHint");
    if (!input) return;
    var res = validateName(input.value);
    if (!res.ok) {
      input.classList.add("bad");
      setTimeout(function () { input.classList.remove("bad"); }, 420);
      if (hint) hint.textContent = "⚠️ " + res.msg;
      return;
    }
    var score = Math.floor(gameState().total || 0);
    addScore(res.value, score);
    try { localStorage.setItem("onlyfish.me", res.value); } catch (e) { }
    input.value = "";
    if (hint) hint.textContent = "✅ " + res.value + " steht im Leaderboard!";
    renderLeaderboard();
    showToast("🏆 " + res.value + ": " + score.toLocaleString("de-DE") + " Blubber");
  }

  function clearLeaderboard() {
    if (!window.confirm("Leaderboard auf diesem Gerät wirklich leeren?")) return;
    saveLB([]);
    try { localStorage.removeItem("onlyfish.me"); } catch (e) { }
    renderLeaderboard();
    showToast("🧹 Leaderboard geleert.");
  }
  window.submitScore = submitScore;
  window.clearLeaderboard = clearLeaderboard;
  window.renderLeaderboard = renderLeaderboard;
  /* Fuer Tests und externes Debugging - enthaelt keine Geheimnisse. */
  window.loadLB = loadLB;
  window.validateName = validateName;
  window.addScore = addScore;

  /* ---------- START ---------- */
  function init() {
    renderLeaderboard();
    var form = document.getElementById("lbForm");
    if (form) form.addEventListener("submit", submitScore);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
