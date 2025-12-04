#!/usr/bin/env python3
"""
Скрипт для оновлення createdAt та head для героїв з API mlbb-stats
"""
import sqlite3
import requests
import time
from datetime import datetime

DB_FILE = 'test_games.db'
API_BASE = 'https://mlbb-stats.ridwaanhall.com/api/hero-detail'

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_hero_metadata(hero_name):
    """
    Отримує createdAt та head з API для героя
    """
    # Конвертуємо ім'я в URL-friendly формат (lowercase)
    url_name = hero_name.lower().replace(' ', '-').replace("'", '')
    url = f"{API_BASE}/{url_name}/"
    
    try:
        print(f"Fetching {hero_name} from {url}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"  ❌ Error: HTTP {response.status_code}")
            return None, None
        
        data = response.json()
        
        # Парсимо відповідь
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"  ❌ No data in response")
            return None, None
        
        record = data['data']['records'][0]
        
        # Отримуємо createdAt (timestamp в мілісекундах)
        created_at = record.get('createdAt')
        
        # Отримуємо head з data.hero.data.head
        head = None
        if record.get('data', {}).get('hero', {}).get('data', {}).get('head'):
            head = record['data']['hero']['data']['head']
        
        print(f"  ✅ Found: createdAt={created_at}, head={head[:50] if head else None}...")
        return created_at, head
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request error: {e}")
        return None, None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None, None

def update_hero_metadata(hero_id, created_at, head):
    """
    Оновлює createdAt та head для героя в БД
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE heroes 
        SET createdAt = ?, head = ?
        WHERE id = ?
    """, (created_at, head, hero_id))
    
    conn.commit()
    conn.close()

def main():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Отримуємо всіх героїв з game_id = 3 (Mobile Legends)
    cursor.execute("SELECT id, name FROM heroes WHERE game_id = 3 ORDER BY name")
    heroes = cursor.fetchall()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"Found {len(heroes)} heroes to update")
    print(f"{'='*60}\n")
    
    updated = 0
    skipped = 0
    
    for hero in heroes:
        hero_id = hero['id']
        hero_name = hero['name']
        
        created_at, head = fetch_hero_metadata(hero_name)
        
        if created_at or head:
            update_hero_metadata(hero_id, created_at, head)
            updated += 1
            print(f"  ✓ Updated in DB\n")
        else:
            skipped += 1
            print(f"  ⊘ Skipped (no data)\n")
        
        # Пауза між запитами щоб не перевантажити API
        time.sleep(0.5)
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(heroes)}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
