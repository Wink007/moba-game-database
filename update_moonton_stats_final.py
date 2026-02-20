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

def fetch_counter_data(hero_id):
    """Fetch counter data (match_type=0)"""
    url = f"{API_BASE}/{ENDPOINT}"
    payload = {
        "pageSize": 20,
        "pageIndex": 1,
        "filters": [
            {"field": "match_type", "operator": "eq", "value": 0},
            {"field": "main_heroid", "operator": "eq", "value": str(hero_id)},
            {"field": "bigrank", "operator": "eq", "value": 7}
        ],
        "sorts": []
    }
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        records = data.get('data', {}).get('records', [])
        if records:
            return records[0].get('data', {})
        return None
    except Exception as e:
        print(f"    ❌ Counter error: {e}")
        return None

def fetch_compatibility_data(hero_id):
    """Fetch compatibility data (match_type=1)"""
    url = f"{API_BASE}/{ENDPOINT}"
    payload = {
        "pageSize": 20,
        "pageIndex": 1,
        "filters": [
            {"field": "match_type", "operator": "eq", "value": 1},
            {"field": "main_heroid", "operator": "eq", "value": str(hero_id)},
            {"field": "bigrank", "operator": "eq", "value": 7}
        ],
        "sorts": []
    }
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        records = data.get('data', {}).get('records', [])
        if records:
            return records[0].get('data', {})
        return None
    except Exception as e:
        print(f"    ❌ Compat error: {e}")
        return None

print("Loading heroes from database...")
db_heroes = db.get_heroes(2, include_details=False, include_skills=False, include_relation=False)

# Create game_id to hero mapping (Moonton hero_id -> DB hero)
gameid_to_hero = {}
for h in db_heroes:
    gid = h.get('hero_game_id')
    if gid:
        gameid_to_hero[int(gid) if isinstance(gid, str) and gid.isdigit() else gid] = h

print(f"✅ {len(db_heroes)} heroes loaded from DB\n")

# Process
updated = 0
skipped = 0

for hero in db_heroes:
    hero_name = hero.get('name', '').strip()
    moonton_id = hero.get('hero_game_id')
    if not moonton_id:
        skipped += 1
        continue

    hero_db_id = hero['id']

    print(f"[{updated + skipped + 1}] {hero_name} (ID:{moonton_id})")
    
    # Fetch data
    counter_raw = fetch_counter_data(moonton_id)
    time.sleep(0.3)
    
    compat_raw = fetch_compatibility_data(moonton_id)
    time.sleep(0.3)
    
    if not counter_raw and not compat_raw:
        print(f"  ⚠️  No data\n")
        skipped += 1
        continue
    
    # Parse counter — зберігаємо Moonton heroid як є (фронтенд використовує hero_game_id)
    counter_data = {}
    if counter_raw:
        best_counters = []
        for item in counter_raw.get('sub_hero', [])[:5]:
            sub_heroid = item.get('heroid')
            if sub_heroid:
                best_counters.append({
                    'heroid': sub_heroid,
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        most_countered = []
        for item in counter_raw.get('sub_hero_last', [])[:5]:
            sub_heroid = item.get('heroid')
            if sub_heroid:
                most_countered.append({
                    'heroid': sub_heroid,
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        counter_data = {
            'main_hero_win_rate': round(counter_raw.get('main_hero_win_rate', 0), 4),
            'best_counters': best_counters,
            'most_countered_by': most_countered
        }
    
    # Parse compatibility — зберігаємо Moonton heroid як є
    compat_data = {}
    if compat_raw:
        compatible = []
        for item in compat_raw.get('sub_hero', [])[:5]:
            sub_heroid = item.get('heroid')
            if sub_heroid:
                compatible.append({
                    'heroid': sub_heroid,
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        not_compatible = []
        for item in compat_raw.get('sub_hero_last', [])[:5]:
            sub_heroid = item.get('heroid')
            if sub_heroid:
                not_compatible.append({
                    'heroid': sub_heroid,
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        compat_data = {
            'main_hero_win_rate': round(compat_raw.get('main_hero_win_rate', 0), 4),
            'compatible': compatible,
            'not_compatible': not_compatible
        }
    
    # Прямий SQL UPDATE — оновлюємо ТІЛЬКИ counter_data і compatibility_data
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        counter_json = json.dumps(counter_data, ensure_ascii=False) if counter_data else None
        compat_json = json.dumps(compat_data, ensure_ascii=False) if compat_data else None
        
        if counter_json and compat_json:
            cursor.execute(f"""
                UPDATE heroes SET counter_data = {ph}, compatibility_data = {ph}
                WHERE id = {ph}
            """, (counter_json, compat_json, hero_db_id))
        elif counter_json:
            cursor.execute(f"""
                UPDATE heroes SET counter_data = {ph}
                WHERE id = {ph}
            """, (counter_json, hero_db_id))
        elif compat_json:
            cursor.execute(f"""
                UPDATE heroes SET compatibility_data = {ph}
                WHERE id = {ph}
            """, (compat_json, hero_db_id))
        
        conn.commit()
        db.release_connection(conn)
        
        print(f"  ✅ {len(counter_data.get('best_counters', []))} counters, {len(compat_data.get('compatible', []))} mates\n")
        updated += 1
    except Exception as e:
        print(f"  ❌ Update error: {e}\n")
        try:
            db.release_connection(conn)
        except:
            pass
        skipped += 1

print(f"\n✅ Updated: {updated}, Skipped: {skipped}")
