#!/usr/bin/env python3
"""
Скрипт для отримання та оновлення перекладів предметів Mobile Legends
Джерела:
1. Fandom Wiki (англійська) - основне джерело
2. Liquipedia - додаткове джерело
3. Можливість додавання власних перекладів (українська, російська)
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
import database as db
from urllib.parse import quote

# Конфігурація
FANDOM_BASE_URL = "https://mobile-legends.fandom.com/wiki/"
LIQUIPEDIA_BASE_URL = "https://liquipedia.net/mobilelegends/"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

def fetch_item_from_fandom(item_name):
    """Отримати дані предмета з Fandom Wiki"""
    try:
        # Форматуємо назву для URL
        wiki_name = item_name.replace(' ', '_')
        url = f"{FANDOM_BASE_URL}{quote(wiki_name)}"
        
        print(f"  📡 Fetching: {url}")
        
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        result = {
            'name_en': item_name,
            'description_en': None,
            'passive_name': None,
            'passive_description': None,
            'active_name': None,
            'active_description': None,
            'attributes': {}
        }
        
        # Отримуємо опис предмета
        # На Fandom описи зазвичай в div з класом "mw-parser-output"
        content = soup.find('div', {'class': 'mw-parser-output'})
        if content:
            # Шукаємо перший параграф як основний опис
            first_p = content.find('p')
            if first_p and first_p.get_text(strip=True):
                result['description_en'] = first_p.get_text(strip=True)
        
        # Шукаємо Passive/Active abilities в інфобоксі
        infobox = soup.find('aside', {'class': 'portable-infobox'})
        if infobox:
            # Шукаємо секції з пасивними/активними абілками
            sections = infobox.find_all('section')
            for section in sections:
                header = section.find('h2')
                if header:
                    header_text = header.get_text(strip=True).lower()
                    
                    if 'passive' in header_text or 'unique passive' in header_text:
                        # Знайшли пасивну абілку
                        ability_name = section.find('div', {'class': 'pi-item'})
                        if ability_name:
                            result['passive_name'] = ability_name.get_text(strip=True)
                        
                        # Шукаємо опис
                        ability_desc = section.find_all('div', {'class': 'pi-item'})
                        if len(ability_desc) > 1:
                            result['passive_description'] = ability_desc[1].get_text(strip=True)
                    
                    elif 'active' in header_text or 'unique active' in header_text:
                        # Знайшли активну абілку
                        ability_name = section.find('div', {'class': 'pi-item'})
                        if ability_name:
                            result['active_name'] = ability_name.get_text(strip=True)
                        
                        # Шукаємо опис
                        ability_desc = section.find_all('div', {'class': 'pi-item'})
                        if len(ability_desc) > 1:
                            result['active_description'] = ability_desc[1].get_text(strip=True)
        
        # Витягуємо атрибути (статистику)
        if infobox:
            data_items = infobox.find_all('div', {'class': 'pi-data'})
            for item in data_items:
                label_elem = item.find('h3', {'class': 'pi-data-label'})
                value_elem = item.find('div', {'class': 'pi-data-value'})
                
                if label_elem and value_elem:
                    label = label_elem.get_text(strip=True).lower()
                    value = value_elem.get_text(strip=True)
                    
                    # Зберігаємо основні атрибути
                    if any(stat in label for stat in ['physical attack', 'magic power', 'hp', 'mana', 
                                                        'physical defense', 'magic defense', 'attack speed',
                                                        'movement speed', 'cooldown', 'lifesteal', 'crit']):
                        result['attributes'][label] = value
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error fetching {item_name}: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Parse error for {item_name}: {e}")
        return None

def fetch_item_from_liquipedia(item_name):
    """Отримати дані предмета з Liquipedia (резервне джерело)"""
    try:
        wiki_name = item_name.replace(' ', '_')
        url = f"{LIQUIPEDIA_BASE_URL}{quote(wiki_name)}"
        
        print(f"  📡 Trying Liquipedia: {url}")
        
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        result = {
            'name_en': item_name,
            'description_en': None
        }
        
        # На Liquipedia структура інша
        content = soup.find('div', {'class': 'mw-parser-output'})
        if content:
            first_p = content.find('p')
            if first_p:
                result['description_en'] = first_p.get_text(strip=True)
        
        return result
        
    except Exception as e:
        print(f"  ⚠️ Liquipedia failed: {e}")
        return None

def update_item_translations(game_id=1, dry_run=False):
    """
    Оновити переклади для всіх предметів гри
    
    Args:
        game_id: ID гри (1 для Mobile Legends)
        dry_run: Якщо True, тільки показує що буде зроблено, не оновлює БД
    """
    print(f"\n{'='*80}")
    print(f"🌍 Оновлення перекладів предметів для гри ID={game_id}")
    print(f"{'='*80}\n")
    
    # Отримуємо всі предмети з бази даних
    conn = db.get_connection()
    cursor = conn.cursor()
    ph = db.get_placeholder()
    
    cursor.execute(f"""
        SELECT id, name, name_en, description, description_en, 
               passive_name, passive_description,
               active_name, active_description
        FROM equipment 
        WHERE game_id = {ph}
        ORDER BY tier DESC, name
    """, (game_id,))
    
    items = cursor.fetchall()
    print(f"📦 Знайдено {len(items)} предметів\n")
    
    updated = 0
    failed = 0
    skipped = 0
    
    for item in items:
        if db.DATABASE_TYPE == 'postgres':
            item_id = item[0]
            name = item[1]
            name_en = item[2]
            description = item[3]
            description_en = item[4]
        else:
            item_id = item['id']
            name = item['name']
            name_en = item['name_en']
            description = item['description']
            description_en = item['description_en']
        
        print(f"\n[{item_id}] {name}")
        
        # Якщо вже є англійський переклад, пропускаємо
        if name_en and description_en:
            print(f"  ✅ Вже є переклад")
            skipped += 1
            continue
        
        # Спробуємо отримати з Fandom
        data = fetch_item_from_fandom(name)
        
        # Якщо не вдалося, пробуємо Liquipedia
        if not data or not data.get('description_en'):
            time.sleep(1)  # Пауза між запитами
            data = fetch_item_from_liquipedia(name)
        
        if not data:
            print(f"  ❌ Не вдалося знайти переклад")
            failed += 1
            continue
        
        # Показуємо знайдені дані
        if data.get('description_en'):
            print(f"  ✅ Description: {data['description_en'][:80]}...")
        if data.get('passive_name'):
            print(f"  ✅ Passive: {data['passive_name']}")
        if data.get('active_name'):
            print(f"  ✅ Active: {data['active_name']}")
        
        # Оновлюємо базу даних
        if not dry_run:
            update_fields = []
            update_values = []
            
            if data.get('name_en'):
                update_fields.append(f"name_en = {ph}")
                update_values.append(data['name_en'])
            
            if data.get('description_en'):
                update_fields.append(f"description_en = {ph}")
                update_values.append(data['description_en'])
            
            if data.get('passive_name'):
                update_fields.append(f"passive_name = {ph}")
                update_values.append(data['passive_name'])
            
            if data.get('passive_description'):
                update_fields.append(f"passive_description = {ph}")
                update_values.append(data['passive_description'])
            
            if data.get('active_name'):
                update_fields.append(f"active_name = {ph}")
                update_values.append(data['active_name'])
            
            if data.get('active_description'):
                update_fields.append(f"active_description = {ph}")
                update_values.append(data['active_description'])
            
            if update_fields:
                update_values.append(item_id)
                query = f"""
                    UPDATE equipment 
                    SET {', '.join(update_fields)}
                    WHERE id = {ph}
                """
                cursor.execute(query, tuple(update_values))
                conn.commit()
                updated += 1
                print(f"  💾 Збережено в БД")
        else:
            print(f"  🔍 DRY RUN: дані знайдені, але не збережені")
            updated += 1
        
        # Пауза між запитами, щоб не перевантажувати сервер
        time.sleep(2)
    
    db.release_connection(conn)
    
    print(f"\n{'='*80}")
    print(f"📊 Результати:")
    print(f"  ✅ Оновлено: {updated}")
    print(f"  ⏭️  Пропущено (вже є): {skipped}")
    print(f"  ❌ Помилки: {failed}")
    print(f"  📦 Всього: {len(items)}")
    print(f"{'='*80}\n")

def export_translations_to_json(game_id=1, output_file='item_translations.json'):
    """Експортувати всі переклади в JSON файл"""
    conn = db.get_connection()
    cursor = conn.cursor()
    ph = db.get_placeholder()
    
    cursor.execute(f"""
        SELECT id, name, name_en, description, description_en,
               passive_name, passive_description,
               active_name, active_description
        FROM equipment 
        WHERE game_id = {ph}
        ORDER BY name
    """, (game_id,))
    
    items = cursor.fetchall()
    
    translations = []
    for item in items:
        if db.DATABASE_TYPE == 'postgres':
            translations.append({
                'id': item[0],
                'name': item[1],
                'name_en': item[2],
                'description': item[3],
                'description_en': item[4],
                'passive_name': item[5],
                'passive_description': item[6],
                'active_name': item[7],
                'active_description': item[8]
            })
        else:
            translations.append({
                'id': item['id'],
                'name': item['name'],
                'name_en': item['name_en'],
                'description': item['description'],
                'description_en': item['description_en'],
                'passive_name': item['passive_name'],
                'passive_description': item['passive_description'],
                'active_name': item['active_name'],
                'active_description': item['active_description']
            })
    
    db.release_connection(conn)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Експортовано {len(translations)} перекладів в {output_file}")

if __name__ == "__main__":
    import sys
    
    # Парсимо аргументи командного рядка
    dry_run = '--dry-run' in sys.argv or '-d' in sys.argv
    export_only = '--export' in sys.argv or '-e' in sys.argv
    
    if export_only:
        print("📤 Експорт перекладів...")
        export_translations_to_json()
    else:
        if dry_run:
            print("🔍 DRY RUN MODE - дані не будуть збережені в БД\n")
        
        update_item_translations(game_id=1, dry_run=dry_run)
        
        print("\n💡 Підказки:")
        print("  • Запустіть скрипт без --dry-run щоб зберегти зміни")
        print("  • Використайте --export щоб експортувати переклади в JSON")
        print("  • Ви можете вручну відредагувати JSON і імпортувати назад")
