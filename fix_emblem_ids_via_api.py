#!/usr/bin/env python3
"""
Виправлення emblem_id в pro_builds через API
"""
import requests
import json

API_URL = "https://web-production-8570.up.railway.app/api"

# Маппінг старих ID на нові
EMBLEM_MAPPING = {
    34: 1,  # Common
    35: 2,  # Tank
    36: 3,  # Assassin
    37: 4,  # Mage -> Marksman (7)
    38: 5,  # Fighter
    39: 6,  # Support -> Marksman (7)
    40: 7,  # Marksman
}

# Отримати всіх героїв
print("📥 Завантажую героїв...")
response = requests.get(f"{API_URL}/heroes?game_id=2")
heroes_list = response.json()
print(f"Знайдено: {len(heroes_list)} героїв")

updated_count = 0
for hero_brief in heroes_list:
    hero_id = hero_brief['id']
    
    # Завантажити повні дані
    response = requests.get(f"{API_URL}/heroes/{hero_id}")
    hero = response.json()
    
    builds = hero.get('pro_builds', [])
    if not builds or not isinstance(builds, list):
        continue
    
    updated = False
    for build in builds:
        old_emblem_id = build.get('emblem_id')
        if old_emblem_id and old_emblem_id in EMBLEM_MAPPING:
            new_emblem_id = EMBLEM_MAPPING[old_emblem_id]
            print(f"  {hero['name']}: emblem {old_emblem_id} -> {new_emblem_id}")
            build['emblem_id'] = new_emblem_id
            updated = True
    
    if updated:
        # Оновити тільки pro_builds
        payload = {'pro_builds': builds}
        try:
            response = requests.put(f"{API_URL}/heroes/{hero_id}", json=payload)
            if response.status_code == 200:
                updated_count += 1
                print(f"  ✅ {hero['name']} оновлено")
            else:
                print(f"  ❌ Помилка {response.status_code}: {response.text[:200]}")
        except Exception as e:
            print(f"  ❌ Помилка: {e}")

print(f"\n✅ Оновлено героїв: {updated_count}")
