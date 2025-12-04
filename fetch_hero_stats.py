#!/usr/bin/env python3
"""
Скрипт для оновлення статистики героїв (Ban Rate, Pick Rate, Win Rate) з API mlbb-stats
"""
import sqlite3
import requests
import time

DB_FILE = 'test_games.db'
API_BASE = 'https://mlbb-stats.ridwaanhall.com/api/hero-detail-stats'

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_hero_stats(hero_name):
    """
    Отримує статистику героя з API
    Повертає: (ban_rate, pick_rate, win_rate) у відсотках (помножених на 100)
    """
    # Конвертуємо ім'я в URL-friendly формат (lowercase)
    url_name = hero_name.lower().replace(' ', '-').replace("'", '').replace('.', '')
    url = f"{API_BASE}/{url_name}/"
    
    try:
        print(f"Fetching {hero_name} from {url}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            print(f"  ❌ Error: HTTP {response.status_code}")
            return None, None, None
        
        data = response.json()
        
        # Парсимо відповідь
        if data.get('code') != 0 or not data.get('data', {}).get('records'):
            print(f"  ❌ No data in response")
            return None, None, None
        
        record = data['data']['records'][0]
        stats_data = record.get('data', {})
        
        # Отримуємо статистику (у форматі 0.023294 тощо)
        ban_rate = stats_data.get('main_hero_ban_rate')
        pick_rate = stats_data.get('main_hero_appearance_rate')
        win_rate = stats_data.get('main_hero_win_rate')
        
        # Множимо на 100 для отримання відсотків
        ban_rate_pct = round(ban_rate * 100, 2) if ban_rate is not None else None
        pick_rate_pct = round(pick_rate * 100, 2) if pick_rate is not None else None
        win_rate_pct = round(win_rate * 100, 2) if win_rate is not None else None
        
        print(f"  ✅ Ban: {ban_rate_pct}%, Pick: {pick_rate_pct}%, Win: {win_rate_pct}%")
        return ban_rate_pct, pick_rate_pct, win_rate_pct
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Request error: {e}")
        return None, None, None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None, None, None

def update_hero_stats(hero_id, ban_rate, pick_rate, win_rate):
    """
    Оновлює статистику героя в БД
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE heroes 
        SET main_hero_ban_rate = ?, 
            main_hero_appearance_rate = ?, 
            main_hero_win_rate = ?
        WHERE id = ?
    """, (ban_rate, pick_rate, win_rate, hero_id))
    
    conn.commit()
    conn.close()

def main():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Отримуємо всіх героїв з game_id = 3 (Mobile Legends)
    cursor.execute("SELECT id, name FROM heroes WHERE game_id = 3 ORDER BY name")
    heroes = cursor.fetchall()
    conn.close()
    
    print(f"\n{'='*70}")
    print(f"Found {len(heroes)} heroes to update")
    print(f"{'='*70}\n")
    
    updated = 0
    skipped = 0
    
    for hero in heroes:
        hero_id = hero['id']
        hero_name = hero['name']
        
        ban_rate, pick_rate, win_rate = fetch_hero_stats(hero_name)
        
        if ban_rate is not None or pick_rate is not None or win_rate is not None:
            update_hero_stats(hero_id, ban_rate, pick_rate, win_rate)
            updated += 1
            print(f"  ✓ Updated in DB\n")
        else:
            skipped += 1
            print(f"  ⊘ Skipped (no data)\n")
        
        # Пауза між запитами щоб не перевантажити API
        time.sleep(0.5)
    
    print(f"\n{'='*70}")
    print(f"Summary:")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(heroes)}")
    print(f"{'='*70}\n")
    
    # Показуємо топ-10 за Ban Rate
    print("\nТоп-10 героїв за Ban Rate:")
    print(f"{'='*70}")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, 
               main_hero_ban_rate as 'Ban%', 
               main_hero_appearance_rate as 'Pick%', 
               main_hero_win_rate as 'Win%'
        FROM heroes 
        WHERE main_hero_win_rate IS NOT NULL 
        ORDER BY main_hero_ban_rate DESC 
        LIMIT 10
    """)
    
    print(f"{'Rank':<6} {'Hero':<20} {'Ban%':<10} {'Pick%':<10} {'Win%':<10}")
    print(f"{'-'*70}")
    for idx, row in enumerate(cursor.fetchall(), 1):
        print(f"{idx:<6} {row['name']:<20} {row['Ban%']:<10.2f} {row['Pick%']:<10.2f} {row['Win%']:<10.2f}")
    
    conn.close()

if __name__ == '__main__':
    main()
