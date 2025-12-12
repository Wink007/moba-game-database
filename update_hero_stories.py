#!/usr/bin/env python3
"""
Update hero short_description with story from mlbb-stats API
Fetches story field from https://mlbb-stats.ridwaanhall.com/api/hero-detail/{name}
and updates short_description in our database
"""

import requests
import time
from database import get_connection, release_connection, get_placeholder

def get_heroes_from_db(game_id=2):
    """Get all heroes for Mobile Legends (game_id=2)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, short_description FROM heroes WHERE game_id = %s", (game_id,))
    
    heroes = []
    for row in cursor.fetchall():
        heroes.append({
            'id': row[0],
            'name': row[1],
            'short_description': row[2]
        })
    
    release_connection(conn)
    return heroes

def fetch_hero_story(hero_name):
    """Fetch story from mlbb-stats API"""
    # Convert hero name to API format:
    # "Luo Yi" -> "Luo_Yi"
    # "Franco" -> "franco"
    # "Yi Sun-shin" -> "Yi_Sun-shin"
    api_name = hero_name.replace(' ', '_')
    url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{api_name}/"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Navigate through nested structure: data -> records -> [0] -> data -> hero -> data -> story
            if 'data' in data and 'records' in data['data'] and len(data['data']['records']) > 0:
                record = data['data']['records'][0]
                if 'data' in record and 'hero' in record['data'] and 'data' in record['data']['hero']:
                    story = record['data']['hero']['data'].get('story', '')
                    return story
            return None
        else:
            print(f"API error {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def update_hero_description(hero_id, story):
    """Update short_description in database"""
    conn = get_connection()
    cursor = conn.cursor()
    ph = get_placeholder()
    
    cursor.execute(f"""
        UPDATE heroes 
        SET short_description = {ph}
        WHERE id = {ph}
    """, (story, hero_id))
    
    conn.commit()
    release_connection(conn)

def main():
    print("🏆 Оновлення hero stories з mlbb-stats API")
    print("=" * 60)
    
    heroes = get_heroes_from_db(game_id=2)
    print(f"📊 Знайдено героїв: {len(heroes)}")
    print()
    
    updated = 0
    skipped = 0
    failed = 0
    
    for i, hero in enumerate(heroes, 1):
        hero_id = hero['id']
        hero_name = hero['name']
        current_desc = hero['short_description']
        
        print(f"[{i}/{len(heroes)}] {hero_name}...", end=' ')
        
        # Fetch story from API
        story = fetch_hero_story(hero_name)
        
        if story:
            if story != current_desc:
                update_hero_description(hero_id, story)
                print(f"✅ Оновлено")
                print(f"    Старе: {current_desc[:50]}...")
                print(f"    Нове: {story[:50]}...")
                updated += 1
            else:
                print(f"⏭️  Без змін")
                skipped += 1
        else:
            print(f"❌ Не знайдено")
            failed += 1
        
        # Rate limiting - wait 0.5s between requests
        if i < len(heroes):
            time.sleep(0.5)
    
    print()
    print("=" * 60)
    print(f"✅ Оновлено: {updated}")
    print(f"⏭️  Пропущено (без змін): {skipped}")
    print(f"❌ Помилки: {failed}")
    print(f"📊 Всього оброблено: {len(heroes)}")

if __name__ == '__main__':
    main()
