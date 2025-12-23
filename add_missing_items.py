#!/usr/bin/env python3
"""Додає відсутні предмети Hero's Ring та Molten Essence"""

import requests
import json

API_URL = "https://web-production-8570.up.railway.app"

# Дані для Hero's Ring
heroes_ring = {
    "game_id": 2,
    "name": "Hero's Ring",
    "tier": "2",
    "price_total": 450,
    "category": "Defense",
    "icon_url": "https://static.wikia.nocookie.net/mobile-legends/images/9/91/Hero%27s_Ring.png",
    "hp": 150,
    "cooldown_reduction": 5,
    "attributes_json": json.dumps({"HP": "+150", "Cooldown Reduction": "+5%"}),
    "recipe": json.dumps([])
}

# Дані для Molten Essence  
molten_essence = {
    "game_id": 2,
    "name": "Molten Essence",
    "tier": "2", 
    "price_total": 800,
    "category": "Defense",
    "icon_url": "https://static.wikia.nocookie.net/mobile-legends/images/8/8c/Molten_Essence.png",
    "hp": 540,
    "attributes_json": json.dumps({"HP": "+540"}),
    "recipe": json.dumps([{"name": "Vitality Crystal"}])
}

print("🔧 Додаю відсутні предмети в базу...\n")

for item_data in [heroes_ring, molten_essence]:
    print(f"📦 Додаю {item_data['name']}...")
    try:
        response = requests.post(f"{API_URL}/api/items", json=item_data)
        if response.status_code in [200, 201]:
            print(f"   ✅ Додано!")
        else:
            print(f"   ❌ Помилка: {response.status_code}")
            print(f"   {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Помилка: {e}")

print("\n✅ Готово! Тепер запустіть: python3 update_items_bulk.py")
