import requests
from bs4 import BeautifulSoup

url = 'https://liquipedia.net/mobilelegends/Patch_2.1.40'
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')

content = soup.find('div', class_='mw-parser-output')

# Знаходимо секцію New Hero (може мати префікс як I., II., etc)
new_hero_span = content.find('span', id=lambda x: x and 'New_Hero' in x)
if new_hero_span:
    print('=== Знайдено New Hero ===')
    parent_h2 = new_hero_span.find_parent('h2')
    
    # Дивимось всі елементи після h2 до наступного h2
    current = parent_h2.find_next_sibling()
    while current and current.name != 'h2':
        print(f'\n--- Element: {current.name} ---')
        
        if current.name == 'h3':
            print(f'H3: {current.get_text()}')
            
        elif current.name == 'h4':
            print(f'H4: {current.get_text()}')
            
        elif current.name == 'div':
            # Дивимось inner divs
            inner_divs = current.find_all('div', recursive=False)
            print(f'Inner divs: {len(inner_divs)}')
            
            for idx, div in enumerate(inner_divs):
                print(f'\n  Inner DIV {idx}:')
                paragraphs = div.find_all('p', recursive=False)
                print(f'  Paragraphs: {len(paragraphs)}')
                
                for p_idx, p in enumerate(paragraphs[:5]):  # Перші 5
                    text = p.get_text(strip=True)
                    print(f'    P{p_idx}: {text[:100]}')
                    
                    # Перевіряємо чи є bold tags
                    b_tags = p.find_all('b')
                    for b in b_tags:
                        print(f'      BOLD: {b.get_text()}')
        
        current = current.find_next_sibling()
