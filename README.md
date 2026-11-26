# OnlyFish 🐟 – Parodie-Seite für dombledore1337

Die lustigste Parodie-Website für den Twitch-Streamer **dombledore1337** – 100 % unzensierte Schuppen, 0 % echte Fische. Magikarp-Fan-Content als Gag, der per Chat-Befehl aufgerufen wird.

## 🚀 Live ansehen

Die Seite ist eine einzige `index.html` (plus Bild in `assets/`). Einfach öffnen oder auf GitHub Pages hosten:

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

Ein Cookie-Clicker-Klon im Magikarp-Gewand. Die Logik liegt in **`assets/tycoon.js`** (rund 1.000 Zeilen, keine Abhängigkeiten), das Markup in `index.html`.

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
| 🌊 Tiefsee-Anlage | +7,8K/s | 20 Mio. |
| 🐉 Gyarados-Legende | +44K/s | 330 Mio. |

Kaufmenge lässt sich umschalten: **1 → 10 → 100 → MAX**. Der MAX-Kauf rechnet die geometrische Reihe aus, man zahlt also nie zu viel.

### Upgrades (38 Stück, einmalig)

- **6 Klick-Upgrades** – verdoppeln bzw. verdreifachen den Klickwert (100 bis 5 Mrd.)
- **32 Gebäude-Upgrades** – je Gebäude vier Stufen, verfügbar ab 10/25/50/100 Stück, jeweils ×2 Produktion

### Weitere Systeme

- **Erfolge:** 20 Stück, jeder gibt dauerhaft **+1 bis +7 % Produktion** (insgesamt +57 % möglich)
- **Blubber-Ball:** schwebt alle 90–180 s vorbei. Beim Klick: Sofort-Blubber (15 % des Kontos), *Klick-Frenzy* (15 s lang 77-fach), *Drachenrausch* (30 s lang 7-fach Produktion) oder – wie beim Original – nichts
- **Jahreszeiten:** wechseln alle 2 Minuten Spielzeit, dazwischen 4 Minuten Ruhe. Sommer **+25 % Produktion**, Herbst −15 % dafür mehr Bälle, Winter stärkere Ball-Belohnungen
- **Evolution:** ab **4 Mio.** gesammelten Blubber wird Magikarp zu Gyarados und gibt dauerhaft **+25 %**
- **Aufstieg (Prestige):** ab **10 Mio.** in einer Runde. Punkte wachsen mit `(Runde/10 Mio)^0,6`, jeder Punkt gibt +1 % permanent. Gebäude und Konto werden zurückgesetzt, Erfolge bleiben
- **Offline-Produktion:** bis zu 3 Stunden bei 50 % Effizienz

### Speicherung

`localStorage` unter `onlyfish.tycoon.v3`. Ein vorhandenes Save aus der alten Version (`onlyfish.save.v2`) wird beim ersten Start automatisch übernommen. Alle geladenen Werte werden auf endliche, nicht-negative Zahlen geprüft – ein manipuliertes Save kann das Spiel nicht kaputt machen.

### Balance (gemessen, nicht geschätzt)

| Meilenstein | Gelegenheitsspieler (1 Klick/s) | Normalspieler (4 Klicks/s) |
|---|---|---|
| 1 Mio. Blubber | ~24 min | ~10 min |
| 10 Mio. | ~61 min | ~36 min |
| 100 Mio. | ~2,5 h | ~1,7 h |
| Evolution (4 Mio.) | ~41 min | ~21 min |

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
