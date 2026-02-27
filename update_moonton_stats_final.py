#!/usr/bin/env python3
"""
Update counter/compatibility data from Moonton API endpoint 2756569
Uses GET then PUT to Railway API
"""
import json
import requests
import time
import sys
import os

# Config
# Читаємо токен з environment variable або з аргумента командного рядка
AUTH_TOKEN = os.environ.get('MOONTON_AUTH_TOKEN')

if not AUTH_TOKEN and len(sys.argv) > 1:
    AUTH_TOKEN = sys.argv[1]

# --start-from N (optional): resume from hero N (1-based), skip already-done ones
START_FROM = 1
for _arg in sys.argv[1:]:
    if _arg.startswith('--start-from='):
        START_FROM = int(_arg.split('=')[1])
    elif _arg.startswith('--start-from'):
        idx = sys.argv.index(_arg)
        if idx + 1 < len(sys.argv):
            START_FROM = int(sys.argv[idx + 1])

if not AUTH_TOKEN:
    print("\n⚠️  Authorization token not provided!")
    print("Usage: python3 update_moonton_stats_final.py <AUTH_TOKEN>")
    print("   or: MOONTON_AUTH_TOKEN=<token> python3 update_moonton_stats_final.py")
    print("\nGet token from: https://m.mobilelegends.com/en/rank")
    print("Open DevTools → Network → rank → Headers → authorization")
    sys.exit(1)

API_BASE = "https://api.gms.moontontech.com/api/gms/source/2669606"
ENDPOINT = "2756569"

HEADERS = {
    'authorization': AUTH_TOKEN,
    'content-type': 'application/json;charset=UTF-8',
}

# bigrank values per rank tier
BIGRANK_MAP = {
    'all':    101,
    'epic':   5,
    'legend': 6,
    'mythic': 7,
    'honor':  8,
    'glory':  9,
}

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

def fetch_raw(hero_id, match_type, bigrank):
    """Fetch raw data for a given hero_id, match_type and bigrank"""
    url = f"{API_BASE}/{ENDPOINT}"
    payload = {
        "pageSize": 20,
        "pageIndex": 1,
        "filters": [
            {"field": "match_type", "operator": "eq", "value": match_type},
            {"field": "main_heroid", "operator": "eq", "value": str(hero_id)},
            {"field": "bigrank", "operator": "eq", "value": bigrank}
        ],
        "sorts": []
    }
    try:
        response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
        if response.status_code in (401, 403):
            raise AuthExpiredError(f"HTTP {response.status_code} — token expired or invalid")
        response.raise_for_status()
        data = response.json()
        # Moonton sometimes returns 200 with error code in body
        if data.get('code') in (401, 403, 10001, 10002):
            raise AuthExpiredError(f"Moonton auth error: code={data.get('code')} msg={data.get('msg')}")
        records = data.get('data', {}).get('records', [])
        if records:
            return records[0].get('data', {})
        return None
    except AuthExpiredError:
        raise
    except Exception as e:
        print(f"    ❌ Error (match_type={match_type}, bigrank={bigrank}): {e}")
        return None

def parse_counter(raw):
    if not raw:
        return None
    best_counters = []
    for item in sorted(raw.get('sub_hero', []), key=lambda x: x.get('hero_win_rate', 0), reverse=True)[:5]:
        if item.get('heroid'):
            best_counters.append({
                'heroid': item['heroid'],
                'win_rate': round(item.get('hero_win_rate', 0), 4),
                'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                'appearance_rate': round(item.get('hero_appearance_rate', 0), 4),
            })
    most_countered = []
    for item in sorted(raw.get('sub_hero_last', []), key=lambda x: x.get('hero_win_rate', 1))[:5]:
        if item.get('heroid'):
            most_countered.append({
                'heroid': item['heroid'],
                'win_rate': round(item.get('hero_win_rate', 0), 4),
                'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                'appearance_rate': round(item.get('hero_appearance_rate', 0), 4),
            })
    return {
        'main_hero_win_rate': round(raw.get('main_hero_win_rate', 0), 4),
        'best_counters': best_counters,
        'most_countered_by': most_countered,
    }

