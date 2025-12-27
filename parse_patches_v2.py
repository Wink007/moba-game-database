#!/usr/bin/env python3
"""
Новий парсер патчів Mobile Legends з Liquipedia
Парсить всі секції: New Hero, Hero Adjustments, Battlefield Adjustments, System Adjustments
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time

# Список патчів для парсингу
PATCH_VERSIONS = [
    '2.1.40', '2.1.30a', '2.1.30', '2.1.18b', '2.1.18a', '2.1.18',
    '1.9.99a', '1.9.99', '1.9.90', '1.9.64', '1.9.42', '1.9.20',
    '1.9.06', '1.8.92', '1.8.78', '1.8.66', '1.8.56', '1.8.47',
    '1.8.44', '1.8.30'
]

def fetch_patch_page(version):
    """Завантажує HTML сторінку патчу"""
    url = f"https://liquipedia.net/mobilelegends/Patch_{version}"
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            return BeautifulSoup(response.text, 'html.parser')
        else:
            print(f"  ❌ HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None


def get_release_date(soup):
    """Витягує дату релізу з infobox"""
    infobox = soup.find('div', {'data-analytics-infobox-type': 'Patch'})
    if infobox:
        date_div = infobox.find('div', string=re.compile('Release Date'))
        if date_div:
            date_value = date_div.find_next_sibling('div')
            if date_value:
                return date_value.get_text(strip=True)
    return None


def parse_new_hero(soup):
    """Парсить секцію New Hero Release"""
    new_hero_span = soup.find('span', id='New_Hero_Release')
    if not new_hero_span:
        return None
    
    # Знаходимо наступний div після заголовка
    h2 = new_hero_span.find_parent(['h2', 'h3'])
    if not h2:
        return None
    
    hero_div = h2.find_next_sibling('div')
    if not hero_div:
        return None
    
    # Витягуємо ім'я та title героя
    hero_name_elem = hero_div.find('b')
    if not hero_name_elem:
        return None
    
    hero_name = hero_name_elem.get_text(strip=True)
    
    # Title може бути в наступному елементі або в тому ж div
    hero_data = {
        'name': hero_name,
        'title': '',
        'description': '',
        'skills': []
    }
    
    # Шукаємо опис та скіли
    inner_divs = hero_div.find_all('div', recursive=False)
    
    for div in inner_divs:
        # Опис героя (Hero Feature)
        for p in div.find_all('p', recursive=False):
            text = p.get_text(strip=True)
            if 'Hero Feature:' in text:
                hero_data['description'] = text.replace('Hero Feature:', '').strip()
            elif text and len(text) > 50 and not p.find('b'):
                # Довгий текст без bold - це опис
                if not hero_data['description']:
                    hero_data['description'] = text
        
        # Парсимо скіли
        current_skill = None
        for p in div.find_all('p', recursive=False):
            # Перевіряємо чи це заголовок скіла
            b_tag = p.find('b')
            if b_tag:
                skill_type_text = b_tag.get_text(strip=True)
                if any(keyword in skill_type_text for keyword in ['Passive', 'Skill', 'Ultimate', 'Special']):
                    # Зберігаємо попередній скіл
                    if current_skill and current_skill['description']:
                        hero_data['skills'].append(current_skill)
                    
                    # Новий скіл
                    skill_name = ''
                    # Шукаємо назву скіла (зазвичай в <a> тегу)
                    for a_tag in p.find_all('a'):
                        text = a_tag.get_text(strip=True)
                        if text and text not in ['Passive', 'Skill 1', 'Skill 2', 'Skill 3', 'Ultimate']:
                            skill_name = text
                            break
                    
                    current_skill = {
                        'type': skill_type_text,
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
    
    return hero_data if hero_data['name'] else None


def parse_hero_adjustments(soup):
    """Парсить секцію Hero Adjustments"""
    hero_adjustments_span = soup.find('span', id='Hero_Adjustments')
    if not hero_adjustments_span:
        return {}
    
    h2 = hero_adjustments_span.find_parent(['h2', 'h3'])
    if not h2:
        return {}
    
    heroes = {}
    
    # Шукаємо всі h3 після Hero Adjustments до наступної h2
    current = h2.find_next_sibling()
    
    while current:
        # Якщо h2 - закінчилась секція
        if current.name == 'h2':
            break
        
        # h3 = окремий герой
        if current.name == 'h3':
            span = current.find('span', class_='mw-headline')
            if not span:
                current = current.find_next_sibling()
                continue
            
            # Наступний div містить інформацію про героя
            hero_div = current.find_next_sibling('div')
            if not hero_div:
                current = current.find_next_sibling()
                continue
            
            # Ім'я героя
            hero_name_elem = hero_div.find('b')
            if not hero_name_elem:
                current = current.find_next_sibling()
                continue
            
            hero_name = hero_name_elem.get_text(strip=True)
            
            heroes[hero_name] = {
                'summary': '',
                'skills': []
            }
            
            # Парсимо внутрішні div
            inner_divs = hero_div.find_all('div', recursive=False)
            
            # div[1] зазвичай містить summary (якщо є)
            if len(inner_divs) >= 2:
                for p in inner_divs[1].find_all('p', recursive=False):
                    text = p.get_text(strip=True)
                    if text and len(text) > 20:
                        if heroes[hero_name]['summary']:
                            heroes[hero_name]['summary'] += ' ' + text
                        else:
                            heroes[hero_name]['summary'] = text
            
            # Парсимо зміни скілів та атрибутів
            for div in inner_divs[2:]:
                # Перевіряємо чи це Attributes
                first_p = div.find('p', recursive=False)
                if first_p:
                    first_text = first_p.get_text(strip=True)
                    if first_text in ['Atributes', 'Attributes', 'Base Stats']:
                        # Збираємо зміни атрибутів
                        attr_changes = []
                        for p in div.find_all('p', recursive=False):
                            text = p.get_text(strip=True)
                            if text and text not in ['Atributes', 'Attributes', 'Base Stats']:
                                attr_changes.append(text)
                        if attr_changes:
                            if heroes[hero_name]['summary']:
                                heroes[hero_name]['summary'] += ' | Attributes: ' + ', '.join(attr_changes)
                            else:
                                heroes[hero_name]['summary'] = 'Attributes: ' + ', '.join(attr_changes)
                        continue
                
                # Парсимо скіли
                current_skill = None
                for p in div.find_all('p', recursive=False):
                    b_tag = p.find('b')
                    if b_tag and any(keyword in b_tag.get_text() for keyword in ['Passive', 'Skill', 'Ultimate']):
                        # Зберігаємо попередній скіл
                        if current_skill and current_skill['changes']:
                            heroes[hero_name]['skills'].append(current_skill)
                        
                        # Новий скіл
                        skill_type = b_tag.get_text(strip=True)
                        skill_name = ''
                        skill_balance = ''
                        
                        # Назва скіла
                        for a_tag in p.find_all('a'):
                            text = a_tag.get_text(strip=True)
                            if text and text not in ['Passive', 'Skill 1', 'Skill 2', 'Skill 3', 'Ultimate']:
                                skill_name = text
                                break
                        
                        # Balance (BUFF/NERF/ADJUST)
                        span_tag = p.find('span', class_='white-text')
                        if span_tag:
                            badge_text = span_tag.get_text(strip=True)
                            if 'NERF' in badge_text:
                                skill_balance = 'NERF'
                            elif 'BUFF' in badge_text:
                                skill_balance = 'BUFF'
                            elif 'ADJUST' in badge_text:
                                skill_balance = 'ADJUST'
                            elif 'REVAMP' in badge_text:
                                skill_balance = 'REVAMP'
                        
                        current_skill = {
                            'type': skill_type,
                            'name': skill_name,
                            'balance': skill_balance,
                            'changes': []
                        }
                    else:
                        # Це зміна для поточного скіла
                        if current_skill:
                            text = p.get_text(strip=True)
                            if text and len(text) > 10:
                                current_skill['changes'].append(text)
                
                # Не забути останній скіл
                if current_skill and current_skill['changes']:
                    heroes[hero_name]['skills'].append(current_skill)
        
        current = current.find_next_sibling()
    
    return heroes


def parse_battlefield_adjustments(soup):
    """Парсить секцію Battlefield Adjustments (Equipment)"""
    battlefield_span = soup.find('span', id='Battlefield_Adjustments')
    if not battlefield_span:
        # Спробуємо Equipment_Adjustments
        battlefield_span = soup.find('span', id='Equipment_Adjustments')
    
    if not battlefield_span:
        return {}
    
    h2 = battlefield_span.find_parent(['h2', 'h3'])
    if not h2:
        return {}
    
    items = {}
    
    # Шукаємо всі h4 (якщо є) або просто <p> теги
    current = h2.find_next_sibling()
    
    while current:
        if current.name == 'h2':
            break
        
        # h4 = окремий item
        if current.name == 'h4':
            item_span = current.find('span', class_='mw-headline')
            if item_span:
                item_name = item_span.get_text(strip=True)
                items[item_name] = {
                    'description': '',
                    'sections': []
                }
                
                # Збираємо зміни після h4
                next_elem = current.find_next_sibling()
                while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                    if next_elem.name == 'p':
                        text = next_elem.get_text(strip=True)
                        if text and len(text) > 20:
                            # Додаємо як зміну
                            if not items[item_name]['sections']:
                                items[item_name]['sections'].append({
                                    'type': 'Changes',
                                    'balance': 'ADJUST',
                                    'changes': []
                                })
                            items[item_name]['sections'][0]['changes'].append(text)
                    
                    next_elem = next_elem.find_next_sibling()
        
        # Якщо немає h4, просто <p> теги зі змінами
        elif current.name == 'p':
            text = current.get_text(strip=True)
            if '>>' in text:
                # Формат: "Item Name >> Change"
                parts = text.split('>>', 1)
                item_info = parts[0].strip()
                change_info = parts[1].strip() if len(parts) > 1 else ''
                
                # Витягуємо назву item (перше слово або фраза)
                # "[Modifier] ItemName" або просто "ItemName"
                item_name = item_info.strip()
                
                # Спрощена логіка - беремо все до першого великого слова або модифікатора
                if '[' in item_name and ']' in item_name:
                    # Є модифікатор
                    bracket_end = item_name.index(']')
                    modifier = item_name[1:bracket_end]
                    rest = item_name[bracket_end+1:].strip()
                    # Беремо перше слово
                    first_word = rest.split()[0] if rest else ''
                    # Видаляємо все що йде після CamelCase
                    clean_word = re.match(r'^([A-Z][a-z]+)', first_word)
                    if clean_word:
                        item_name = f"[{modifier}] {clean_word.group(1)}"
                else:
                    # Просто перше слово
                    first_word = item_name.split()[0] if item_name else ''
                    clean_word = re.match(r'^([A-Z][a-z]+)', first_word)
                    if clean_word:
                        item_name = clean_word.group(1)
                
                if item_name not in items:
                    items[item_name] = {
                        'description': '',
                        'sections': [{
                            'type': 'Changes',
                            'balance': 'ADJUST',
                            'changes': []
                        }]
                    }
                
                full_change = f"{item_info} >> {change_info}".strip()
                items[item_name]['sections'][0]['changes'].append(full_change)
        
        current = current.find_next_sibling()
    
    return items


def parse_system_adjustments(soup):
    """Парсить секцію System Adjustments"""
    system_span = soup.find('span', id='System_Adjustments')
    if not system_span:
        return []
    
    h2 = system_span.find_parent(['h2', 'h3'])
    if not h2:
        return []
    
    changes = []
    
    # Збираємо ul/li та p після System Adjustments
    current = h2.find_next_sibling()
    
    while current:
        if current.name == 'h2':
            break
        
        if current.name == 'ul':
            for li in current.find_all('li', recursive=False):
                text = li.get_text(strip=True)
                if text:
                    changes.append(text)
        
        elif current.name == 'p':
            text = current.get_text(strip=True)
            if text and (text.startswith('[') or len(text) > 30):
                changes.append(text)
        
        current = current.find_next_sibling()
    
    return changes


def parse_patch(version):
    """Парсить весь патч"""
    print(f"[{version}] Завантажую...", end=' ')
    
    soup = fetch_patch_page(version)
    if not soup:
        return None
    
    content = soup.find('div', class_='mw-parser-output')
    if not content:
        print("❌ Немає контенту")
        return None
    
    patch_data = {
        'release_date': get_release_date(soup),
        'highlights': [],
        'new_hero': parse_new_hero(soup),
        'hero_changes': parse_hero_adjustments(soup),
        'item_changes': parse_battlefield_adjustments(soup),
        'system_changes': parse_system_adjustments(soup)
    }
    
    # Підрахунок статистики
    hero_count = len(patch_data['hero_changes'])
    item_count = len(patch_data['item_changes'])
    
    print(f"✅ OK ({patch_data['release_date']}, {hero_count} heroes, {item_count} items)")
    return patch_data


def main():
    """Головна функція"""
    print("🔍 Парсинг патчів Mobile Legends...\n")
    
    all_patches = {}
    
    for i, version in enumerate(PATCH_VERSIONS):
        print(f"[{i+1}/{len(PATCH_VERSIONS)}] ", end='')
        
        patch_data = parse_patch(version)
        if patch_data:
            all_patches[version] = patch_data
        
        # Затримка між запитами
        if i < len(PATCH_VERSIONS) - 1:
            time.sleep(1.5)
    
    # Зберігаємо результат
    output_file = 'patches_data_v2.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_patches, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✅ Завершено! Оброблено {len(all_patches)} патчів")
    print(f"📄 Дані збережено в {output_file}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
