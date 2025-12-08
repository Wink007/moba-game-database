#!/usr/bin/env python3
"""
Додає поле 'painting' до таблиці heroes та заповнює його з API mlbb-stats
"""

import requests
import time
import database as db

def add_painting_column():
    """Додає колонку painting до таблиці heroes"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        # Спробувати додати колонку (якщо вже є - буде помилка, ігноруємо)
        if db.DATABASE_TYPE == 'postgres':
            cursor.execute("ALTER TABLE heroes ADD COLUMN painting TEXT")
        else:
            cursor.execute("ALTER TABLE heroes ADD COLUMN painting TEXT")
        conn.commit()
        print("✅ Колонка 'painting' додана до таблиці heroes")
    except Exception as e:
        print(f"ℹ️  Колонка вже існує або помилка: {e}")
        conn.rollback()
    finally:
        db.release_connection(conn)

def fetch_painting_from_api(hero_name):
    """Отримує painting URL з API mlbb-stats"""
    try:
        # Очищуємо ім'я героя (видаляємо спеціальні символи, приводимо до нижнього регістру)
        clean_name = hero_name.lower().replace(' ', '-').replace("'", "")
        url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{clean_name}/"
        
        print(f"  Запит: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            painting = data.get('painting')
            if painting:
                print(f"  ✅ Знайдено painting для {hero_name}")
                return painting
            else:
                print(f"  ⚠️  Поле 'painting' не знайдено для {hero_name}")
        else:
            print(f"  ❌ Помилка API {response.status_code} для {hero_name}")
    except Exception as e:
        print(f"  ❌ Помилка: {e}")
    
    return None

def update_hero_paintings():
    """Оновлює painting для всіх героїв Mobile Legends"""
    # Отримуємо всіх героїв Mobile Legends (game_id = 1)
    heroes = db.get_heroes(game_id=1, include_details=False, include_skills=False)
    
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
        
        # Отримуємо painting з API
        painting_url = fetch_painting_from_api(hero_name)
        
        if painting_url:
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
    print("🎮 Додавання поля 'painting' до героїв Mobile Legends")
    print("=" * 60)
    
    # Крок 1: Додати колонку
    add_painting_column()
    
    # Крок 2: Заповнити дані
    update_hero_paintings()
