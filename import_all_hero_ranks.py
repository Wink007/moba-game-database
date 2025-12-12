import requests
import time

# Всі комбінації параметрів для імпорту
configs = [
    # days=1
    {'days': 1, 'rank': 'all'},
    {'days': 1, 'rank': 'epic'},
    {'days': 1, 'rank': 'legend'},
    {'days': 1, 'rank': 'mythic'},
    {'days': 1, 'rank': 'honor'},
    {'days': 1, 'rank': 'glory'},
    
    # days=3
    {'days': 3, 'rank': 'all'},
    {'days': 3, 'rank': 'epic'},
    {'days': 3, 'rank': 'legend'},
    {'days': 3, 'rank': 'mythic'},
    {'days': 3, 'rank': 'honor'},
    {'days': 3, 'rank': 'glory'},
    
    # days=7
    {'days': 7, 'rank': 'all'},
    {'days': 7, 'rank': 'epic'},
    {'days': 7, 'rank': 'legend'},
    {'days': 7, 'rank': 'mythic'},
    {'days': 7, 'rank': 'honor'},
    {'days': 7, 'rank': 'glory'},
    
    # days=15
    {'days': 15, 'rank': 'all'},
    {'days': 15, 'rank': 'epic'},
    {'days': 15, 'rank': 'legend'},
    {'days': 15, 'rank': 'mythic'},
    {'days': 15, 'rank': 'honor'},
    {'days': 15, 'rank': 'glory'},
    
    # days=30
    {'days': 30, 'rank': 'all'},
    {'days': 30, 'rank': 'epic'},
    {'days': 30, 'rank': 'legend'},
    {'days': 30, 'rank': 'mythic'},
    {'days': 30, 'rank': 'honor'},
    {'days': 30, 'rank': 'glory'},
]

API_URL = 'https://web-production-8570.up.railway.app/api/hero-ranks/update'

def import_data(config):
    """Імпортує дані для заданої конфігурації"""
    days = config['days']
    rank = config['rank']
    
    print(f"\n{'='*60}")
    print(f"📥 Імпорт: {days} days, {rank} rank")
    print(f"{'='*60}")
    
    payload = {
        'game_id': 2,
        'days': days,
        'rank': rank,
        'sort_field': 'win_rate'
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        if result.get('success'):
            print(f"✅ Успішно: {result.get('inserted', 0)} додано, {result.get('updated', 0)} оновлено")
        else:
            print(f"❌ Помилка: {result.get('error', 'Unknown error')}")
            
        return result
        
    except Exception as e:
        print(f"❌ Виняток: {e}")
        return None

def main():
    print("🚀 Початок імпорту всіх комбінацій hero ranks...")
    print(f"Всього конфігурацій: {len(configs)}")
    
    total_inserted = 0
    total_updated = 0
    success_count = 0
    failed_count = 0
    
    for i, config in enumerate(configs, 1):
        print(f"\n[{i}/{len(configs)}]")
        result = import_data(config)
        
        if result and result.get('success'):
            total_inserted += result.get('inserted', 0)
            total_updated += result.get('updated', 0)
            success_count += 1
        else:
            failed_count += 1
        
        # Невелика затримка між запитами
        if i < len(configs):
            time.sleep(2)
    
    print(f"\n{'='*60}")
    print(f"📊 ПІДСУМОК")
    print(f"{'='*60}")
    print(f"Успішно: {success_count}/{len(configs)}")
    print(f"Помилок: {failed_count}/{len(configs)}")
    print(f"Всього додано: {total_inserted}")
    print(f"Всього оновлено: {total_updated}")
    print("\n✅ Імпорт завершено!")

if __name__ == '__main__':
    main()
