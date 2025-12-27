#!/usr/bin/env python3
"""
Парсинг одного патчу Mobile Legends з Liquipedia для тестування
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def parse_patch_2_1_40():
    """Парсить патч 2.1.40"""
    url = "https://liquipedia.net/mobilelegends/Patch_2.1.40"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    print(f"📥 Завантажую {url}...")
    
    response = requests.get(url, headers=headers, timeout=15)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    content = soup.find('div', class_='mw-parser-output')
    
    data = {
        'version': '2.1.40',
        'release_date': None,
        'new_hero': None,
        'hero_adjustments': {},
        'battlefield_adjustments': {},
        'system_adjustments': []
    }
    
    # Дата релізу
    infobox = content.find('div', {'data-analytics-infobox-type': 'Patch'})
    if infobox:
        date_row = infobox.find('div', string=re.compile('Release Date'))
        if date_row:
            date_value = date_row.find_next_sibling('div')
            if date_value:
                data['release_date'] = date_value.get_text(strip=True)
    
    print(f"✅ Дата релізу: {data['release_date']}")
    
    # Шукаємо всі h2 розділи
    h2_sections = content.find_all('h2')
    
    for h2 in h2_sections:
        section_span = h2.find('span', class_='mw-headline')
        if not section_span:
            continue
        
        section_title = section_span.get_text(strip=True)
        print(f"\n📋 Розділ: {section_title}")
        
        # I. New Hero
        if 'New Hero' in section_title:
            print("  Парсимо New Hero...")
            # Шукаємо div після h2
            hero_div = h2.find_next_sibling('div')
            if hero_div:
                # Витягуємо інформацію про нового героя
                new_hero_data = {
                    'name': '',
                    'title': '',
                    'description': '',
                    'skills': []
                }
                
                # Шукаємо bold текст з ім'ям героя
                bold_text = hero_div.find('b')
                if bold_text:
                    full_name = bold_text.get_text(strip=True)
                    # Розділяємо на ім'я та титул (наприклад "Sora, Shifting Cloud")
                    if ',' in full_name:
                        parts = full_name.split(',', 1)
                        new_hero_data['name'] = parts[0].strip()
                        new_hero_data['title'] = parts[1].strip()
                    else:
                        new_hero_data['name'] = full_name
                
                # Шукаємо всі параграфи з описом
                paragraphs = hero_div.find_all('p')  # Без recursive=False
                descriptions = []
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    # Беремо тільки параграф з "Hero Feature:"
                    if 'Hero Feature:' in text:
                        descriptions.append(text)
                        break
                
                if descriptions:
                    new_hero_data['description'] = descriptions[0]
                
                # Шукаємо скіли (якщо є)
                # TODO: парсинг скілів нового героя
                
                data['new_hero'] = new_hero_data
                print(f"    ✅ New Hero: {new_hero_data['name']}")
            
        # II. Hero Adjustments
        elif 'Hero Adjustments' in section_title:
            print("  Парсимо Hero Adjustments...")
            # Шукаємо всі h3 після цього h2
            current = h2.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    hero_span = current.find('span', class_='mw-headline')
                    if hero_span:
                        hero_name = hero_span.get_text(strip=True)
                        print(f"    - {hero_name}")
                        
                        # Ініціалізуємо дані героя
                        data['hero_adjustments'][hero_name] = {
                            'summary': '',
                            'changes': []
                        }
                        
                        # Збираємо всі div після h3 до наступного h3/h2
                        hero_div = current.find_next_sibling('div')
                        if hero_div:
                            # Перший div містить іконку та ім'я
                            # Другий div може містити summary
                            # Третій div (після hr) містить зміни
                            
                            inner_divs = hero_div.find_all('div', recursive=False)
                            
                            # Шукаємо summary (якщо є текст до <hr>)
                            for idx, div in enumerate(inner_divs):
                                # Якщо в div є параграфи з текстом (не тільки заголовок)
                                paragraphs = div.find_all('p', recursive=False)
                                summary_text = []
                                for p in paragraphs:
                                    text = p.get_text(strip=True)
                                    # Пропускаємо короткі тексти та заголовки
                                    if text and len(text) > 30 and not p.find('b'):
                                        summary_text.append(text)
                                
                                if summary_text:
                                    data['hero_adjustments'][hero_name]['summary'] = ' '.join(summary_text)
                                
                                # Шукаємо зміни (параграфи з >>)
                                for p in paragraphs:
                                    text = p.get_text(strip=True)
                                    if '>>' in text or 'Attributes' in text or len(text) > 50:
                                        data['hero_adjustments'][hero_name]['changes'].append(text)
                
                current = current.find_next_sibling()
        
        # III. Battlefield Adjustments  
        elif 'Battlefield' in section_title or 'Equipment' in section_title:
            print("  Парсимо Battlefield/Equipment Adjustments...")
            # Шукаємо всі h3 та h4 після цього h2
            current = h2.find_next_sibling()
            while current and current.name != 'h2':
                if current.name in ['h3', 'h4']:
                    item_span = current.find('span', class_='mw-headline')
                    if item_span:
                        item_name = item_span.get_text(strip=True)
                        print(f"    - {item_name}")
                        
                        data['battlefield_adjustments'][item_name] = {
                            'changes': []
                        }
                        
                        # Збираємо всі параграфи після цього заголовка
                        next_elem = current.find_next_sibling()
                        while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                            if next_elem.name == 'p':
                                text = next_elem.get_text(strip=True)
                                if text:
                                    data['battlefield_adjustments'][item_name]['changes'].append(text)
                            elif next_elem.name == 'ul':
                                for li in next_elem.find_all('li', recursive=False):
                                    text = li.get_text(strip=True)
                                    if text:
                                        data['battlefield_adjustments'][item_name]['changes'].append(text)
                            next_elem = next_elem.find_next_sibling()
                
                current = current.find_next_sibling()
            
        # IV. System Adjustments
        elif 'System' in section_title:
            print("  Парсимо System Adjustments...")
            # Шукаємо всі h3 та параграфи після цього h2
            current = h2.find_next_sibling()
            while current and current.name != 'h2':
                if current.name == 'h3':
                    subsection_span = current.find('span', class_='mw-headline')
                    if subsection_span:
                        subsection_name = subsection_span.get_text(strip=True)
                        print(f"    - Підрозділ: {subsection_name}")
                
                elif current.name == 'p':
                    text = current.get_text(strip=True)
                    if text:
                        data['system_adjustments'].append(text)
                        
                elif current.name == 'ul':
                    for li in current.find_all('li', recursive=False):
                        text = li.get_text(strip=True)
                        if text:
                            data['system_adjustments'].append(text)
                
                current = current.find_next_sibling()
    
    return data


if __name__ == "__main__":
    data = parse_patch_2_1_40()
    
    # Виводимо статистику
    print("\n" + "="*60)
    print("📊 СТАТИСТИКА")
    print("="*60)
    print(f"Версія: {data['version']}")
    print(f"Дата: {data['release_date']}")
    print(f"New Hero: {'Так' if data['new_hero'] else 'Ні'}")
    print(f"Hero Adjustments: {len(data['hero_adjustments'])} героїв")
    print(f"Battlefield Adjustments: {len(data['battlefield_adjustments'])} предметів")
    print(f"System Adjustments: {len(data['system_adjustments'])} пунктів")
    
    # Показуємо перших 3 героїв
    print("\n📝 Перші герої:")
    for idx, (hero_name, hero_data) in enumerate(list(data['hero_adjustments'].items())[:3]):
        print(f"\n{idx+1}. {hero_name}")
        print(f"   Summary: {hero_data['summary'][:100] if hero_data['summary'] else 'Немає'}...")
        print(f"   Changes: {len(hero_data['changes'])} змін")
        if hero_data['changes']:
            print(f"   Перша зміна: {hero_data['changes'][0][:80]}...")
    
    # Зберігаємо в JSON
    output_file = 'patch_2.1.40_test.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Дані збережено в {output_file}")
