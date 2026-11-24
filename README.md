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
- 🔴 **Echter Live-Status** von Twitch (live/offline, Spiel, Zuschauer, Uptime) + optionaler Stream-Embed
- Blasen-Animation, Splash-Effekte, Konfetti

## 🔴 Live-Status (Twitch)

Die Seite zeigt in der Sidebar und im Hero an, ob dombledore1337 gerade live ist – mit Spiel, Zuschauerzahl und Uptime. Alle 60 Sekunden wird neu geladen, dazu gibt es einen manuellen Refresh-Button.

**Ohne Einrichtung** funktioniert das sofort: Es werden öffentliche Status-APIs abgefragt (decapi.me, dann ivr.fi). Das ist CORS-freundlich und braucht keinen Key – ideal für GitHub Pages.

**Eigene Twitch-API (optional, mehr Details):** Trage in `index.html` oben im Script-Block deine Werte ein:

```js
const TWITCH_CLIENT_ID = "deine-client-id";
const TWITCH_ACCESS_TOKEN = "dein-app-access-token";
```

So bekommst du es:
1. [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) → „Register your application", Typ **Public**
2. Client-ID kopieren
3. App Access Token holen (gültig ~60 Tage):
   ```
   POST https://id.twitch.tv/oauth2/token?client_id=DEINE_ID&client_secret=DEIN_SECRET&grant_type=client_credentials
   ```

⚠️ **Wichtig:** Ein Twitch-Client-Secret in einer statischen Seite ist nie wirklich geheim. Wer den Quellcode liest, sieht es. Für einen Gag-Link reicht der öffentliche Fallback völlig aus – nutze eigene Credentials nur, wenn dir das egal ist oder die Seite hinter einem Login liegt. Den App Access Token (nicht das Secret!) sieht man zwar auch, aber er läuft nach ~60 Tagen ab und hat nur Lesezugriff.

**Stream einbetten:** Wenn er live ist, erscheint im Live-Status ein Button „▶️ Einbetten". Der Player wird erst auf Klick geladen (kein Autoplay-Stress) und nutzt automatisch deinen Hostnamen als Twitch-`parent`.

## ⚠️ Hinweis

Parodie-Seite, keine Verbindung zu OnlyFans. Alle Preise fiktiv. Magikarp als Fan-Gag.
