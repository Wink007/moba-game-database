import sqlite3
import requests
from bs4 import BeautifulSoup
import json
import re
import time

def parse_stat_value(text):
    """Parse stat value from text"""
    match = re.search(r'^([0-9.,]+)\s*%?', text)
    if match:
        return float(match.group(1).replace(',', ''))
    return 0

def fetch_item_attributes(item_name):
    """Fetch all attributes from Fandom wiki"""
    url = f"https://mobile-legends.fandom.com/wiki/{item_name.replace(' ', '_')}"
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"  ❌ HTTP {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        attributes = {}
        
        # Знаходимо div з атрібутами (основні стати)
        for div in soup.find_all('div', class_='pi-data-value'):
            text = div.get_text()
            if '+' not in text:
                continue
            
            # Перевіряємо чи це блок з атрібутами
            if not any(s in text for s in ['Physical', 'Magic', 'HP', 'Attack', 'Movement', 
                                            'Defense', 'CD', 'Lifesteal', 'Spell', 'Crit', 
                                            'Penetration', 'Mana']):
                continue
            
            # Розбиваємо текст по + для обробки множинних атрібутів в одному рядку
            text = re.sub(r'\s+\+', '\n+', text)
            lines = text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line or '+' not in line:
                    continue
                
                # Парсимо кожен атрибут
                if 'Physical Penetration' in line:
                    attributes['penetration'] = parse_stat_value(line.split('+')[1])
                elif 'Magic Penetration' in line or 'Magical Penetration' in line:
                    attributes['penetration'] = parse_stat_value(line.split('+')[1])
                elif 'Physical Attack' in line:
                    attributes['physical_attack'] = parse_stat_value(line.split('+')[1])
                elif 'Magic Power' in line:
                    attributes['magic_power'] = parse_stat_value(line.split('+')[1])
                elif 'HP' in line and 'Regen' not in line:
                    attributes['hp'] = parse_stat_value(line.split('+')[1])
                elif 'Physical Defense' in line:
                    attributes['physical_defense'] = parse_stat_value(line.split('+')[1])
                elif 'Magic Defense' in line or 'Magical Defense' in line:
                    attributes['magic_defense'] = parse_stat_value(line.split('+')[1])
                elif 'Movement Speed' in line or 'Mov. Speed' in line:
                    attributes['movement_speed'] = parse_stat_value(line.split('+')[1])
                elif 'Attack Speed' in line and 'Crit' not in line:
                    attributes['attack_speed'] = parse_stat_value(line.split('+')[1])
                elif 'CD Reduction' in line or 'Cooldown Reduction' in line or 'CDR' in line:
                    attributes['cooldown_reduction'] = parse_stat_value(line.split('+')[1])
                elif 'Spell Vamp' in line:
                    attributes['spell_vamp'] = parse_stat_value(line.split('+')[1])
                elif 'Lifesteal' in line:
                    attributes['lifesteal'] = parse_stat_value(line.split('+')[1])
                elif 'Crit Chance' in line or 'Critical Chance' in line:
                    attributes['crit_chance'] = parse_stat_value(line.split('+')[1])
                elif 'Mana Regen' in line:
                    attributes['mana_regen'] = parse_stat_value(line.split('+')[1])
                elif 'HP Regen' in line:
                    attributes['hp_regen'] = parse_stat_value(line.split('+')[1])
        
        return attributes if attributes else None
        
    except Exception as e:
        print(f"  ❌ Помилка: {e}")
        return None

def main():
    conn = sqlite3.connect('test_games.db')
    cursor = conn.cursor()
    
    # Отримуємо ВСІ предмети
    cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
    items = cursor.fetchall()
    
    print(f"🔄 Оновлюю атрібути для {len(items)} предметів з Fandom Wiki...\n")
    
    updated_count = 0
    failed_items = []
    skipped_items = []
    
    for item_id, name in items:
        print(f"Обробляю: {name}")
        
        attrs = fetch_item_attributes(name)
        
        if attrs:
            # Оновлюємо JSON
            cursor.execute("""
                UPDATE equipment 
                SET attributes_json = ?
                WHERE id = ?
            """, (json.dumps(attrs), item_id))
            
            # Також оновлюємо окремі колонки для зворотної сумісності
            for key, value in attrs.items():
                try:
                    cursor.execute(f"""
                        UPDATE equipment 
                        SET {key} = ?
                        WHERE id = ?
                    """, (value, item_id))
                except sqlite3.OperationalError:
                    pass  # Поле не існує
            
            print(f"  ✅ {attrs}")
            updated_count += 1
        else:
            # Перевіряємо чи це спеціальний item без атрібутів
            if any(x in name for x in ['Retribution', 'Throw', 'Potion', 'Allow', 'Broken']):
                print(f"  ⚠️ Спеціальний предмет (без атрібутів)")
                skipped_items.append(name)
            else:
                print(f"  ❌ Не вдалося отримати дані")
                failed_items.append(name)
        
        time.sleep(0.4)  # Не перевантажуємо сервер
    
    conn.commit()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Оновлено: {updated_count}/{len(items)} предметів")
    print(f"⚠️ Пропущено (спец. предмети): {len(skipped_items)}")
    
    if failed_items:
        print(f"\n❌ Не вдалося оновити ({len(failed_items)}):")
        for item in failed_items:
            print(f"  - {item}")

if __name__ == "__main__":
    main()
