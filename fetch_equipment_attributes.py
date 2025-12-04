import sqlite3
import requests
from bs4 import BeautifulSoup
import re
import time

def parse_stat_value(text):
    """Витягує числове значення зі статистики"""
    # Шукаємо числа з + або -, можливо з відсотком
    # Спочатку шукаємо відсоток
    percent_match = re.search(r'[+\-]?\s*(\d+(?:\.\d+)?)\s*%', text)
    if percent_match:
        return float(percent_match.group(1))
    
    # Якщо не відсоток, шукаємо звичайне число
    match = re.search(r'[+\-]?\s*(\d+(?:\.\d+)?)', text)
    if match:
        return float(match.group(1))
    return 0

def get_equipment_attributes(item_name):
    """Отримує всі атрибути предмета з Fandom Wiki"""
    # Спеціальні назви
    special_names = {
        "Demon Boots": "Demon_Shoes",
        "Magic Boots": "Magic_Shoes",
    }
    
    wiki_name = special_names.get(item_name, item_name.replace(" ", "_"))
    page_url = f"https://mobile-legends.fandom.com/wiki/{wiki_name}"
    
    attributes = {
        'physical_attack': 0,
        'magic_power': 0,
        'hp': 0,
        'physical_defense': 0,
        'magic_defense': 0,
        'movement_speed': 0,
        'attack_speed': 0,
        'cooldown_reduction': 0,
        'lifesteal': 0,
        'spell_vamp': 0,
        'penetration': 0,
        'passive_name': None,
        'passive_description': None,
        'description': None,
        'tier': None,
    }
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
        response = requests.get(page_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {item_name}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Парсимо всі pi-data-value елементи (статистика там)
        for value_div in soup.select('.pi-data-value.pi-font'):
            value_text = value_div.get_text(separator=' ', strip=True)
            
            # Парсимо статистику з тексту - ВАЖЛИВО: порядок має значення!
            # Спочатку шукаємо фрази які містять конкретні слова
            
            # Physical Penetration - НЕ плутати з Physical Attack!
            if 'Physical Penetration' in value_text:
                attributes['penetration'] = parse_stat_value(value_text)
            # Magic Penetration
            elif 'Magic Penetration' in value_text:
                attributes['penetration'] = parse_stat_value(value_text)
            # Physical Attack
            elif 'Physical Attack' in value_text:
                attributes['physical_attack'] = parse_stat_value(value_text)
            # Magic Power
            elif 'Magic Power' in value_text or 'Magical Power' in value_text:
                attributes['magic_power'] = parse_stat_value(value_text)
            # HP
            elif '+' in value_text and 'HP' in value_text:
                attributes['hp'] = parse_stat_value(value_text)
            # Physical Defense
            elif 'Physical Defense' in value_text:
                attributes['physical_defense'] = parse_stat_value(value_text)
            # Magic Defense / Resistance
            elif 'Magic Defense' in value_text or 'Magic Resistance' in value_text:
                attributes['magic_defense'] = parse_stat_value(value_text)
            # Attack Speed
            elif 'Attack Speed' in value_text:
                attributes['attack_speed'] = parse_stat_value(value_text)
            # Cooldown Reduction
            elif 'Cooldown Reduction' in value_text:
                attributes['cooldown_reduction'] = parse_stat_value(value_text)
            # Lifesteal
            elif 'Lifesteal' in value_text or 'Physical Lifesteal' in value_text:
                attributes['lifesteal'] = parse_stat_value(value_text)
            # Spell Vamp
            elif 'Spell Vamp' in value_text or 'Magic Lifesteal' in value_text:
                attributes['spell_vamp'] = parse_stat_value(value_text)
            # Movement Speed - НЕ плутати з Movement Speed в пасивах!
            elif 'Movement Speed' in value_text and 'Passive' not in value_text:
                attributes['movement_speed'] = parse_stat_value(value_text)
            
            # Пасивна здібність
            if 'Passive' in value_text and attributes['passive_description'] is None:
                # Витягуємо назву та опис пасиву
                passive_match = re.search(r'Passive\s*-?\s*([^:]+):\s*(.+)', value_text)
                if passive_match:
                    attributes['passive_name'] = passive_match.group(1).strip()
                    attributes['passive_description'] = passive_match.group(2).strip()[:500]
                else:
                    attributes['passive_description'] = value_text[:500]
        
        # Парсимо Tier з infobox
        for data_item in soup.select('.pi-item'):
            label = data_item.select_one('.pi-data-label')
            value = data_item.select_one('.pi-data-value')
            
            if label and value:
                label_text = label.get_text(strip=True).lower()
                if 'tier' in label_text:
                    attributes['tier'] = value.get_text(strip=True)
        
        # Шукаємо опис предмета
        desc_div = soup.select_one('.mw-parser-output > p')
        if desc_div:
            attributes['description'] = desc_div.get_text(strip=True)[:500]  # Обмежуємо 500 символами
        
        print(f"✅ {item_name}: PA={attributes['physical_attack']}, MP={attributes['magic_power']}, HP={attributes['hp']}")
        return attributes
        
    except Exception as e:
        print(f"❌ {item_name}: {str(e)}")
        return None

# Підключаємося до бази
conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

# Отримуємо всі предмети
cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
items = cursor.fetchall()

print(f"🔍 Починаю обробку {len(items)} предметів...\n")

updated_count = 0

for item_id, name in items:
    attrs = get_equipment_attributes(name)
    
    if attrs:
        cursor.execute("""
            UPDATE equipment SET
                physical_attack = ?,
                magic_power = ?,
                hp = ?,
                physical_defense = ?,
                magic_defense = ?,
                movement_speed = ?,
                attack_speed = ?,
                cooldown_reduction = ?,
                lifesteal = ?,
                spell_vamp = ?,
                penetration = ?,
                passive_name = ?,
                passive_description = ?,
                description = ?,
                tier = ?
            WHERE id = ?
        """, (
            attrs['physical_attack'],
            attrs['magic_power'],
            attrs['hp'],
            attrs['physical_defense'],
            attrs['magic_defense'],
            attrs['movement_speed'],
            attrs['attack_speed'],
            attrs['cooldown_reduction'],
            attrs['lifesteal'],
            attrs['spell_vamp'],
            attrs['penetration'],
            attrs['passive_name'],
            attrs['passive_description'],
            attrs['description'],
            attrs['tier'],
            item_id
        ))
        updated_count += 1
    
    # Затримка
    time.sleep(0.4)

conn.commit()
conn.close()

print(f"\n{'='*60}")
print(f"✅ Оновлено атрибутів для {updated_count}/{len(items)} предметів")
