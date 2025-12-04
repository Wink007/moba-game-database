import requests
from bs4 import BeautifulSoup

url = 'https://mobile-legends.fandom.com/wiki/Cyclops'
response = requests.get(url, timeout=10)
html = response.text
skill_name = 'Stardust Shock'

soup = BeautifulSoup(html, 'html.parser')
all_tables = soup.find_all('table', class_='wikitable')

for i, table in enumerate(all_tables):
    first_row = table.find('tr')
    if not first_row:
        continue
        
    headers = [th.get_text(strip=True) for th in first_row.find_all('th')]
    
    if not headers or headers[0] != 'Properties':
        continue
    
    # Check for Level scaling
    prev_sibling = table.find_previous_sibling()
    found_level_scaling = False
    
    for j in range(5):
        if prev_sibling:
            text = prev_sibling.get_text(strip=True)
            if 'Level scaling' in text:
                found_level_scaling = True
                break
            prev_sibling = prev_sibling.find_previous_sibling()
    
    if not found_level_scaling:
        continue
    
    print(f'\nTable {i+1}: Checking for {skill_name}')
    
    # Exact logic from the script
    search_range = table
    skill_found = False
    level_scaling_count = 0
    
    for k in range(50):
        search_range = search_range.find_previous()
        if not search_range:
            print(f'  Reached end of document')
            break
        
        text = search_range.get_text(strip=True)
        
        # Skip empty or very long text
        if not text or len(text) > 200:
            continue
        
        # Show what we're checking
        if k < 35 and text:
            print(f'  Step {k}: [{search_range.name}] "{text[:40]}"')
        
        if skill_name.lower() in text.lower():
            print(f'  ✓ Found skill at step {k}: {text[:60]}')
            skill_found = True
            break
        
        # Count "Level scaling" occurrences
        if 'Level scaling' in text:
            level_scaling_count += 1
            print(f'  Level scaling count: {level_scaling_count}')
            if level_scaling_count >= 3:
                print(f'  Stop at level_scaling_count >= 3')
                break
    
    if not skill_found:
        print(f'  ✗ Skill not found')
