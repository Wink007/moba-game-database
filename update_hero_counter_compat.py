#!/usr/bin/env python3
"""
Simple script to update hero counter_data and compatibility_data via Railway API.
Uses separate PUT requests to avoid breaking existing hero update logic.
"""
import requests
import json

RAILWAY_API = "https://web-production-8570.up.railway.app/api"

def update_hero_counter_compat(hero_id, counter_data=None, compatibility_data=None):
    """Update only counter_data and compatibility_data for a hero."""
    url = f"{RAILWAY_API}/heroes/{hero_id}/counter-compat"
    payload = {}
    if counter_data:
        payload['counter_data'] = counter_data
    if compatibility_data:
        payload['compatibility_data'] = compatibility_data
    
    response = requests.put(url, json=payload)
    return response.status_code == 200

# Load heroes
print("Loading Moonton data...")
with open('heroes_moonton_data_complete.json', 'r') as f:
    moonton_data = json.load(f)

# Get Railway heroes
print("Fetching Railway heroes...")
response = requests.get(f"{RAILWAY_API}/heroes?game_id=2", timeout=30)
railway_data = response.json()
if isinstance(railway_data, dict):
    railway_heroes = railway_data.get('heroes', [])
else:
    railway_heroes = railway_data

name_to_id = {h['name'].strip(): h['id'] for h in railway_heroes}

print(f"✅ {len(moonton_data)} Moonton heroes")
print(f"✅ {len(railway_heroes)} Railway heroes\n")

# Process all heroes
for hero in moonton_data:
    name = hero['name']
    hero_game_id = hero['hero_id']
    
    if name not in name_to_id:
        print(f"⚠️ {name}: Not found in Railway")
        continue
    
    railway_id = name_to_id[name]
    
    # Extract counter data (existing logic)
    counter_section = hero.get('counter', {})
    best_counters_raw = counter_section.get('relation', {}).get('strong', [])
    countered_by_raw = counter_section.get('relation', {}).get('weak', [])
    
    best_counters = [{
        'heroid': c['heroid'],
        'appearance_rate': c.get('appearance_rate', 0),
        'win_rate': c.get('win_rate', 0),
        'increase_win_rate': c.get('increase_win_rate', 0)
    } for c in best_counters_raw]
    
    most_countered_by = [{
        'heroid': c['heroid'],
        'appearance_rate': c.get('appearance_rate', 0),
        'win_rate': c.get('win_rate', 0),
        'increase_win_rate': c.get('increase_win_rate', 0)
    } for c in countered_by_raw]
    
    # Get main_hero_win_rate from counter API stats
    main_hero_win_rate = counter_section.get('stats', {}).get('main_hero_win_rate', 0.5)
    
    counter_data = {
        'best_counters': best_counters,
        'most_countered_by': most_countered_by,
        'main_hero_win_rate': main_hero_win_rate
    }
    
    # Extract compatibility data  
    compat_section = hero.get('compatibility', {})
    compatible_raw = compat_section.get('relation', {}).get('strong', [])
    not_compatible_raw = compat_section.get('relation', {}).get('weak', [])
    
    compatible = [{
        'heroid': c['heroid'],
        'appearance_rate': c.get('appearance_rate', 0),
        'win_rate': c.get('win_rate', 0),
        'increase_win_rate': c.get('increase_win_rate', 0)
    } for c in compatible_raw]
    
    not_compatible = [{
        'heroid': c['heroid'],
        'appearance_rate': c.get('appearance_rate', 0),
        'win_rate': c.get('win_rate', 0),
        'increase_win_rate': c.get('increase_win_rate', 0)
    } for c in not_compatible_raw]
    
    # Use same main_hero_win_rate for compatibility
    compatibility_data = {
        'compatible': compatible,
        'not_compatible': not_compatible,
        'main_hero_win_rate': main_hero_win_rate
    }
    
    # Update via new endpoint
    if update_hero_counter_compat(railway_id, counter_data, compatibility_data):
        print(f"✅ {name}")
    else:
        print(f"❌ {name}")

print("\n✅ Done!")
