#!/usr/bin/env python3
"""
Update counter/compatibility data from Moonton API endpoint 2756567
Fetches ALL heroes per rank in one paginated sweep (much faster than per-hero)
"""
import json
import requests
import time
import sys
import os

AUTH_TOKEN = os.environ.get('MOONTON_AUTH_TOKEN')
if not AUTH_TOKEN and len(sys.argv) > 1 and not sys.argv[1].startswith('--'):
    AUTH_TOKEN = sys.argv[1]

if not AUTH_TOKEN:
    print("\n⚠️  Authorization token not provided!")
    print("Usage: MOONTON_AUTH_TOKEN=<token> python3 update_moonton_stats_final.py")
    print("\nGet token from: https://m.mobilelegends.com/en/rank")
    print("Open DevTools → Network → any API request → authorization header")
    sys.exit(1)

API_BASE = "https://api.gms.moontontech.com/api/gms/source/2669606"
# 2756567 = returns ALL heroes at once with their counter/compat sub_hero data
ENDPOINT = "2756567"

HEADERS = {
    'authorization': AUTH_TOKEN,
    'content-type': 'application/json;charset=UTF-8',
    'x-actid': '2669607',
    'x-appid': '2669606',
    'x-lang': 'en',
}

# bigrank filter values (sent as strings per Moonton API)
BIGRANK_MAP = {
    'all':    '101',
    'epic':   '5',
    'legend': '6',
    'mythic': '7',
    'honor':  '8',
    'glory':  '9',
}

FIELDS_COUNTER = [
    "main_heroid", "main_hero_win_rate",
    "data.sub_hero.heroid", "data.sub_hero.increase_win_rate",
    "data.sub_hero_last.heroid", "data.sub_hero_last.increase_win_rate",
]

# Load .env for database connection
from pathlib import Path
def _load_env():
    env_path = Path(__file__).resolve().parent / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
_load_env()

import database as db

class AuthExpiredError(Exception):
    pass

def fetch_all_heroes(match_type, bigrank_str):
    """Fetch all heroes for given match_type and bigrank. Returns dict {main_heroid: record_data}"""
    url = f"{API_BASE}/{ENDPOINT}"
    result = {}
    page = 1
    while True:
        payload = {
            "pageSize": 20,
            "pageIndex": page,
            "filters": [
                {"field": "bigrank", "operator": "eq", "value": bigrank_str},
                {"field": "match_type", "operator": "eq", "value": match_type},
            ],
            "sorts": [
                {"data": {"field": "main_hero_win_rate", "order": "desc"}, "type": "sequence"},
                {"data": {"field": "main_heroid", "order": "desc"}, "type": "sequence"},
            ],
            "fields": FIELDS_COUNTER,
        }
        try:
            resp = requests.post(url, headers=HEADERS, json=payload, timeout=30)
            if resp.status_code in (401, 403):
                raise AuthExpiredError(f"HTTP {resp.status_code} — token expired")
            resp.raise_for_status()
            data = resp.json()
            if data.get('code') in (401, 403, 10001, 10002):
                raise AuthExpiredError(f"Moonton code={data.get('code')}: {data.get('msg')}")
            records = data.get('data', {}).get('records', [])
            if not records:
                break
            for rec in records:
                hero_id = rec.get('data', {}).get('main_heroid')
                if hero_id:
                    result[int(hero_id)] = rec['data']
            if len(records) < 20:
                break
            page += 1
            time.sleep(0.3)
        except AuthExpiredError:
            raise
        except Exception as e:
            print(f"  ❌ fetch error (mt={match_type} bigrank={bigrank_str} page={page}): {e}")
            break
    return result

print("Loading heroes from database...")
db_heroes = db.get_heroes(2, include_details=False, include_skills=False, include_relation=False)
gameid_to_hero = {h['hero_game_id']: h for h in db_heroes if h.get('hero_game_id')}
print(f"✅ {len(db_heroes)} heroes loaded from DB\n")

# Accumulate nested data: {hero_game_id: {"counter": {rank: {...}}, "compat": {rank: {...}}}}
hero_data = {}  # hero_game_id -> {rank_name -> {best_counters, most_countered_by, main_hero_win_rate}}
compat_data = {}

total_combos = len(BIGRANK_MAP) * 2
done = 0

