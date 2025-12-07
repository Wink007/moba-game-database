#!/usr/bin/env python3
"""
Оновлення relation для Roger та Beatrix з mlbb-stats API
"""

import requests
import json
from database import get_connection, release_connection, get_placeholder

def fetch_hero_relation(hero_name):
    """Отримує relation з mlbb-stats API"""
    url_name = hero_name.lower().replace(' ', '-')
    url = f'https://mlbb-stats.ridwaanhall.com/api/hero-detail/{url_name}/'
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            print(f"❌ {hero_name}: HTTP {response.status_code}")
            return None
        
        data = response.json()
        if data.get('code') != 0:
            print(f"❌ {hero_name}: API error")
            return None
        
        relation_data = data['data']['records'][0]['data'].get('relation')
        
        if not relation_data:
            print(f"⚠️  {hero_name}: No relation data")
            return None
        
        # Форматуємо relation
        relations = []
        
        for rel_type in ['assist', 'strong', 'weak']:
            if rel_type in relation_data and 'target_hero' in relation_data[rel_type]:
                for target in relation_data[rel_type]['target_hero']:
                    # Пропускаємо 0 (placeholder)
                    if target == 0 or not isinstance(target, dict):
                        continue
                    
                    if 'data' in target and 'head' in target['data']:
                        # Витягуємо ім'я з URL (після 100_)
                        head_url = target['data']['head']
                        # Додаємо тільки head URL, ім'я героя знайдемо пізніше
                        relations.append({
                            'type': rel_type,
                            'hero_image': head_url
                        })
        
        return relations if relations else None
        
    except Exception as e:
        print(f"❌ {hero_name}: {str(e)}")
        return None

def update_hero_relation(hero_name):
    """Оновлює relation для героя в БД"""
    
    relations = fetch_hero_relation(hero_name)
    
    if not relations:
        return False
    
    conn = get_connection()
    cursor = conn.cursor()
    ph = get_placeholder()
    
    try:
        # Знаходимо ID героя
        cursor.execute(f"SELECT id FROM heroes WHERE name = {ph}", (hero_name,))
        result = cursor.fetchone()
        
        if not result:
            print(f"❌ {hero_name}: Hero not found in database")
            return False
        
        hero_id = result[0]
        
        # Оновлюємо relation
        relation_json = json.dumps(relations)
        cursor.execute(
            f"UPDATE heroes SET relation = {ph} WHERE id = {ph}",
            (relation_json, hero_id)
        )
        
        conn.commit()
        print(f"✅ {hero_name}: Updated with {len(relations)} relations")
        return True
        
    except Exception as e:
        print(f"❌ {hero_name}: Database error - {str(e)}")
        conn.rollback()
        return False
    finally:
        release_connection(conn)

if __name__ == '__main__':
    print("🔄 Оновлення relation для Roger та Beatrix...\n")
    
    heroes = ['Roger', 'Beatrix']
    
    for hero_name in heroes:
        update_hero_relation(hero_name)
    
    print("\n✅ Готово!")
