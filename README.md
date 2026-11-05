# Surf Session Tracker

A responsive surf-session journal built with React, TypeScript and Vite.

## Features

- Arabic, English, French, Spanish and Portuguese interface
- Automatic right-to-left layout for Arabic
- Save sessions and selected language in browser local storage
- Record date, surf spot, session duration, wave height, wind speed and notes
- Delete individual sessions
- Export all sessions to a UTF-8 CSV file (Excel-friendly BOM)

## Run the app

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

**Privacy note:** sessions are stored in the current browser on the current device. They are not synced to an online account.
