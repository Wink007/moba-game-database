#!/usr/bin/env python3
"""
Порівнює список предметів з нашої бази даних з Liquipedia
"""

import requests
from bs4 import BeautifulSoup
import database as db

def get_liquipedia_items():
    """Отримує список предметів з Liquipedia"""
    url = "https://liquipedia.net/mobilelegends/Portal:Equipment"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        items = set()
        
        # Знаходимо всі таблиці з категоріями предметів
        for table in soup.find_all('table', class_='wikitable'):
            for link in table.find_all('a'):
                title = link.get('title', '')
                # Фільтруємо тільки реальні предмети (не сторінки, не турніри)
                if title and not any(x in title for x in [
                    'Season', 'Championship', 'League', 'Special:', 'Help:', 
                    'Liquipedia:', 'Main Page', 'Patch', 'Games of',
                    'Southeast Asian', 'IESF', 'SURGE', 'Saudi', 'Shanghai',
                    'CyberHero', 'BetBoom', 'MLBB Academy'
                ]):
                    items.add(title)
        
        return sorted(items)
    except Exception as e:
        print(f"Error fetching from Liquipedia: {e}")
        return []

def get_database_items():
    """Отримує список предметів з нашої бази даних"""
    try:
        conn = db.get_connection()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM equipment WHERE game_id = 2 ORDER BY name")
        items = [db.dict_from_row(row)['name'] for row in cursor.fetchall()]
        db.release_connection(conn)
        
        return items
    except Exception as e:
        print(f"Error fetching from database: {e}")
        return []

def main():
    print("🔍 Fetching items from Liquipedia...")
    liquipedia_items = get_liquipedia_items()
    print(f"Found {len(liquipedia_items)} items on Liquipedia")
    
    print("\n🔍 Fetching items from database...")
    db_items = get_database_items()
    print(f"Found {len(db_items)} items in database")
    
    # Порівняння
    liquipedia_set = set(liquipedia_items)
    db_set = set(db_items)
    
    missing_in_db = liquipedia_set - db_set
    extra_in_db = db_set - liquipedia_set
    
    print("\n" + "="*60)
    print("📊 COMPARISON RESULTS")
    print("="*60)
    
    if missing_in_db:
        print(f"\n❌ Missing in database ({len(missing_in_db)} items):")
        for item in sorted(missing_in_db):
            print(f"  - {item}")
    else:
        print("\n✅ No items missing in database")
    
    if extra_in_db:
        print(f"\n⚠️  Extra in database ({len(extra_in_db)} items):")
        for item in sorted(extra_in_db):
            print(f"  - {item}")
    else:
        print("\n✅ No extra items in database")
    
    if not missing_in_db and not extra_in_db:
        print("\n🎉 Perfect match! All items are in sync.")
    
    print("\n" + "="*60)
    print(f"Database: {len(db_items)} | Liquipedia: {len(liquipedia_items)}")
    print("="*60)

if __name__ == "__main__":
    main()
