# App Pages & Screens

The app is a single-page application with mode-based navigation. There are **no separate URLs** except the shared-WOD entry point.

## Navigation Structure

```
┌─────────────────────────────────────────────┐
│ Header: [Back]              [🔊 volume]     │
├─────────────────────────────────────────────┤
│ Tabs (config screen only):                  │
│   INTERVALS | WOD | HISTORY                 │
├─────────────────────────────────────────────┤
│ Content area                                │
└─────────────────────────────────────────────┘
```

## 1. Config Screen — Tab "Intervals" (`/`)

Default screen after launch.

| Element | Description |
|---|---|
| Work / Rest / Preparation Time | mm:ss inputs with −/+ steppers |
| Number of Rounds | editable stepper (1–99) |
| Progressive Adjustment | per-round ± seconds for work/rest/prep |
| Total / Work summary | calculated workout duration (excl. prep) |
| Favorites | save/load/delete interval configs |
| **Start Workout** | white primary button |

## 2. Interval Runner

Shown while an interval workout is active.

- Phase label (Get Ready / Work / Rest), big countdown clock
- Round X/Y indicator, round progress bars
- Controls: Reset · Play/Pause (white circle) · Skip
- ±10s time-adjust pills under reset/skip
- "Workout Complete" view → Back to Settings (auto-recorded to history)

Voice: phase announcements, 10-count before each work phase.

## 3. Config Screen — Tab "WOD"

Sub-tabs: **My WODs | Famous**

| Sub-tab | Content |
|---|---|
| My WODs | saved WODs: ▶ start, ✏ edit, ⤴ share, 🗑 delete, + New WOD (builder) |
| Famous | ~20 presets (Cindy, Murph, Angie, calisthenics WODs, …): ▶ start, ⤴ share, + add to My WODs |

### WOD Builder
Name, scheme selector (AMRAP / For Time / EMOM / Rounds), duration or rounds, EMOM round time (s), rest between exercises (s), movement list with editable name + reps.

## 4. WOD Runner (`activeWod` set)

Full-screen workout execution. Header shows Back + volume bar (only here).

- Scheme + name header; round counter for EMOM/Rounds
- Clock: countdown (AMRAP) or count-up (For Time/Rounds/EMOM)
- Movement list; current exercise highlighted (Rounds scheme)
- AMRAP: manual "Completed Rounds" −/+ counter
- Rounds scheme: Done / Skip Rest buttons, auto-advance through exercise→rest→exercise
- Prep: 10s "Get ready" voice countdown before start (AMRAP/EMOM/For Time)
- End: "Time!" + Save Result / Exit

Voice: "3,2,1 go", English 10-count at the end, round announcements.

## 5. Config Screen — Tab "History"

| Element | Description |
|---|---|
| Stats strip | sessions this month · total time · top WOD |
| View toggle | List / Calendar |
| Calendar | month grid, days with workouts ringed, tap = filter day |
| Filters | scheme chips (All/AMRAP/For Time/EMOM/Rounds/Interval), name search, range 7d/30d/all |
| List | grouped by Today/Yesterday/date; rows: time · title · scheme · result · 🗑 |

## 6. Share Modal (overlay)

QR code (scannable → share link), Copy Link button, **Share via WhatsApp** (formatted workout text + link).

## 7. Shared-WOD Import (`/wod?d=…` or `/#/wod?d=…`)

Landing page when opening a shared link:

- Workout preview card (name, scheme, movements)
- **Install App** button (when Chrome offers PWA install; otherwise manual hint)
- **Add to My WODs** · **Start Now** · Dismiss

## URL Routes

| Route | Page |
|---|---|
| `/` | Main app (config screen, default tab Intervals) |
| `/wod?d=<payload>` | Import preview for a shared WOD |
| `*` | NotFound fallback |
