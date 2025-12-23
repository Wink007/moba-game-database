#!/usr/bin/env python3
"""
Скрипт для оновлення таблиці equipment з даних зібраних з Fandom Wiki
"""
import psycopg2
import os
import json
import re

def parse_stat_value(value_str):
    """Парсить значення атрибута: '+35' -> 35, '+20%' -> 20"""
    if not value_str:
        return None
    match = re.search(r'([+\-]?\d+(?:\.\d+)?)', str(value_str))
    if match:
        return float(match.group(1))
    return None

def update_equipment_from_json(json_file='equipment_data_complete.json'):
    """Оновлює всі предмети з JSON файлу"""
    
    # Завантажуємо дані
    with open(json_file, 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    print(f"📦 Завантажено {len(items)} предметів з {json_file}")
    
    # Підключаємось до бази
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    updated = 0
    not_found = 0
    errors = []
    
    for item in items:
        try:
            name = item['name']
            
            # Витягуємо числові значення атрибутів
            attrs = item.get('attributes', {})
            physical_attack = parse_stat_value(attrs.get('Physical Attack'))
            magic_power = parse_stat_value(attrs.get('Magic Power'))
            attack_speed = parse_stat_value(attrs.get('Attack Speed'))
            hp = parse_stat_value(attrs.get('HP'))
            physical_defense = parse_stat_value(attrs.get('Physical Defense'))
            magic_defense = parse_stat_value(attrs.get('Magic Defense'))
            movement_speed = parse_stat_value(attrs.get('Movement Speed') or attrs.get('Move Speed'))
            cooldown_reduction = parse_stat_value(attrs.get('CD Reduction') or attrs.get('Cooldown Reduction'))
            lifesteal = parse_stat_value(attrs.get('Physical Lifesteal'))
            spell_vamp = parse_stat_value(attrs.get('Magic Lifesteal') or attrs.get('Spell Vamp'))
            mana_regen = parse_stat_value(attrs.get('Mana Regen'))
            crit_chance = parse_stat_value(attrs.get('Crit Chance'))
            
            # Описи пасивок та активок
            passive_text = '\n'.join(item.get('unique_passive', []))
            if item.get('unique_active'):
                passive_text += '\n' + item['unique_active']
            
            # Чистий опис (без повторень з infobox)
            description = item.get('description', '')[:500] if item.get('description') else f"{name} - {item.get('type', 'Equipment')}"
            
            # Recipe - конвертуємо список назв в JSON для збереження
            recipe_list = item.get('recipe', [])
            recipe_json = json.dumps(recipe_list, ensure_ascii=False) if recipe_list else None
            
            # Оновлюємо
            cur.execute("""
                UPDATE equipment 
                SET 
                    price_total = %s,
                    category = %s,
                    description = %s,
                    icon_url = %s,
                    physical_attack = %s,
                    magic_power = %s,
                    hp = %s,
                    physical_defense = %s,
                    magic_defense = %s,
                    movement_speed = %s,
                    attack_speed = %s,
                    cooldown_reduction = %s,
                    lifesteal = %s,
                    spell_vamp = %s,
                    mana_regen = %s,
                    crit_chance = %s,
                    attributes_json = %s,
                    passive_description = %s,
                    recipe = %s
                WHERE game_id = 2 AND name = %s
                RETURNING id
            """, (
                item.get('price'),
                item.get('type'),
                description,
                item.get('icon_url'),
                physical_attack,
                magic_power,
                hp,
                physical_defense,
                magic_defense,
                movement_speed,
                attack_speed,
                cooldown_reduction,
                lifesteal,
                spell_vamp,
                mana_regen,
                crit_chance,
                json.dumps(attrs, ensure_ascii=False),
                passive_text if passive_text else None,
                recipe_json,
                name
            ))
            
            result = cur.fetchone()
            if result:
                updated += 1
                print(f"✅ {name}")
            else:
                not_found += 1
                print(f"⚠️  {name} - не знайдено в базі")
                
        except Exception as e:
            errors.append(f"{item.get('name', 'Unknown')}: {str(e)}")
            print(f"❌ {item.get('name', 'Unknown')}: {str(e)}")
    
    # Комітимо зміни
    conn.commit()
    cur.close()
    conn.close()
    
    # Підсумки
    print("\n" + "="*70)
    print("📊 ПІДСУМКИ ОНОВЛЕННЯ:")
    print("="*70)
    print(f"✅ Оновлено: {updated}")
    print(f"⚠️  Не знайдено в базі: {not_found}")
    print(f"❌ Помилки: {len(errors)}")
    
    if errors:
        print("\n❌ Помилки:")
        for error in errors:
            print(f"  • {error}")
    
    return updated, not_found, len(errors)

if __name__ == '__main__':
    update_equipment_from_json()
