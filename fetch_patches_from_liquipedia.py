#!/usr/bin/env python3
"""
Парсинг патчів Mobile Legends з Liquipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
from datetime import datetime

def fetch_patch_list():
    """Отримує список всіх патчів з Liquipedia Portal:Patches"""
    print("📋 Завантажую список патчів з Portal:Patches...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get('https://liquipedia.net/mobilelegends/Portal:Patches', 
                              headers=headers, timeout=15)
        
        if response.status_code != 200:
            print(f"❌ Не вдалося завантажити список патчів: HTTP {response.status_code}")
            return []
        
        # Витягуємо всі посилання на патчі
        soup = BeautifulSoup(response.text, 'html.parser')
        patch_links = soup.find_all('a', href=re.compile(r'/mobilelegends/Patch_\d+\.\d+\.\d+'))
        
        # Збираємо унікальні версії
        versions = set()
        for link in patch_links:
            match = re.search(r'Patch_(\d+\.\d+\.\d+)', link.get('href', ''))
            if match:
                versions.add(match.group(1))
        
        # Сортуємо від найновіших до найстаріших
        sorted_versions = sorted(versions, key=lambda v: [int(x) for x in v.split('.')], reverse=True)
        
        patches = []
        for version in sorted_versions:
            patches.append({
                'version': version,
                'name': f'Patch {version}',
                'url': f'https://liquipedia.net/mobilelegends/Patch_{version}'
            })
        
        print(f"✅ Знайдено {len(patches)} патчів на Liquipedia\n")
        return patches
        
    except Exception as e:
        print(f"❌ Помилка при завантаженні списку патчів: {e}")
        return []


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
        
        # Парсимо Equipment Adjustments (items)
        equipment_span = content.find('span', id='Equipment_Adjustments')
        if equipment_span:
            equipment_h3 = equipment_span.find_parent('h3')
            if equipment_h3:
                # Збираємо всі h4 після Equipment Adjustments до наступного h2/h3
                current_sibling = equipment_h3.find_next_sibling()
                
                while current_sibling:
                    # Якщо h2 або h3 без Equipment - закінчилась секція
                    if current_sibling.name in ['h2', 'h3']:
                        if current_sibling.name == 'h3' or 'Equipment' not in current_sibling.get_text():
                            break
                    
                    # h4 - це конкретний предмет
                    if current_sibling.name == 'h4':
                        item_span = current_sibling.find('span', class_='mw-headline')
                        if item_span:
                            item_name = item_span.get_text(strip=True)
                            
                            if item_name and item_name not in data['item_changes']:
                                data['item_changes'][item_name] = []
                            
                            # Збираємо ul/p після цього h4
                            next_elem = current_sibling.find_next_sibling()
                            while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                                if next_elem.name == 'ul':
                                    for li in next_elem.find_all('li', recursive=False):
                                        change_text = li.get_text(strip=True)
                                        if change_text:
                                            data['item_changes'][item_name].append(change_text)
                                elif next_elem.name == 'p':
                                    text = next_elem.get_text(strip=True)
                                    if text and '>>' in text:  # Зміна статів
                                        data['item_changes'][item_name].append(text)
                                
                                next_elem = next_elem.find_next_sibling()
                                if next_elem and next_elem.name in ['h2', 'h3', 'h4']:
                                    break
                    
                    current_sibling = current_sibling.find_next_sibling()
        
        # Парсимо System Adjustments
        system_h2 = content.find('span', string=re.compile('System.*Adjustment', re.I))
        if system_h2:
            system_section = system_h2.find_parent('h2')
            if system_section:
                # Збираємо ul після System Adjustments
                for sibling in system_section.find_next_siblings():
                    if sibling.name == 'h2':
                        break
                    
                    if sibling.name == 'ul':
                        for li in sibling.find_all('li', recursive=False):
                            change_text = li.get_text(strip=True)
                            if change_text:
                                data['system_changes'].append(change_text)
                    elif sibling.name == 'p':
                        change_text = sibling.get_text(strip=True)
                        if change_text and len(change_text) > 20:
                            data['system_changes'].append(change_text)
        
        print(f"  ✅ Patch {version}: OK ({data['release_date']}, {len(data['hero_changes'])} heroes, {len(data['item_changes'])} items)")
        return data
        
    except Exception as e:
        print(f"  ❌ Patch {version}: {e}")
        return None


def fetch_latest_patches(limit=10):
    """Отримує останні N патчів"""
    print("🔍 Завантажую патчі з Liquipedia...\n")
    
    patches = fetch_patch_list()
    
    if not patches:
        print("❌ Не вдалося отримати список патчів")
        return []
    
    # Беремо тільки перші limit патчів (вже відсортовані від найновіших)
    patches_to_fetch = patches[:limit]
    
    print(f"📥 Завантажую {len(patches_to_fetch)} патчів...\n")
    
    detailed_patches = []
    
    for i, patch in enumerate(patches_to_fetch):
        # Затримка між запитами щоб уникнути 429
        if i > 0:
            time.sleep(1.5)  # 1.5 секунди між запитами
        
        print(f"[{i+1}/{len(patches_to_fetch)}] {patch['version']}...", end=' ')
        details = fetch_patch_details(patch['version'])
        if details:
            detailed_patches.append(details)
        else:
            print(f"⚠️  Пропускаю")
    
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
