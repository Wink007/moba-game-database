#!/usr/bin/env python3
"""
Парсинг даних предметів з Mobile Legends Fandom Wiki
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re

def fetch_item_data(item_name):
    """Отримує дані предмета з Fandom Wiki"""
    # Форматуємо URL
    formatted_name = item_name.replace(' ', '_').replace("'", "%27")
    url = f"https://mobile-legends.fandom.com/wiki/{formatted_name}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            print(f"  ❌ {item_name}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        data = {
            'name': item_name,
            'url': url,
            'price': None,
            'type': None,
            'description': None,
            'attributes': {},
            'unique_passive': [],
            'unique_active': None,
            'recipe': [],
            'icon_url': None
        }
        
        # Шукаємо infobox
        infobox = soup.find('aside', class_='portable-infobox')
        if not infobox:
            print(f"  ⚠️  {item_name}: No infobox found")
            return None
        
        # Icon
        img = infobox.find('img', class_='pi-image-thumbnail')
        if img:
            src = img.get('src', '')
            if src:
                # Обрізаємо до .png (прибираємо /revision/latest та параметри)
                if '.png' in src:
                    data['icon_url'] = src.split('.png')[0] + '.png'
                elif '.jpg' in src:
                    data['icon_url'] = src.split('.jpg')[0] + '.jpg'
                else:
                    data['icon_url'] = src.split('?')[0]
            else:
                data['icon_url'] = None
        
        # Type/Category
        type_elem = infobox.find('div', {'data-source': 'type'})
        if type_elem:
            type_val = type_elem.find('div', class_='pi-data-value')
            if type_val:
                data['type'] = type_val.get_text(strip=True)
        
        # Bonus (атрибути)
        bonus_elem = infobox.find('div', {'data-source': 'bonus'})
        if bonus_elem:
            bonus_val = bonus_elem.find('div', class_='pi-data-value')
            if bonus_val:
                for line in bonus_val.stripped_strings:
                    # "+35 Physical Attack"
                    match = re.match(r'([+\-]?\d+%?)\s+(.+)', line)
                    if match:
                        val, stat = match.groups()
                        data['attributes'][stat] = val
        
        # Unique (пасивки/активки)
        unique_elem = infobox.find('div', {'data-source': 'unique'})
        if unique_elem:
            unique_val = unique_elem.find('div', class_='pi-data-value')
            if unique_val:
                for line in unique_val.stripped_strings:
                    if 'Unique Passive' in line:
                        data['unique_passive'].append(line)
                    elif 'Unique Active' in line:
                        data['unique_active'] = line
        
        # Recipe (компоненти)
        recipe_elem = infobox.find('div', {'data-source': 'recipe'})
        if recipe_elem:
            recipe_val = recipe_elem.find('div', class_='pi-data-value')
            if recipe_val:
                links = recipe_val.find_all('a')
                # Перший лінк - це сам предмет, пропускаємо
                # Зберігаємо всі компоненти включно з дублікатами
                for link in links[1:]:
                    component_name = link.get('title', link.get_text(strip=True))
                    if component_name and component_name != item_name:
                        data['recipe'].append(component_name)
        
        # Шукаємо ціну в таблиці
        price_found = False
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for i, row in enumerate(rows):
                headers = row.find_all('th')
                # Шукаємо рядок з заголовком "Price"
                if headers:
                    header_texts = [h.get_text(strip=True).lower() for h in headers]
                    if 'price' in header_texts:
                        # Наступний рядок містить значення
                        if i + 1 < len(rows):
                            value_row = rows[i + 1]
                            cells = value_row.find_all('td')
                            if cells:
                                price_text = cells[0].get_text(strip=True)
                                # Витягуємо число
                                match = re.search(r'(\d{3,5})', price_text)
                                if match:
                                    data['price'] = int(match.group(1))
                                    price_found = True
                                    break
            if price_found:
                break
        
        # Якщо не знайшли в таблиці, пробуємо текстовий пошук
        if not data['price']:
            text_content = soup.get_text()
            price_patterns = [
                r'(?:Price|Cost)[\s:]+(\d{3,5})',
                r'for\s+(\d{3,5})\s+gold',
                r'costs?\s+(\d{3,5})'
            ]
            for pattern in price_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    data['price'] = int(match.group(1))
                    break
        
        # Description з першого параграфа
        content = soup.find('div', class_='mw-parser-output')
        if content:
            first_p = content.find('p')
            if first_p:
                desc = first_p.get_text(strip=True)
                if len(desc) > 20:
                    data['description'] = desc[:500]
        
        print(f"  ✅ {item_name}: OK (${data['price']})")
        return data
        
    except Exception as e:
        print(f"  ❌ {item_name}: {str(e)}")
        return None

def main():
    # Список предметів з Liquipedia
    items_list = """Allow Throw
Antique Cuirass
Arcane Boots
Ares Belt
Athena's Shield
Azure Blade
Berserker's Fury
Black Ice Shield
Blade Armor
Blade of Despair
Blade of the Heptaseas
Blood Wings
Bloody Retribution
Book of Sages
Boots
Broken Heart
Brute Force Breastplate
Chastise Pauldron
Clock of Destiny
Conceal
Concentrated Energy
Corrosion Scythe
Cursed Helmet
Dagger
Demon Boots
Demon Hunter Sword
Dire Hit
Divine Glaive
Dominance Ice
Dreadnaught Armor
Elegant Gem
Enchanted Talisman
Encourage
Endless Battle
Exotic Veil
Expert Gloves
Favor
Feather of Heaven
Flame Retribution
Flask of the Oasis
Fleeting Time
Flower of Hope
Fury Hammer
Genius Wand
Glowing Wand
Golden Staff
Great Dragon Spear
Guardian Helmet
Haas's Claws
Healing Necklace
Hero's Ring
Holy Crystal
Hunter Strike
Ice Queen Wand
Ice Retribution
Immortality
Iron Hunting Bow
Javelin
Knife
Lantern of Hope
Leather Jerkin
Legion Sword
Lightning Truncheon
Magic Blade
Magic Boots
Magic Necklace
Magic Potion
Magic Resist Cloak
Magic Wand
Malefic Gun
Malefic Roar
Molten Essence
Mystery Codex
Mystic Container
Ogre Tomahawk
Oracle
Power Crystal
Power Potion
Queen's Wings
Radiant Armor
Rapid Boots
Regular Spear
Rock Potion
Rogue Meteor
Rose Gold Meteor
Sea Halberd
Silence Robe
Sky Piercer
Starlium Scythe
Steel Legplates
Swift Boots
Swift Crossbow
Throw Forbidden
Thunder Belt
Tome of Evil
Tough Boots
Vampire Mallet
Vitality Crystal
War Axe
Warrior Boots
Wind of Nature
Windtalker
Winter Crown
Wishing Lantern"""
    
    items = [item.strip() for item in items_list.strip().split('\n') if item.strip()]
    
    print(f"🔍 Починаємо парсинг {len(items)} предметів з Fandom Wiki...\n")
    
    all_data = []
    
    for i, item in enumerate(items, 1):
        print(f"[{i}/{len(items)}] {item}")
        data = fetch_item_data(item)
        if data:
            all_data.append(data)
        time.sleep(1)  # Затримка між запитами
    
    # Зберігаємо результати
    output_file = 'equipment_data_fandom.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✅ Завершено! Оброблено {len(all_data)} з {len(items)} предметів")
    print(f"📄 Дані збережено в {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
