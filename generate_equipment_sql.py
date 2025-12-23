#!/usr/bin/env python3
"""
Генерує SQL для імпорту/оновлення предметів з equipment_data_fandom.json
"""

import json
import re

def escape_sql(text):
    """Екранує текст для SQL"""
    if text is None:
        return 'NULL'
    return "'" + str(text).replace("'", "''").replace("\\", "\\\\") + "'"

def main():
    with open('equipment_data_fandom.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    print(f"-- Імпорт {len(items)} предметів з Fandom Wiki")
    print(f"-- Згенеровано: {__file__}\n")
    
    for item in items:
        name = item['name']
        price = item.get('price') or 0
        item_type = item.get('type', 'Unknown')
        description = item.get('description', '')
        icon_url = item.get('icon_url', '')
        
        # Attributes в JSON
        attributes_json = json.dumps(item.get('attributes', {}))
        
        # Unique Passive/Active
        unique_effects = {
            'passive': item.get('unique_passive', []),
            'active': item.get('unique_active')
        }
        unique_json = json.dumps(unique_effects, ensure_ascii=False)
        
        # SQL для вставки/оновлення
        print(f"""
-- {name}
INSERT INTO equipment (game_id, name, price, tier, type, description, icon, attributes, unique_effects)
VALUES (
    2, -- MLBB
    {escape_sql(name)},
    {price},
    NULL, -- tier to be determined
    {escape_sql(item_type)},
    {escape_sql(description[:500] if description else None)},
    {escape_sql(icon_url)},
    '{attributes_json}'::jsonb,
    '{unique_json}'::jsonb
)
ON CONFLICT (game_id, name) DO UPDATE SET
    price = EXCLUDED.price,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    attributes = EXCLUDED.attributes,
    unique_effects = EXCLUDED.unique_effects;
""")
    
    print(f"\n-- Всього: {len(items)} предметів")

if __name__ == "__main__":
    main()