for rank_name, bigrank_str in BIGRANK_MAP.items():
    # --- COUNTER (match_type=0) ---
    done += 1
    print(f"[{done}/{total_combos}] Fetching counter data  rank={rank_name} (bigrank={bigrank_str})...")
    try:
        heroes_raw = fetch_all_heroes(0, bigrank_str)
    except AuthExpiredError as e:
        print(f"\n🔑 TOKEN EXPIRED: {e}")
        print("Get a fresh token and re-run the script.")
        sys.exit(2)

    for hero_id, rec in heroes_raw.items():
        sub = rec.get('sub_hero', []) or []
        sub_last = rec.get('sub_hero_last', []) or []

        best_counters = [
            {'heroid': h['heroid'], 'increase_win_rate': round(h.get('increase_win_rate', 0), 4)}
            for h in sorted(sub, key=lambda x: x.get('increase_win_rate', 0), reverse=True)[:5]
            if h.get('heroid')
        ]
        most_countered_by = [
            {'heroid': h['heroid'], 'increase_win_rate': round(h.get('increase_win_rate', 0), 4)}
            for h in sorted(sub_last, key=lambda x: x.get('increase_win_rate', 0))[:5]
            if h.get('heroid')
        ]

        if hero_id not in hero_data:
            hero_data[hero_id] = {}
        hero_data[hero_id][rank_name] = {
            'main_hero_win_rate': round(rec.get('main_hero_win_rate', 0), 4),
            'best_counters': best_counters,
            'most_countered_by': most_countered_by,
        }

    print(f"  → {len(heroes_raw)} heroes fetched")
    time.sleep(0.5)

    # --- COMPAT (match_type=1) ---
    done += 1
    print(f"[{done}/{total_combos}] Fetching compat data   rank={rank_name} (bigrank={bigrank_str})...")
    try:
        heroes_raw = fetch_all_heroes(1, bigrank_str)
    except AuthExpiredError as e:
        print(f"\n🔑 TOKEN EXPIRED: {e}")
        print("Get a fresh token and re-run the script.")
        sys.exit(2)

    for hero_id, rec in heroes_raw.items():
        sub = rec.get('sub_hero', []) or []
        sub_last = rec.get('sub_hero_last', []) or []

        compatible = [
            {'heroid': h['heroid'], 'increase_win_rate': round(h.get('increase_win_rate', 0), 4)}
            for h in sorted(sub, key=lambda x: x.get('increase_win_rate', 0), reverse=True)[:5]
            if h.get('heroid')
        ]
        not_compatible = [
            {'heroid': h['heroid'], 'increase_win_rate': round(h.get('increase_win_rate', 0), 4)}
            for h in sorted(sub_last, key=lambda x: x.get('increase_win_rate', 0))[:5]
            if h.get('heroid')
        ]

        if hero_id not in compat_data:
            compat_data[hero_id] = {}
        compat_data[hero_id][rank_name] = {
            'main_hero_win_rate': round(rec.get('main_hero_win_rate', 0), 4),
            'compatible': compatible,
            'not_compatible': not_compatible,
        }

    print(f"  → {len(heroes_raw)} heroes fetched")
    time.sleep(0.5)

print(f"\n✅ All ranks fetched. Writing to DB...")

# Write to DB
updated = 0
skipped = 0
all_hero_ids = set(hero_data.keys()) | set(compat_data.keys())

for moonton_id in all_hero_ids:
    db_hero = gameid_to_hero.get(moonton_id)
    if not db_hero:
        continue

    counter_json = json.dumps(hero_data[moonton_id], ensure_ascii=False) if moonton_id in hero_data else None
    compat_json  = json.dumps(compat_data[moonton_id], ensure_ascii=False) if moonton_id in compat_data else None

    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()

        if counter_json and compat_json:
            cursor.execute(
                f"UPDATE heroes SET counter_data = {ph}, compatibility_data = {ph} WHERE id = {ph}",
                (counter_json, compat_json, db_hero['id'])
            )
        elif counter_json:
            cursor.execute(f"UPDATE heroes SET counter_data = {ph} WHERE id = {ph}", (counter_json, db_hero['id']))
        elif compat_json:
            cursor.execute(f"UPDATE heroes SET compatibility_data = {ph} WHERE id = {ph}", (compat_json, db_hero['id']))

        conn.commit()
        db.release_connection(conn)
        updated += 1
    except Exception as e:
        print(f"  ❌ DB error for hero {moonton_id}: {e}")
        try: db.release_connection(conn)
        except: pass
        skipped += 1

print(f"✅ Updated: {updated}, Skipped/missing: {skipped}")

