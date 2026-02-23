#!/usr/bin/env python3
"""Export full descriptions for heroes that need translation, grouped by size"""
import psycopg2

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, name, full_description
    FROM heroes WHERE game_id = 2 
    AND (full_description_uk IS NULL OR full_description_uk = '')
    AND full_description IS NOT NULL AND full_description != ''
    ORDER BY LENGTH(full_description) ASC
""")
rows = cur.fetchall()

print("=== SHORT (<1500 chars) ===")
for r in rows:
    if len(r[2]) < 1500:
        print(f"\n--- {r[1]} (id={r[0]}, {len(r[2])} chars) ---")
        print(r[2])

conn.close()
