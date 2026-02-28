#!/usr/bin/env python3
"""
Update counter/compatibility data from Moonton API
Different endpoints per day period, all 6 ranks, 2 match types = 60 combos
Stores nested JSON: {days_str: {rank_name: {best_counters, ...}}}
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
    print("\nAuthorization token not provided!")
    print("Usage: MOONTON_AUTH_TOKEN=<token> python3 update_moonton_stats_final.py")
    sys.exit(1)

API_BASE = "https://api.gms.moontontech.com/api/gms/source/2669606"

# Different endpoints per day period (confirmed from DevTools)
DAYS_ENDPOINT_MAP = {
    1:  '2756567',   # confirmed
    3:  '2756568',   # confirmed
    7:  '2756569',   # confirmed
    15: '2756565',   # confirmed
    30: '2756570',   # confirmed
}

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

FIELDS_COMPAT = FIELDS_COUNTER

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

def fetch_all_heroes(endpoint, match_type, bigrank_str, fields=None):
    """Fetch all heroes for given endpoint/match_type/bigrank. Returns dict {main_heroid: record_data}"""
    if fields is None:
        fields = FIELDS_COUNTER
    url = f"{API_BASE}/{endpoint}"
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
            "fields": fields,
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
print(f"OK {len(db_heroes)} heroes loaded\n")

# Nested structure: hero_data[moonton_id][days_str][rank_name] = {...}
hero_data   = {}  # counter data
compat_data = {}  # compatibility data

total_combos = len(DAYS_ENDPOINT_MAP) * len(BIGRANK_MAP) * 2
done = 0

for days, endpoint in DAYS_ENDPOINT_MAP.items():
    days_str = str(days)
    for rank_name, bigrank_str in BIGRANK_MAP.items():
        # --- COUNTER (match_type=0) ---
        done += 1
        print(f"[{done}/{total_combos}] counter  days={days} rank={rank_name}...")
        try:
            records = fetch_all_heroes(endpoint, 0, bigrank_str, FIELDS_COUNTER)
            print(f"  -> {len(records)} heroes")
            for moonton_id, rec in records.items():
                sub = rec.get('sub_hero') or []
                sub_last = rec.get('sub_hero_last') or []
                best_counters = sorted(sub, key=lambda x: x.get('increase_win_rate', 0), reverse=True)[:5]
                most_countered_by = sorted(sub_last, key=lambda x: x.get('increase_win_rate', 0), reverse=False)[:5]
                if moonton_id not in hero_data:
                    hero_data[moonton_id] = {}
                if days_str not in hero_data[moonton_id]:
                    hero_data[moonton_id][days_str] = {}
                hero_data[moonton_id][days_str][rank_name] = {
                    'main_hero_win_rate': rec.get('main_hero_win_rate'),
                    'best_counters': best_counters,
                    'most_countered_by': most_countered_by,
                }
        except AuthExpiredError as e:
            print(f"\nTOKEN EXPIRED at combo {done}/{total_combos}: {e}")
            print("Get a fresh token and re-run.")
            sys.exit(2)

        # --- COMPAT (match_type=1) ---
        done += 1
        print(f"[{done}/{total_combos}] compat   days={days} rank={rank_name}...")
        try:
            records = fetch_all_heroes(endpoint, 1, bigrank_str, FIELDS_COMPAT)
            print(f"  -> {len(records)} heroes")
            for moonton_id, rec in records.items():
                sub = rec.get('sub_hero') or []
                sub_last = rec.get('sub_hero_last') or []
                compatible = sorted(sub, key=lambda x: x.get('increase_win_rate', 0), reverse=True)[:5]
                not_compatible = sorted(sub_last, key=lambda x: x.get('increase_win_rate', 0), reverse=False)[:5]
                if moonton_id not in compat_data:
                    compat_data[moonton_id] = {}
                if days_str not in compat_data[moonton_id]:
                    compat_data[moonton_id][days_str] = {}
                compat_data[moonton_id][days_str][rank_name] = {
                    'main_hero_win_rate': rec.get('main_hero_win_rate'),
                    'compatible': compatible,
                    'not_compatible': not_compatible,
                }
        except AuthExpiredError as e:
            print(f"\nTOKEN EXPIRED at combo {done}/{total_combos}: {e}")
            print("Get a fresh token and re-run.")
            sys.exit(2)

print(f"\nAll combos fetched. Writing to DB...")

# Write to DB
updated = 0
skipped = 0
all_hero_ids = set(hero_data.keys()) | set(compat_data.keys())

for moonton_id in all_hero_ids:
    db_hero = gameid_to_hero.get(moonton_id)
    if not db_hero:
        skipped += 1
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

print(f"Updated: {updated}, Skipped/missing: {skipped}")

