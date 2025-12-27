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
                
                # Знаходимо Hero Feature
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if 'Hero Feature:' in text:
                        new_hero_data['description'] = text
                        break
                
                # Парсимо скіли нового героя
                current_skill = None
                current_skill_descriptions = []
                
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    bold = p.find('b')
                    
                    # Перевіряємо чи це заголовок скіла
                    if bold and any(keyword in text for keyword in ['Passive-', 'Skill 1-', 'Skill 2-', 'Ultimate-']):
                        # Зберігаємо попередній скіл якщо був
                        if current_skill:
                            current_skill['description'] = '\n\n'.join(current_skill_descriptions)
                            new_hero_data['skills'].append(current_skill)
                        
                        # Витягуємо тип та назву скіла
                        skill_type = bold.get_text(strip=True)  # "Passive", "Skill 1", etc.
                        
                        # Назва скіла - з другого a tag (перший - іконка, другий - назва)
                        skill_name = ''
                        a_tags = p.find_all('a')
                        if len(a_tags) >= 2:
                            skill_name = a_tags[1].get_text(strip=True)
                        else:
                            # Fallback - якщо немає a tags
                            skill_name = text.replace(bold.get_text(strip=True), '').replace('-', '').strip()
                        
                        current_skill = {
                            'type': skill_type,
                            'name': skill_name,
                            'description': ''
                        }
                        current_skill_descriptions = []
                    
                    elif current_skill and len(text) > 20 and 'Hero Feature' not in text and text != new_hero_data['name']:
                        # Це опис скіла
                        current_skill_descriptions.append(text)
                
                # Зберігаємо останній скіл
                if current_skill:
                    current_skill['description'] = '\n\n'.join(current_skill_descriptions)
                    new_hero_data['skills'].append(current_skill)
                
                data['new_hero'] = new_hero_data
                print(f"    ✅ New Hero: {new_hero_data['name']} з {len(new_hero_data['skills'])} скілами")
            
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
                        
                        # Ініціалізуємо дані героя з skills
                        data['hero_adjustments'][hero_name] = {
                            'summary': '',
                            'skills': []
                        }
                        
                        # Шукаємо div з змінами після h3
                        hero_div = current.find_next_sibling('div')
                        if hero_div:
                            nested_divs = hero_div.find_all('div', recursive=False)
                            
                            # DIV 1: має summary text (загальний опис змін)
                            if len(nested_divs) >= 2:
                                summary_paragraphs = nested_divs[1].find_all('p', recursive=False)
                                summary_texts = []
                                for p in summary_paragraphs:
                                    text = p.get_text(strip=True)
                                    if text:
                                        summary_texts.append(text)
                                if summary_texts:
                                    data['hero_adjustments'][hero_name]['summary'] = ' '.join(summary_texts)
                            
                            # DIV 2: має детальні зміни по скілам
                            if len(nested_divs) >= 3:
                                skills_div = nested_divs[2]
                                paragraphs = skills_div.find_all('p', recursive=False)
                                
                                current_skill = None
                                for p in paragraphs:
                                    text = p.get_text(strip=True)
                                    
                                    # Перевіряємо чи це заголовок скіла
                                    if any(keyword in text for keyword in ['Passive-', 'Skill 1-', 'Skill 2-', 'Ultimate-', 'Attributes']):
                                        # Витягуємо balance type (BUFF/NERF/ADJUST)
                                        balance = None
                                        # Шукаємо span з класом що містить balance text
                                        span = p.find('span', class_=lambda x: x and ('theme-dark-bg' in x if x else False))
                                        if span:
                                            span_text = span.get_text(strip=True)
                                            # Витягуємо перше слово (BUFF/NERF/ADJUST)
                                            for badge_text in ['BUFF', 'NERF', 'ADJUST', 'REVAMP']:
                                                if badge_text in span_text:
                                                    balance = badge_text
                                                    break
                                        
                                        # Розділяємо на type і name
                                        skill_type = None
                                        skill_name = text
                                        
                                        # Видаляємо badge text
                                        for badge_text in ['BUFF', 'NERF', 'ADJUST', 'REVAMP']:
                                            skill_name = skill_name.replace(badge_text, '')
                                        skill_name = skill_name.strip()
                                        
                                        # Витягуємо тип
                                        if 'Passive-' in skill_name:
                                            skill_type = 'Passive'
                                            skill_name = skill_name.replace('Passive-', '').strip()
                                        elif 'Skill 1-' in skill_name:
                                            skill_type = 'Skill 1'
                                            skill_name = skill_name.replace('Skill 1-', '').strip()
                                        elif 'Skill 2-' in skill_name:
                                            skill_type = 'Skill 2'
                                            skill_name = skill_name.replace('Skill 2-', '').strip()
                                        elif 'Ultimate-' in skill_name:
                                            skill_type = 'Ultimate'
                                            skill_name = skill_name.replace('Ultimate-', '').strip()
                                        elif 'Attributes' in skill_name:
                                            skill_type = 'Attributes'
                                            skill_name = 'Base Stats'
                                        
                                        current_skill = {
                                            'type': skill_type,
                                            'name': skill_name,
                                            'balance': balance,
                                            'changes': []
                                        }
                                        data['hero_adjustments'][hero_name]['skills'].append(current_skill)
                                    
                                    elif current_skill is not None:
                                        # Це зміна для поточного скіла
                                        if text and len(text) > 3:
                                            current_skill['changes'].append(text)
                
                # ТАКОЖ обробляємо героїв в DIV елементах (без H3)
                elif current.name == 'div':
                    # Перевіряємо чи є це hero div
                    bold_tags = current.find_all('b')
                    if bold_tags:
                        first_bold = bold_tags[0].get_text(strip=True)
                        
                        # Якщо перший bold - це НЕ skill keyword, то це ім'я героя
                        if first_bold and not any(keyword in first_bold for keyword in ['Skill 1', 'Skill 2', 'Passive', 'Ultimate', 'Attribute', 'Attributes']):
                            hero_name = first_bold
                            
                            # Перевіряємо чи цей герой вже був доданий (уникаємо дублікатів)
                            if hero_name not in data['hero_adjustments']:
                                print(f"    - {hero_name} (from DIV)")
                                
                                # Ініціалізуємо дані героя
                                data['hero_adjustments'][hero_name] = {
                                    'summary': '',
                                    'skills': []
                                }
                                
                                # Знаходимо всі вкладені div в батьківському div
                                parent_div = current
                                inner_divs = parent_div.find_all('div', recursive=False)
                                
                                # Перший div після row містить summary
                                for div in inner_divs:
                                    if 'padding-left: 2rem' in div.get('style', ''):
                                        paragraphs = div.find_all('p', recursive=False)
                                        summary_texts = []
                                        for p in paragraphs:
                                            # Пропускаємо параграфи з skills
                                            if not p.find('b'):
                                                text = p.get_text(strip=True)
                                                if text:
                                                    summary_texts.append(text)
                                        if summary_texts:
                                            data['hero_adjustments'][hero_name]['summary'] = ' '.join(summary_texts)
                                            break
                                
                                # Шукаємо skills в div після <hr/>
                                # Знаходимо всі <p> що містять <b>Skill
                                all_paragraphs = parent_div.find_all('p')
                                
                                current_skill = None
                                for p in all_paragraphs:
                                    bold = p.find('b')
                                    
                                    if bold:
                                        bold_text = bold.get_text(strip=True)
                                        
                                        # Перевіряємо чи це skill keyword
                                        if any(keyword in bold_text for keyword in ['Skill 1', 'Skill 2', 'Passive', 'Ultimate', 'Attribute', 'Attributes']):
                                            # Зберігаємо попередній скіл
                                            if current_skill:
                                                data['hero_adjustments'][hero_name]['skills'].append(current_skill)
                                            
                                            # Витягуємо balance
                                            balance = None
                                            balance_span = p.find('span', class_=lambda c: c and 'theme-dark-bg' in c)
                                            if balance_span:
                                                span_text = balance_span.get_text(strip=True)
                                                for badge_text in ['BUFF', 'NERF', 'ADJUST', 'REVAMP']:
                                                    if badge_text in span_text:
                                                        balance = badge_text
                                                        break
                                            
                                            # Витягуємо тип і назву скілу
                                            skill_type = bold_text
                                            skill_name = bold_text
                                            a_tags = p.find_all('a')
                                            if a_tags:
                                                # Другий a tag - назва скіла (перший - іконка)
                                                skill_name = a_tags[-1].get_text(strip=True) if len(a_tags) > 1 else a_tags[0].get_text(strip=True)
                                            
                                            current_skill = {
                                                'type': skill_type,
                                                'name': skill_name,
                                                'balance': balance,
                                                'changes': []
                                            }
                                    
                                    elif current_skill:
                                        # Це change для поточного скіла
                                        text = p.get_text(strip=True)
                                        if text and len(text) > 3:
                                            current_skill['changes'].append(text)
                                
                                # Зберігаємо останній скіл
                                if current_skill:
                                    data['hero_adjustments'][hero_name]['skills'].append(current_skill)
                
                current = current.find_next_sibling()
        
        # III. Battlefield Adjustments  
        elif 'Battlefield' in section_title or 'Equipment' in section_title:
            print("  Парсимо Battlefield/Equipment Adjustments...")
            
            # Нова структура з вкладеністю
            current = h2.find_next_sibling()
            current_section = None  # H3 секція (Equipment Adjustments, Battle Spells)
            
            while current and current.name != 'h2':
                # H3 - це батьківська секція
                if current.name == 'h3':
                    h3_span = current.find('span', class_='mw-headline')
                    if h3_span:
                        section_name = h3_span.get_text(strip=True)
                        print(f"    📁 {section_name}")
                        current_section = section_name
                        
                        data['battlefield_adjustments'][section_name] = {
                            'type': 'section',
                            'description': [],
                            'items': {},
                            'changes': []
                        }
                
                # H4 - це або підсекція (якщо є current_section), або окрема секція
                elif current.name == 'h4':
                    h4_span = current.find('span', class_='mw-headline')
                    if h4_span:
                        item_name = h4_span.get_text(strip=True)
                        
                        # Спеціальна обробка для "Battle Spells" - це нова секція, а не підсекція Equipment
                        if item_name == 'Battle Spells':
                            print(f"    📁 {item_name}")
                            current_section = item_name
                            
                            data['battlefield_adjustments'][item_name] = {
                                'type': 'section',
                                'description': [],
                                'items': {},
                                'changes': []
                            }
                        
                        # Якщо є current_section (наприклад Equipment Adjustments)
                        elif current_section and current_section in data['battlefield_adjustments']:
                            print(f"      └─ {item_name}")
                            
                            data['battlefield_adjustments'][current_section]['items'][item_name] = {
                                'description': [],
                                'sections': [],  # Attributes (BUFF), Unique Passive (REVAMP), Conceal, Dire Hit, etc.
                                'changes': []
                            }
                            
                            # Збираємо дані для цього H4
                            next_elem = current.find_next_sibling()
                            while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                                if next_elem.name == 'p':
                                    text = next_elem.get_text(strip=True)
                                    if text:
                                        data['battlefield_adjustments'][current_section]['items'][item_name]['description'].append(text)
                                elif next_elem.name == 'ul':
                                    for li in next_elem.find_all('li', recursive=False):
                                        text = li.get_text(strip=True)
                                        if text:
                                            data['battlefield_adjustments'][current_section]['items'][item_name]['changes'].append(text)
                                elif next_elem.name == 'div':
                                    # Кожен DIV може бути окремою секцією (Roaming Blessings має 4 DIV)
                                    # або DIV з кількома секціями всередині (Demon Hunter Sword має 1 DIV з 2 секціями)
                                    
                                    current_section_data = None
                                    
                                    for child in next_elem.descendants:
                                        # Знаходимо <b> теги як початок нової секції
                                        if child.name == 'b':
                                            section_name = child.get_text(strip=True)
                                            
                                            # Пропускаємо якщо це назва самого item'а
                                            if section_name != item_name:
                                                # Зберігаємо попередню секцію
                                                if current_section_data and (current_section_data.get('changes') or current_section_data.get('balance')):
                                                    data['battlefield_adjustments'][current_section]['items'][item_name]['sections'].append(current_section_data)
                                                
                                                # Починаємо нову секцію
                                                current_section_data = {
                                                    'name': section_name,
                                                    'balance': None,
                                                    'changes': []
                                                }
                                        
                                        # Знаходимо <span> з балансом після <b>
                                        elif child.name == 'span' and current_section_data and not current_section_data['balance']:
                                            balance_text = child.get_text(strip=True)
                                            if balance_text in ['BUFF', 'NERF', 'ADJUST', 'REVAMP']:
                                                current_section_data['balance'] = balance_text
                                        
                                        # Збираємо текстові зміни (пропускаємо текст всередині <b> і <span>)
                                        elif isinstance(child, str) and current_section_data:
                                            # Пропускаємо якщо текст всередині <b> або <span> тегу
                                            if child.parent and child.parent.name in ['b', 'span']:
                                                continue
                                            
                                            text = child.strip()
                                            # Пропускаємо назву секції, баланс і порожні рядки
                                            if text and text not in ['BUFF', 'NERF', 'ADJUST', 'REVAMP', current_section_data['name']]:
                                                current_section_data['changes'].append(text)
                                    
                                    # Зберігаємо останню секцію з цього DIV
                                    if current_section_data and (current_section_data.get('changes') or current_section_data.get('balance')):
                                        data['battlefield_adjustments'][current_section]['items'][item_name]['sections'].append(current_section_data)
                                
                                next_elem = next_elem.find_next_sibling()
                        
                        # Якщо немає current_section - це окрема H4 секція (Mythic Battlefield тощо)
                        else:
                            print(f"    - {item_name}")
                            
                            data['battlefield_adjustments'][item_name] = {
                                'type': 'item',
                                'description': [],
                                'changes': []
                            }
                            
                            # Збираємо дані
                            next_elem = current.find_next_sibling()
                            while next_elem and next_elem.name not in ['h2', 'h3', 'h4']:
                                if next_elem.name == 'p':
                                    text = next_elem.get_text(strip=True)
                                    if text:
                                        data['battlefield_adjustments'][item_name]['description'].append(text)
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
        print(f"   Skills: {len(hero_data['skills'])} скілів")
        if hero_data['skills']:
            first_skill = hero_data['skills'][0]
            print(f"   Перший скіл: {first_skill['name']} ({first_skill.get('balance', 'N/A')})")
            if first_skill['changes']:
                print(f"   Перша зміна: {first_skill['changes'][0][:80]}...")
    
    # Зберігаємо в JSON
    output_file = 'patch_2.1.40_test.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Дані збережено в {output_file}")
