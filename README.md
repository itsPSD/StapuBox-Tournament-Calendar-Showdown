## StapuBox – Tournament Calendar (Expo)

A clean, lightweight Tournament Calendar that mirrors the provided design. You can filter by sport, see monthly highlights (Aug–Oct), and expand a tournament to view its fixtures.

### Quick start

1) Install
```bash
npm install
```

2) Run in Expo Go (Android)
```bash
npm run start
```
Scan the QR and you’re in.

3) Build an APK (optional)
```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
You’ll get a link with an APK artifact you can share/install.

### What’s inside

- Sports filter dropdown (default “All”). Data from `https://stapubox.com/sportslist`.
- Month view for Aug–Sep–Oct. Only the tournament start date is highlighted.
- Tap a highlighted day to list tournaments starting that date.
- Cards:
  - Outer: logo, name, sport (accent), level (right), date range.
  - Inner: expandable fixtures. If there are no fixtures, there’s no expand control.
- Time is shown in IST using Day.js.
- Always-light UI, Source Sans 3 typography, and icons to match the screenshot.

### APIs

- Sports: `GET https://stapubox.com/sportslist`
- Tournaments (month + sport filters):
  - All demo data: `GET https://stapubox.com/tournament/demo`
  - Per sport & month: `GET https://stapubox.com/tournament/demo?sports_id=7061509&month=8`

### Project layout

- `src/api/client.ts` – Axios client with small AsyncStorage cache
- `src/features/calendar/CalendarMonthView.tsx` – Month grid + highlights
- `src/components/TournamentCard.tsx` – Outer/inner match cards
- `src/screens/TournamentCalendarScreen.tsx` – Screen glue: dropdown, month switcher, list

### A few implementation notes

- The calendar is hand-rolled: it’s tiny, fast, and matches the Figma spacing.
- Highlights are computed from the tournaments’ start_date only (as requested).
- Images: SVG logos are auto-converted to PNG (and proxied if needed) so they render reliably on Android.
- Everything uses light mode and Source Sans 3 to stay close to the design.

### Troubleshooting

- If Metro shows odd cache warnings, restart with:
```bash
npm run start -c
```
- If a logo URL blocks SVG requests, the code falls back to a PNG thumbnail or a proxy and finally a local logo.

### Thanks

I aimed for a practical build that looks and feels like the screenshot: focused, quick to run, and easy to read. If you want any polish on top (animations, deeper caching, tests), I’m happy to add them.
