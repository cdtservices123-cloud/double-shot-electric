# Double Shot Electric — Waitlist Landing Page

Delivery-first functional coffee waitlist page for Double Shot Electric (Las Vegas, NV).

Implemented from the Claude Design prototype `Double Shot Electric Waitlist.dc.html`
(project `870f70e9-7029-430f-b329-b3f3e6036c8d`).

## Stack

- Vite + React 18
- Self-hosted fonts via @fontsource: Anton, Bebas Neue, Inter, Permanent Marker
- No router — single page

## Configuration

Site-level settings live at the top of `src/App.jsx`, mirroring the design prototype's
editable props:

- `CITY` — market name used across copy (default `LAS VEGAS`)
- `FILM_GRAIN` — animated grain overlay on/off
- `STICKY_BAR` — mobile sticky pre-order CTA on/off

## Develop

```bash
npm install
npm run dev
```

## Build / preview

```bash
npm run build
npm run preview
```

## Deploy

Vercel-ready: `vercel.json` rewrites all routes to `index.html`. Framework preset: Vite.

## Open questions

- The waitlist form is front-end only (matches the design prototype). Wire the submit
  handler to a real endpoint (e.g. a form service or API route) before launch.
- Image assets are exported straight from the design project and are large
  (1.7–3.5 MB each). Compress/resize before production launch.
