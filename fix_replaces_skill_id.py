#!/usr/bin/env python3
"""
Цей скрипт встановлює правильні replaces_skill_id для трансформованих героїв.
Запускати ПІСЛЯ update_transformed_heroes.py
"""
import sqlite3
import requests
import json
from database import get_connection, release_connection, get_placeholder

conn_sqlite = sqlite3.connect('test_games.db')
cursor_sqlite = conn_sqlite.cursor()

transformed_heroes = ['Beatrix', 'Edith', 'Hanzo', 'Julian', 'Lapu-Lapu', 'Leomord', 'Lukas', 'Lunox', 'Popol and Kupa', 'Roger', 'Selena', 'Yin']

print('Оновлюю replaces_skill_id для трансформованих героїв...\n')

# Отримуємо всіх героїв з Railway
resp = requests.get('https://web-production-8570.up.railway.app/api/heroes?game_id=2', timeout=10)
railway_heroes = resp.json()

conn_pg = get_connection()
cursor_pg = conn_pg.cursor()
ph = get_placeholder()

total_updates = 0

for hero_name in transformed_heroes:
    railway_hero = [h for h in railway_heroes if h['name'] == hero_name]
    if not railway_hero:
        continue
    
    railway_id = railway_hero[0]['id']
    
    # Отримуємо деталі героя з Railway
    resp = requests.get(f'https://web-production-8570.up.railway.app/api/heroes/{railway_id}')
    hero_data = resp.json()
    
    # Створюємо мапу назва -> ID для Railway
    railway_skill_map = {s['skill_name']: s['id'] for s in hero_data['skills']}
    
    # Отримуємо з SQLite які навички що замінюють
    cursor_sqlite.execute('''
        SELECT hs1.skill_name as transformed_skill, hs2.skill_name as base_skill
        FROM hero_skills hs1
        JOIN hero_skills hs2 ON hs1.replaces_skill_id = hs2.id
        WHERE hs1.hero_id = (SELECT id FROM heroes WHERE name = ?)
        AND hs1.is_transformed = 1
    ''', (hero_name,))
    
    replacements = cursor_sqlite.fetchall()
    
    if not replacements:
        print(f'⚠️  {hero_name}: немає замін')
        continue
    
    print(f'{hero_name}:')
    for transformed_skill, base_skill in replacements:
        transformed_id = railway_skill_map.get(transformed_skill)
        base_id = railway_skill_map.get(base_skill)
        
        if transformed_id and base_id:
            cursor_pg.execute(
                f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}',
                (base_id, transformed_id)
            )
            print(f'  ✓ {transformed_skill} -> {base_skill}')
            total_updates += 1
        else:
            print(f'  ❌ Не знайдено: {transformed_skill} або {base_skill}')
    
    conn_pg.commit()

release_connection(conn_pg)
conn_sqlite.close()

print(f'\n✅ Оновлено {total_updates} зв\'язків replaces_skill_id')
