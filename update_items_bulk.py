#!/usr/bin/env python3
"""
Скрипт для масового оновлення предметів через API
1. Парсить всі дані з Fandom локально
2. Відправляє JSON на Railway для оновлення
"""

import json
import requests
from fetch_equipment_from_fandom import fetch_item_data, main as fetch_main

def update_items_from_json():
    """Оновлює предмети на Railway використовуючи локально згенерований JSON"""
    
    # Читаємо згенерований JSON
    try:
        with open('equipment_data_fandom.json', 'r', encoding='utf-8') as f:
            items_data = json.load(f)
    except FileNotFoundError:
        print("❌ Файл equipment_data_fandom.json не знайдено")
        print("🔄 Запускаю парсинг з Fandom...")
        fetch_main()
        with open('equipment_data_fandom.json', 'r', encoding='utf-8') as f:
            items_data = json.load(f)
    
    print(f"\n📦 Завантажено {len(items_data)} предметів з JSON")
    
    # Відправляємо на Railway
    url = "https://web-production-8570.up.railway.app/api/items/update-from-fandom"
    
    payload = {
        "game_id": 2,
        "items": items_data
    }
    
    print(f"🚀 Відправляю дані на Railway...")
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        
        print(f"\n✅ Успішно оновлено!")
        print(f"   Всього: {result.get('total', 0)}")
        print(f"   Оновлено: {result.get('updated', 0)}")
        print(f"   Пропущено: {result.get('skipped', 0)}")
        print(f"   Помилок: {result.get('failed', 0)}")
        
        if result.get('errors'):
            print(f"\n⚠️  Помилки ({len(result['errors'])} з перших):")
            for error in result['errors'][:10]:
                print(f"   - {error}")
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Помилка при відправці: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Відповідь сервера: {e.response.text[:500]}")
        return None

if __name__ == '__main__':
    update_items_from_json()
