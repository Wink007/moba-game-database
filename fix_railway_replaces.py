#!/usr/bin/env python3
"""
Оновлює replaces_skill_id безпосередньо в Railway PostgreSQL базі
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

# Railway PostgreSQL connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:LNKqmpBUWlnFCaOdzCMZmMLgAGskBjNW@postgres.railway.internal:5432/railway')

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Отримуємо всіх героїв з Railway
resp = requests.get('https://web-production-8570.up.railway.app/api/heroes?game_id=2')
heroes = resp.json()

transformed_heroes_mapping = {
    'Beatrix': [
        ('Mechanical Genius', 'Mechanical Genius'),  # трансформовані версії замінюють базову
        ('Bennett\'s Rage', 'Renner\'s Apathy'),
        ('Wesker\'s Elation', 'Renner\'s Apathy'),
        ('Nibiru\'s Passion', 'Renner\'s Apathy'),
    ],
    'Edith': [
        ('Divine Retribution', 'Earth Shatter'),
        ('Lightning Bolt', 'Onward'),
    ],
    'Hanzo': [
        ('Forbidden Ninjutsu: Soul Snatch', 'Ninjutsu: Demon Feast'),
        ('Forbidden Ninjutsu: Black Mist', 'Ninjutsu: Dark Mist'),
        ('Ninjutsu Flee: Return', 'Kinjutsu: Pinnacle Ninja'),
    ],
    'Julian': [
        ('Enhanced Scythe', 'Scythe'),
        ('Enhanced Sword', 'Sword'),
        ('Enhanced Chain', 'Chain'),
    ],
    'Lapu-Lapu': [
        ('Storm Sword', 'Justice Blades'),
        ('Raging Slash', 'Jungle Warrior'),
        ('Land Shaker', 'Bravest Fighter'),
    ],
    'Leomord': [
        ('Phantom Stomp', 'Momentum'),
        ('Phantom Charge', 'Decimation Assault'),
    ],
    'Lukas': [
        ('Flash Combo', 'Flash Combo'),
        ('Flash Step', 'Flash Step'),
        ('Shockwave Blast', 'Unleash the Beast'),
    ],
    'Lunox': [
        ('Power of Order: Brilliance', 'Order & Chaos'),
        ('Power of Chaos: Darkening', 'Order & Chaos'),
    ],
    'Popol and Kupa': [
        ('Bite \'em, Kupa!', 'Bite \'em, Kupa!'),
        ('Kupa, Help!', 'Kupa, Help!'),
    ],
    'Roger': [
        ('Lycan Pounce', 'Open Fire'),
        ('Bloodthirsty Howl', 'Hunter\'s Steps'),
        ('Restore Human Form', 'Wolf Transformation'),
    ],
    'Selena': [
        ('Soul Eater', 'Abyssal Trap'),
        ('Garotte', 'Abyssal Arrow'),
        ('Blessing of the Moon Goddess', 'Primal Darkness'),
    ],
    'Yin': [
        ('Frenzy Strike', 'Charged Punch'),
        ('Instant Blast', 'Instant Blast'),
    ]
}

total_updates = 0

for hero_name, replacements in transformed_heroes_mapping.items():
    hero = [h for h in heroes if h['name'] == hero_name]
    if not hero:
        print(f'⚠️  {hero_name}: не знайдено')
        continue
    
    hero_id = hero[0]['id']
    
    # Отримуємо детальну інформацію
    resp = requests.get(f'https://web-production-8570.up.railway.app/api/heroes/{hero_id}')
    hero_data = resp.json()
    
    skill_ids = {s['skill_name']: s['id'] for s in hero_data['skills']}
    
    print(f'\n{hero_name}:')
    for transformed_skill, base_skill in replacements:
        transformed_id = skill_ids.get(transformed_skill)
        base_id = skill_ids.get(base_skill)
        
        if transformed_id and base_id:
            cursor.execute(
                'UPDATE hero_skills SET replaces_skill_id = %s WHERE id = %s',
                (base_id, transformed_id)
            )
            print(f'  ✓ {transformed_skill} -> {base_skill}')
            total_updates += 1
        else:
            print(f'  ❌ Не знайдено: {transformed_skill} або {base_skill}')

conn.commit()
cursor.close()
conn.close()

print(f'\n✅ Оновлено {total_updates} зв\'язків replaces_skill_id на Railway')
