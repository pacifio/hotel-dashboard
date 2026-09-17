# hotel-dashboard

**Auberge** — a hotel ERP, CRM and omnichannel-AI dashboard.
A product of **[UVTR Infotech](https://uvtrinfotech.com/)**.

An interactive, forward-looking prototype of a hotel operating system: a full
ERP/HMS, a built-in CRM, a visitor-management module, an omnichannel inbox where
an AI agent handles the calls and messages, and an AI intelligence layer over
all of it.

It is built to be **demoed**, not deployed. Everything runs client-side against
deterministic generated data — no backend, no database, no API key, no network
call. The demo behaves identically every time it is opened, which means it never
fails in a room full of people.

```bash
bun install
bun run dev      # http://localhost:3000 → /login (any credentials work)
```

> The interface opens in **Bangla** by default. Switch to English from the
> sidebar footer, the ⌘K palette, or `/settings/localization`.

---

## What's in it

**61 routes** — 56 application screens plus 5 auth flows — all navigable, all
populated with coherent data.

| Area | Screens |
| --- | --- |
| Overview | dashboard, activity feed |
| Front desk | arrivals / departures / in-house / walk-in, guest lookup |
| Bookings | list, calendar, 6-step booking wizard, channel manager |
| Rooms | occupancy rack, room status, housekeeping board, maintenance, tariff grid |
| CRM | companies, contacts, deal pipeline, segments, campaigns, loyalty |
| Omnichannel | unified inbox, AI voice calls, autopilot configuration |
| Intelligence | copilot, report studio, forecasting, agent runs, report library |
| Visitor management | overview, gate movements, visitor log, VIP/CIP clearance, luggage, vehicles, CCTV wall, gate pass |
| Resources | inventory, purchase orders, suppliers, F&B, staff ×4, finance ×4 |
| Admin | properties, users, roles, integrations, audit log, settings ×4 |

## Start here

Three screens carry the idea:

1. **Omnichannel inbox** — `/inbox`
   Send a message with autopilot on and watch the AI reply with a confidence
   meter, then materialise a reservation card inside the thread.

2. **AI voice call** — `/inbox/calls`
   Plays a scripted booking call end to end **in Bangla**: live waveform,
   streaming transcript, entities populating a reservation form as the agent
   hears them, sentiment meter, barge-in.

3. **Report studio** — `/ai/reports`
   Describe a report and the agent visibly runs the pipeline — understand,
   query the ERP, aggregate, analyse, compose, visualise — assembling the
   document section by section.

Also worth a look: the **room rack** (`/rooms/rack`), where bookings drag
between rooms and dates with conflict detection, and the **deal pipeline**
(`/crm/pipeline`).

## The AI layer

Every AI feature is **scripted, not live**. There is no model call and no key to
configure. Responses stream token by token with realistic latency, tool-call
cards render live charts and tables from the actual generated dataset, and
pipeline runs show per-step state. It is deterministic and demo-safe by design.

## Visitor management (VMS)

A full module under `/visitors`:

- **Movements** — every gate in/out event with the read method (badge, QR, face
  match, plate read), operator, bag count and vehicle, plus an hourly in/out
  profile and a flagged-events feed: overstay, unscreened bag carried in, badge
  reused at a second gate, escort not present.
- **Clearance** — VIP and CIP tiers, each with the entitlements it actually
  grants. CIP sits *above* VIP: it covers revenue-critical account contacts, so
  it clears faster and carries more (screening waived, private lift, lounge).
  Restricted visitors require a named escort.
- **Luggage** — tagged pieces tied to their owner, with screening state, weight,
  storage location and porter.
- **Vehicles** — plate register (written in Bangla, as real Bangladeshi plates
  are), driver, pass validity, screening, and a live parking-bay map where
  escalated clearance holds the reserved forecourt bays.
- **CCTV** — a multi-monitor wall with 1/4/9/16 layouts, zone filtering, a
  camera list with live / degraded / offline state, and click-to-expand.
  **No video is streamed.** Each tile renders a deterministic synthetic frame
  derived from the camera's seed, overlaid with the chrome an operator actually
  reads: camera code, ticking timestamp, record state, PTZ and head-count.

## Multi-tenancy

Three properties, switchable from the sidebar header or ⌘K:

| Property | Location | Rooms | Currency |
| --- | --- | --- | --- |
| Sarina Residency | Gulshan, Dhaka | 120 | BDT |
| Ocean Pearl | Cox's Bazar | 240 | BDT |
| Sarina Bay | Marina Bay, Singapore | 380 | USD |

Switching re-seeds every dataset — rooms, reservations, staff, CRM,
conversations, visitors, finance and charts — and swaps the currency.

## Language

Full **bn-BD / en-US** localization across ~800 keys, with Bangla as the
default. Bangla is not a veneer over an English app: figures render in Bengali
numerals (১২৩) with lakh/crore grouping, dates and currency localize (৳), Noto
Sans Bengali loads for the script, and the mock data itself is native — guest
and staff names, AI conversations and the voice-call transcript are written in
Bangla rather than transliterated.

## Accessibility & density

Front-desk software is read all day on ageing monitors, so the whole interface
scales rather than just the type. The control sits beside the profile avatar in
the top bar (and on `/settings/appearance`) and steps from 90% to 140%. Every
size in the app is expressed in `rem`, so raising it grows text, spacing, row
heights, controls and icons together.

## Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` | Command palette — navigate, switch property, switch language |
| `⌘J` | Toggle the AI copilot dock |
| `⌘B` | Collapse the sidebar |
| `⌘⌥+` / `⌘⌥−` | Grow / shrink the interface |
| `⌘⌥0` | Reset interface size |
| `D` | Toggle dark mode |

## Date range

The chip in the top bar is a real reporting range picker: presets (today,
yesterday, last 7/30/90 days, this month, last month) beside a two-month
calendar for custom ranges, with future dates disabled. It drives a global
reporting window that the dashboard reads — KPIs, deltas and revenue streams all
recompute against the selection, and the dashboard's own 7d/30d/90d pills stay
in sync with it.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui on Base UI · Motion · Recharts · TanStack Table · dnd-kit · cmdk ·
Zustand · NumberFlow · react-resizable-panels.

## Project layout

```
app/
  (app)/          56 application screens, grouped by module
  (auth)/         sign in, sign up, reset, OTP, property selection
components/
  motion/         the signature primitives — room rack, comb charts, KPI strip,
                  pipeline runner, trip picker, streaming text, waveform
  ai/             copilot chat and tool-call cards
  charts/         occupancy, forecast and channel-mix charts
  shell/          sidebar, top bar, command palette, copilot dock
  vms/            CCTV camera tile
  ui/             shadcn/ui components (Base UI)
lib/
  mock/           deterministic, seeded data generators
  i18n/           en/bn dictionaries, provider, Intl formatters
  ai/             scripted copilot answers and autopilot replies
```

## Scripts

```bash
bun run dev         # development server
bun run build       # production build
bun run typecheck   # tsc --noEmit
bun run format      # prettier
```

## Notes

- **`bun run lint` fails on the scaffold.** ESLint 10 is incompatible with the
  `eslint-plugin-react` that `eslint-config-next@16.3.4` depends on. This is a
  dependency conflict, not application code — `typecheck` and `build` both pass.
- Data is anchored to the current UTC day so the demo always reads as "today"
  while staying identical between the server render and the client hydrate.
- Bangla relative times ("২১ ঘণ্টা আগে") are formatted in-app rather than by
  `Intl.RelativeTimeFormat`: Node and Chrome ship different spellings for some
  units, which produced a hydration mismatch on every server-rendered timestamp.
- All data is fictional. No real guest, staff or financial information is
  present anywhere in this repository.

---

© UVTR Infotech · [uvtrinfotech.com](https://uvtrinfotech.com/)
