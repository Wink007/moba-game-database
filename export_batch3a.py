#!/usr/bin/env python3
"""Export specific heroes by ID for translation"""
import psycopg2

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Batch 3a: 13 heroes (3500-5000 chars)
ids = [105, 27, 89, 94, 59, 60, 74, 122, 96, 14, 98, 102, 23]

for hero_id in ids:
    cur.execute("SELECT id, name, full_description FROM heroes WHERE id = %s", (hero_id,))
    r = cur.fetchone()
    if r:
        print(f"--- {r[1]} (id={r[0]}, {len(r[2])} chars) ---")
        print(r[2])
        print()

conn.close()
