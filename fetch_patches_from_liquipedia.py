#!/usr/bin/env python3
"""
Парсинг патчів Mobile Legends з Liquipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def fetch_patch_list():
    """Отримує список всіх патчів з Liquipedia"""
    # Беремо конкретну сторінку з патчами або просто генеруємо список версій
    # Liquipedia не має єдиної сторінки зі списком всіх патчів
    # Тому генеруємо список останніх патчів на основі поточної версії
    
    patches = []
    
    # Генеруємо версії від 2.1.40 до 2.1.20 (останні 20 патчів)
    for minor in range(40, 19, -1):
        patches.append({
            'version': f'2.1.{minor}',
            'name': f'Patch 2.1.{minor}',
            'url': f'https://liquipedia.net/mobilelegends/Patch_2.1.{minor}'
        })
    
    return patches


def fetch_patch_details(version):
    """Отримує детальну інформацію про патч"""
    formatted_version = version.replace('.', '.')
    url = f"https://liquipedia.net/mobilelegends/Patch_{formatted_version}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"  ❌ Patch {version}: HTTP {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        data = {
            'version': version,
            'url': url,
            'release_date': None,
            'highlights': [],
            'hero_changes': {},
            'item_changes': {},
            'system_changes': []
        }
        
        content = soup.find('div', class_='mw-parser-output')
        if not content:
            return None
        
        # Шукаємо дату релізу в infobox
        infobox = content.find('div', {'data-analytics-infobox-type': 'Patch'})
        if infobox:
            date_cell = infobox.find('div', string=re.compile('Release Date'))
            if date_cell:
                date_div = date_cell.find_next_sibling('div')
                if date_div:
                    date_text = date_div.get_text(strip=True)
                    # 2025-12-18
                    date_match = re.search(r'\d{4}-\d{2}-\d{2}', date_text)
                    if date_match:
                        data['release_date'] = date_match.group(0)
        
        # Витягуємо highlights з infobox
        highlights_section = infobox.find('ul') if infobox else None
        if highlights_section:
            for li in highlights_section.find_all('li', recursive=False):
                highlight_text = li.get_text(strip=True)
                if highlight_text:
                    data['highlights'].append(highlight_text)
        
        # Простіший підхід - знаходимо всі h3 в content і парсимо наступний div
        all_h3 = content.find_all('h3')
        
        for h3 in all_h3:
            # Пропускаємо h3 що не в секції Hero Adjustments
            h3_id = h3.get('id', '')
            span = h3.find('span', class_='mw-headline')
            if not span:
                continue
            
            # Шукаємо ім'я героя в наступному div
            hero_div = h3.find_next_sibling('div')
            if not hero_div:
                continue
            
            hero_name_elem = hero_div.find('b')
            if not hero_name_elem:
                continue
            
            hero_name = hero_name_elem.get_text(strip=True)
            
            # Ініціалізуємо структуру для героя
            if hero_name not in data['hero_changes']:
                data['hero_changes'][hero_name] = {
                    'summary': '',
                    'changes': []
                }
            
            # Збираємо summary з другого div
            content_divs = hero_div.find_next_siblings('div', limit=3)
            for div in content_divs:
                # Перший div з текстом - summary
                paragraphs = div.find_all('p', recursive=False)
                if paragraphs and not data['hero_changes'][hero_name]['summary']:
                    summary_text = paragraphs[0].get_text(strip=True)
                    if len(summary_text) > 20:
                        data['hero_changes'][hero_name]['summary'] = summary_text
                
                # Збираємо зміни (тексти з >> або конкретні цифри)
                all_p = div.find_all('p')
                for p in all_p:
                    text = p.get_text(strip=True)
                    # Шукаємо зміни статів
                    if '>>' in text or 'Cooldown' in text or 'Damage' in text or 'New Effect' in text:
                        clean_text = re.sub(r'\s+', ' ', text)
                        if clean_text not in data['hero_changes'][hero_name]['changes']:
                            data['hero_changes'][hero_name]['changes'].append(clean_text)
        
        print(f"  ✅ Patch {version}: OK ({data['release_date']}, {len(data['hero_changes'])} heroes)")
        return data
        
    except Exception as e:
        print(f"  ❌ Patch {version}: {e}")
        return None


def fetch_latest_patches(limit=10):
    """Отримує останні N патчів"""
    print("🔍 Отримую список патчів з Liquipedia...\n")
    
    patches = fetch_patch_list()
    
    if not patches:
        print("❌ Не вдалося отримати список патчів")
        return []
    
    # Сортуємо за версією (останні спочатку)
    patches_sorted = sorted(patches, key=lambda x: [int(n) for n in x['version'].split('.')], reverse=True)
    
    # Беремо останні N
    latest = patches_sorted[:limit]
    
    print(f"📋 Знайдено {len(patches)} патчів, обробляю останні {len(latest)}...\n")
    
    detailed_patches = []
    
    for patch in latest:
        print(f"[{len(detailed_patches)+1}/{len(latest)}] Patch {patch['version']}")
        details = fetch_patch_details(patch['version'])
        if details:
            detailed_patches.append(details)
    
    return detailed_patches


if __name__ == "__main__":
    patches = fetch_latest_patches(limit=20)
    
    # Зберігаємо в JSON
    output_file = 'patches_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(patches, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✅ Завершено! Оброблено {len(patches)} патчів")
    print(f"📄 Дані збережено в {output_file}")
    print(f"{'='*60}")
