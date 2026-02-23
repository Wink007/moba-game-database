#!/usr/bin/env python3
"""List heroes that need full_description_uk translation, grouped by size"""
import psycopg2

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, name, LENGTH(full_description) as len
    FROM heroes WHERE game_id = 2 
    AND (full_description_uk IS NULL OR full_description_uk = '')
    AND full_description IS NOT NULL AND full_description != ''
    ORDER BY LENGTH(full_description) ASC
""")
rows = cur.fetchall()

print(f"Total remaining: {len(rows)} heroes\n")

# Group by size
groups = {
    '3500-4500': [],
    '4500-5500': [],
    '5500-6500': [],
    '6500-7500': [],
    '7500+': [],
}
for r in rows:
    l = r[2]
    if l < 4500:
        groups['3500-4500'].append(r)
    elif l < 5500:
        groups['4500-5500'].append(r)
    elif l < 6500:
        groups['5500-6500'].append(r)
    elif l < 7500:
        groups['6500-7500'].append(r)
    else:
        groups['7500+'].append(r)

for group, heroes in groups.items():
    print(f"\n=== {group} chars ({len(heroes)} heroes) ===")
    for h in heroes:
        print(f"  {h[1]} (id={h[0]}, {h[2]} chars)")

conn.close()
