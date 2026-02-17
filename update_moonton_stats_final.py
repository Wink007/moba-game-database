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
RAILWAY_API = "https://web-production-8570.up.railway.app/api/heroes"

HEADERS = {
    'authorization': AUTH_TOKEN,
    'content-type': 'application/json;charset=UTF-8',
}

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

print("Loading Railway heroes...")
response = requests.get(f'{RAILWAY_API}?game_id=2')
response.raise_for_status()
railway_heroes = response.json()

# Create game_id to railway mapping (Moonton hero_id -> Railway hero)
gameid_to_railway = {h.get('hero_game_id'): h for h in railway_heroes if h.get('hero_game_id')}

print(f"✅ {len(railway_heroes)} Railway heroes loaded\n")

# Process
updated = 0
skipped = 0

for railway_hero in railway_heroes:
    hero_name = railway_hero.get('name', '').strip()
    moonton_id = railway_hero.get('hero_game_id')
    if not moonton_id:
        skipped += 1
        continue

    railway_id = railway_hero['id']

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
    
    # Parse counter
    counter_data = {}
    if counter_raw:
        best_counters = []
        for item in counter_raw.get('sub_hero', [])[:5]:
            sub_heroid = item.get('heroid')
            sub_hero = gameid_to_railway.get(sub_heroid)
            if sub_hero:
                best_counters.append({
                    'heroid': sub_hero['id'],
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        most_countered = []
        for item in counter_raw.get('sub_hero_last', [])[:5]:
            sub_heroid = item.get('heroid')
            sub_hero = gameid_to_railway.get(sub_heroid)
            if sub_hero:
                most_countered.append({
                    'heroid': sub_hero['id'],
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        counter_data = {
            'main_hero_win_rate': round(counter_raw.get('main_hero_win_rate', 0), 4),
            'best_counters': best_counters,
            'most_countered_by': most_countered
        }
    
    # Parse compatibility
    compat_data = {}
    if compat_raw:
        compatible = []
        for item in compat_raw.get('sub_hero', [])[:5]:
            sub_heroid = item.get('heroid')
            sub_hero = gameid_to_railway.get(sub_heroid)
            if sub_hero:
                compatible.append({
                    'heroid': sub_hero['id'],
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        not_compatible = []
        for item in compat_raw.get('sub_hero_last', [])[:5]:
            sub_heroid = item.get('heroid')
            sub_hero = gameid_to_railway.get(sub_heroid)
            if sub_hero:
                not_compatible.append({
                    'heroid': sub_hero['id'],
                    'win_rate': round(item.get('hero_win_rate', 0), 4),
                    'increase_win_rate': round(item.get('increase_win_rate', 0), 4),
                    'appearance_rate': round(item.get('hero_appearance_rate', 0), 4)
                })
        
        compat_data = {
            'main_hero_win_rate': round(compat_raw.get('main_hero_win_rate', 0), 4),
            'compatible': compatible,
            'not_compatible': not_compatible
        }
    
    # Get current hero data, update only counter/compat, then PUT back
    try:
        get_resp = requests.get(f"{RAILWAY_API}/{railway_id}")
        get_resp.raise_for_status()
        hero_data = get_resp.json()
        
        # Update only these fields
        hero_data['counter_data'] = json.dumps(counter_data, ensure_ascii=False)
        hero_data['compatibility_data'] = json.dumps(compat_data, ensure_ascii=False)
        
        # PUT back
        put_resp = requests.put(f"{RAILWAY_API}/{railway_id}", json=hero_data, timeout=10)
        put_resp.raise_for_status()
        
        print(f"  ✅ {len(counter_data.get('best_counters', []))} counters, {len(compat_data.get('compatible', []))} mates\n")
        updated += 1
    except Exception as e:
        print(f"  ❌ Update error: {e}\n")
        skipped += 1

print(f"\n✅ Updated: {updated}, Skipped: {skipped}")
