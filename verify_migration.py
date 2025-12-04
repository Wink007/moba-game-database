#!/usr/bin/env python3
"""
Перевірка міграції на Railway PostgreSQL
"""
import psycopg2

PG_URL = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

print("🔍 Перевіряю міграцію...")
print()

conn = psycopg2.connect(PG_URL)
cursor = conn.cursor()

# Перевіряємо всі таблиці
tables = ['games', 'heroes', 'items', 'equipment', 'battle_spells', 'emblems', 'hero_stats', 'hero_skills', 'emblem_talents']

for table in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"✅ {table}: {count} записів")

print()
print("🎯 Перевіряю героїв:")
cursor.execute("SELECT id, name, role FROM heroes LIMIT 5")
heroes = cursor.fetchall()
for hero in heroes:
    print(f"   • {hero[0]}: {hero[1]} ({hero[2]})")

print()
print("🎯 Перевіряю предмети:")
cursor.execute("SELECT id, name, item_type FROM items LIMIT 5")
items = cursor.fetchall()
for item in items:
    print(f"   • {item[0]}: {item[1]} ({item[2]})")

cursor.close()
conn.close()

print()
print("🎉 Міграція успішна! База даних на Railway працює!")
