# Your Life, In Receipts

An interactive frontend that turns real digital-life data — Spotify listening
history and daily household spending — into a browsable, connected story.
Built for a 6-hour frontend hackathon.

**Live idea:** four years (2015–2018) of real streaming + spending data, read
closely enough to find where a purchase, a late-night song, and a handful of
smaller reconstructed moments (photos, messages, notes) line up on the same
day — plus a 2023 "epilogue" chapter built from real travel data.

---

## 1. Run it locally (Windows / PowerShell)

**You need [Node.js](https://nodejs.org) installed first** (the LTS version —
this also installs `npm`). Check you have it:

```powershell
node -v
npm -v
```

If those print version numbers, you're set. If not, install Node.js from
nodejs.org, then reopen PowerShell.

Then, from the project folder in VS Code's terminal (**Terminal → New
Terminal**, make sure it's a PowerShell tab):

```powershell
npm install
npm run dev
```

Open **http://localhost:3000** in your browser. That's the whole app.

To stop the dev server, click into the terminal and press `Ctrl+C`.

---

## 2. Project structure

```
app/                 Next.js pages (App Router)
  layout.js            fonts + global HTML shell
  page.js              loads data/*.json, hands it to Experience
  globals.css          design tokens (colors, type)
components/          all UI, one component + one .module.css each
  Experience.jsx        thin orchestration layer — wires the hooks together, no state logic itself
  Hero.jsx               header + headline stats
  ChapterNav.jsx          sticky year tabs (scroll-spy)
  FilterBar.jsx           search box + type toggle chips
  ChapterSection.jsx      one year's blurb + stats + sparkline + paginated card grid
  ReceiptCard.jsx         a single "ticket stub" card
  ChainDrawer.jsx         slide-in panel that traces a connected moment
  Sparkline.jsx           hand-rolled SVG monthly bar chart (no chart lib)
  Colophon.jsx            footer: methodology + data source credits
  TypeIcon.jsx            hand-drawn line icons per receipt type
hooks/                state logic, kept out of the components themselves
  useReceiptFilters.js    active type set + search text + the match predicate
  useChainTrace.js         which "moment" is open in the drawer, and its receipts
  useGlobalStats.js        hero/colophon headline numbers, derived from the full dataset
  __tests__/                unit tests for the above
lib/
  receiptTypes.js        type→color/label config + date/amount formatters
  propTypes.js            shared PropTypes shapes (a receipt, a chapter)
  __tests__/                unit tests for the formatters
data/                 the generated dataset the app actually reads
  receipts.json          646 receipts, already generated — app runs without Python
  chapters.json           5 chapters (2015–2018 + 2023) with computed stats/blurbs
scripts/generate_data.py  the pipeline that built data/*.json from raw/*.csv
raw/                  the three original Kaggle CSVs (kept for transparency/rebuilds)
```

**You don't need Python to run the app** — `data/receipts.json` and
`data/chapters.json` are already generated and committed. The Python script
is there so you (or a judge) can see exactly how the raw data became the
story, and so you can regenerate it if you tweak the logic.

### Architecture notes

State is deliberately kept out of `Experience.jsx` and pushed into three
single-purpose hooks (`useReceiptFilters`, `useChainTrace`, `useGlobalStats`),
each testable on its own without rendering anything. `Experience.jsx` itself
just composes them and lays out the page — if you're looking for "where does
X state live," it's in `hooks/`, not in a component.

Every component that accepts a `receipt` or `chapter` prop validates it via
the shared shapes in `lib/propTypes.js`, rather than re-declaring the shape
per file. Pure, side-effect-free logic (date/amount formatting, the search
predicate) is unit-tested; see "Testing" below.

### Testing & linting

```powershell
npm test
npm run lint
```

Tests cover the pure helpers in `lib/receiptTypes.js` and the search
predicate in `hooks/useReceiptFilters.js` — the parts of the codebase that
are cheap to test in isolation and most likely to silently break (date
formatting, currency formatting, "does this receipt match the search box").
Linting runs Next.js's `next/core-web-vitals` ESLint config.

### Regenerating the data (optional)

Only needed if you edit `scripts/generate_data.py` itself:

```powershell
python scripts/generate_data.py
```

(Needs Python 3 and no extra packages — it only uses the standard library.)

---

## 3. Deploy (Vercel)

### Push to GitHub first

```powershell
git init
git add .
git commit -m "Your Life, In Receipts"
git branch -M main
git remote add origin https://github.com/manas765/your-life-in-receipts.git
git push -u origin main
```

(Create the empty repo on GitHub first at github.com/new, under `manas765`,
then run the commands above from the project folder.)

### Deploy

Easiest path — no install needed:
1. Go to **vercel.com** → **Add New Project**
2. Import the GitHub repo you just pushed
3. Leave all settings as default (Vercel auto-detects Next.js) → **Deploy**

You'll get a live URL in about a minute. That's your submission link.

Alternative, from the terminal:

```powershell
npm install -g vercel
vercel login
vercel --prod
```

---

## 4. What's real vs. reconstructed

- **Real:** every `music` and `purchase` receipt (from Spotify history and
  household transactions), every `place`/`movie` receipt in the 2023 chapter
  (from the India Transact dataset), and every chapter's stats/blurb (computed
  from the *full* underlying data, not just the sample of cards you see).
- **Reconstructed:** `photo`, `message`, `search`, `note`, and some `event`/
  `movie` receipts in 2015–2018. These don't exist in either dataset — they're
  generated from small template banks, anchored to a real transaction's date,
  and marked "reconstructed" on the card. The Colophon at the bottom of the
  page explains this to anyone viewing the deployed site.

This distinction is explained on the page itself (scroll to the bottom), which
is worth keeping in mind if a judge asks about data provenance.
