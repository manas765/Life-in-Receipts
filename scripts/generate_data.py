#!/usr/bin/env python3
"""
Your Life, In Receipts — data pipeline
========================================
Turns three raw Kaggle datasets into one curated, story-shaped dataset:

  1. archive/spotify_history.csv               -> real "music" receipts + listening stats
  2. archive__1_/Daily Household Transactions.csv -> real "purchase" receipts + spending stats
  3. archive__2_/...IndiaTransactMultiFacet2024.csv -> real "place"/"entertainment" receipts (2023 epilogue)

Categories the brief asks for that have no real source data (movies/shows, photos,
messages, searches, personal notes, some events) are SYNTHESIZED — but never at random.
Each synthesized receipt is anchored to a real transaction date and templated from
that transaction's real category, so every "invented" receipt is a plausible echo of
something that really happened that day, not noise.

Run with: python scripts/generate_data.py
Outputs: data/receipts.json, data/chapters.json  (consumed by the Next.js app at build time)

Deterministic: seeded RNG (42) so re-running produces the same story.
"""
import csv
import json
import random
import re
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from pathlib import Path

RNG = random.Random(42)

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
OUT = ROOT / "data"
OUT.mkdir(exist_ok=True)

STORY_YEARS = ["2015", "2016", "2017", "2018"]
EPILOGUE_YEAR = "2023"

# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def parse_household_date(raw):
    raw = raw.strip()
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    return None


