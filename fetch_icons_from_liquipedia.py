import sqlite3
import requests
from bs4 import BeautifulSoup
import time

def get_icon_url_from_page(item_name):
    """Отримує URL іконки зі сторінки предмета на Fandom Wiki"""
    # Формуємо URL сторінки
    encoded_name = item_name.replace(" ", "_")
    page_url = f"https://mobile-legends.fandom.com/wiki/{encoded_name}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(page_url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {item_name}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Шукаємо іконку в infobox
        infobox_img = soup.select_one('.pi-image-thumbnail')
        if infobox_img and infobox_img.get('src'):
            icon_url = infobox_img['src']
            # Отримуємо оригінальний розмір (без /revision/latest/scale-to-width-down/)
            if '/revision/' in icon_url:
                # Беремо базову URL до /revision/
                base_url = icon_url.split('/revision/')[0]
                icon_url = base_url
            print(f"✅ {item_name}: {icon_url}")
            return icon_url
        
        # Альтернативний пошук - перша картинка в статті
        img = soup.select_one('figure.pi-item img')
        if img and img.get('src'):
            icon_url = img['src']
            if '/revision/' in icon_url:
                base_url = icon_url.split('/revision/')[0]
                icon_url = base_url
            print(f"✅ {item_name}: {icon_url}")
            return icon_url
            
        print(f"⚠️  {item_name}: іконку не знайдено на сторінці")
        return None
        
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

updated = 0
failed = []

for item_id, name in items:
    icon_url = get_icon_url_from_page(name)
    
    if icon_url:
        cursor.execute("UPDATE equipment SET icon_url = ? WHERE id = ?", (icon_url, item_id))
        updated += 1
    else:
        failed.append(name)
    
    # Затримка, щоб не перевантажувати сервер
    time.sleep(0.5)

conn.commit()
conn.close()

print(f"\n" + "="*60)
print(f"✅ Оновлено іконок: {updated}/{len(items)}")
if failed:
    print(f"❌ Не знайдено іконки для {len(failed)} предметів:")
    for name in failed:
        print(f"  • {name}")
