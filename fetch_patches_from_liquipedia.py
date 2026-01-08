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
        
        # Витягуємо всі посилання на патчі (включно з буквами a, b, c)
        soup = BeautifulSoup(response.text, 'html.parser')
        patch_links = soup.find_all('a', href=re.compile(r'/mobilelegends/Patch_\d+\.\d+\.\d+[a-z]*'))
        
        # Збираємо унікальні версії
        versions = set()
        for link in patch_links:
            match = re.search(r'Patch_(\d+\.\d+\.\d+[a-z]*)', link.get('href', ''))
            if match:
                versions.add(match.group(1))
        
        # Сортуємо від найновіших до найстаріших (враховуючи букви)
        def version_key(v):
            # Розділяємо на числа та букву (якщо є)
            match = re.match(r'(\d+)\.(\d+)\.(\d+)([a-z]?)', v)
            if match:
                major, minor, patch, letter = match.groups()
                # Букви сортуються після основної версії (a < b < c)
                return (int(major), int(minor), int(patch), letter or '')
            return (0, 0, 0, '')
        
        sorted_versions = sorted(versions, key=version_key, reverse=True)
        
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
            'new_hero': None,
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
        
        # Парсимо секцію New Hero якщо є
        new_hero_span = content.find('span', id=lambda x: x and 'New_Hero' in x)
        if new_hero_span:
            parent_h2 = new_hero_span.find_parent('h2')
            if parent_h2:
                hero_data = {
                    'name': '',
                    'title': '',
                    'description': '',
                    'skills': []
                }
                
                # Дивимось div після h2
                hero_main_div = parent_h2.find_next_sibling('div')
                if hero_main_div:
                    inner_divs = hero_main_div.find_all('div', recursive=False)
                    
                    for idx, div in enumerate(inner_divs):
                        # Перший div - має ім'я героя (може бути в nested p)
                        if idx == 0:
                            # Шукаємо bold tag рекурсивно
                            b_tag = div.find('b')
                            if b_tag:
                                full_name = b_tag.get_text(strip=True)
                                # Розділяємо "Sora, Shifting Cloud" на ім'я і title
                                if ',' in full_name:
                                    parts = full_name.split(',', 1)
                                    hero_data['name'] = parts[0].strip()
                                    hero_data['title'] = parts[1].strip()
                                else:
                                    hero_data['name'] = full_name
                        
                        # Другий div - опис (Hero Feature)
                        elif idx == 1:
                            paragraphs = div.find_all('p', recursive=False)
                            for p in paragraphs:
                                text = p.get_text(strip=True)
                                if 'Hero Feature:' in text:
                                    hero_data['description'] = text.replace('Hero Feature:', '').strip()
                        
                        # Наступні divs - скіли
                        elif idx >= 2:
                            current_skill = None
                            # Шукаємо всі параграфи рекурсивно, бо скіли можуть бути nested
                            all_paragraphs = div.find_all('p')
                            
                            for p in all_paragraphs:
                                # Перевіряємо чи це заголовок скіла (має <b> tag)
                                b_tag = p.find('b')
                                if b_tag:
                                    # Зберігаємо попередній скіл
                                    if current_skill and current_skill['description']:
                                        hero_data['skills'].append(current_skill)
                                    
                                    # Новий скіл - структура: "<b>Passive - </b>Mystic Surge Mystic Surge"
                                    # або "<b>Skill 1 - </b>Sundering Strike Sundering Strike"
                                    skill_header = b_tag.get_text(strip=True).rstrip('-').strip()
                                    
                                    # Витягуємо решту тексту після bold (назва скіла)
                                    full_text = p.get_text(strip=True)
                                    skill_name = full_text.replace(b_tag.get_text(), '').strip()
                                    
                                    # Прибираємо дефіс на початку якщо є
                                    skill_name = skill_name.lstrip('-').strip()
                                    
                                    # Назва скіла дублюється: "Mystic SurgeMystic Surge" або "SkyfallSkyfall"
                                    # Якщо довжина парна, перевіряємо чи перша половина == друга половина
                                    if len(skill_name) >= 4 and len(skill_name) % 2 == 0:
                                        mid = len(skill_name) // 2
                                        first_half = skill_name[:mid]
                                        second_half = skill_name[mid:]
                                        if first_half == second_half:
                                            skill_name = first_half
                                    
                                    current_skill = {
                                        'type': skill_header,
                                        'name': skill_name,
                                        'description': ''
                                    }
                                else:
                                    # Це опис скіла
                                    if current_skill:
                                        text = p.get_text(strip=True)
                                        if text:
                                            if current_skill['description']:
                                                current_skill['description'] += '\n\n' + text
                                            else:
                                                current_skill['description'] = text
                            
                            # Не забути останній скіл
                            if current_skill and current_skill['description']:
                                hero_data['skills'].append(current_skill)
                
                # Зберігаємо якщо є хоч якісь дані
                if hero_data['name'] or hero_data['skills']:
                    data['new_hero'] = hero_data
        
        # Знаходимо секцію Hero Adjustments і парсимо тільки героїв з неї
        hero_section_span = content.find('span', id=lambda x: x and 'Hero_Adjustments' in x)
        
        # Знаходимо межі секції Hero Adjustments
        hero_section_start = None
        hero_section_end = None
        
        if hero_section_span:
            hero_section_start = hero_section_span.find_parent(['h2', 'h3'])
            
            # Шукаємо наступну h2 секцію (III. Battlefield Adjustments)
            if hero_section_start:
                current = hero_section_start.find_next_sibling()
                while current:
                    if current.name == 'h2':
                        hero_section_end = current
                        break
                    current = current.find_next_sibling()
        
        # Якщо знайшли секцію Hero Adjustments
        if hero_section_start:
            # Знаходимо всі h3 між hero_section_start та hero_section_end
            current = hero_section_start.find_next_sibling()
            
            while current and current != hero_section_end:
                if current.name == 'h3':
                    span = current.find('span', class_='mw-headline')
                    if not span:
                        current = current.find_next_sibling()
                        continue
                    
                    # Шукаємо ім'я героя в наступному div
                    hero_div = current.find_next_sibling('div')
                    if not hero_div:
                        current = current.find_next_sibling()
                        continue
            
            hero_name_elem = hero_div.find('b')
            if not hero_name_elem:
                continue
            
            hero_name = hero_name_elem.get_text(strip=True)
            
            # Ініціалізуємо структуру для героя
            if hero_name not in data['hero_changes']:
                data['hero_changes'][hero_name] = {
                    'summary': '',
                    'skills': []
                }
            
            # Знаходимо всі дочірні div (не рекурсивно)
            inner_divs = hero_div.find_all('div', recursive=False)
            
            # Структура: div[0] - заголовок, div[1] - summary, hr, div[2+] - скіли або атрибути
            summary_parts = []
            
            if len(inner_divs) >= 2:
                # div[1] містить summary або може бути порожнім
                summary_div = inner_divs[1]
                for p in summary_div.find_all('p', recursive=False):
                    text = p.get_text(strip=True)
                    if text and len(text) > 20:
                        summary_parts.append(text)
            
            # div[2+] містять зміни скілів або атрибутів (після <hr />)
            for div_idx in range(2, len(inner_divs)):
                div = inner_divs[div_idx]
                
                # Перевіряємо чи це Attributes (Base Physical Attack, Base HP, etc)
                first_p = div.find('p', recursive=False)
                if first_p:
                    first_text = first_p.get_text(strip=True)
                    if first_text in ['Atributes', 'Attributes', 'Base Stats']:
                        # Це зміни атрибутів, додаємо до summary
                        attr_changes = []
                        for p in div.find_all('p', recursive=False):
                            text = p.get_text(strip=True)
                            if text and text not in ['Atributes', 'Attributes', 'Base Stats']:
                                # Форматуємо зміни атрибутів
                                attr_changes.append(text)
                        if attr_changes:
                            summary_parts.append('Attributes: ' + ', '.join(attr_changes))
                        continue
            
            # Зберігаємо summary якщо є
            if summary_parts:
                data['hero_changes'][hero_name]['summary'] = ' '.join(summary_parts)
            
            # Парсимо скіли (залишилась стара логіка для скілів)
            for div_idx in range(2, len(inner_divs)):
                div = inner_divs[div_idx]
                
                # Пропускаємо div з Attributes (вже оброблені вище)
                first_p = div.find('p', recursive=False)
                if first_p and first_p.get_text(strip=True) in ['Atributes', 'Attributes', 'Base Stats']:
                    continue
                
                current_skill = None
                
                for p in div.find_all('p', recursive=False):
                    # Якщо це заголовок скіла (містить Passive/Skill 1/Skill 2/Ultimate)
                    if any(skill_keyword in p.get_text() for skill_keyword in ['Passive', 'Skill 1', 'Skill 2', 'Skill 3', 'Ultimate']):
                        # Зберігаємо попередній скіл якщо є
                        if current_skill and current_skill['changes']:
                            data['hero_changes'][hero_name]['skills'].append(current_skill)
                        
                        # Парсимо назву скіла окремо по компонентам
                        # Структура: <b>Passive</b> - <a>Smart Heart</a> <span>NERF</span>
                        skill_type = ''
                        skill_name = ''
                        skill_balance = ''
                        
                        # Витягуємо тип скіла (Passive, Skill 1, etc)
                        b_tag = p.find('b')
                        if b_tag:
                            skill_type = b_tag.get_text(strip=True)
                        
                        # Витягуємо назву скіла з посилання (друге <a> має текст)
                        all_a_tags = p.find_all('a')
                        for a_tag in all_a_tags:
                            text = a_tag.get_text(strip=True)
                            if text and text not in ['Passive', 'Skill 1', 'Skill 2', 'Skill 3', 'Ultimate']:
                                skill_name = text
                                break
                        
                        # Витягуємо badge (NERF/BUFF/ADJUST)
                        span_tag = p.find('span', class_='white-text')
                        if span_tag:
                            badge_text = span_tag.get_text(strip=True)
                            # Витягуємо тільки текст без іконок
                            if 'NERF' in badge_text:
                                skill_balance = 'NERF'
                            elif 'BUFF' in badge_text:
                                skill_balance = 'BUFF'
                            elif 'ADJUST' in badge_text:
                                skill_balance = 'ADJUST'
                        
                        # Зберігаємо окремо type, name, balance
                        current_skill = {
                            'type': skill_type,
                            'name': skill_name,
                            'balance': skill_balance,
                            'changes': []
                        }
                    
                    # Інакше це зміна для поточного скіла
                    else:
                        if current_skill:
                            text = p.get_text(strip=True)
                            if text and ('>>' in text or 'New Effect' in text or 'Effect Change' in text):
                                clean_text = re.sub(r'\s+', ' ', text)
                                if clean_text:
                                    current_skill['changes'].append(clean_text)
                
                # Не забути останній скіл
                if current_skill and current_skill['changes']:
                    data['hero_changes'][hero_name]['skills'].append(current_skill)
        
        # Парсимо Equipment Adjustments (items)
        equipment_span = content.find('span', id='Equipment_Adjustments')
        if equipment_span:
            equipment_h3 = equipment_span.find_parent('h3')
            if equipment_h3:
                # Збираємо всі h4 після Equipment Adjustments до наступного h2/h3
                # АБО просто <p> теги якщо немає h4 структури
                current_sibling = equipment_h3.find_next_sibling()
                
                # Перевіряємо чи є h4 структура або просто <p> теги
                has_h4_structure = False
                temp_sibling = current_sibling
                while temp_sibling and temp_sibling.name not in ['h2', 'h3']:
                    if temp_sibling.name == 'h4':
                        has_h4_structure = True
                        break
                    temp_sibling = temp_sibling.find_next_sibling()
                
                # Якщо немає h4 структури, парсимо прості <p> теги
                if not has_h4_structure:
                    current_item = None
                    while current_sibling and current_sibling.name not in ['h2', 'h3']:
                        if current_sibling.name == 'p':
                            text = current_sibling.get_text(strip=True)
                            
                            # Якщо текст містить >> це зміна
                            if '>>' in text:
                                # Перша частина до >> це назва item/skill
                                parts = text.split('>>', 1)
                                item_info = parts[0].strip()
                                change_info = parts[1].strip() if len(parts) > 1 else ''
                                
                                # Витягуємо назву - це перше слово або фраза до двокрапки/Grant/etc
                                # Приклад: "AegisGrants a Shield..." -> "Aegis"
                                # Приклад: "[Quartermaster] AegisGrants..." -> "[Quartermaster] Aegis"
                                
                                item_name = item_info
                                
                                # Якщо є [modifier], витягуємо його та наступне слово
                                if item_name.startswith('[') and ']' in item_name:
                                    bracket_end = item_name.index(']')
                                    modifier = item_name[1:bracket_end]
                                    rest = item_name[bracket_end+1:].strip()
                                    # Беремо тільки перше слово після модифікатора
                                    first_word = rest.split()[0] if rest.split() else ''
                                    # Видаляємо все після великої букви всередині слова (Grants, Creates, etc)
                                    match = re.match(r'^([A-Z][a-z]+(?:[A-Z][a-z]+)*?)([A-Z][a-z]+.*)?', first_word)
                                    if match:
                                        first_word = match.group(1)
                                    item_name = f"[{modifier}] {first_word}"
                                else:
                                    # Без модифікатора - беремо перше слово
                                    first_word = item_name.split()[0] if item_name.split() else item_name
                                    # Видаляємо все після великої букви всередині слова
                                    match = re.match(r'^([A-Z][a-z]+(?:[A-Z][a-z]+)*?)([A-Z][a-z]+.*)?', first_word)
                                    if match:
                                        item_name = match.group(1)
                                    else:
                                        item_name = first_word
                                
                                # Створюємо або оновлюємо item
                                if item_name and item_name not in data['item_changes']:
                                    data['item_changes'][item_name] = {
                                        'description': '',
                                        'sections': [{
                                            'type': 'Base Stats',
                                            'balance': 'ADJUST',
                                            'changes': []
                                        }]
                                    }
                                
                                if item_name:
                                    # Додаємо повний текст як зміну
                                    full_change = f"{item_info} >> {change_info}".strip()
                                    if data['item_changes'][item_name]['sections']:
                                        data['item_changes'][item_name]['sections'][0]['changes'].append(full_change)
                        
                        current_sibling = current_sibling.find_next_sibling()
                
                # Якщо є h4 структура, використовуємо старий код
                else:
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
                                    data['item_changes'][item_name] = {
                                        'description': '',
                                        'sections': []
                                    }
                                
                                # Збираємо ul/p/div після цього h4
                                next_elem = current_sibling.find_next_sibling()
                                
                                # Якщо одразу наступний h4 - це категорія без змісту, пропускаємо
                                if next_elem and next_elem.name == 'h4':
                                    current_sibling = next_elem
                                    continue
                                
                                # Парсимо структуру схожу на героїв
                                while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                                    if next_elem.name == 'div':
                                        # Знаходимо всі вкладені div
                                        inner_divs = next_elem.find_all('div', recursive=False)
                                        
                                        # Якщо є вкладені divs - працюємо з ними
                                        if inner_divs:
                                            for div_idx, div in enumerate(inner_divs):
                                                # Перший або другий div може містити description (до <hr />)
                                                if div_idx <= 1:
                                                    desc_paragraphs = []
                                                    for p in div.find_all('p', recursive=False):
                                                        text = p.get_text(strip=True)
                                                        if text and len(text) > 20 and not p.find('b'):
                                                            desc_paragraphs.append(text)
                                                    if desc_paragraphs:
                                                        data['item_changes'][item_name]['description'] = ' '.join(desc_paragraphs)
                                                
                                                # Будь-який div може містити секції (шукаємо <b> теги)
                                                current_section = None
                                                section_changes = []
                                                
                                                for p in div.find_all('p', recursive=False):
                                                    # Перевіряємо чи це заголовок секції
                                                    b_tag = p.find('b')
                                                    if b_tag:
                                                        # Зберігаємо попередню секцію
                                                        if current_section and current_section['changes']:
                                                            data['item_changes'][item_name]['sections'].append(current_section)
                                                        
                                                        # Нова секція
                                                        section_type = b_tag.get_text(strip=True)
                                                        section_balance = ''
                                                        
                                                        span_tag = p.find('span', class_='white-text')
                                                        if span_tag:
                                                            badge_text = span_tag.get_text(strip=True)
                                                            if 'NERF' in badge_text:
                                                                section_balance = 'NERF'
                                                            elif 'BUFF' in badge_text:
                                                                section_balance = 'BUFF'
                                                            elif 'ADJUST' in badge_text:
                                                                section_balance = 'ADJUST'
                                                            elif 'REVAMP' in badge_text:
                                                                section_balance = 'REVAMP'
                                                        
                                                        current_section = {
                                                            'type': section_type,
                                                            'balance': section_balance,
                                                            'changes': []
                                                        }
                                                    else:
                                                        # Це зміна для поточної секції
                                                        if current_section:
                                                            text = p.get_text(strip=True)
                                                            if text and ('>>' in text or 'New Effect' in text or 'Gold' in text or 'EXP' in text or 'Removed' in text or len(text) > 30):
                                                                clean_text = re.sub(r'\s+', ' ', text)
                                                                if clean_text:
                                                                    current_section['changes'].append(clean_text)
                                                
                                                # Не забути останню секцію
                                                if current_section and current_section['changes']:
                                                    data['item_changes'][item_name]['sections'].append(current_section)
                                    
                                    next_elem = next_elem.find_next_sibling()
                                    if next_elem and next_elem.name in ['h2', 'h3', 'h4']:
                                        break
                        
                        current_sibling = current_sibling.find_next_sibling()
        
        # Парсимо System Adjustments
        system_span = content.find('span', id='System_Adjustments')
        if system_span:
            system_section = system_span.find_parent(['h2', 'h3'])
            if system_section:
                # Збираємо ul/p після System Adjustments
                for sibling in system_section.find_next_siblings():
                    if sibling.name in ['h2', 'h3']:
                        break
                    
                    if sibling.name == 'ul':
                        for li in sibling.find_all('li', recursive=False):
                            change_text = li.get_text(strip=True)
                            if change_text:
                                data['system_changes'].append(change_text)
                    elif sibling.name == 'p':
                        change_text = sibling.get_text(strip=True)
                        # Шукаємо текст з заголовками в квадратних дужках або зміни
                        if change_text and (change_text.startswith('[') or len(change_text) > 30):
                            data['system_changes'].append(change_text)
        
        # Видаляємо порожні item_changes (категорії без змісту або без sections)
        data['item_changes'] = {k: v for k, v in data['item_changes'].items() if v.get('sections') or v.get('description')}
        
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
        return {}
    
    # Беремо тільки перші limit патчів (вже відсортовані від найновіших)
    patches_to_fetch = patches[:limit]
    
    print(f"📥 Завантажую {len(patches_to_fetch)} патчів...\n")
    
    detailed_patches = {}
    
    for i, patch in enumerate(patches_to_fetch):
        # Затримка між запитами щоб уникнути 429
        if i > 0:
            time.sleep(1.5)  # 1.5 секунди між запитами
        
        print(f"[{i+1}/{len(patches_to_fetch)}] {patch['version']}...", end=' ')
        details = fetch_patch_details(patch['version'])
        if details:
            version = details.pop('version')  # Видаляємо version з даних
            detailed_patches[version] = details  # Використовуємо version як ключ
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
