#!/usr/bin/env python3
"""
Скрипт для створення індексів у PostgreSQL базі даних.
Використовує DATABASE_URL з Railway.
"""
import psycopg2
import sys

# Railway PostgreSQL URL (замість цього можна передати як аргумент)
DATABASE_URL = input("Введіть DATABASE_URL з Railway: ").strip()

if not DATABASE_URL:
    print("❌ DATABASE_URL не може бути порожнім")
    sys.exit(1)

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    indexes = [
        ("idx_heroes_game_id", "CREATE INDEX IF NOT EXISTS idx_heroes_game_id ON heroes(game_id)"),
        ("idx_hero_stats_hero_id", "CREATE INDEX IF NOT EXISTS idx_hero_stats_hero_id ON hero_stats(hero_id)"),
        ("idx_hero_skills_hero_id", "CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id)"),
        ("idx_equipment_game_id", "CREATE INDEX IF NOT EXISTS idx_equipment_game_id ON equipment(game_id)"),
        ("idx_emblems_game_id", "CREATE INDEX IF NOT EXISTS idx_emblems_game_id ON emblems(game_id)"),
        ("idx_battle_spells_game_id", "CREATE INDEX IF NOT EXISTS idx_battle_spells_game_id ON battle_spells(game_id)"),
        ("idx_emblem_talents_emblem_id", "CREATE INDEX IF NOT EXISTS idx_emblem_talents_emblem_id ON emblem_talents(emblem_id)")
    ]
    
    for idx_name, sql in indexes:
        cursor.execute(sql)
        print(f"✓ Створено індекс: {idx_name}")
    
    conn.commit()
    
    # Перевіряємо створені індекси
    cursor.execute("""
        SELECT tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
    """)
    
    print("\n📊 Створені індекси:")
    for row in cursor.fetchall():
        print(f"  {row[0]}.{row[1]}")
    
    cursor.close()
    conn.close()
    print("\n✅ Всі індекси успішно створено!")
    
except Exception as e:
    print(f"❌ Помилка: {e}")
    sys.exit(1)
