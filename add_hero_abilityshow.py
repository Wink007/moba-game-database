#!/usr/bin/env python3
"""
Додає поле 'abilityshow' до таблиці heroes та заповнює його з API mlbb-stats
"""

import requests
import time
import json
import database as db

def add_abilityshow_column():
    """Додає колонку abilityshow до таблиці heroes"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        # Додати колонку як JSON/JSONB для PostgreSQL або TEXT для SQLite
        if db.DATABASE_TYPE == 'postgres':
            cursor.execute("ALTER TABLE heroes ADD COLUMN abilityshow JSONB")
        else:
            cursor.execute("ALTER TABLE heroes ADD COLUMN abilityshow TEXT")
        conn.commit()
        print("✅ Колонка 'abilityshow' додана до таблиці heroes")
    except Exception as e:
        print(f"ℹ️  Колонка вже існує або помилка: {e}")
        conn.rollback()
    finally:
        db.release_connection(conn)

def fetch_abilityshow_from_api(hero_name):
    """Отримує abilityshow з API mlbb-stats"""
    try:
        # Очищуємо ім'я героя
        clean_name = hero_name.lower().replace(' ', '-').replace("'", "")
        url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{clean_name}/"
        
        print(f"  Запит: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Поле знаходиться в data.records[0].data.hero.data.abilityshow
            records = data.get('data', {}).get('records', [])
            if records and len(records) > 0:
                hero_data = records[0].get('data', {}).get('hero', {}).get('data', {})
                abilityshow = hero_data.get('abilityshow')
                
                if abilityshow and isinstance(abilityshow, list):
                    print(f"  ✅ Знайдено abilityshow для {hero_name}: {abilityshow}")
                    return abilityshow
                else:
                    print(f"  ⚠️  Поле 'abilityshow' не знайдено для {hero_name}")
            else:
                print(f"  ⚠️  Немає записів для {hero_name}")
        else:
            print(f"  ❌ Помилка API {response.status_code} для {hero_name}")
    except Exception as e:
        print(f"  ❌ Помилка: {e}")
    
    return None

def update_hero_abilityshow():
    """Оновлює abilityshow для всіх героїв Mobile Legends"""
    # Отримуємо всіх героїв Mobile Legends (game_id = 2)
    heroes = db.get_heroes(game_id=2, include_details=False, include_skills=False)
    
    if not heroes:
        print("❌ Не знайдено героїв Mobile Legends")
        return
    
    print(f"\n📊 Знайдено {len(heroes)} героїв Mobile Legends")
    print("=" * 60)
    
    updated_count = 0
    skipped_count = 0
    
    for hero in heroes:
        hero_id = hero['id']
        hero_name = hero['name']
        
        print(f"\n[{updated_count + skipped_count + 1}/{len(heroes)}] Обробка: {hero_name} (ID: {hero_id})")
        
        # Отримуємо abilityshow з API
        abilityshow = fetch_abilityshow_from_api(hero_name)
        
        if abilityshow:
            # Оновлюємо в базі
            conn = db.get_connection()
            cursor = conn.cursor()
            ph = db.get_placeholder()
            
            try:
                # Для PostgreSQL зберігаємо як JSONB, для SQLite як JSON string
                if db.DATABASE_TYPE == 'postgres':
                    cursor.execute(
                        f"UPDATE heroes SET abilityshow = {ph}::jsonb WHERE id = {ph}",
                        (json.dumps(abilityshow), hero_id)
                    )
                else:
                    cursor.execute(
                        f"UPDATE heroes SET abilityshow = {ph} WHERE id = {ph}",
                        (json.dumps(abilityshow), hero_id)
                    )
                conn.commit()
                updated_count += 1
                print(f"  💾 Збережено в БД")
            except Exception as e:
                print(f"  ❌ Помилка збереження: {e}")
                conn.rollback()
            finally:
                db.release_connection(conn)
        else:
            skipped_count += 1
        
        # Затримка щоб не перевантажити API
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print(f"✅ Завершено!")
    print(f"   Оновлено: {updated_count}")
    print(f"   Пропущено: {skipped_count}")
    print(f"   Всього: {len(heroes)}")

if __name__ == '__main__':
    print("🎮 Додавання поля 'abilityshow' до героїв Mobile Legends")
    print("=" * 60)
    
    # Крок 1: Додати колонку
    add_abilityshow_column()
    
    # Крок 2: Заповнити дані
    update_hero_abilityshow()
