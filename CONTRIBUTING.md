# Contributing

This started as a 6-hour hackathon build, but the usual project hygiene still
applies if you're picking it up.

## Setup

```powershell
npm install
npm run dev
```

## Before opening a PR

```powershell
npm run lint
npm test
```

Both should pass clean. `npm run lint` runs Next.js's ESLint config
(`next/core-web-vitals`); `npm test` runs the Jest unit tests under
`lib/__tests__/` and `hooks/__tests__/`.

## Where things live

See the "Project structure" section in `README.md` — in short, UI in
`components/`, state logic in `hooks/`, pure helpers in `lib/`, and the
generated dataset in `data/` (produced by `scripts/generate_data.py`).

## Conventions

- One component per file, paired with its own `*.module.css`.
- Any component that touches state (`useState`/`useEffect`/`useMemo`) either
  is the file that declares `"use client"`, or is rendered underneath one —
  keep the directive on hooks and components that use it directly, so it's
  obvious from the file alone which side of the server/client boundary it's
  meant for.
- Shared data shapes (a receipt, a chapter) live in `lib/propTypes.js` and are
  reused via PropTypes rather than re-declared per component.
- State logic that isn't purely presentational belongs in a custom hook under
  `hooks/`, not inlined into a component — see `useReceiptFilters`,
  `useChainTrace`, `useGlobalStats` for the pattern.
- No new npm dependency without a concrete reason; the point of this project
  is that it stays inspectable in one sitting.

## Regenerating the dataset

Only needed if you change `scripts/generate_data.py` itself:

```powershell
python scripts/generate_data.py
```

It's deterministic (seeded RNG), so re-running with unchanged logic reproduces
the same `data/receipts.json` and `data/chapters.json`.
