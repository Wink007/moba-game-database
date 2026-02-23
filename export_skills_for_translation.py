#!/usr/bin/env python3
"""
Export all hero skills from production DB for translation review
"""
import psycopg2
import json

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
SELECT hs.id, h.name as hero_name, h.id as hero_id,
       hs.skill_name, hs.skill_description,
       hs.skill_name_uk, hs.skill_description_uk,
       hs.display_order
FROM hero_skills hs
JOIN heroes h ON h.id = hs.hero_id
WHERE h.game_id = 2
ORDER BY h.name, hs.display_order
""")

skills = []
for row in cur.fetchall():
    skills.append({
        'skill_id': row[0],
        'hero_name': row[1],
        'hero_id': row[2],
        'skill_name': row[3],
        'skill_description': row[4],
        'skill_name_uk': row[5],
        'skill_description_uk': row[6],
        'display_order': row[7]
    })

conn.close()

with open('skills_export.json', 'w', encoding='utf-8') as f:
    json.dump(skills, f, ensure_ascii=False, indent=2)

print(f"Exported {len(skills)} skills to skills_export.json")

# Stats
no_name_uk = [s for s in skills if not s['skill_name_uk']]
no_desc_uk = [s for s in skills if not s['skill_description_uk']]
same_name = [s for s in skills if s['skill_name_uk'] == s['skill_name']]

print(f"Missing name_uk: {len(no_name_uk)}")
print(f"Missing desc_uk: {len(no_desc_uk)}")
print(f"Name UK == Name EN: {len(same_name)}")
for s in same_name:
    print(f"  {s['hero_name']}: {s['skill_name']}")
