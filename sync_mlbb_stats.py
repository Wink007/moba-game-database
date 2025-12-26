#!/usr/bin/env python3
"""
Синхронізація даних героїв з mlbb-stats API
Оновлює: abilityshow, relation (compatibility), statistics (ban/pick/win rates)
"""

import requests
import database as db
import json
import time
from datetime import datetime

API_BASE = "https://mlbb-stats.ridwaanhall.com/api"

def get_hero_slug(hero_name):
    """Конвертує ім'я героя в slug для API"""
    return hero_name.lower().replace("'", "").replace(" ", "-").replace(".", "")

def fetch_hero_stats(hero_slug):
    """Отримує статистику героя з API"""
    try:
        url = f"{API_BASE}/hero-detail-stats/{hero_slug}/"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('data', {}).get('records'):
                return data['data']['records'][0]['data']
    except Exception as e:
        print(f"  ⚠️  Помилка отримання stats: {e}")
    return None

def fetch_hero_compatibility(hero_game_id):
    """Отримує дані compatibility (relation) героя"""
    try:
        # mlbb-stats використовує hero_game_id - 1 для API
        api_id = hero_game_id - 1
        url = f"{API_BASE}/hero-compatibility/{api_id}/"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('data', {}).get('records'):
                record = data['data']['records'][0]['data']
                
                # Top 10 synergy (assist)
                assist_ids = [h['heroid'] for h in record.get('sub_hero', [])[:10]]
                
                # Top 10 counters (weak)
                weak_ids = [h['heroid'] for h in record.get('sub_hero_last', [])[:10]]
                
                return {
                    'assist': assist_ids,
                    'weak': weak_ids
                }
    except Exception as e:
        print(f"  ⚠️  Помилка отримання compatibility: {e}")
    return None

def fetch_hero_detail(hero_slug):
    """Отримує детальні дані героя включаючи abilityshow"""
    try:
        url = f"{API_BASE}/hero-detail/{hero_slug}/"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('data', {}).get('records'):
                hero_data = data['data']['records'][0]['data']['hero']['data']
                return {
                    'abilityshow': hero_data.get('abilityshow'),
                }
    except Exception as e:
        print(f"  ⚠️  Помилка отримання detail: {e}")
    return None

def update_hero_data(hero_id, hero_game_id, hero_name, abilityshow=None, relation=None, stats=None):
    """Оновлює дані героя в БД"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    
    # Оновлення abilityshow
    if abilityshow:
        updates.append("abilityshow = %s")
        params.append(json.dumps(abilityshow))
    
    # Оновлення relation
    if relation:
        # Зберігаємо існуючі описи
        cursor.execute("SELECT relation FROM heroes WHERE id = %s", (hero_id,))
        existing = cursor.fetchone()
        existing_relation = existing[0] if existing and existing[0] else {}
        
        new_relation = {
            'assist': {
                'desc': existing_relation.get('assist', {}).get('desc', 'Works well with'),
                'target_hero_id': relation['assist']
            },
            'strong': {
                'desc': existing_relation.get('strong', {}).get('desc', 'Strong against'),
                'target_hero_id': []
            },
            'weak': {
                'desc': existing_relation.get('weak', {}).get('desc', 'Weak against'),
                'target_hero_id': relation['weak']
            }
        }
        
        updates.append("relation = %s")
        params.append(json.dumps(new_relation, ensure_ascii=False))
    
    # Оновлення statistics
    if stats:
        if 'main_hero_ban_rate' in stats:
            updates.append("main_hero_ban_rate = %s")
            params.append(stats['main_hero_ban_rate'])
        if 'main_hero_appearance_rate' in stats:
            updates.append("main_hero_appearance_rate = %s")
            params.append(stats['main_hero_appearance_rate'])
        if 'main_hero_win_rate' in stats:
            updates.append("main_hero_win_rate = %s")
            params.append(stats['main_hero_win_rate'])
    
    if updates:
        sql = f"UPDATE heroes SET {', '.join(updates)} WHERE id = %s"
        params.append(hero_id)
        
        cursor.execute(sql, tuple(params))
        conn.commit()
    
    db.release_connection(conn)

def sync_hero(hero):
    """Синхронізує одного героя"""
    hero_id = hero['id']
    hero_name = hero['name']
    hero_game_id = hero['hero_game_id']
    
    print(f"\n📥 {hero_name} (ID: {hero_id}, game_id: {hero_game_id})")
    
    slug = get_hero_slug(hero_name)
    
    # Fetch data
    stats_data = fetch_hero_stats(slug)
    compat_data = fetch_hero_compatibility(hero_game_id)
    detail_data = fetch_hero_detail(slug)
    
    # Prepare updates
    updates = {}
    
    # Check abilityshow
    if not hero.get('abilityshow') and detail_data and detail_data.get('abilityshow'):
        updates['abilityshow'] = detail_data['abilityshow']
        print(f"  ✅ abilityshow: {detail_data['abilityshow']}")
    
    # Check relation
    current_relation = hero.get('relation')
    if (not current_relation or 
        not current_relation.get('assist', {}).get('target_hero_id') or
        not current_relation.get('weak', {}).get('target_hero_id')):
        if compat_data:
            updates['relation'] = compat_data
            print(f"  ✅ relation: {len(compat_data['assist'])} assist, {len(compat_data['weak'])} weak")
    
    # Check statistics
    if stats_data:
        stats = {}
        if stats_data.get('main_hero_ban_rate') is not None:
            stats['main_hero_ban_rate'] = stats_data['main_hero_ban_rate']
        if stats_data.get('main_hero_appearance_rate') is not None:
            stats['main_hero_appearance_rate'] = stats_data['main_hero_appearance_rate']
        if stats_data.get('main_hero_win_rate') is not None:
            stats['main_hero_win_rate'] = stats_data['main_hero_win_rate']
        
        if stats:
            updates['stats'] = stats
            print(f"  ✅ statistics: ban={stats.get('main_hero_ban_rate', 0):.1%}, "
                  f"pick={stats.get('main_hero_appearance_rate', 0):.1%}, "
                  f"win={stats.get('main_hero_win_rate', 0):.1%}")
    
    # Apply updates
    if updates:
        update_hero_data(
            hero_id, hero_game_id, hero_name,
            abilityshow=updates.get('abilityshow'),
            relation=updates.get('relation'),
            stats=updates.get('stats')
        )
        print(f"  💾 Збережено")
        return True
    else:
        print(f"  ⏭️  Пропущено (дані актуальні)")
        return False

def main():
    print("=" * 60)
    print("🔄 Синхронізація даних з mlbb-stats API")
    print("=" * 60)
    
    # Get all MLBB heroes
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, hero_game_id, abilityshow, relation 
        FROM heroes 
        WHERE game_id = 2 
        ORDER BY name
    """)
    
    heroes = []
    columns = [desc[0] for desc in cursor.description]
    for row in cursor.fetchall():
        hero = dict(zip(columns, row))
        heroes.append(hero)
    
    db.release_connection(conn)
    
    print(f"Знайдено {len(heroes)} героїв Mobile Legends\n")
    
    updated_count = 0
    skipped_count = 0
    
    for hero in heroes:
        try:
            if sync_hero(hero):
                updated_count += 1
            else:
                skipped_count += 1
            
            # Rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  ❌ Помилка: {e}")
            continue
    
    print("\n" + "=" * 60)
    print(f"✅ Завершено!")
    print(f"   Оновлено: {updated_count}")
    print(f"   Пропущено: {skipped_count}")
    print(f"   Всього: {len(heroes)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
