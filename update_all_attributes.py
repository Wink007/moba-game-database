import sqlite3
import requests
from bs4 import BeautifulSoup
import time
import re

def parse_stat_value(text):
    """Parse stat value, handling percentages and numbers"""
    if not text:
        return 0
    text = text.strip()
    
    # Extract just the number part (remove text like "Physical Attack", "Attack Speed", etc.)
    # Pattern: extract number before % or before text
    import re
    
    # Try to find number with optional % at the start
    match = re.search(r'^([0-9.,]+)\s*%?', text)
    if match:
        return float(match.group(1).replace(',', ''))
    
    # Handle ranges like "8-15"
    if '-' in text and text.replace('-', '').replace('.', '').isdigit():
        parts = text.split('-')
        return float(parts[1])  # Take the max value
    
    return 0

def fetch_item_attributes(item_name):
    """Fetch all attributes from Fandom wiki"""
    url = f"https://mobile-legends.fandom.com/wiki/{item_name.replace(' ', '_')}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
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
            'crit_chance': 0
        }
        
        # Find the main stats div (contains all attributes in one text block)
        stats_div = None
        for div in soup.find_all('div', class_='pi-data-value'):
            text = div.get_text()
            # Check if this div contains attribute stats (has + and stat names)
            if '+' in text and any(stat in text for stat in ['Physical Attack', 'Magic Power', 'HP', 'Attack Speed']):
                stats_div = div
                break
        
        if stats_div:
            # Get the full text with line breaks
            text = stats_div.get_text()
            
            # Split by both newlines and + signs to handle all formats
            # Replace multiple + with single separator
            import re
            text = re.sub(r'\s+\+', '\n+', text)  # Convert "+ stat" to newline + stat
            lines = text.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line or '+' not in line:
                    continue
                
                # Parse each stat line
                if 'Physical Penetration' in line:
                    attributes['penetration'] = parse_stat_value(line.split('+')[1])
                elif 'Magic Penetration' in line:
                    attributes['penetration'] = parse_stat_value(line.split('+')[1])
                elif 'Physical Attack' in line:
                    attributes['physical_attack'] = parse_stat_value(line.split('+')[1])
                elif 'Magic Power' in line:
                    attributes['magic_power'] = parse_stat_value(line.split('+')[1])
                elif line.startswith('+') and 'HP' in line:
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
                elif 'Crit Chance' in line or 'Critical Chance' in line or 'Crit. Chance' in line:
                    attributes['crit_chance'] = parse_stat_value(line.split('+')[1])
        
        return attributes
        
    except Exception as e:
        print(f"  ❌ Помилка для {item_name}: {e}")
        return None

def main():
    conn = sqlite3.connect('test_games.db')
    cursor = conn.cursor()
    
    # Get all items for Mobile Legends
    cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
    items = cursor.fetchall()
    
    print(f"Оновлюю атрібути для {len(items)} предметів...\n")
    
    updated_count = 0
    failed_items = []
    
    for item_id, name in items:
        print(f"Обробляю: {name}")
        
        attrs = fetch_item_attributes(name)
        
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
                    crit_chance = ?
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
                attrs['crit_chance'],
                item_id
            ))
            
            # Show what was updated
            non_zero = {k: v for k, v in attrs.items() if v > 0}
            if non_zero:
                print(f"  ✅ {non_zero}")
            else:
                print(f"  ⚠️ Немає атрібутів")
            
            updated_count += 1
        else:
            failed_items.append(name)
            print(f"  ❌ Не вдалося отримати дані")
        
        time.sleep(0.5)  # Be nice to the server
    
    conn.commit()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Оновлено: {updated_count}/{len(items)} предметів")
    
    if failed_items:
        print(f"\n❌ Не вдалося оновити ({len(failed_items)}):")
        for item in failed_items:
            print(f"  - {item}")

if __name__ == "__main__":
    main()
