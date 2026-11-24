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
- 🎮 **Füttere Magikarp:** 50 Klicks → Evolution zu Gyarados 🐉
- 💬 Fake-DM mit Auto-Antworten („Blub.")
- 📋 `!onlyfish` kopieren, Countdown zum nächsten Stream (22:30 Uhr)
- 🔴 **Echter Live-Status** über decapi.me (live/offline, Spiel, Titel, Uptime) + optionaler Stream-Embed
- 🎮 **Magikarp Tycoon:** Klicker mit 5 Upgrades, passivem Einkommen, kritischen Treffern, Evolutionsstufen und Prestige
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

Der Klicker in der Sidebar ist ein kleines Idle-Game:

| Upgrade | Wirkung | Startpreis |
|---|---|---|
| 🖐️ Flossen-Power | +1 Blubber pro Klick | 15 |
| 🌿 Algen-Farm | +1 Blubber pro Sekunde | 40 |
| 🐠 Fisch-Rudel | +5 Blubber pro Sekunde | 400 |
| 🫧 Aquarium | +25 Blubber pro Sekunde | 5.000 |
| ⚡ Kritische Welle | +10 % Chance auf 10× Klick | 750 |

- Preise steigen pro Level (Faktor ~1,9–2,4), jedes Upgrade hat ein Max-Level
- **Evolution bei 50 Blubber** → Magikarp wird Gyarados, danach weitere Stufen bis Sturm-Gyarados (500)
- Fortschritt wird in `localStorage` gespeichert und beim nächsten Besuch geladen
- **Neu starten** (Prestige) ab 100 gesammelten Blubber – der Leaderboard-Eintrag bleibt

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
