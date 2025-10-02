# StapuBox | Tournament Calendar Showdown (Expo)

This app implements a calendar + list UI to browse sports tournaments by month with a sports dropdown filter, matching the provided design.

## Run (Expo Go)

1. Install dependencies
```bash
npm install
```
2. Start
```bash
npm run start
```
3. Scan the QR in Expo Go on Android.

## Features
- Sports dropdown: fetched from `https://stapubox.com/sportslist` with an "All Sports" option.
- Month calendars for Aug–Sep–Oct 2025. Only tournament start dates are highlighted.
- Tap a highlighted date to see tournaments starting that day.
- Tournament cards show logo, name, sport, level, and start date.
- Expandable fixtures per tournament when available. Times shown in IST.
- Basic loading and empty states.

## API
- Sports: `GET https://stapubox.com/sportslist`
- Tournaments (month/sport filters): `GET https://stapubox.com/tournament/demo?sports_id=7061509&month=8`
- During development you can use `https://mockly.me/custom/tournament/demo/v2` to preview data shape.

## Build APK (Expo prebuild)
```bash
npm run android
```
Follow the prompts or use EAS for production builds.

## Repo Structure
- `src/api` – Axios client and API helpers
- `src/screens/TournamentCalendarScreen.tsx` – Main screen
- `src/features/calendar/CalendarMonthView.tsx` – Simple month grid with highlights
- `src/components/TournamentCard.tsx` – Tournament outer/inner cards

## Notes / Decisions
- Calendar is a lightweight custom grid for the required three months.
- Data is merged across Aug–Oct for quick highlight calculation.
- Time conversion uses `dayjs(...).utcOffset(330)` for IST formatting.

## Demo Video
Add a short screen recording link here after testing on a device.
