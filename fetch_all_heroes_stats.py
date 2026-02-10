#!/usr/bin/env python3
"""
Скрипт для збору статистики всіх героїв з офіційного API Mobile Legends
"""
import json
import requests
import time
from typing import Dict, List, Any

# API Configuration
API_BASE = "https://api.gms.moontontech.com/api/gms/source/2669606"
HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'authorization': 'CciHBEvFRqQNHGj2djxdUSja7W4=',
    'content-type': 'application/json;charset=UTF-8',
    'origin': 'https://www.mobilelegends.com',
    'referer': 'https://www.mobilelegends.com/',
    'x-actid': '2669607',
    'x-appid': '2669606',
    'x-lang': 'en'
}

def fetch_all_heroes() -> List[Dict[str, Any]]:
    """Отримати список всіх героїв"""
    print("📥 Fetching list of all heroes...")
    
    url = f"{API_BASE}/2756564"
    payload = {
        "pageSize": 200,
        "pageIndex": 1,
        "filters": [],
        "sorts": [{"data": {"field": "hero_id", "order": "desc"}, "type": "sequence"}],
        "fields": ["id", "hero_id", "hero.data.name"]
    }
    
    response = requests.post(url, json=payload, headers=HEADERS)
    data = response.json()
    
    if 'data' in data and 'records' in data['data']:
        heroes = data['data']['records']
        print(f"✅ Found {len(heroes)} heroes\n")
        return heroes
    else:
        print(f"❌ Error: {data}")
        return []

def fetch_hero_stats(hero_id: int, hero_name: str) -> Dict[str, Any]:
    """Отримати статистику конкретного героя"""
    url = f"{API_BASE}/2756567"
    payload = {
        "pageSize": 20,
        "pageIndex": 1,
        "filters": [
            {"field": "main_heroid", "operator": "eq", "value": hero_id},
            {"field": "bigrank", "operator": "eq", "value": 101},  # Mythic rank
            {"field": "match_type", "operator": "eq", "value": 1}  # Ranked matches
        ],
        "sorts": []
    }
    
    try:
        response = requests.post(url, json=payload, headers=HEADERS)
        data = response.json()
        
        if 'data' in data and 'records' in data['data'] and len(data['data']['records']) > 0:
            stats = data['data']['records'][0]['data']
            
            win_rate = stats.get('main_hero_win_rate', 0) * 100
            pick_rate = stats.get('main_hero_appearance_rate', 0) * 100
            ban_rate = stats.get('main_hero_ban_rate', 0) * 100
            
            print(f"  ✓ {hero_name:20s} (ID: {hero_id:3d}) - WR: {win_rate:5.2f}% | Pick: {pick_rate:5.2f}% | Ban: {ban_rate:5.2f}%")
            
            return {
                'hero_id': hero_id,
                'hero_name': hero_name,
                'win_rate': win_rate,
                'pick_rate': pick_rate,
                'ban_rate': ban_rate,
                'raw_data': stats
            }
        else:
            print(f"  ⚠ {hero_name:20s} (ID: {hero_id:3d}) - No stats available")
            return None
            
    except Exception as e:
        print(f"  ❌ {hero_name:20s} (ID: {hero_id:3d}) - Error: {e}")
        return None

def main():
    print("=" * 80)
    print("🎮 MOBILE LEGENDS HEROES STATISTICS FETCHER")
    print("=" * 80)
    print()
    
    # Отримати список героїв
    heroes = fetch_all_heroes()
    if not heroes:
        print("Failed to fetch heroes list")
        return
    
    # Зібрати статистику для кожного героя
    print("📊 Fetching statistics for all heroes (Mythic Rank, Ranked Games)...")
    print("-" * 80)
    
    all_stats = []
    failed_heroes = []
    
    for i, hero in enumerate(heroes, 1):
        hero_id = hero['data']['hero_id']
        hero_name = hero['data']['hero']['data']['name']
        
        stats = fetch_hero_stats(hero_id, hero_name)
        
        if stats:
            all_stats.append(stats)
        else:
            failed_heroes.append({'id': hero_id, 'name': hero_name})
        
        # Затримка щоб не перевантажити API
        if i % 10 == 0:
            print(f"\n  Progress: {i}/{len(heroes)} heroes processed...")
            time.sleep(1)
        else:
            time.sleep(0.2)
    
    # Зберегти результати
    output_file = "mlbb_heroes_stats.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_heroes': len(heroes),
            'stats_collected': len(all_stats),
            'failed': len(failed_heroes),
            'failed_heroes': failed_heroes,
            'statistics': all_stats,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }, f, indent=2, ensure_ascii=False)
    
    # Підсумки
    print("\n" + "=" * 80)
    print("📈 SUMMARY")
    print("=" * 80)
    print(f"Total heroes: {len(heroes)}")
    print(f"Stats collected: {len(all_stats)}")
    print(f"Failed: {len(failed_heroes)}")
    print(f"\n💾 Results saved to: {output_file}")
    
    # Топ 10 героїв за win rate
    if all_stats:
        print("\n🏆 TOP 10 HEROES BY WIN RATE:")
        sorted_by_wr = sorted(all_stats, key=lambda x: x['win_rate'], reverse=True)[:10]
        for i, hero in enumerate(sorted_by_wr, 1):
            print(f"  {i:2d}. {hero['hero_name']:20s} - {hero['win_rate']:.2f}% WR")
        
        print("\n🚫 TOP 10 MOST BANNED HEROES:")
        sorted_by_ban = sorted(all_stats, key=lambda x: x['ban_rate'], reverse=True)[:10]
        for i, hero in enumerate(sorted_by_ban, 1):
            print(f"  {i:2d}. {hero['hero_name']:20s} - {hero['ban_rate']:.2f}% Ban Rate")
    
    print("\n✅ Done!")

if __name__ == "__main__":
    main()
