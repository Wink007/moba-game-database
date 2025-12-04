import sqlite3
import requests
from bs4 import BeautifulSoup
import time
import re

def parse_stat_value(text):
    """Parse stat value from text"""
    match = re.search(r'([0-9.,]+)\s*%?', text)
    if match:
        return float(match.group(1).replace(',', ''))
    return 0

def fetch_unique_attributes(item_name):
    """Fetch unique attributes from Fandom wiki"""
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
            'lifesteal': 0,
            'spell_vamp': 0,
            'penetration': 0
        }
        
        # Find all divs with "Unique Attribute"
        for div in soup.find_all('div', class_='pi-data-value'):
            text = div.get_text()
            
            if 'Unique Attribute' not in text:
                continue
            
            # Parse unique attributes
            if 'Lifesteal' in text:
                match = re.search(r'([0-9.]+)%?\s*Lifesteal', text)
                if match:
                    attributes['lifesteal'] = float(match.group(1))
            
            if 'Spell Vamp' in text:
                match = re.search(r'([0-9.]+)%?\s*Spell Vamp', text)
                if match:
                    attributes['spell_vamp'] = float(match.group(1))
            
            if 'Physical Penetration' in text or 'Magic Penetration' in text or 'Magical Penetration' in text:
                match = re.search(r'([0-9.]+)%?\s*(?:Physical|Magic|Magical) Penetration', text)
                if match:
                    attributes['penetration'] = float(match.group(1))
        
        # Return only if we found something
        non_zero = {k: v for k, v in attributes.items() if v > 0}
        return non_zero if non_zero else None
        
    except Exception as e:
        print(f"  ❌ Помилка: {e}")
        return None

def main():
    conn = sqlite3.connect('test_games.db')
    cursor = conn.cursor()
    
    # Get all items
    cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
    items = cursor.fetchall()
    
    print(f"Парсинг Unique Attributes для {len(items)} предметів...\n")
    
    updated_count = 0
    
    for item_id, name in items:
        print(f"Обробляю: {name}")
        
        attrs = fetch_unique_attributes(name)
        
        if attrs:
            # Update only the attributes we found
            for attr_name, value in attrs.items():
                cursor.execute(f"""
                    UPDATE equipment 
                    SET {attr_name} = ?
                    WHERE id = ?
                """, (value, item_id))
            
            print(f"  ✅ {attrs}")
            updated_count += 1
        else:
            print(f"  ⚠️ Немає Unique Attributes")
        
        time.sleep(0.3)
    
    conn.commit()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Оновлено Unique Attributes для {updated_count} предметів")

if __name__ == "__main__":
    main()