def parse_compat(raw):
    if not raw:
        return None
    compatible = []
    for item in sorted(raw.get('sub_hero', []), key=lambda x: x.get('hero_win_rate', 0), reverse=True)[:5]:
        if item.get('heroid'):
            compatible.append({
                'heroid': item['heroid'],
                'win_rate': round(item.get('hero_win_rate', 0), 4),
                'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                'appearance_rate': round(item.get('hero_appearance_rate', 0), 4),
            })
    not_compatible = []
    for item in sorted(raw.get('sub_hero_last', []), key=lambda x: x.get('hero_win_rate', 1))[:5]:
        if item.get('heroid'):
            not_compatible.append({
                'heroid': item['heroid'],
                'win_rate': round(item.get('hero_win_rate', 0), 4),
                'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                'appearance_rate': round(item.get('hero_appearance_rate', 0), 4),
            })
    return {
        'main_hero_win_rate': round(raw.get('main_hero_win_rate', 0), 4),
        'compatible': compatible,
        'not_compatible': not_compatible,
    }

print("Loading heroes from database...")
db_heroes = db.get_heroes(2, include_details=False, include_skills=False, include_relation=False)

# Create game_id to hero mapping (Moonton hero_id -> DB hero)
gameid_to_hero = {}
for h in db_heroes:
    gid = h.get('hero_game_id')
    if gid:
        gameid_to_hero[int(gid) if isinstance(gid, str) and gid.isdigit() else gid] = h

print(f"✅ {len(db_heroes)} heroes loaded from DB")
if START_FROM > 1:
    print(f"▶️  Resuming from hero #{START_FROM}\n")
else:
    print()

# Process — fetch all 6 bigranks per hero and store nested JSON
updated = 0
skipped = 0
heroes_with_id = [h for h in db_heroes if h.get('hero_game_id')]
total = len(heroes_with_id)

for seq_idx, hero in enumerate(heroes_with_id, start=1):
    if seq_idx < START_FROM:
        skipped += 1
        continue

    hero_name = hero.get('name', '').strip()
    moonton_id = hero.get('hero_game_id')
    hero_db_id = hero['id']
    print(f"[{seq_idx}/{total}] {hero_name} (ID:{moonton_id})")

    counter_by_rank = {}
    compat_by_rank  = {}
    auth_failed = False

    for rank_name, bigrank_val in BIGRANK_MAP.items():
        try:
            # counter (match_type=0)
            raw_c = fetch_raw(moonton_id, 0, bigrank_val)
            time.sleep(0.25)
            parsed_c = parse_counter(raw_c)
            if parsed_c:
                counter_by_rank[rank_name] = parsed_c

            # compat (match_type=1)
            raw_p = fetch_raw(moonton_id, 1, bigrank_val)
            time.sleep(0.25)
            parsed_p = parse_compat(raw_p)
            if parsed_p:
                compat_by_rank[rank_name] = parsed_p
        except AuthExpiredError as e:
            print(f"\n🔑 TOKEN EXPIRED at hero #{seq_idx} ({hero_name}): {e}")
            print(f"   Get a fresh token and resume with:")
            print(f"   MOONTON_AUTH_TOKEN=\"<new_token>\" python3 update_moonton_stats_final.py --start-from={seq_idx}")
            print(f"\n✅ Updated before expiry: {updated}")
            sys.exit(2)

    if not counter_by_rank and not compat_by_rank:
        print(f"  ⚠️  No data for any rank\n")
        skipped += 1
        continue

    # Write nested JSON to DB
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()

        counter_json = json.dumps(counter_by_rank, ensure_ascii=False) if counter_by_rank else None
        compat_json  = json.dumps(compat_by_rank,  ensure_ascii=False) if compat_by_rank  else None

        if counter_json and compat_json:
            cursor.execute(
                f"UPDATE heroes SET counter_data = {ph}, compatibility_data = {ph} WHERE id = {ph}",
                (counter_json, compat_json, hero_db_id)
            )
        elif counter_json:
            cursor.execute(
                f"UPDATE heroes SET counter_data = {ph} WHERE id = {ph}",
                (counter_json, hero_db_id)
            )
        elif compat_json:
            cursor.execute(
                f"UPDATE heroes SET compatibility_data = {ph} WHERE id = {ph}",
                (compat_json, hero_db_id)
            )

        conn.commit()
        db.release_connection(conn)

        ranks_done = list(counter_by_rank.keys())
        sample = counter_by_rank.get('all', {})
        print(f"  ✅ ranks={ranks_done}, counters(all)={len(sample.get('best_counters', []))}\n")
        updated += 1
    except Exception as e:
        print(f"  ❌ DB update error: {e}\n")
        try:
            db.release_connection(conn)
        except:
            pass
        skipped += 1

print(f"\n✅ Updated: {updated}, Skipped: {skipped}")
