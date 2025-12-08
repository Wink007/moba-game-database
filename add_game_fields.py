#!/usr/bin/env python3
"""
Додає нові поля до таблиці games:
- background_image: URL фонового зображення
- video_intro: URL відео вступу
- subtitle: Підзаголовок гри
- preview: URL превʼю зображення
"""

import database as db

def add_game_fields():
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Додаємо нові поля
    fields_to_add = [
        ('background_image', 'TEXT'),
        ('video_intro', 'TEXT'),
        ('subtitle', 'TEXT'),
        ('preview', 'TEXT')
    ]
    
    for field_name, field_type in fields_to_add:
        try:
            if db.DATABASE_TYPE == 'postgres':
                # PostgreSQL підтримує IF NOT EXISTS
                cursor.execute(f"ALTER TABLE games ADD COLUMN IF NOT EXISTS {field_name} {field_type}")
            else:
                cursor.execute(f"ALTER TABLE games ADD COLUMN {field_name} {field_type}")
            print(f"✅ Added column: {field_name}")
        except Exception as e:
            if 'already exists' in str(e) or 'duplicate column' in str(e).lower():
                print(f"⚠️  Column {field_name} already exists")
            else:
                print(f"❌ Error adding {field_name}: {e}")
    
    conn.commit()
    db.release_connection(conn)
    print("\n✅ Migration completed!")

if __name__ == '__main__':
    print("Adding new fields to games table...")
    add_game_fields()
