import sqlite3
import requests
from bs4 import BeautifulSoup
import time

def get_tier_from_liquipedia(item_name):
    """Отримує Tier предмета з Liquipedia"""
    encoded_name = item_name.replace(" ", "_").replace("'", "%27")
    url = f"https://liquipedia.net/mobilelegends/{encoded_name}"
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {item_name}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Шукаємо в infobox
        for row in soup.select('.infobox-cell-2'):
            label_cell = row.find_previous_sibling()
            if label_cell:
                label_text = label_cell.get_text(strip=True).lower()
                if 'tier' in label_text:
                    tier_value = row.get_text(strip=True)
                    # Витягуємо число
                    if '1' in tier_value:
                        tier = 'Tier 1'
                    elif '2' in tier_value:
                        tier = 'Tier 2'
                    elif '3' in tier_value:
                        tier = 'Tier 3'
                    else:
                        tier = tier_value
                    print(f"✅ {item_name}: {tier}")
                    return tier
        
        # Альтернативний пошук - в тексті сторінки
        page_text = soup.get_text()
        if 'Tier 3' in page_text or 'tier 3' in page_text:
            print(f"✅ {item_name}: Tier 3")
            return 'Tier 3'
        elif 'Tier 2' in page_text or 'tier 2' in page_text:
            print(f"✅ {item_name}: Tier 2")
            return 'Tier 2'
        elif 'Tier 1' in page_text or 'tier 1' in page_text:
            print(f"✅ {item_name}: Tier 1")
            return 'Tier 1'
        
        print(f"⚠️  {item_name}: Tier не знайдено")
        return None
        
    except Exception as e:
        print(f"❌ {item_name}: {str(e)}")
        return None

# Підключення до бази
conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

# Отримуємо всі предмети
cursor.execute("SELECT id, name FROM equipment WHERE game_id = 3 ORDER BY name")
items = cursor.fetchall()

print(f"🔍 Парсинг Tier для {len(items)} предметів з Liquipedia...\n")

updated = 0
tier_counts = {'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0, 'None': 0}

for item_id, name in items:
    tier = get_tier_from_liquipedia(name)
    
    if tier:
        cursor.execute("UPDATE equipment SET tier = ? WHERE id = ?", (tier, item_id))
        updated += 1
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
    else:
        tier_counts['None'] += 1
    
    time.sleep(0.5)  # Затримка між запитами

conn.commit()
conn.close()

print(f"\n{'='*60}")
print(f"✅ Оновлено Tier для {updated}/{len(items)} предметів")
print(f"\n📊 Розподіл по Tier:")
for tier, count in sorted(tier_counts.items()):
    if count > 0:
        print(f"  {tier}: {count}")