def parse_spotify_date(raw):
    try:
        return datetime.strptime(raw.strip(), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None


def parse_india_date(raw):
    raw = raw.strip()
    for fmt in ("%m/%d/%Y %H:%M", "%m/%d/%Y"):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    return None


# ---------------------------------------------------------------------------
# 1. Household purchases
# ---------------------------------------------------------------------------

# Categories we treat as "everyday noise" — sampled down hard.
ROUTINE_CATEGORIES = {"Food", "Transportation", "Household", "Grooming", "Petty cash",
                       "water (jar /tanker)", "garbage disposal", "scrap", "Apparel"}
# Categories that make good chain anchors — a purchase that clearly implies a moment.
CHAIN_CATEGORIES = {
    "subscription": "movie",
    "Gift": "photo",
    "Festivals": "event",
    "Family": "message",
    "Health": "note",
    "Tourism": "place",
    "Culture": "movie",
    "Self-development": "search",
    "Social Life": "message",
    "Education": "search",
}

def load_household():
    rows = load_csv(RAW / "Daily Household Transactions.csv")
    parsed = []
    for row in rows:
        if row["Income/Expense"] != "Expense":
            continue
        dt = parse_household_date(row["Date"])
        if dt is None or str(dt.year) not in STORY_YEARS:
            continue
        try:
            amount = float(row["Amount"])
        except ValueError:
            continue
        parsed.append({
            "dt": dt,
            "category": row["Category"].strip(),
            "subcategory": row["Subcategory"].strip(),
            "note": row["Note"].strip(),
            "amount": amount,
            "currency": row["Currency"].strip() or "INR",
            "mode": row["Mode"].strip(),
        })
    return parsed


def sample_household(rows):
    """Thin the ~2,200 real expenses down to a browsable, still-representative
    set: routine categories (Food, Transport...) are sampled hardest, chain-worthy
    categories are capped rather than dropped (we need anchors, not a flood of
    them), everything else gets a light sample. Every category keeps SOME rows."""
    by_cat = defaultdict(list)
    for r in rows:
        by_cat[r["category"]].append(r)

    kept = []
    for cat, cat_rows in by_cat.items():
        RNG.shuffle(cat_rows)
        if cat in ROUTINE_CATEGORIES:
            n = max(1, round(len(cat_rows) * 0.05))
        elif cat in CHAIN_CATEGORIES:
            n = min(len(cat_rows), 20)
        else:
            n = max(1, min(20, round(len(cat_rows) * 0.15)))
        kept.extend(cat_rows[:n])
    return kept


# ---------------------------------------------------------------------------
# 2. Spotify plays
# ---------------------------------------------------------------------------

def load_spotify():
    rows = load_csv(RAW / "spotify_history.csv")
    parsed = []
    for row in rows:
        dt = parse_spotify_date(row["ts"])
        if dt is None or str(dt.year) not in STORY_YEARS:
            continue
        try:
            ms = int(row["ms_played"])
        except ValueError:
            ms = 0
        parsed.append({
            "dt": dt,
            "track": row["track_name"].strip(),
            "artist": row["artist_name"].strip(),
            "album": row["album_name"].strip(),
            "ms": ms,
            "shuffle": row["shuffle"].strip().upper() == "TRUE",
            "skipped": row["skipped"].strip().upper() == "TRUE",
            "reason_start": row["reason_start"].strip(),
        })
    return parsed


def pick_music_highlights(plays):
    """Select a curated ~220 tracks: biggest listening days, late-night plays,
    and 'new obsession' first-plays of artists — from the FULL play history
    (stats below are computed from the full history separately)."""
    by_day = defaultdict(list)
    for p in plays:
        by_day[p["dt"].date()].append(p)

    day_totals = sorted(by_day.items(), key=lambda kv: sum(x["ms"] for x in kv[1]), reverse=True)
    chosen = {}

    # a) top 2 immersive-listening days per month
    by_month_days = defaultdict(list)
    for day, day_plays in day_totals:
        by_month_days[(day.year, day.month)].append((day, day_plays))
    for _, days in by_month_days.items():
        days.sort(key=lambda kv: sum(x["ms"] for x in kv[1]), reverse=True)
        for day, day_plays in days[:2]:
            longest = max(day_plays, key=lambda x: x["ms"])
            chosen[(day, longest["track"], longest["artist"])] = longest

    # b) late-night plays (00:00-04:00), up to 60, spread across the range
    night_plays = [p for p in plays if 0 <= p["dt"].hour < 4]
    RNG.shuffle(night_plays)
    for p in night_plays[:60]:
        chosen[(p["dt"].date(), p["track"], p["artist"])] = p

    # c) first-ever play of artists who show up often (a "new obsession begins")
    artist_counts = Counter(p["artist"] for p in plays)
    frequent_artists = {a for a, c in artist_counts.items() if c >= 25}
    first_play = {}
    for p in sorted(plays, key=lambda x: x["dt"]):
        if p["artist"] in frequent_artists and p["artist"] not in first_play:
            first_play[p["artist"]] = p
    firsts = list(first_play.values())
    RNG.shuffle(firsts)
    for p in firsts[:40]:
        chosen[(p["dt"].date(), p["track"], p["artist"])] = p

    return list(chosen.values())


def full_year_music_stats(plays):
    stats = {}
    for year in STORY_YEARS:
        year_plays = [p for p in plays if str(p["dt"].year) == year]
        total_ms = sum(p["ms"] for p in year_plays)
        artist_counts = Counter(p["artist"] for p in year_plays if p["artist"])
        top_artist = artist_counts.most_common(1)[0][0] if artist_counts else "—"
        night = sum(1 for p in year_plays if 0 <= p["dt"].hour < 4)
        stats[year] = {
            "hours": round(total_ms / 3_600_000, 1),
            "topArtist": top_artist,
            "plays": len(year_plays),
            "nightPct": round(100 * night / len(year_plays), 1) if year_plays else 0,
        }
    return stats


def find_nearest_play(plays_by_day, day, window=1):
    for delta in range(0, window + 1):
        for d in (day - timedelta(days=delta), day + timedelta(days=delta)):
            if d in plays_by_day:
                return RNG.choice(plays_by_day[d])
    return None


# ---------------------------------------------------------------------------
# 3. India Transact epilogue (2023, real cities/merchants)
# ---------------------------------------------------------------------------

def clean_merchant(name):
    name = re.sub(r"^fraud_", "", name)
    name = re.sub(r"\s+(Pvt Ltd|Ltd|Group|Inc)\.?$", "", name.strip())
    return name.replace("-", " & ")


def load_india_transact():
    rows = load_csv(RAW / "Augmented_IndiaTransactMultiFacet2024.csv")
    travel, entertainment = [], []
    for row in rows:
        if row.get("is_fraud", "").strip() not in ("0", "0.0"):
            continue
        dt = parse_india_date(row.get("trans_date_trans_time", ""))
        city = (row.get("city") or "").strip()
        merchant = (row.get("merchant") or "").strip()
        amt = row.get("amt", "").strip()
        if not (dt and city and merchant and amt):
            continue
        try:
            amt = float(amt)
        except ValueError:
            continue
        entry = {"dt": dt, "city": city, "merchant": clean_merchant(merchant), "amount": amt}
        cat = (row.get("category") or "").strip()
        if cat == "travel":
            travel.append(entry)
        elif cat == "entertainment":
            entertainment.append(entry)
    RNG.shuffle(travel)
    RNG.shuffle(entertainment)
    return travel[:22], entertainment[:18]


# ---------------------------------------------------------------------------
# Synthesis template banks (original text — not from any copyrighted source)
# ---------------------------------------------------------------------------

MOVIE_TITLES = [
    "a slow-burn thriller everyone was talking about", "a rewatch of an old favourite",
    "a documentary you didn't expect to finish", "three episodes in a row, no regrets",
    "a comedy that didn't quite land", "something in black and white, for a change",
    "a sequel that was better than expected", "a film your friend swore you'd love",
]
PHOTO_CAPTIONS = [
    "a blurry photo, taken too fast", "the light was good, so you took ten more",
    "a photo you'll forget you took", "something small, worth remembering",
    "a table full of food, before anyone touched it", "a photo you almost deleted",
    "the kind of ordinary moment cameras are for", "one photo, then you put the phone away",
]
MESSAGE_SNIPPETS = [
    "a long message thread that started with a joke", "a message you reread before sending",
    "a check-in text, nothing urgent", "a voice note you meant to reply to properly",
    "a group chat that wouldn't stop buzzing", "a message that took three tries to write",
    "a short reply to a long story", "a forwarded message with no context",
]
SEARCH_QUERIES = [
    "how to actually stick to a routine", "best budget options near me",
    "is it normal to feel like this", "how long does it actually take to learn",
    "simple recipe for one person", "cheapest way to get there",
    "how to start over without overthinking it", "difference between the two, explained simply",
]
NOTE_LINES = [
    "Didn't sleep well. Need to slow down.", "Today was fine. Just fine.",
    "Remember this feeling next time it's hard.", "Small win today. Noting it before I forget.",
    "Not sure what I'm doing, but doing it anyway.", "A good day, for no clear reason.",
    "Need to call them back. Keep forgetting.", "Trying something different this week.",
]
EVENT_NAMES = [
    "a small gathering that ran late", "a celebration you almost skipped",
    "a reunion, years overdue", "a quiet evening that turned into a proper night out",
    "an event you went to alone and left with new friends", "a tradition, kept one more year",
]
PLACE_NAMES = [
    "a place you'd been meaning to visit", "somewhere quieter than expected",
    "a spot you'll probably return to", "a place that looked better in photos",
    "somewhere you ended up by accident", "a short trip that felt longer",
]

SYNTH_BANK = {
    "movie": ("Watched", MOVIE_TITLES),
    "photo": ("Photo", PHOTO_CAPTIONS),
    "message": ("Message", MESSAGE_SNIPPETS),
    "search": ("Searched", SEARCH_QUERIES),
    "note": ("Note to self", NOTE_LINES),
    "event": ("Event", EVENT_NAMES),
    "place": ("Visited", PLACE_NAMES),
}

TYPE_LABELS = {
    "music": "Music", "purchase": "Purchase", "movie": "Watched", "place": "Place",
    "photo": "Photo", "message": "Message", "search": "Search", "note": "Note", "event": "Event",
}

# ---------------------------------------------------------------------------
# Build receipts
# ---------------------------------------------------------------------------

def mk_id(prefix, n):
    return f"{prefix}-{n:04d}"


def build():
    receipts = []
    rid = 0

    household = sample_household(load_household())
    all_plays = load_spotify()
    music_stats = full_year_music_stats(all_plays)
    highlighted_plays = pick_music_highlights(all_plays)
    plays_by_day = defaultdict(list)
    for p in all_plays:
        plays_by_day[p["dt"].date()].append(p)

    travel, entertainment = load_india_transact()

    # --- purchases ---
    for h in household:
        rid += 1
        chapter = str(h["dt"].year)
        subtitle = h["subcategory"] if h["subcategory"] and h["subcategory"] != h["category"] else (
            h["note"] or f"Paid via {h['mode']}")
        detail = h["note"] if h["note"] and h["note"] != subtitle else f"Paid via {h['mode']}"
        receipts.append({
            "id": mk_id("purchase", rid),
            "type": "purchase",
            "date": h["dt"].isoformat(),
            "chapter": chapter,
            "title": h["category"],
            "subtitle": subtitle,
            "detail": detail,
            "tag": h["category"],
            "amount": h["amount"],
            "currency": h["currency"],
            "chainId": None,
        })

    # --- music highlights ---
    music_receipt_by_key = {}
    for p in highlighted_plays:
        rid += 1
        chapter = str(p["dt"].year)
        mood = "late-night" if 0 <= p["dt"].hour < 4 else (
            "on repeat" if not p["skipped"] else "restless")
        rec = {
            "id": mk_id("music", rid),
            "type": "music",
            "date": p["dt"].isoformat(),
            "chapter": chapter,
            "title": p["track"] or "Untitled",
            "subtitle": p["artist"] or "Unknown artist",
            "detail": p["album"] or "",
            "tag": mood,
            "chainId": None,
        }
        receipts.append(rec)
        music_receipt_by_key[p["dt"].date()] = rec

    # --- chain anchors: pick chain-worthy household purchases, cap per year ---
    anchors_by_year = defaultdict(list)
    for h in household:
        if h["category"] in CHAIN_CATEGORIES:
            anchors_by_year[str(h["dt"].year)].append(h)
    chain_n = 0
    for year, anchors in anchors_by_year.items():
        RNG.shuffle(anchors)
        for h in anchors[:16]:  # cap chain anchors per year
            chain_n += 1
            chain_id = f"chain-{year}-{chain_n:03d}"

            # tag the purchase receipt itself with this chain
            for r in receipts:
                if (r["type"] == "purchase" and r["chapter"] == year
                        and r["tag"] == h["category"] and r["date"] == h["dt"].isoformat()
                        and r["chainId"] is None):
                    r["chainId"] = chain_id
                    break

            # link a nearby real music receipt if one exists
            nearby = find_nearest_play(plays_by_day, h["dt"].date(), window=1)
            if nearby is not None:
                key = nearby["dt"].date()
                if key in music_receipt_by_key:
                    music_receipt_by_key[key]["chainId"] = music_receipt_by_key[key]["chainId"] or chain_id
                else:
                    rid += 1
                    receipts.append({
                        "id": mk_id("music", rid),
                        "type": "music",
                        "date": nearby["dt"].isoformat(),
                        "chapter": year,
                        "title": nearby["track"] or "Untitled",
                        "subtitle": nearby["artist"] or "Unknown artist",
                        "detail": nearby["album"] or "",
                        "tag": "same day",
                        "chainId": chain_id,
                    })

            # synthesized companion receipt matching the purchase category
            synth_type = CHAIN_CATEGORIES[h["category"]]
            label, bank = SYNTH_BANK[synth_type]
            rid += 1
            offset_days = RNG.choice([-1, 0, 0, 0, 1])
            synth_dt = h["dt"] + timedelta(days=offset_days,
                                            hours=RNG.randint(-3, 3))
            receipts.append({
                "id": mk_id(synth_type, rid),
                "type": synth_type,
                "date": synth_dt.isoformat(),
                "chapter": year,
                "title": label,
                "subtitle": RNG.choice(bank),
                "detail": f"Around the same time as: {h['category'].lower()}",
                "tag": "linked moment",
                "chainId": chain_id,
                "synthesized": True,
            })

    # --- a light sprinkle of unlinked synthesized receipts, for texture ---
    filler_targets = {"photo": 14, "message": 14, "search": 12, "note": 12, "event": 6, "movie": 10}
    for synth_type, count in filler_targets.items():
        label, bank = SYNTH_BANK[synth_type]
        for _ in range(count):
            year = RNG.choice(STORY_YEARS)
            month = RNG.randint(1, 12)
            day = RNG.randint(1, 28)
            hour = RNG.randint(7, 23)
            dt = datetime(int(year), month, day, hour, RNG.randint(0, 59))
            rid += 1
            receipts.append({
                "id": mk_id(synth_type, rid),
                "type": synth_type,
                "date": dt.isoformat(),
                "chapter": year,
                "title": label,
                "subtitle": RNG.choice(bank),
                "detail": "",
                "tag": "unlinked",
                "chainId": None,
                "synthesized": True,
            })

    # --- epilogue: 2023 places + entertainment from India Transact ---
    epi_chain_n = 0
    for t in travel:
        rid += 1
        make_chain = RNG.random() < 0.4
        chain_id = None
        if make_chain:
            epi_chain_n += 1
            chain_id = f"chain-{EPILOGUE_YEAR}-{epi_chain_n:03d}"
        receipts.append({
            "id": mk_id("place", rid),
            "type": "place",
            "date": t["dt"].isoformat(),
            "chapter": EPILOGUE_YEAR,
            "title": t["city"],
            "subtitle": t["merchant"],
            "detail": f"{t['amount']:.0f} INR",
            "tag": "travel",
            "amount": t["amount"],
            "currency": "INR",
            "chainId": chain_id,
        })
        if chain_id:
            rid += 1
            label, bank = SYNTH_BANK["photo"]
            receipts.append({
                "id": mk_id("photo", rid),
                "type": "photo",
                "date": (t["dt"] + timedelta(hours=RNG.randint(1, 5))).isoformat(),
                "chapter": EPILOGUE_YEAR,
                "title": label,
                "subtitle": RNG.choice(bank),
                "detail": f"Somewhere in {t['city']}",
                "tag": "linked moment",
                "chainId": chain_id,
                "synthesized": True,
            })

    for e in entertainment:
        rid += 1
        receipts.append({
            "id": mk_id("movie", rid),
            "type": "movie",
            "date": e["dt"].isoformat(),
            "chapter": EPILOGUE_YEAR,
            "title": "Entertainment",
            "subtitle": e["merchant"],
            "detail": f"{e['amount']:.0f} INR · {e['city']}",
            "tag": "entertainment",
            "amount": e["amount"],
            "currency": "INR",
            "chainId": None,
        })

    receipts.sort(key=lambda r: r["date"])
    return receipts, music_stats, household


CHAPTER_TITLES = {
    "2015": "First Signals",
    "2016": "Building Momentum",
    "2017": "The Turn",
    "2018": "Coming Together",
    "2023": "Six Years Later",
}

BLURB_TEMPLATES = [
    "You spent {hours} hours with {artist} this year, and {night}% of it happened after midnight. "
    "Most of what you paid for went toward {topCat} — {total} INR in total, {count} small decisions "
    "that added up to a year.",
    "{artist} was the constant — {hours} hours of them, mostly late. Money moved differently this "
    "year: {topCat} took the largest share of {total} INR across {count} receipts.",
    "A year mostly spent on {topCat} ({total} INR, {count} receipts) with {artist} playing underneath "
    "it — {hours} hours, {night}% past midnight.",
]

EPILOGUE_BLURB = (
    "Six years on, the receipts look different. No more late-night listening logs — just "
    "boarding passes and new cities. {count} places, paid for and moved through."
)


def build_chapters(receipts, music_stats):
    chapters = []
    for year in STORY_YEARS:
        year_receipts = [r for r in receipts if r["chapter"] == year]
        purchases = [r for r in year_receipts if r["type"] == "purchase"]
        total = sum(r["amount"] for r in purchases)
        cat_counts = Counter(r["tag"] for r in purchases)
        top_cat = cat_counts.most_common(1)[0][0] if cat_counts else "—"
        ms = music_stats[year]
        blurb = BLURB_TEMPLATES[STORY_YEARS.index(year) % len(BLURB_TEMPLATES)].format(
            hours=ms["hours"], artist=ms["topArtist"], night=ms["nightPct"],
            topCat=top_cat, total=f"{total:,.0f}", count=len(purchases),
        )
        chapters.append({
            "id": year,
            "label": CHAPTER_TITLES[year],
            "years": year,
            "blurb": blurb,
            "stats": {
                "receiptCount": len(year_receipts),
                "totalSpent": round(total, 2),
                "topCategory": top_cat,
                "listeningHours": ms["hours"],
                "topArtist": ms["topArtist"],
                "nightOwlPct": ms["nightPct"],
                "totalPlays": ms["plays"],
            },
        })
    epi_receipts = [r for r in receipts if r["chapter"] == EPILOGUE_YEAR]
    chapters.append({
        "id": EPILOGUE_YEAR,
        "label": CHAPTER_TITLES[EPILOGUE_YEAR],
        "years": EPILOGUE_YEAR,
        "blurb": EPILOGUE_BLURB.format(count=len([r for r in epi_receipts if r["type"] == "place"])),
        "stats": {
            "receiptCount": len(epi_receipts),
            "totalSpent": round(sum(r.get("amount", 0) for r in epi_receipts), 2),
            "topCategory": "travel",
            "listeningHours": 0,
            "topArtist": "—",
            "nightOwlPct": 0,
            "totalPlays": 0,
        },
    })
    return chapters


def main():
    receipts, music_stats, household = build()
    chapters = build_chapters(receipts, music_stats)

    (OUT / "receipts.json").write_text(json.dumps(receipts, indent=2, ensure_ascii=False), encoding="utf-8")
    (OUT / "chapters.json").write_text(json.dumps(chapters, indent=2, ensure_ascii=False), encoding="utf-8")

    type_counts = Counter(r["type"] for r in receipts)
    chained = sum(1 for r in receipts if r.get("chainId"))
    print(f"Total receipts: {len(receipts)}")
    print("By type:", dict(type_counts))
    print(f"Receipts in a chain: {chained}")
    print(f"Chapters: {[c['id'] for c in chapters]}")


if __name__ == "__main__":
    main()
