#!/usr/bin/env python3
"""
Перевіряє які герої мають відсутні дані
"""

import database as db

def check_missing_data():
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, hero_game_id,
               abilityshow IS NULL as no_abilityshow,
               relation IS NULL as no_relation,
               main_hero_ban_rate IS NULL as no_ban_rate,
               main_hero_appearance_rate IS NULL as no_appearance_rate,
               main_hero_win_rate IS NULL as no_win_rate
        FROM heroes 
        WHERE game_id = 2
        ORDER BY name
    """)
    
    missing = {
        'abilityshow': [],
        'relation': [],
        'statistics': []
    }
    
    for row in cursor.fetchall():
        hero_id, name, game_id, no_ability, no_relation, no_ban, no_appear, no_win = row
        
        if no_ability:
            missing['abilityshow'].append(name)
        if no_relation:
            missing['relation'].append(name)
        if no_ban or no_appear or no_win:
            missing['statistics'].append(name)
    
    db.release_connection(conn)
    
    print("=" * 60)
    print("📊 Звіт про відсутні дані")
    print("=" * 60)
    
    for field, heroes in missing.items():
        print(f"\n{field.upper()}:")
        if heroes:
            print(f"  ❌ Відсутні у {len(heroes)} героїв:")
            for h in heroes[:10]:
                print(f"     - {h}")
            if len(heroes) > 10:
                print(f"     ... та ще {len(heroes) - 10}")
        else:
            print(f"  ✅ Всі герої мають дані")
    
    print("\n" + "=" * 60)
    total_missing = sum(len(h) for h in missing.values())
    if total_missing > 0:
        print(f"💡 Запустіть sync_mlbb_stats.py для автоматичного оновлення")
    else:
        print(f"✅ Всі дані актуальні!")
    print("=" * 60)

if __name__ == "__main__":
    check_missing_data()
