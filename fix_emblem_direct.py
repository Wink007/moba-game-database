#!/usr/bin/env python3
import os
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = 'postgresql://postgres:GcgFDeAdCdbFDcdDgBfFADfeeBedfaDb@crossover.proxy.rlwy.net:34790/railway'

import json
from database import get_connection

EMBLEM_MAPPING = {34: 1, 35: 2, 36: 3, 37: 7, 38: 5, 39: 7, 40: 7}

conn = get_connection()
cursor = conn.cursor()

# Отримати героїв з білдами
cursor.execute("SELECT id, name, pro_builds FROM heroes WHERE pro_builds IS NOT NULL AND pro_builds::text != 'null'")
heroes = cursor.fetchall()

print(f"Героїв з білдами: {len(heroes)}")

for row in heroes:
    hero_id, name, pro_builds_raw = row[0], row[1], row[2]
    
    try:
        if isinstance(pro_builds_raw, str):
            builds = json.loads(pro_builds_raw)
        else:
            builds = pro_builds_raw
        
        if not isinstance(builds, list):
            continue
        
        updated = False
        for build in builds:
            old_id = build.get('emblem_id')
            if old_id in EMBLEM_MAPPING:
                build['emblem_id'] = EMBLEM_MAPPING[old_id]
                print(f"  {name}: {old_id} -> {EMBLEM_MAPPING[old_id]}")
                updated = True
        
        if updated:
            cursor.execute(
                "UPDATE heroes SET pro_builds = %s WHERE id = %s",
                (json.dumps(builds), hero_id)
            )
            print(f"  ✅ Оновлено")
    except Exception as e:
        print(f"  ❌ {name}: {e}")

conn.commit()
conn.close()
print("\n✅ Готово!")
