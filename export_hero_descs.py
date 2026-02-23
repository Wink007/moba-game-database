#!/usr/bin/env python3
"""Export all hero descriptions for translation"""
import psycopg2
import json

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, name, name_uk, short_description, short_description_uk, full_description, full_description_uk
    FROM heroes WHERE game_id = 2
    ORDER BY name
""")

heroes = []
for row in cur.fetchall():
    heroes.append({
        'id': row[0],
        'name': row[1],
        'name_uk': row[2],
        'short_description': row[3],
        'short_description_uk': row[4],
        'full_description': row[5],
        'full_description_uk': row[6]
    })

conn.close()

with open('/tmp/hero_descriptions.json', 'w', encoding='utf-8') as f:
    json.dump(heroes, f, ensure_ascii=False, indent=2)

# Print summary
print(f"Exported {len(heroes)} heroes")

# Show the one that has translation
for h in heroes:
    if h['short_description_uk'] or h['full_description_uk']:
        print(f"\nHero with existing UK translation: {h['name']}")
        print(f"  short_uk: {h['short_description_uk']}")
        print(f"  full_uk: {(h['full_description_uk'] or '')[:200]}")

# Print all short descriptions for reference
print("\n\n=== ALL SHORT DESCRIPTIONS ===")
for h in heroes:
    print(f"\n{h['name']}: {h['short_description']}")

print(f"\n\nTotal: {len(heroes)} heroes")
