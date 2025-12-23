#!/usr/bin/env python3
"""Додає відсутні предмети напряму в PostgreSQL на Railway"""

import psycopg2
import os

# Railway PostgreSQL credentials
conn = psycopg2.connect(
    host='junction.proxy.rlwy.net',
    port=17697,
    database='railway',
    user='postgres',
    password=os.environ.get('PGPASSWORD')
)

cursor = conn.cursor()

items = [
    ("Hero's Ring", '2', 450, 'Defense', 'https://static.wikia.nocookie.net/mobile-legends/images/9/91/Hero%27s_Ring.png', 
     150, 5, '{"HP": "+150", "Cooldown Reduction": "+5%"}', '[]'),
    ('Molten Essence', '2', 800, 'Defense', 'https://static.wikia.nocookie.net/mobile-legends/images/8/8c/Molten_Essence.png',
     540, None, '{"HP": "+540"}', '[{"name": "Vitality Crystal"}]')
]

for item in items:
    try:
        cursor.execute("""
            INSERT INTO equipment (game_id, name, tier, price_total, category, icon_url, hp, cooldown_reduction, attributes_json, recipe, sellable, removed)
            VALUES (2, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 0)
        """, item)
        print(f"✅ Додано {item[0]}")
    except psycopg2.IntegrityError as e:
        print(f"⚠️  {item[0]} вже існує")
        conn.rollback()
    except Exception as e:
        print(f"❌ Помилка: {e}")
        conn.rollback()

conn.commit()
cursor.close()
conn.close()

print("\n✅ Готово! Тепер запустіть: python3 update_items_bulk.py")
