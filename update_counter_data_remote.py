#!/usr/bin/env python3
"""
Скрипт для оновлення Counter та Compatibility даних через production API
"""
import requests
import time
import json

# Production API
PROD_API = 'https://web-production-8570.up.railway.app/api'
# Офіційне API mlbb-stats
MLBB_COUNTER_API = 'https://mlbb-stats.ridwaanhall.com/api/hero-counter'
MLBB_COMPAT_API = 'https://mlbb-stats.ridwaanhall.com/api/hero-compatibility'

def fetch_heroes():
    """Отримує список героїв з production API"""
    try:
        response = requests.get(f"{PROD_API}/heroes?game_id=2", timeout=10)
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching heroes: {e}")
        return []

def fetch_hero_counter(hero_id, hero_name):
    """Отримує Counter дані з офіційного API через hero_id"""
    url = f"{MLBB_COUNTER_API}/{hero_id}/"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"    ❌ Counter API returned {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"    ❌ No counter data in response")
            return None
        
        record = data['data']['records'][0]['data']
        
        counter_data = {
            'best_counters': [],
            'most_countered_by': []
        }
        
        # Best Counters (топ-5)
        for hero in record.get('sub_hero', [])[:5]:
            counter_data['best_counters'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        # Most Countered by (топ-5)
        for hero in record.get('sub_hero_last', [])[:5]:
            counter_data['most_countered_by'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        return counter_data
        
    except Exception as e:
        print(f"    ❌ Error fetching counter: {e}")
        return None

def fetch_hero_compatibility(hero_id, hero_name):
    """Отримує Compatibility дані з офіційного API через hero_id"""
    url = f"{MLBB_COMPAT_API}/{hero_id}/"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"    ❌ Compat API returned {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"    ❌ No compat data in response")
            return None
        
        record = data['data']['records'][0]['data']
        
        compat_data = {
            'compatible': [],
            'not_compatible': []
        }
        
        # Compatible (топ-5)
        for hero in record.get('sub_hero', [])[:5]:
            compat_data['compatible'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        # Not Compatible (топ-5)
        for hero in record.get('sub_hero_last', [])[:5]:
            compat_data['not_compatible'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        return compat_data
        
    except Exception as e:
        print(f"    ❌ Error fetching compat: {e}")
        return None

def update_hero_data(hero_id, counter_data, compat_data):
    """Оновлює дані героя через production API"""
    try:
        payload = {}
        if counter_data:
            payload['counter_data'] = json.dumps(counter_data, ensure_ascii=False)
        if compat_data:
            payload['compatibility_data'] = json.dumps(compat_data, ensure_ascii=False)
        
        if not payload:
            return False
        
        response = requests.patch(
            f"{PROD_API}/heroes/{hero_id}",
            json=payload,
            timeout=10
        )
        
        return response.status_code in [200, 204]
        
    except Exception as e:
        print(f"    ❌ Error updating hero: {e}")
        return False

def main():
    print(f"\n{'='*70}")
    print("Fetching heroes from production API...")
    print(f"{'='*70}\n")
    
    heroes = fetch_heroes()
    
    if not heroes:
        print("No heroes found!")
        return
    
    print(f"Found {len(heroes)} heroes\n")
    
    updated = 0
    skipped = 0
    errors = 0
    
    for hero in heroes:
        hero_id = hero['id']
        hero_name = hero['name']
        
        print(f"[{hero_id}] {hero_name}")
        
        # Отримуємо дані з офіційного API
        counter_data = fetch_hero_counter(hero_id, hero_name)
        time.sleep(0.5)
        
        compat_data = fetch_hero_compatibility(hero_id, hero_name)
        time.sleep(0.5)
        
        if not counter_data and not compat_data:
            print(f"  ⊘ No data available\n")
            skipped += 1
            continue
        
        # Виводимо що отримали
        if counter_data:
            print(f"  ✓ Counter: {len(counter_data.get('best_counters', []))} best, {len(counter_data.get('most_countered_by', []))} worst")
        if compat_data:
            print(f"  ✓ Compat: {len(compat_data.get('compatible', []))} good, {len(compat_data.get('not_compatible', []))} bad")
        
        # Оновлюємо в production
        if update_hero_data(hero_id, counter_data, compat_data):
            print(f"  ✓ Updated in production DB\n")
            updated += 1
        else:
            print(f"  ❌ Failed to update\n")
            errors += 1
    
    print(f"\n{'='*70}")
    print("Summary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Errors: {errors}")
    print(f"  Total: {len(heroes)}")
    print(f"{'='*70}\n")

if __name__ == '__main__':
    main()
