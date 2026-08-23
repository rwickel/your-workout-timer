# Workout Timer

A minimalist, monochrome workout timer PWA with interval training and full WOD (Workout of the Day) support — built with React, Vite, Tailwind CSS and Framer Motion.

![Design](https://img.shields.io/badge/design-pure%20monochrome-black)

## Features

### Intervals
- Configurable work / rest / preparation times per round
- Progressive adjustments (+/− seconds per round)
- Round progress dots, tabular digits, no layout jitter

### WODs
Four schemes:
| Scheme | Clock | End |
|---|---|---|
| **AMRAP** | Countdown to time cap | Manual round counter (−/+) saved as score |
| **For Time** | Count-up | Time cap or manual "Finish" → achieved time saved |
| **EMOM** | Configurable round time in seconds | After all rounds, beeps each round |
| **Rounds** | Exercise → rest → exercise phases | Voice-guided, rest between exercises configurable |

- **Famous WODs** presets: Cindy, Mary, Chelsea, Murph, Angie, The 300, Annie, 100 Burpees, Tabata Something Else, Barbara, plus calisthenics WODs (Gymnastique, Street Workout, Upside Down, L-Sit Ladder, …)
- **WOD builder**: name, scheme, editable steppers for duration/rounds/reps
- **Share**: QR code, copy link or WhatsApp — the receiver opens a web link (`https://<host>/wod?d=…`), previews the WOD and can add it to their collection or start it instantly

### Voice Guidance
- English speech synthesis: "Get ready", countdown "10, 9, …", "Prepare for work", "Work", "Prepare for rest", "Time!"
- Smart handling of very short rest periods (announcement is skipped to avoid overlapping counts)
- Volume slider + mute toggle

### History
- All completed workouts recorded (intervals auto-recorded, WOD results on save)
- List grouped by day, calendar month view with active-day rings
- Filters: scheme chips, name search, date range (7d/30d/all)
- Stats strip: sessions, total time and top WOD per month

## Design System

Strict monochrome: pure black canvas (#000), white primary elements, neutral-gray secondary text, `border-neutral-900` dividers. No accent colors, no glows, no shadows. Inter typeface, uppercase `tracking-widest` labels, tabular numerals. OLED-friendly.

## Run Locally

```sh
git clone https://github.com/rwickel/your-workout-timer.git
cd your-workout-timer
npm install
npm run dev          # http://localhost:8080
```

## Run with Docker (production)

```sh
docker compose up -d --build   # serves on port 8090 with SPA fallback
```

The container builds the app (multi-stage Node build) and serves it via nginx, including the `/wod?d=…` share routes.

## Install as App (PWA)

Open the app in Chrome on Android → menu (⋮) → **Add to Home screen**, or use the **Install App** button on a shared-WOD page. Requires HTTPS — e.g. via [Tailscale Serve/Funnel](https://tailscale.com/kb/1247/tailscale-serve):

```sh
tailscale funnel --bg 8090   # https://<machine>.ts.net -> localhost:8090
```

Shared links use `SHARE_ORIGIN` defined in `src/lib/wodShare.ts`.

## Android Native Build (Capacitor, optional)

```sh
npm install @capacitor/android
npm run build
npx cap add android
npx cap sync android
```

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Framer Motion · Web Speech API · qrcode · Docker/nginx

Data is stored locally in your browser (localStorage): WODs, favorites and history never leave your device except through explicitly shared links.
