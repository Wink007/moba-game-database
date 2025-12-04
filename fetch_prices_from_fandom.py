import sqlite3
import requests
from bs4 import BeautifulSoup
import time
import re

def get_prices_from_fandom(item_name):
    """Отримує Price та Sell Price зі сторінки предмета на Fandom Wiki"""
    encoded_name = item_name.replace(" ", "_")
    page_url = f"https://mobile-legends.fandom.com/wiki/{encoded_name}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(page_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {item_name}: HTTP {response.status_code}")
            return None, None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        price_total = None
        price_sell = None
        
        # Шукаємо в infobox
        for data_item in soup.select('.pi-item'):
            label = data_item.select_one('.pi-data-label')
            value = data_item.select_one('.pi-data-value')
            
            if label and value:
                label_text = label.get_text(strip=True).lower()
                value_text = value.get_text(strip=True)
                
                # Шукаємо Price
                if 'price' in label_text and 'sell' not in label_text:
                    # Витягуємо число з тексту типу "2,360"
                    numbers = re.findall(r'[\d,]+', value_text)
                    if numbers:
                        price_total = int(numbers[0].replace(',', ''))
                
                # Шукаємо Sell Price
                if 'sell' in label_text:
                    numbers = re.findall(r'[\d,]+', value_text)
                    if numbers:
                        price_sell = int(numbers[0].replace(',', ''))
        
        if price_total is not None or price_sell is not None:
            print(f"✅ {item_name}: Price={price_total}, Sell={price_sell}")
            return price_total, price_sell
        else:
            print(f"⚠️  {item_name}: ціни не знайдено")
            return None, None
            
    except Exception as e:
        print(f"❌ {item_name}: {str(e)}")
        return None, None

# Підключаємося до бази
conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

# Отримуємо всі предмети
cursor.execute("SELECT id, name, price_total, price_sell FROM equipment WHERE game_id = 3 ORDER BY name")
items = cursor.fetchall()

print(f"🔍 Починаю обробку {len(items)} предметів...\n")

updated_count = 0
mismatches = []

for item_id, name, db_price_total, db_price_sell in items:
    wiki_price_total, wiki_price_sell = get_prices_from_fandom(name)
    
    # Порівнюємо та оновлюємо
    needs_update = False
    update_fields = {}
    
    if wiki_price_total is not None and wiki_price_total != db_price_total:
        update_fields['price_total'] = wiki_price_total
        needs_update = True
        mismatches.append(f"  {name}: Price {db_price_total} -> {wiki_price_total}")
    
    if wiki_price_sell is not None and wiki_price_sell != db_price_sell:
        update_fields['price_sell'] = wiki_price_sell
        needs_update = True
        mismatches.append(f"  {name}: Sell {db_price_sell} -> {wiki_price_sell}")
    
    if needs_update:
        if 'price_total' in update_fields and 'price_sell' in update_fields:
            cursor.execute(
                "UPDATE equipment SET price_total = ?, price_sell = ? WHERE id = ?",
                (update_fields['price_total'], update_fields['price_sell'], item_id)
            )
        elif 'price_total' in update_fields:
            cursor.execute(
                "UPDATE equipment SET price_total = ? WHERE id = ?",
                (update_fields['price_total'], item_id)
            )
        elif 'price_sell' in update_fields:
            cursor.execute(
                "UPDATE equipment SET price_sell = ? WHERE id = ?",
                (update_fields['price_sell'], item_id)
            )
        updated_count += 1
    
    # Затримка, щоб не перевантажувати сервер
    time.sleep(0.5)

conn.commit()
conn.close()

print(f"\n" + "="*60)
print(f"✅ Оновлено: {updated_count}/{len(items)} предметів")

if mismatches:
    print(f"\n📊 Розбіжності, які були виправлені:")
    for mismatch in mismatches:
        print(mismatch)
