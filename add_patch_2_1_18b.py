#!/usr/bin/env python3
"""
Додавання патча 2.1.18b до бази даних
"""

import json
import sqlite3

def add_patch():
    # Читаємо дані патча з patches_data.json
    with open('patches_data.json', 'r', encoding='utf-8') as f:
        patches_data = json.load(f)
    
    patch_version = '2.1.18b'
    patch_data = patches_data.get(patch_version)
    
    if not patch_data:
        print(f"❌ Патч {patch_version} не знайдено в patches_data.json")
        return
    
    # Підключаємося до бази даних
    conn = sqlite3.connect('mlbb_data.db')
    cursor = conn.cursor()
    
    # Перевіряємо чи існує патч
    cursor.execute('SELECT version FROM patches WHERE version = ?', (patch_version,))
    existing = cursor.fetchone()
    
    if existing:
        print(f"⚠️  Патч {patch_version} вже існує в базі даних. Оновлюємо...")
        cursor.execute('''
            UPDATE patches 
            SET release_date = ?,
                highlights = ?,
                new_hero = ?,
                hero_adjustments = ?,
                item_adjustments = ?,
                system_changes = ?
            WHERE version = ?
        ''', (
            patch_data['release_date'],
            json.dumps(patch_data['highlights'], ensure_ascii=False),
            json.dumps(patch_data['new_hero'], ensure_ascii=False) if patch_data['new_hero'] else None,
            json.dumps(patch_data['hero_changes'], ensure_ascii=False),
            json.dumps(patch_data['item_changes'], ensure_ascii=False),
            json.dumps(patch_data['system_changes'], ensure_ascii=False),
            patch_version
        ))
        print(f"✅ Патч {patch_version} оновлено")
    else:
        print(f"➕ Додаємо патч {patch_version} до бази даних...")
        cursor.execute('''
            INSERT INTO patches (
                version, 
                release_date, 
                highlights, 
                new_hero, 
                hero_adjustments, 
                item_adjustments, 
                system_changes,
                game_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            patch_version,
            patch_data['release_date'],
            json.dumps(patch_data['highlights'], ensure_ascii=False),
            json.dumps(patch_data['new_hero'], ensure_ascii=False) if patch_data['new_hero'] else None,
            json.dumps(patch_data['hero_changes'], ensure_ascii=False),
            json.dumps(patch_data['item_changes'], ensure_ascii=False),
            json.dumps(patch_data['system_changes'], ensure_ascii=False),
            1  # Mobile Legends Bang Bang
        ))
        print(f"✅ Патч {patch_version} додано")
    
    conn.commit()
    
    # Виводимо інформацію про патч
    print(f"\n📋 Інформація про патч {patch_version}:")
    print(f"📅 Дата релізу: {patch_data['release_date']}")
    print(f"🎯 Highlights: {', '.join(patch_data['highlights'])}")
    print(f"👤 Нових героїв: {patch_data['new_hero']['name'] if patch_data['new_hero'] else 'Немає'}")
    print(f"⚖️  Змін героїв: {len(patch_data['hero_changes'])}")
    if patch_data['hero_changes']:
        print(f"   Герої: {', '.join(patch_data['hero_changes'].keys())}")
    print(f"🛡️  Змін предметів: {len(patch_data['item_changes'])}")
    print(f"⚙️  Системних змін: {len(patch_data['system_changes'])}")
    
    conn.close()

if __name__ == '__main__':
    add_patch()
