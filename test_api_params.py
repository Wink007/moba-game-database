import requests

# Спробуємо різні параметри
test_urls = [
    ('Without params', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank'),
    ('page=1&limit=50', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?page=1&limit=50'),
    ('limit=130', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?limit=130'),
    ('per_page=130', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?per_page=130'),
    ('page_size=130', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?page_size=130'),
    ('offset=0&limit=130', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?offset=0&limit=130'),
    ('page=1&size=130', 'https://mlbb-stats.ridwaanhall.com/api/hero-rank?page=1&size=130'),
]

print("Testing different API parameters:\n")

for name, url in test_urls:
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if 'data' in data and 'records' in data['data']:
            records = data['data']['records']
            hero_ids = [rec['data']['main_heroid'] for rec in records]
            unique_ids = set(hero_ids)
            total = data['data'].get('total', 'N/A')
            
            print(f'{name:30} -> Records: {len(records):3}, Unique: {len(unique_ids):3}, Total: {total}')
            
            # Виводимо перші ID для перевірки чи змінилися
            if len(unique_ids) != 20:
                print(f'  ✨ Different! First IDs: {sorted(list(unique_ids))[:5]}')
        else:
            print(f'{name:30} -> Unexpected response structure')
    except Exception as e:
        print(f'{name:30} -> Error: {str(e)[:50]}')

print("\n" + "="*60)
print("Checking if there are other API endpoints...")
print("="*60)

# Перевіряємо інші можливі ендпоінти
other_endpoints = [
    'https://mlbb-stats.ridwaanhall.com/api/heroes',
    'https://mlbb-stats.ridwaanhall.com/api/hero',
    'https://mlbb-stats.ridwaanhall.com/api/hero-stats',
    'https://mlbb-stats.ridwaanhall.com/api/rankings',
]

for url in other_endpoints:
    try:
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            print(f'✅ {url} - exists!')
            data = response.json()
            print(f'   Keys: {list(data.keys())[:5]}')
        else:
            print(f'❌ {url} - {response.status_code}')
    except:
        print(f'❌ {url} - not accessible')
