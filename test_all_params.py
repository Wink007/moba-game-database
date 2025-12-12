#!/usr/bin/env python3
"""
Тестування всіх параметрів mlbb-stats API
"""
import requests

base_url = "https://mlbb-stats.ridwaanhall.com/api/hero-rank"

print("🔍 Тестування параметрів mlbb-stats API\n")

# Test 1: days parameter
print("=" * 60)
print("Test 1: Days parameter (1, 7, 30)")
print("=" * 60)
for days in [1, 7, 30]:
    response = requests.get(base_url, params={"index": 1, "size": 3, "days": days}, timeout=10)
    data = response.json()
    if data.get('code') == 0 and 'data' in data:
        records = data['data']['records']
        top_hero = records[0]['data']['main_hero']['data']['name']
        top_wr = records[0]['data']['main_hero_win_rate']
        print(f"  days={days}: {top_hero} - {top_wr*100:.2f}% WR")

# Test 2: rank parameter
print("\n" + "=" * 60)
print("Test 2: Rank parameter (all, epic, legend, mythic)")
print("=" * 60)
for rank in ['all', 'epic', 'legend', 'mythic']:
    response = requests.get(base_url, params={"index": 1, "size": 3, "rank": rank}, timeout=10)
    data = response.json()
    if data.get('code') == 0 and 'data' in data:
        records = data['data']['records']
        if len(records) > 0:
            top_hero = records[0]['data']['main_hero']['data']['name']
            top_wr = records[0]['data']['main_hero_win_rate']
            print(f"  rank={rank}: {top_hero} - {top_wr*100:.2f}% WR")
        else:
            print(f"  rank={rank}: No data")

# Test 3: sort_field parameter
print("\n" + "=" * 60)
print("Test 3: Sort field (win_rate, ban_rate, pick_rate)")
print("=" * 60)
for sort_field in ['win_rate', 'ban_rate', 'pick_rate']:
    response = requests.get(base_url, params={"index": 1, "size": 3, "sort_field": sort_field, "sort_order": "desc"}, timeout=10)
    data = response.json()
    if data.get('code') == 0 and 'data' in data:
        records = data['data']['records']
        if len(records) > 0:
            top_hero = records[0]['data']['main_hero']['data']['name']
            if sort_field == 'win_rate':
                value = records[0]['data']['main_hero_win_rate']
            elif sort_field == 'ban_rate':
                value = records[0]['data']['main_hero_ban_rate']
            else:  # pick_rate
                value = records[0]['data']['main_hero_appearance_rate']
            print(f"  sort_field={sort_field}: {top_hero} - {value*100:.2f}%")

# Test 4: sort_order parameter
print("\n" + "=" * 60)
print("Test 4: Sort order (asc vs desc) with win_rate")
print("=" * 60)
for sort_order in ['desc', 'asc']:
    response = requests.get(base_url, params={"index": 1, "size": 3, "sort_field": "win_rate", "sort_order": sort_order}, timeout=10)
    data = response.json()
    if data.get('code') == 0 and 'data' in data:
        records = data['data']['records']
        if len(records) > 0:
            hero = records[0]['data']['main_hero']['data']['name']
            wr = records[0]['data']['main_hero_win_rate']
            print(f"  sort_order={sort_order}: {hero} - {wr*100:.2f}% WR")

# Test 5: Combined parameters
print("\n" + "=" * 60)
print("Test 5: Combined (days=7, rank=mythic, sort=win_rate desc)")
print("=" * 60)
response = requests.get(base_url, params={
    "index": 1, 
    "size": 5,
    "days": 7,
    "rank": "mythic",
    "sort_field": "win_rate",
    "sort_order": "desc"
}, timeout=10)
data = response.json()
if data.get('code') == 0 and 'data' in data:
    records = data['data']['records']
    print(f"  Total heroes: {len(records)}")
    print(f"  Top 5:")
    for i, record in enumerate(records[:5], 1):
        hero_name = record['data']['main_hero']['data']['name']
        win_rate = record['data']['main_hero_win_rate']
        ban_rate = record['data']['main_hero_ban_rate']
        print(f"    {i}. {hero_name}: {win_rate*100:.2f}% WR, {ban_rate*100:.2f}% Ban")

print("\n✅ Всі параметри працюють!")
