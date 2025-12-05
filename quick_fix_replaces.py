#!/usr/bin/env python3
"""
Оновлює тільки навички з replaces_skill_id через API
"""
import requests
import time

# Маппінг: Hero -> [(transformed_skill, replaces_base_skill)]
TRANSFORMATIONS = {
    'Roger': [
        ('Lycan Pounce', 'Open Fire'),
        ('Bloodthirsty Howl', "Hunter's Steps"),
        ('Restore Human Form', 'Wolf Transformation'),
    ],
    'Beatrix': [
        ('Mechanical Genius', 'Mechanical Genius'),  # 3 трансформовані замінюють 1 базову
        ('Bennett\'s Rage', 'Renner\'s Apathy'),
        ('Wesker\'s Elation', 'Renner\'s Apathy'),
        ('Nibiru\'s Passion', 'Renner\'s Apathy'),
    ],
    # Додайте інших героїв за потреби
}

for hero_name, replacements in TRANSFORMATIONS.items():
    # Отримуємо героя
    resp = requests.get('https://web-production-8570.up.railway.app/api/heroes?game_id=2')
    heroes = resp.json()
    hero = [h for h in heroes if h['name'] == hero_name]
    
    if not hero:
        print(f'⚠️  {hero_name}: не знайдено')
        continue
    
    hero_id = hero[0]['id']
    
    # Отримуємо повні дані
    resp = requests.get(f'https://web-production-8570.up.railway.app/api/heroes/{hero_id}')
    hero_full = resp.json()
    
    # Створюємо мапу назв до ID
    skill_map = {s['skill_name']: s['id'] for s in hero_full['skills']}
    
    # Встановлюємо replaces_skill_id
    skills_updated = []
    for skill in hero_full['skills']:
        skill_copy = skill.copy()
        # Знаходимо чи ця навичка щось замінює
        for trans_name, base_name in replacements:
            if skill['skill_name'] == trans_name:
                base_id = skill_map.get(base_name)
                if base_id:
                    skill_copy['replaces_skill_id'] = base_id
                break
        skills_updated.append(skill_copy)
    
    # Готуємо мінімальні дані для оновлення
    update_data = {
        'game_id': hero_full['game_id'],
        'name': hero_full['name'],
        'hero_game_id': hero_full.get('hero_game_id', ''),
        'image': hero_full.get('image', ''),
        'head': hero_full.get('head', ''),
        'short_description': hero_full.get('short_description', ''),
        'full_description': hero_full.get('full_description', ''),
        'lane': hero_full.get('lane', []),
        'roles': hero_full.get('roles', []),
        'specialty': hero_full.get('specialty', []),
        'damage_type': hero_full.get('damage_type', ''),
        'use_energy': hero_full.get('use_energy', False),
        'hero_stats': hero_full.get('hero_stats', []),
        'skills': skills_updated
    }
    
    print(f'\n{hero_name}: оновлюю {len(replacements)} навичок...')
    resp = requests.put(
        f'https://web-production-8570.up.railway.app/api/heroes/{hero_id}',
        json=update_data,
        timeout=30
    )
    
    if resp.status_code == 200:
        print(f'✓ {hero_name}: успішно оновлено')
        # Перевіряємо
        resp = requests.get(f'https://web-production-8570.up.railway.app/api/heroes/{hero_id}')
        hero_check = resp.json()
        for skill in hero_check['skills']:
            if skill.get('replaces_skill_id'):
                base = [s for s in hero_check['skills'] if s['id'] == skill['replaces_skill_id']]
                if base:
                    print(f'  → {skill["skill_name"]} замінює {base[0]["skill_name"]}')
    else:
        print(f'❌ {hero_name}: помилка {resp.status_code}')
        print(f'   {resp.text[:200]}')
    
    time.sleep(1)

print('\n✅ Готово!')
