#!/usr/bin/env python3
"""
Оновлення статистики героїв з mlbb-stats API
Використовуємо прямий доступ до Railway PostgreSQL
"""

import os
import requests
import time
from database import get_connection, release_connection, get_placeholder

def update_hero_stats():
    """Оновлює статистику всіх героїв з mlbb-stats API"""
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Отримуємо всіх героїв
    cursor.execute("SELECT id, name FROM heroes WHERE game_id = 2 ORDER BY name")
    heroes = cursor.fetchall()
    
    updated = 0
    skipped = 0
    errors = []
    
    API_BASE = 'https://mlbb-stats.ridwaanhall.com/api/hero-detail-stats'
    
    print(f"🔄 Оновлення статистики для {len(heroes)} героїв...\n")
    
    for hero in heroes:
        hero_id = hero[0]
        hero_name = hero[1]
        
        # Конвертуємо ім'я в URL-friendly формат
        url_name = hero_name.lower().replace(' ', '-').replace("'", '').replace('.', '')
        url = f"{API_BASE}/{url_name}/"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code != 200:
                print(f"⚠️  {hero_name}: HTTP {response.status_code}")
                skipped += 1
                continue
            
            api_data = response.json()
            
            if api_data.get('code') != 0 or not api_data.get('data', {}).get('records'):
                print(f"⚠️  {hero_name}: No data")
                skipped += 1
                continue
            
            record = api_data['data']['records'][0]
            stats_data = record.get('data', {})
            
            # Отримуємо статистику
            ban_rate = stats_data.get('main_hero_ban_rate')
            pick_rate = stats_data.get('main_hero_appearance_rate')
            win_rate = stats_data.get('main_hero_win_rate')
            
            # Множимо на 100 для відсотків
            ban_rate_pct = round(ban_rate * 100, 2) if ban_rate is not None else None
            pick_rate_pct = round(pick_rate * 100, 2) if pick_rate is not None else None
            win_rate_pct = round(win_rate * 100, 2) if win_rate is not None else None
            
            if ban_rate_pct is not None or pick_rate_pct is not None or win_rate_pct is not None:
                ph = get_placeholder()
                cursor.execute(f"""
                    UPDATE heroes 
                    SET main_hero_ban_rate = {ph}, 
                        main_hero_appearance_rate = {ph}, 
                        main_hero_win_rate = {ph}
                    WHERE id = {ph}
                """, (ban_rate_pct, pick_rate_pct, win_rate_pct, hero_id))
                
                print(f"✅ {hero_name}: Ban {ban_rate_pct}%, Pick {pick_rate_pct}%, Win {win_rate_pct}%")
                updated += 1
            else:
                print(f"⚠️  {hero_name}: No stats")
                skipped += 1
            
            # Пауза між запитами
            time.sleep(0.3)
            
        except Exception as e:
            error_msg = f"{hero_name}: {str(e)}"
            errors.append(error_msg)
            print(f"❌ {error_msg}")
            skipped += 1
    
    conn.commit()
    release_connection(conn)
    
    print(f"\n📊 Результат:")
    print(f"  ✅ Оновлено: {updated}")
    print(f"  ⚠️  Пропущено: {skipped}")
    print(f"  📝 Всього: {len(heroes)}")
    if errors:
        print(f"  ❌ Помилок: {len(errors)}")

if __name__ == '__main__':
    update_hero_stats()
