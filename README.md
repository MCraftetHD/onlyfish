# OnlyFish 🐟 – Parodie-Seite für dombledore1337

Die lustigste Parodie-Website für den Twitch-Streamer **dombledore1337** – 100 % unzensierte Schuppen, 0 % echte Fische. Magikarp-Fan-Content als Gag, der per Chat-Befehl aufgerufen wird.

## 🚀 Live ansehen

Die Seite läuft ohne Build-Schritt: `index.html` (Startseite) und `spiel.html` (Clicker), dazu CSS/JS in `assets/`. Einfach öffnen oder auf GitHub Pages hosten:

1. Repo auf GitHub pushen
2. **Settings → Pages → Source: `main` / root**
3. URL im Twitch-Chat-Befehl eintragen

## 🤖 Chat-Befehl einrichten

Im Twitch-Chat tippt der Zuschauer:

```
!onlyfish
```

Der Bot antwortet mit dem Link zu dieser Seite.

**Nightbot:** `!commands add onlyfish <deine-link-url>`

**StreamElements:** `!commands add -cd=5 onlyfish <deine-link-url>`

**Tipp:** Auch als Channel-Point-Reward („OnlyFish öffnen") oder als wiederkehrender Command im Panel verlinken.

## ✨ Features

- OnlyFans-Style Profil mit Magikarp Mike (@dombledore1337)
- FSK-18-Kiemen Age-Gate (Gag)
- Abo-Tiers (Splasher / Kiemen-Fan / Gyarados VIP) – alle führen zurück zu Twitch
- Gesperrte Beiträge, Likes, Teilen, Gratis-Geschenk
- 💬 Fake-DM mit Auto-Antworten („Blub.")
- 📋 `!onlyfish` kopieren, Countdown zum nächsten Stream (22:30 Uhr)
- 🔴 **Echter Live-Status** über decapi.me (live/offline, Spiel, Titel, Uptime) + optionaler Stream-Embed
- 🎮 **Magikarp Tycoon:** vollwertiger Cookie-Clicker-Klon mit 8 Gebäuden, 38 Upgrades, Erfolgen, Jahreszeiten, Blubber-Bällen und Prestige
- 🏆 **Blubber-Leaderboard:** Name eintragen (max. 15 Zeichen, gefiltert), Speicherung lokal im Browser
- Blasen-Animation, Splash-Effekte, Konfetti

## 🔴 Live-Status (decapi.me)

Sidebar und Hero zeigen an, ob dombledore1337 gerade live ist – mit Spiel, Stream-Titel und Uptime. Alle 60 Sekunden wird neu geladen, dazu gibt es einen manuellen Refresh-Button.

Die Seite fragt dafür **[decapi.me](https://decapi.me/twitch/) ab**, und zwar drei Endpunkte:

```
https://decapi.me/twitch/uptime/dombledore1337
https://decapi.me/twitch/game/dombledore1337
https://decapi.me/twitch/title/dombledore1337
```

Kein API-Key, kein Secret, CORS-freundlich – läuft direkt auf GitHub Pages. Ist der Dienst gerade nicht erreichbar, zeigt die Seite ehrlich „Status unbekannt" statt fälschlich „Offline".

**Hinweis:** decapi liefert keine Zuschauerzahl. Deshalb zeigt die Karte nur Spiel, Titel und Uptime.

**Stream einbetten:** Wenn er live ist, erscheint im Live-Status ein Button „▶️ Einbetten". Der Player lädt erst auf Klick und nutzt automatisch deinen Hostnamen als Twitch-`parent`.

## 🎮 Magikarp Tycoon

Ein Cookie-Clicker-Klon im Magikarp-Gewand.

**Das Spiel hat eine eigene Seite: [`spiel.html`](spiel.html)** – bewusst getrennt, damit das UI nicht in der Sidebar gequetscht wird und auf dem Handy spielbar bleibt.

| Datei | Inhalt |
|---|---|
| `spiel.html` | Die Spielseite (Layout, Shop, Leaderboard) |
| `assets/tycoon.js` | Komplette Spiellogik, keine Abhängigkeiten |
| `assets/spiel.js` | Nur Seiten-Glue: Toast, Modal, Hilfe-Text, Leaderboard |
| `assets/spiel.css` | Layout + Mobile-Regeln der Spielseite |
| `assets/style.css` | Gemeinsames Design beider Seiten |

Auf der Startseite bleibt eine **Teaser-Karte** mit den live gelesenen Zahlen (Blubber, CPS, Erfolge). Sie rechnet die Werte aus dem `localStorage` nach – inklusive Meilensteinen, Upgrades, Erfolgen, Prestige und Evolution –, ohne das ganze Spiel zu laden.

### Mobile

Die Spielseite ist auf Touch ausgelegt:

- Ab 820 px wird aus dem 2-Spalten-Layout eine Spalte. Der **Klickbereich klebt oben** (`position: sticky`), damit man beim Einkaufen weiterklicken kann.
- Der Fisch bleibt mit **96 px** (84 px unter 400 px Breite) groß genug als Trefferfläche.
- Der 💰-Verkaufen-Knopf ist auf Touch **immer sichtbar** (kein Hover nötig) und misst 34 px.
- `env(safe-area-inset-bottom)` hält Inhalte über der iOS-Leiste frei; Toasts sitzen ebenfalls darüber.
- Querformat bekommt ein eigenes Layout (Fisch links, Shop rechts).
- `touch-action: manipulation` verhindert Doppeltipp-Zoom, `-webkit-tap-highlight-color` das blaue Aufblitzen.
- `prefers-reduced-motion` schaltet die Ball-Animation ab.

**Spielschleife:** klicken → Gebäude kaufen → Upgrades freischalten → Erfolge einsammeln → aufsteigen (Prestige).

### Gebäude

Kosten steigen pro Stück um **15 %** – exakt die Cookie-Clicker-Formel `Preis = Basis × 1,15^Stück`.

| Gebäude | Produktion | Startpreis |
|---|---|---|
| 🖐 Flossen-Betrieb | +0,1/s und +1 Klickwert | 15 |
| 🌿 Algen-Farm | +1/s | 100 |
| 💧 Schaum-Teich | +8/s | 1.100 |
| 🐠 Fisch-Rudel | +47/s | 12.000 |
| 🫗 Glas-Aquarium | +260/s | 130.000 |
| 🪸 Korallen-Riff | +1,4K/s | 1,4 Mio. |
| 🌊 Tiefsee-Anlage | +7,8K/s | 14 Mio. |
| 🐉 Gyarados-Legende | +44K/s | 140 Mio. |
| 🌍 Welt-Ozean | +260K/s | 1,4 Mrd. |
| 🚀 Kosmos-Teich | +1,6Mio/s | 14 Mrd. |

Die Kostenleiter springt durchgehend um **×10 pro Stufe** und die Produktion um **×5,5–6** – dieselbe Kurve wie im Original, damit jede Stufe irgendwann sinnvoll wird.

**Kaufmenge:** 1 → 10 → 100 → MAX. Der MAX-Kauf rechnet die geometrische Reihe aus, man zahlt also nie zu viel.

**Verkaufen:** Der 💰-Knopf an jeder Gebäudezeile verkauft 1 Stück für **50 %** des gezahlten Preises zurück (wie im Original). Kaufen und Verkaufen ist dadurch immer ein Verlust – kein Geldwäsche-Trick.

### Meilensteine

Ab **25, 50, 100, 150 und 200** Stück bekommt ein Gebäude dauerhaft **+1 %** auf seine eigene Produktion. Unter jedem Gebäude steht, wie viele Boni aktiv sind und wann der nächste kommt. Insgesamt sind 50 Meilensteine erreichbar (10 Gebäude × 5 Stufen).

### Weitere Systeme

- **Erfolge:** 23 Stück, jeder gibt dauerhaft **+1 bis +7 % Produktion** (insgesamt +64 % möglich). Jeder zeigt seinen Fortschritt live an (z. B. „1.847 / 10.000 Klicks").
- **Blubber-Ball:** schwebt alle 90–180 s vorbei. Beim Klick: Sofort-Blubber (15 % des Kontos), *Klick-Frenzy* (15 s lang 77-fach), *Drachenrausch* (30 s lang 7-fach Produktion) oder – wie beim Original – nichts
- **Jahreszeiten:** wechseln alle 2 Minuten Spielzeit, dazwischen 4 Minuten Ruhe. Sommer **+25 % Produktion**, Herbst −15 % dafür mehr Bälle, Winter stärkere Ball-Belohnungen
- **Evolution:** ab **4 Mio.** gesammelten Blubber wird Magikarp zu Gyarados und gibt dauerhaft **+25 %**
- **Aufstieg (Prestige):** ab **10 Mio.** in einer Runde. Punkte wachsen mit `(Runde/10 Mio)^0,6`, jeder Punkt gibt +1 % permanent. Gebäude und Konto werden zurückgesetzt, Erfolge bleiben
- **Offline-Produktion:** bis zu 3 Stunden bei 50 % Effizienz

### Speicherung

`localStorage` unter `onlyfish.tycoon.v3`. Ein vorhandenes Save aus der alten Version (`onlyfish.save.v2`) wird beim ersten Start automatisch übernommen. Alle geladenen Werte werden auf endliche, nicht-negative Zahlen geprüft – ein manipuliertes Save kann das Spiel nicht kaputt machen.

### Balance (gemessen, nicht geschätzt)

| Meilenstein | Gelegenheitsspieler (2 Klick/s) | Normalspieler (5 Klick/s) |
|---|---|---|
| 1 Mio. Blubber | ~11 min | ~6 min |
| 10 Mio. | ~31 min | ~21 min |
| 100 Mio. | ~78 min | ~61 min |
| 1 Mrd. | ~3,2 h | ~2,8 h |
| 10 Mrd. | ~7,4 h | ~6,9 h |
| Welt-Ozean (1,4 Mrd.) | ~24 h | ~24 h |

Das ist bewusst deutlich härter als vorher (Evolution lag bei 50 Blubber) und orientiert sich am Original.

## 🏆 Leaderboard

Name eintragen, fertig. Gespeichert wird **lokal in deinem Browser** (`localStorage`), nicht auf einem Server.

**Validierung des Namens:**
- maximal **15 Zeichen**
- nur Buchstaben (inkl. Umlaute), Zahlen, `_` und `-`
- keine Schimpfwörter – geprüft gegen eine Liste inkl. Leetspeak-Varianten (`4rsch`, `f1ck` …) und Wortgrenzen, damit Namen wie „Scunthorpe" nicht fälschlich blockiert werden
- Ausgabe ausschließlich über `textContent`, also kein HTML/JS-Injection möglich
- Einträge aus dem Speicher werden beim Laden erneut geprüft; manipulierte Daten werden verworfen, Punktzahlen auf sinnvolle Werte geklemmt

Gleicher Name = nur der höhere Score zählt. Über „Liste löschen" kann man die lokale Liste zurücksetzen.

## ⚠️ Hinweis

Parodie-Seite, keine Verbindung zu OnlyFans. Alle Preise fiktiv. Magikarp als Fan-Gag.
