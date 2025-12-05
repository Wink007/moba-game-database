#!/usr/bin/env python3
"""
Виправлення emblem_id в pro_builds після міграції.
Старі ID (34-40) -> Нові ID (1-7)
"""
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

# Маппінг старих ID на нові (базується на назвах емблем)
EMBLEM_MAPPING = {
    34: 1,  # Common
    35: 2,  # Tank
    36: 3,  # Assassin
    37: 4,  # Mage
    38: 5,  # Fighter
    39: 6,  # Support (Marksman old)
    40: 7,  # Marksman
}

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL не встановлена!")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor(cursor_factory=RealDictCursor)

# Отримати всіх героїв з про білдами
cursor.execute("SELECT id, name, pro_builds FROM heroes WHERE pro_builds IS NOT NULL AND pro_builds != 'null'")
heroes = cursor.fetchall()

print(f"📊 Знайдено героїв з білдами: {len(heroes)}")

updated_count = 0
for hero in heroes:
    if not hero['pro_builds']:
        continue
    
    try:
        builds = json.loads(hero['pro_builds']) if isinstance(hero['pro_builds'], str) else hero['pro_builds']
        
        if not isinstance(builds, list):
            continue
        
        updated = False
        for build in builds:
            old_emblem_id = build.get('emblem_id')
            if old_emblem_id and old_emblem_id in EMBLEM_MAPPING:
                new_emblem_id = EMBLEM_MAPPING[old_emblem_id]
                print(f"  {hero['name']}: emblem_id {old_emblem_id} -> {new_emblem_id}")
                build['emblem_id'] = new_emblem_id
                updated = True
        
        if updated:
            # Оновити в базі
            builds_json = json.dumps(builds, ensure_ascii=False)
            cursor.execute(
                "UPDATE heroes SET pro_builds = %s WHERE id = %s",
                (builds_json, hero['id'])
            )
            updated_count += 1
    
    except Exception as e:
        print(f"  ❌ Помилка для {hero['name']}: {e}")

conn.commit()
conn.close()

print(f"\n✅ Оновлено героїв: {updated_count}")
