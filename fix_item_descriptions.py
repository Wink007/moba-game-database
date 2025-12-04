import sqlite3
import requests
from bs4 import BeautifulSoup
import re
import time

def clean_text(text):
    """Очищає та форматує текст"""
    # Видаляємо зайві пробіли
    text = ' '.join(text.split())
    # Додаємо пробіли після розділових знаків
    text = re.sub(r'([.!?:])([A-Z])', r'\1 \2', text)
    return text

def parse_item_details(item_name):
    """Парсить деталі предмета з Fandom Wiki"""
    special_names = {
        "Demon Boots": "Demon_Shoes",
        "Magic Boots": "Magic_Shoes",
    }
    
    wiki_name = special_names.get(item_name, item_name.replace(" ", "_"))
    url = f"https://mobile-legends.fandom.com/wiki/{wiki_name}"
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {item_name}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Отримуємо опис (перший параграф)
        desc_p = soup.select_one('.mw-parser-output > p')
        description = None
        if desc_p:
            desc_text = desc_p.get_text(strip=True)
            # Видаляємо технічні частини
            desc_text = re.sub(r'Crit Chance & Damage.*?Recipe', '', desc_text)
            desc_text = re.sub(r'Price.*?Sell.*', '', desc_text)
            description = clean_text(desc_text)[:300] if desc_text.strip() else None
        
        # Отримуємо всі блоки статистики
        stats_blocks = soup.select('.pi-data-value.pi-font')
        
        # Перший блок - основна статистика (вже є в базі)
        # Другий блок - Unique Attribute та Passive
        attributes_text = None
        passive_full = None
        
        if len(stats_blocks) >= 2:
            second_block = stats_blocks[1].get_text(separator=' ', strip=True)
            second_block = clean_text(second_block)
            
            # Розділяємо на Attribute та Passive
            parts = second_block.split('Unique Passive')
            if len(parts) == 2:
                attributes_text = 'Unique Attribute:' + parts[0].replace('Unique Attribute:', '').strip()
                passive_full = 'Unique Passive' + parts[1]
            else:
                # Якщо немає Passive, весь текст - це Attribute
                if 'Unique Attribute' in second_block:
                    attributes_text = second_block
                elif 'Passive' in second_block:
                    passive_full = second_block
        
        print(f"✅ {item_name}")
        if description:
            print(f"   Desc: {description[:60]}...")
        if attributes_text:
            print(f"   Attr: {attributes_text[:60]}...")
        if passive_full:
            print(f"   Pass: {passive_full[:60]}...")
        
        return {
            'description': description,
            'attributes': attributes_text,
            'passive_full': passive_full
        }
        
    except Exception as e:
        print(f"❌ {item_name}: {str(e)}")
        return None

# Підключення до бази
conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

# Отримуємо всі предмети
cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
items = cursor.fetchall()

print(f"🔍 Оновлюю описи для {len(items)} предметів...\n")

updated = 0

for item_id, name in items:
    details = parse_item_details(name)
    
    if details:
        # Оновлюємо тільки description та stats_other (для attributes)
        cursor.execute("""
            UPDATE equipment 
            SET description = ?,
                stats_other = ?,
                passive_description = ?
            WHERE id = ?
        """, (
            details['description'],
            details['attributes'],
            details['passive_full'],
            item_id
        ))
        updated += 1
    
    time.sleep(0.4)

conn.commit()
conn.close()

print(f"\n{'='*60}")
print(f"✅ Оновлено описи для {updated}/{len(items)} предметів")
