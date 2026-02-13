#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Оновлює hero_ranks з офіційного Moonton API
Збирає статистику для різних періодів (1/3/7/15/30 днів) та рангів
"""
import os
import requests
import json
import time
import database as db
from datetime import datetime

# Moonton API configuration
MOONTON_API_BASE = "https://api.gms.moontontech.com/api/gms/source/2669606"

# Читаємо токен з environment variable
AUTH_TOKEN = os.environ.get('MOONTON_AUTH_TOKEN', '')

if not AUTH_TOKEN:
    print("❌ MOONTON_AUTH_TOKEN not set in environment!")
    exit(1)

HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json;charset=UTF-8',
    'x-actid': '2669607',
    'x-appid': '2669606',
    'x-lang': 'en',
    'authorization': AUTH_TOKEN
}

# Source IDs для різних періодів
SOURCE_IDS = {
    1: '2756567',   # 1 день
    3: '2756568',   # 3 дні
    7: '2756569',   # 7 днів
    15: '2756565',  # 15 днів
    30: '2756570'   # 30 днів
}

# Bigrank маппінг
BIGRANK_MAP = {
    'all': '101',
    'epic': '5',
    'legend': '6',
    'mythic': '7',
    'honor': '8',
    'glory': '9'
}

def fetch_hero_stats(days, rank, match_type=1):
    """
    Збирає статистику героїв з Moonton API
    
    Args:
        days: період (1, 3, 7, 15, 30)
        rank: ранг (all, epic, legend, mythic, honor, glory)
        match_type: 0=Classic, 1=Ranked (default: 1)
    """
    source_id = SOURCE_IDS.get(days)
    bigrank = BIGRANK_MAP.get(rank)
    
    if not source_id or not bigrank:
        print(f"⚠️  Невідома комбінація: days={days}, rank={rank}")
        return []
    
    url = f"{MOONTON_API_BASE}/{source_id}"
    
    # Запит для отримання всіх героїв (131 героїв, 7 сторінок по 20)
    all_heroes = []
    
    for page in range(1, 8):  # 7 сторінок
        payload = {
            "pageSize": 20,
            "pageIndex": page,
            "filters": [
                {"field": "bigrank", "operator": "eq", "value": bigrank},
                {"field": "match_type", "operator": "eq", "value": match_type}
            ],
            "sorts": [
                {"data": {"field": "main_hero_win_rate", "order": "desc"}, "type": "sequence"}
            ],
            "fields": [
                "main_hero",
                "main_hero_appearance_rate",
                "main_hero_ban_rate",
                "main_hero_win_rate",
                "main_heroid",
                "data.sub_hero.heroid",
                "data.sub_hero.increase_win_rate"
            ]
        }
        
        try:
            response = requests.post(url, headers=HEADERS, json=payload, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('code') == 0 and data.get('data', {}).get('records'):
                records = data['data']['records']
                all_heroes.extend(records)
                print(f"  📄 Сторінка {page}: {len(records)} героїв")
                
                if len(records) < 20:  # Остання сторінка
                    break
            else:
                print(f"  ⚠️  Сторінка {page}: немає даних")
                break
                
        except Exception as e:
            print(f"  ❌ Помилка на сторінці {page}: {e}")
            break
        
        time.sleep(0.2)  # Затримка між запитами
    
    return all_heroes

def update_hero_rank_in_railway(hero_game_id, days, rank, ban_rate, pick_rate, win_rate, synergy_data, game_id=2):
    """Оновлює або додає запис в hero_rank через Railway API"""
    railway_api = "https://web-production-8570.up.railway.app/api"
    
    try:
        # Знаходимо героя
        response = requests.get(f"{railway_api}/heroes?game_id={game_id}")
        heroes = response.json()
        
        hero = next((h for h in heroes if h.get('hero_game_id') == hero_game_id), None)
        if not hero:
            return False
        
        hero_id = hero['id']
        
        # Перевіряємо чи існує запис hero_rank
        check_response = requests.get(f"{railway_api}/hero-ranks?hero_id={hero_id}&days={days}&rank={rank}")
        existing_ranks = check_response.json()
        
        synergy_json = json.dumps(synergy_data) if synergy_data else None
        
        data = {
            'hero_id': hero_id,
            'days': days,
            'rank': rank,
            'ban_rate': ban_rate,
            'appearance_rate': pick_rate,
            'win_rate': win_rate,
            'synergy_heroes': synergy_json
        }
        
        if existing_ranks and len(existing_ranks) > 0:
            # Оновлюємо існуючий запис
            rank_id = existing_ranks[0]['id']
            update_response = requests.put(f"{railway_api}/hero-ranks/{rank_id}", json=data)
            return update_response.status_code in [200, 204]
        else:
            # Створюємо новий запис
            create_response = requests.post(f"{railway_api}/hero-ranks", json=data)
            return create_response.status_code in [200, 201]
        
    except Exception as e:
        print(f"    ❌ Помилка Railway API: {e}")
        return False

def main():
    print("=" * 80)
    print("🎮 ОНОВЛЕННЯ HERO RANKS З MOONTON API")
    print("=" * 80)
    print(f"🔑 Auth Token: {AUTH_TOKEN[:20]}...")
    
    # Комбінації для оновлення - всі можливі (5 періодів × 6 рангів = 30 комбінацій)
    combinations = [
        # 1 день
        (1, 'all'), (1, 'epic'), (1, 'legend'), (1, 'mythic'), (1, 'honor'), (1, 'glory'),
        # 3 дні
        (3, 'all'), (3, 'epic'), (3, 'legend'), (3, 'mythic'), (3, 'honor'), (3, 'glory'),
        # 7 днів
        (7, 'all'), (7, 'epic'), (7, 'legend'), (7, 'mythic'), (7, 'honor'), (7, 'glory'),
        # 15 днів
        (15, 'all'), (15, 'epic'), (15, 'legend'), (15, 'mythic'), (15, 'honor'), (15, 'glory'),
        # 30 днів
        (30, 'all'), (30, 'epic'), (30, 'legend'), (30, 'mythic'), (30, 'honor'), (30, 'glory')
    ]
    
    total_updated = 0
    total_skipped = 0
    
    for idx, (days, rank) in enumerate(combinations, 1):
        print(f"\n[{idx}/30] 📊 Обробка: {days} днів, ранг {rank}")
        print("-" * 60)
        
        heroes = fetch_hero_stats(days, rank, match_type=1)
        
        if not heroes:
            print(f"  ⚠️  Немає даних для {days}д/{rank}")
            continue
        
        print(f"  ✅ Отримано {len(heroes)} героїв")
        
        updated = 0
        skipped = 0
        
        for hero_data in heroes:
            try:
                data = hero_data.get('data', {})
                hero_game_id = data.get('main_heroid')
                ban_rate = round(data.get('main_hero_ban_rate', 0) * 100, 2)
                pick_rate = round(data.get('main_hero_appearance_rate', 0) * 100, 2)
                win_rate = round(data.get('main_hero_win_rate', 0) * 100, 2)
                
                # Synergy heroes (top 5 allies from sub_hero)
                synergy_heroes = []
                sub_hero = data.get('sub_hero', [])
                if sub_hero and isinstance(sub_hero, list):
                    for ally in sub_hero[:5]:
                        ally_id = ally.get('heroid')
                        increase_wr = ally.get('increase_win_rate', 0) * 100
                        if ally_id:
                            synergy_heroes.append({
                                'hero_id': ally_id,
                                'synergy': round(increase_wr, 2)
                            })
                
                success = update_hero_rank_in_railway(
                    hero_game_id, days, rank, 
                    ban_rate, pick_rate, win_rate,
                    synergy_heroes
                )
                
                if success:
                    updated += 1
                else:
                    skipped += 1
                    
            except Exception as e:
                print(f"    ❌ Помилка обробки героя: {e}")
                skipped += 1
        
        total_updated += updated
        total_skipped += skipped
        
        print(f"  ✅ Оновлено: {updated}, Пропущено: {skipped}")
        time.sleep(0.5)  # Затримка між комбінаціями
    
    print("\n" + "=" * 80)
    print("📈 ПІДСУМОК")
    print("=" * 80)
    print(f"✅ Всього оновлено: {total_updated}")
    print(f"⚠️  Пропущено: {total_skipped}")
    print(f"🎯 Комбінацій: {len(combinations)}")
    print("=" * 80)

if __name__ == "__main__":
    main()
