#!/usr/bin/env python3
import sqlite3

DB_FILE = 'test_games.db'

def create_equipment_table():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Створюємо таблицю equipment
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            display_name TEXT,
            category TEXT NOT NULL,
            physical_attack INTEGER DEFAULT 0,
            magic_power INTEGER DEFAULT 0,
            hp INTEGER DEFAULT 0,
            physical_defense INTEGER DEFAULT 0,
            magic_defense INTEGER DEFAULT 0,
            movement_speed INTEGER DEFAULT 0,
            attack_speed INTEGER DEFAULT 0,
            cooldown_reduction INTEGER DEFAULT 0,
            lifesteal INTEGER DEFAULT 0,
            spell_vamp INTEGER DEFAULT 0,
            penetration INTEGER DEFAULT 0,
            stats_other TEXT,
            passive_name TEXT,
            passive_type TEXT,
            passive_description TEXT,
            passive_effects TEXT,
            price_total INTEGER DEFAULT 0,
            price_upgrade INTEGER DEFAULT 0,
            price_sell INTEGER DEFAULT 0,
            sellable INTEGER DEFAULT 1,
            removed INTEGER DEFAULT 0,
            availability_description TEXT,
            recipe_components TEXT,
            tags TEXT,
            image_path TEXT,
            game_id INTEGER DEFAULT 1,
            FOREIGN KEY (game_id) REFERENCES games(id)
        )
    """)
    
    conn.commit()
    print("✅ Таблиця equipment створена")
    
    # Перевіряємо структуру
    cursor.execute("PRAGMA table_info(equipment)")
    columns = cursor.fetchall()
    print(f"\n📊 Колонок у таблиці: {len(columns)}")
    
    conn.close()

if __name__ == '__main__':
    create_equipment_table()
