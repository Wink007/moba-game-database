#!/usr/bin/env python3
import sqlite3
import json

DB_FILE = 'test_games.db'

def import_equipment():
    # Читаємо JSON
    with open('equipment_data.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    print(f"📦 Завантажено {len(items)} предметів з JSON\n")
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Очищаємо таблицю перед імпортом
    cursor.execute("DELETE FROM equipment")
    
    imported = 0
    by_category = {}
    
    for item in items:
        # Додаємо предмет
        cursor.execute("""
            INSERT INTO equipment (
                id, name, category, price_total, game_id
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            item['id'],
            item['name'],
            item['category'],
            item.get('price_total', 0),
            1  # Mobile Legends
        ))
        
        imported += 1
        cat = item['category']
        by_category[cat] = by_category.get(cat, 0) + 1
    
    conn.commit()
    conn.close()
    
    print(f"✅ Імпортовано: {imported}/{len(items)}\n")
    print("📊 Статистика по категоріях:")
    for cat in sorted(by_category.keys()):
        print(f"  {cat}: {by_category[cat]} предметів")
    
    total = sum(by_category.values())
    cats = '+'.join(str(by_category[cat]) for cat in ['Attack', 'Magic', 'Defense', 'Movement', 'Jungling', 'Roaming'])
    print(f"\n✓ Всього: {cats} = {total}")

if __name__ == '__main__':
    import_equipment()
