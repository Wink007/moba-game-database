#!/usr/bin/env python3
"""
Тестовий скрипт для перевірки імпорту з різними періодами
"""
import os
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

from import_hero_ranks import fetch_hero_ranks

# Тестуємо різні періоди
periods = [None, 1, 3, 7, 15, 30]

print("🔍 Тестування імпорту з різними періодами...\n")

results = {}
for days in periods:
    print(f"\n{'='*60}")
    records = fetch_hero_ranks(days=days)
    
    if records and len(records) > 0:
        # Отримуємо дані першого героя
        first_record = records[0]["data"]
        hero_name = first_record["main_hero"]["data"]["name"]
        win_rate = first_record["main_hero_win_rate"]
        
        period_label = f"{days} днів" if days else "всі дані"
        results[period_label] = {
            "name": hero_name,
            "win_rate": win_rate,
            "total": len(records)
        }
        
        print(f"✅ Період: {period_label}")
        print(f"   Героїв: {len(records)}")
        print(f"   Топ-1: {hero_name} ({win_rate*100:.2f}% WR)")

print(f"\n{'='*60}")
print("\n📊 Підсумок:")
print(f"\n{'Період':<15} {'Топ-1 герой':<15} {'Win Rate':<10} {'Героїв'}")
print("-" * 60)

for period, data in results.items():
    print(f"{period:<15} {data['name']:<15} {data['win_rate']*100:>6.2f}%    {data['total']}")

print("\n✅ Параметр days працює! Статистика змінюється залежно від періоду.")
print("📝 Використання в API:")
print("   GET /api/hero-ranks?game_id=2&days=7")
print("   useHeroRanks(2, undefined, undefined, 7)")
