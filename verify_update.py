#!/usr/bin/env python3
import json
import requests

# Перевіряємо чи створились нові предмети
API_URL = "https://moba-database-production.up.railway.app/api"

print("🔍 Перевірка Hero's Ring та Molten Essence...")
response = requests.get(f"{API_URL}/items?game_id=1")
data = response.json()
items = data if isinstance(data, list) else data.get('items', [])

# Шукаємо нові предмети
hero_ring = next((item for item in items if item['name'] == "Hero's Ring"), None)
molten = next((item for item in items if item['name'] == "Molten Essence"), None)

if hero_ring:
    print(f"✅ Hero's Ring знайдено: ID={hero_ring['id']}, price={hero_ring['price_total']}")
else:
    print("❌ Hero's Ring не знайдено")

if molten:
    print(f"✅ Molten Essence знайдено: ID={molten['id']}, price={molten['price_total']}")
else:
    print("❌ Molten Essence не знайдено")

# Перевіряємо рецепти предметів що використовують ці компоненти
print("\n🔍 Перевірка рецептів предметів:")
test_items = [
    "Cursed Helmet",
    "Brute Force Breastplate", 
    "Oracle",
    "Queen's Wings",
    "War Axe",
    "Winter Crown",
    "Fleeting Time"
]

for item_name in test_items:
    item = next((i for i in items if i['name'] == item_name), None)
    if item:
        recipe_ids = json.loads(item['recipe']) if item.get('recipe') else []
        recipe_names = [next((i['name'] for i in items if i['id'] == rid), f"ID:{rid}") for rid in recipe_ids]
        
        has_hero_ring = "Hero's Ring" in recipe_names
        has_molten = "Molten Essence" in recipe_names
        
        if has_hero_ring or has_molten:
            print(f"✅ {item_name}: {', '.join(recipe_names)}")
        else:
            print(f"⚠️  {item_name}: {', '.join(recipe_names)} (немає нових компонентів)")
