#!/usr/bin/env python3
import sqlite3
import requests
import json
import time

conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

transformed_heroes = ['Beatrix', 'Edith', 'Hanzo', 'Julian', 'Lapu-Lapu', 'Leomord', 'Lukas', 'Lunox', 'Popol and Kupa', 'Roger', 'Selena', 'Yin']

print('Оновлюю героїв з трансформованими навичками...\n')

# Отримуємо всіх героїв один раз
resp = requests.get('https://web-production-8570.up.railway.app/api/heroes?game_id=2', timeout=10)
railway_heroes = resp.json()

for hero_name in transformed_heroes:
    railway_hero = [h for h in railway_heroes if h['name'] == hero_name]
    if not railway_hero:
        print(f'⚠️  {hero_name}: не знайдено на Railway')
        continue
    railway_id = railway_hero[0]['id']
    
    # SQLite дані
    cursor.execute('SELECT * FROM heroes WHERE name = ?', (hero_name,))
    columns = [desc[0] for desc in cursor.description]
    hero_row = cursor.fetchone()
    if not hero_row:
        print(f'⚠️  {hero_name}: не знайдено в SQLite')
        continue
    hero_data = dict(zip(columns, hero_row))
    
    # Статистики
    cursor.execute('SELECT stat_name, value FROM hero_stats WHERE hero_id = ?', (hero_data['id'],))
    stats = [{'stat_name': row[0], 'value': row[1]} for row in cursor.fetchall()]
    
    # Навички з УСІМА полями включаючи replaces_skill_id
    cursor.execute('''
        SELECT skill_name, skill_description, effect, preview, skill_type,
               skill_parameters, level_scaling, is_transformed, passive_description,
               active_description, effect_types, transformation_order, display_order,
               replaces_skill_id, triggered_by_skill_id
        FROM hero_skills WHERE hero_id = ?
        ORDER BY id
    ''', (hero_data['id'],))
    
    # Збираємо навички БЕЗ replaces_skill_id (бо ID не співпадають між SQLite та Railway)
    skills_without_replaces = []
    for row in cursor.fetchall():
        skill = {
            'skill_name': row[0],
            'skill_description': row[1] or '',
            'effect': row[2] or '',
            'preview': row[3] or '',
            'skill_type': row[4] or 'active',
            'skill_parameters': json.loads(row[5]) if row[5] else {},
            'level_scaling': json.loads(row[6]) if row[6] else [],
            'is_transformed': row[7] or 0,
            'passive_description': row[8] or '',
            'active_description': row[9] or '',
            'effect_types': json.loads(row[10]) if row[10] else [],
            'transformation_order': row[11] or 0,
            'display_order': row[12] or 0,
            # НЕ додаємо replaces_skill_id тут, додамо після створення навичок
        }
        skills_without_replaces.append(skill)
    
    # ПОВНІ дані
    update_data = {
        'game_id': hero_data['game_id'],
        'name': hero_data['name'],
        'hero_game_id': str(hero_data['hero_game_id']),
        'image': hero_data.get('image', ''),
        'head': hero_data.get('head', ''),
        'short_description': hero_data.get('short_description', ''),
        'full_description': hero_data.get('full_description', ''),
        'lane': json.loads(hero_data['lane']) if hero_data.get('lane') else [],
        'roles': json.loads(hero_data['roles']) if hero_data.get('roles') else [],
        'specialty': json.loads(hero_data['specialty']) if hero_data.get('specialty') else [],
        'damage_type': hero_data.get('damage_type', ''),
        'use_energy': bool(hero_data.get('use_energy', 0)),
        'relation': json.loads(hero_data['relation']) if hero_data.get('relation') else None,
        'main_hero_ban_rate': hero_data.get('main_hero_ban_rate'),
        'main_hero_appearance_rate': hero_data.get('main_hero_appearance_rate'),
        'main_hero_win_rate': hero_data.get('main_hero_win_rate'),
        'counter_data': json.loads(hero_data['counter_data']) if hero_data.get('counter_data') else None,
        'compatibility_data': json.loads(hero_data['compatibility_data']) if hero_data.get('compatibility_data') else None,
        'createdAt': hero_data.get('createdAt'),
        'hero_stats': stats,
        'skills': skills_without_replaces
    }
    
    resp = requests.put(
        f'https://web-production-8570.up.railway.app/api/heroes/{railway_id}',
        json=update_data,
        timeout=20
    )
    
    if resp.status_code == 200:
        transformed_count = sum(1 for s in skills_without_replaces if s['is_transformed'] == 1)
        print(f'✓ {hero_name}: {len(skills_without_replaces)} skills ({transformed_count} transformed)')
    else:
        print(f'❌ {hero_name}: error {resp.status_code}')
        print(f'   {resp.text[:200]}')
    
    time.sleep(0.5)

conn.close()
print('\n✅ Оновлення завершено!')
