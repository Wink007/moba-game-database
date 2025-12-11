#!/usr/bin/env python3
"""
Перевіряє та оновлює поле 'painting' для всіх героїв з API mlbb-stats
Правильний шлях: data.records[0].data.painting
"""

import requests
import time
import database as db

def fetch_painting_from_api(hero_name):
    """Отримує painting URL з API mlbb-stats"""
    try:
        # Очищуємо ім'я героя
        clean_name = hero_name.lower().replace(' ', '-').replace("'", "").replace(".", "")
        url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{clean_name}/"
        
        print(f"  Запит: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get('data', {}).get('records', [])
            
            if records and len(records) > 0:
                # Правильний шлях: data.records[0].data.painting
                record_data = records[0].get('data', {})
                painting = record_data.get('painting')
                
                if painting:
                    print(f"  ✅ Знайдено: {painting}")
                    return painting
                else:
                    print(f"  ⚠️  Поле 'painting' відсутнє")
            else:
                print(f"  ⚠️  Немає записів")
        else:
            print(f"  ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"  ❌ Помилка: {e}")
    
    return None

def update_all_paintings():
    """Оновлює painting для всіх героїв Mobile Legends"""
    # Отримуємо всіх героїв Mobile Legends (game_id = 2)
    heroes = db.get_heroes(game_id=2, include_details=False, include_skills=False)
    
    if not heroes:
        print("❌ Не знайдено героїв Mobile Legends")
        return
    
    print(f"\n📊 Знайдено {len(heroes)} героїв Mobile Legends")
    print("=" * 70)
    
    updated_count = 0
    failed_count = 0
    
    for i, hero in enumerate(heroes, 1):
        hero_id = hero['id']
        hero_name = hero['name']
        current_painting = hero.get('painting', '')
        
        print(f"\n[{i}/{len(heroes)}] {hero_name} (ID: {hero_id})")
        if current_painting:
            print(f"  Поточне значення: {current_painting[:80]}...")
        
        # Отримуємо painting з API
        painting_url = fetch_painting_from_api(hero_name)
        
        if painting_url:
            # Перевіряємо, чи змінилось значення
            if painting_url != current_painting:
                # Оновлюємо в базі
                conn = db.get_connection()
                cursor = conn.cursor()
                ph = db.get_placeholder()
                
                try:
                    cursor.execute(
                        f"UPDATE heroes SET painting = {ph} WHERE id = {ph}",
                        (painting_url, hero_id)
                    )
                    conn.commit()
                    print(f"  ✅ ОНОВЛЕНО в базі")
                    updated_count += 1
                except Exception as e:
                    print(f"  ❌ Помилка оновлення: {e}")
                    conn.rollback()
                    failed_count += 1
                finally:
                    db.release_connection(conn)
            else:
                print(f"  ℹ️  Значення не змінилось")
        else:
            failed_count += 1
        
        # Затримка між запитами
        time.sleep(0.5)
    
    print("\n" + "=" * 70)
    print(f"📊 ПІДСУМОК:")
    print(f"   Оброблено героїв: {len(heroes)}")
    print(f"   ✅ Оновлено: {updated_count}")
    print(f"   ❌ Помилок: {failed_count}")
    print(f"   ✓ Успішних: {len(heroes) - failed_count}")

if __name__ == "__main__":
    print("🎮 Оновлення поля 'painting' для героїв Mobile Legends")
    print("=" * 70)
    update_all_paintings()
