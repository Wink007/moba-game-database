#!/usr/bin/env python3
"""
Додає відсутні поля до таблиці equipment
"""

import os
os.environ['DATABASE_TYPE'] = 'postgres'

import database as db

def add_missing_fields():
    """Додає поля attributes_json, mana_regen, crit_chance якщо їх немає"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    fields_to_add = [
        ("attributes_json", "TEXT"),
        ("mana_regen", "REAL"),
        ("crit_chance", "REAL"),
    ]
    
    for field_name, field_type in fields_to_add:
        try:
            print(f"Adding field {field_name} {field_type}...")
            cursor.execute(f"ALTER TABLE equipment ADD COLUMN {field_name} {field_type}")
            conn.commit()
            print(f"✅ Added {field_name}")
        except Exception as e:
            if "already exists" in str(e) or "duplicate column" in str(e).lower():
                print(f"⏭️  {field_name} already exists")
                conn.rollback()
            else:
                print(f"❌ Error adding {field_name}: {e}")
                conn.rollback()
    
    db.release_connection(conn)
    print("\n✅ Done!")

if __name__ == '__main__':
    add_missing_fields()
