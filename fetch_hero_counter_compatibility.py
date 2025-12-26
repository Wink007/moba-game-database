#!/usr/bin/env python3
"""
Скрипт для оновлення Counter Relationship та Compatibility для героїв з API mlbb-stats
"""
import requests
import time
import json
import database as db

API_COUNTER = 'https://mlbb-stats.ridwaanhall.com/api/hero-counter'
API_COMPAT = 'https://mlbb-stats.ridwaanhall.com/api/hero-compatibility'

def fetch_hero_counter(hero_game_id):
    """
    Отримує Counter Relationship з API через hero_game_id
    Повертає: JSON з sub_hero (Best Counters) та sub_hero_last (Most Countered by)
    """
    url = f"{API_COUNTER}/{hero_game_id}/"
    
    try:
        print(f"  Fetching counter data from {url}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"    ❌ Error: HTTP {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"    ❌ No data in response")
            return None
        
        record = data['data']['records'][0]['data']
        
        # Витягуємо потрібні дані
        counter_data = {
            'main_hero_win_rate': round(record.get('main_hero_win_rate', 0) * 100, 2),
            'best_counters': [],  # sub_hero
            'most_countered_by': []  # sub_hero_last
        }
        
        # Best Counters (герої що контрять цього героя)
        for hero in record.get('sub_hero', [])[:5]:  # топ-5
            counter_data['best_counters'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        # Most Countered by (герої яких контрить цей герой)
        for hero in record.get('sub_hero_last', [])[:5]:  # топ-5
            counter_data['most_countered_by'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        print(f"    ✅ Counter: {len(counter_data['best_counters'])} counters, {len(counter_data['most_countered_by'])} countered")
        return json.dumps(counter_data, ensure_ascii=False)
        
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return None

def fetch_hero_compatibility(hero_game_id):
    """
    Отримує Compatibility з API через hero_game_id
    Повертає: JSON з sub_hero (Compatible) та sub_hero_last (Not Compatible)
    """
    url = f"{API_COMPAT}/{hero_game_id}/"
    
    try:
        print(f"  Fetching compatibility data from {url}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"    ❌ Error: HTTP {response.status_code}")
            return None
        
        data = response.json()
        
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"    ❌ No data in response")
            return None
        
        record = data['data']['records'][0]['data']
        
        # Витягуємо потрібні дані
        compat_data = {
            'main_hero_win_rate': round(record.get('main_hero_win_rate', 0) * 100, 2),
            'compatible': [],  # sub_hero
            'not_compatible': []  # sub_hero_last
        }
        
        # Compatible (герої з якими добре грати)
        for hero in record.get('sub_hero', [])[:5]:  # топ-5
            compat_data['compatible'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        # Not Compatible (герої з якими погано грати)
        for hero in record.get('sub_hero_last', [])[:5]:  # топ-5
            compat_data['not_compatible'].append({
                'heroid': hero.get('heroid'),
                'win_rate': round(hero.get('hero_win_rate', 0) * 100, 2),
                'increase_win_rate': round(hero.get('increase_win_rate', 0) * 100, 2),
                'appearance_rate': round(hero.get('hero_appearance_rate', 0) * 100, 2)
            })
        
        print(f"    ✅ Compatibility: {len(compat_data['compatible'])} good, {len(compat_data['not_compatible'])} bad")
        return json.dumps(compat_data, ensure_ascii=False)
        
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return None

def update_hero_counter_compat(hero_id, counter_data, compat_data):
    """
    Оновлює counter_data та compatibility_data для героя в БД
    """
    conn = db.get_connection()
    cursor = conn.cursor()
    
    ph = db.get_placeholder()
    cursor.execute(f"""
        UPDATE heroes 
        SET counter_data = {ph}, 
            compatibility_data = {ph}
        WHERE id = {ph}
    """, (counter_data, compat_data, hero_id))
    
    conn.commit()
    db.release_connection(conn)

def main():
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    # Отримуємо всіх героїв з game_id = 2 (Mobile Legends)
    cursor.execute("SELECT id, name, hero_game_id FROM heroes WHERE game_id = 2 ORDER BY name")
    heroes = cursor.fetchall()
    db.release_connection(conn)
    
    print(f"\n{'='*70}")
    print(f"Found {len(heroes)} heroes to update")
    print(f"{'='*70}\n")
    
    updated = 0
    skipped = 0
    
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_id = hero_dict['id']
        hero_name = hero_dict['name']
        hero_game_id = hero_dict.get('hero_game_id')
        
        if not hero_game_id:
            print(f"Processing [{hero_id}] {hero_name}... ⊘ Skipped (no hero_game_id)\n")
            skipped += 1
            continue
        
        print(f"Processing [{hero_id}] {hero_name} (game_id={hero_game_id})...")
        
        counter_data = fetch_hero_counter(hero_game_id)
        time.sleep(0.3)  # Пауза між запитами
        
        compat_data = fetch_hero_compatibility(hero_game_id)
        time.sleep(0.3)  # Пауза між запитами
        
        if counter_data or compat_data:
            update_hero_counter_compat(hero_id, counter_data, compat_data)
            updated += 1
            print(f"  ✓ Updated in DB\n")
        else:
            skipped += 1
            print(f"  ⊘ Skipped (no data)\n")
    
    print(f"\n{'='*70}")
    print(f"Summary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(heroes)}")
    print(f"{'='*70}\n")

if __name__ == '__main__':
    main()
