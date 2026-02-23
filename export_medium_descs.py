#!/usr/bin/env python3
"""Export medium full descriptions (1500-3500 chars) for translation"""
import psycopg2

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, name, full_description
    FROM heroes WHERE game_id = 2 
    AND (full_description_uk IS NULL OR full_description_uk = '')
    AND full_description IS NOT NULL AND full_description != ''
    AND LENGTH(full_description) >= 1500 AND LENGTH(full_description) < 3500
    ORDER BY LENGTH(full_description) ASC
""")
rows = cur.fetchall()

print(f"=== MEDIUM (1500-3500 chars): {len(rows)} heroes ===\n")
for r in rows:
    print(f"--- {r[1]} (id={r[0]}, {len(r[2])} chars) ---")
    print(r[2])
    print()

conn.close()
