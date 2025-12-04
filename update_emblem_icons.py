#!/usr/bin/env python3
import sqlite3
import sys

DB_FILE = 'test_games.db'

# Іконки емблем
emblem_icons = {
    'Common': 'https://static.wikia.nocookie.net/mobile-legends/images/7/7f/Basic_Common_Emblem.png',
    'Tank': 'https://static.wikia.nocookie.net/mobile-legends/images/e/ec/Custom_Tank_Emblem.png',
    'Assassin': 'https://static.wikia.nocookie.net/mobile-legends/images/9/94/Custom_Assassin_Emblem.png',
    'Mage': 'https://static.wikia.nocookie.net/mobile-legends/images/5/5e/Custom_Mage_Emblem.png',
    'Fighter': 'https://static.wikia.nocookie.net/mobile-legends/images/b/ba/Custom_Fighter_Emblem.png',
    'Support': 'https://static.wikia.nocookie.net/mobile-legends/images/c/c7/Custom_Support_Emblem.png',
    'Marksman': 'https://static.wikia.nocookie.net/mobile-legends/images/4/4c/Custom_Marksman_Emblem.png',
    'Jungle': 'https://static.wikia.nocookie.net/mobile-legends/images/c/c1/Jungle_Emblem.png'
}

# Іконки талантів (tier 1-3)
talent_icons = {
    # Tier 1
    'Thrill': 'https://static.wikia.nocookie.net/mobile-legends/images/2/2e/Thrill.png',
    'Swift': 'https://static.wikia.nocookie.net/mobile-legends/images/0/00/Swift.png',
    'Vitality': 'https://static.wikia.nocookie.net/mobile-legends/images/b/be/Vitality.png',
    'Rupture': 'https://static.wikia.nocookie.net/mobile-legends/images/3/38/Rupture.png',
    'Inspire': 'https://static.wikia.nocookie.net/mobile-legends/images/3/32/Inspire_%28Talent%29.png',
    
    # Tier 2
    'Firmness': 'https://static.wikia.nocookie.net/mobile-legends/images/b/b9/Firmness.png',
    'Agility': 'https://static.wikia.nocookie.net/mobile-legends/images/1/14/Agility.png',
    'Fatal': 'https://static.wikia.nocookie.net/mobile-legends/images/5/5e/Fatal.png',
    'Wilderness Blessing': 'https://static.wikia.nocookie.net/mobile-legends/images/b/b2/Wilderness_Blessing.png',
    'Seasoned Hunter': 'https://static.wikia.nocookie.net/mobile-legends/images/f/f9/Seasoned_Hunter.png',
    'Tenacity': 'https://static.wikia.nocookie.net/mobile-legends/images/9/99/Tenacity.png',
    'Master Assassin': 'https://static.wikia.nocookie.net/mobile-legends/images/8/85/Master_Assassin.png',
    'Bargain Hunter': 'https://static.wikia.nocookie.net/mobile-legends/images/6/69/Bargain_Hunter.png',
    'Festival of Blood': 'https://static.wikia.nocookie.net/mobile-legends/images/0/0c/Festival_of_Blood.png',
    'Pull Yourself Together': 'https://static.wikia.nocookie.net/mobile-legends/images/6/69/Pull_Yourself_Together.png',
    'Weapons Master': 'https://static.wikia.nocookie.net/mobile-legends/images/3/33/Weapon_Master_%28Talent%29.png',
    
    # Tier 3
    'Impure Rage': 'https://static.wikia.nocookie.net/mobile-legends/images/b/b5/Impure_Rage.png',
    'Quantum Charge': 'https://static.wikia.nocookie.net/mobile-legends/images/9/9b/Quantum_Charge.png',
    'War Cry': 'https://static.wikia.nocookie.net/mobile-legends/images/a/a9/War_Cry.png',
    'Temporal Reign': 'https://static.wikia.nocookie.net/mobile-legends/images/2/21/Temporal_Reign.png',
    'Concussive Blast': 'https://static.wikia.nocookie.net/mobile-legends/images/7/74/Concussive_Blast.png',
    'Killing Spree': 'https://static.wikia.nocookie.net/mobile-legends/images/b/be/Killing_Spree.png',
    'Lethal Ignition': 'https://static.wikia.nocookie.net/mobile-legends/images/c/ce/Lethal_Ignition.png',
    'Brave Smite': 'https://static.wikia.nocookie.net/mobile-legends/images/f/fd/Brave_Smite.png',
    'Focusing Mark': 'https://static.wikia.nocookie.net/mobile-legends/images/3/3c/Focusing_Mark.png',
    'Weakness Finder': 'https://static.wikia.nocookie.net/mobile-legends/images/2/28/Weakness_Finder.png'
}

def update_emblem_icons():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("Оновлення іконок емблем...")
    updated = 0
    
    for name, icon_url in emblem_icons.items():
        cursor.execute("""
            UPDATE emblems 
            SET icon_url = ?
            WHERE game_id = 3 AND name = ?
        """, (icon_url, name))
        
        if cursor.rowcount > 0:
            print(f"  ✓ {name}: {icon_url}")
            updated += cursor.rowcount
    
    conn.commit()
    print(f"\nОновлено {updated} емблем")
    
    return updated

def update_talent_icons():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print("\nОновлення іконок талантів...")
    updated = 0
    not_found = []
    
    for name, icon_url in talent_icons.items():
        cursor.execute("""
            UPDATE emblem_talents 
            SET icon_url = ?
            WHERE game_id = 3 AND name = ?
        """, (icon_url, name))
        
        if cursor.rowcount > 0:
            print(f"  ✓ {name}: {icon_url[:80]}...")
            updated += cursor.rowcount
        else:
            not_found.append(name)
    
    conn.commit()
    
    if not_found:
        print(f"\n⚠ Не знайдено в базі: {', '.join(not_found)}")
    
    print(f"\nОновлено {updated} талантів")
    
    return updated

def main():
    try:
        emblem_count = update_emblem_icons()
        talent_count = update_talent_icons()
        
        print(f"\n{'='*60}")
        print(f"Загалом оновлено:")
        print(f"  - Емблем: {emblem_count}")
        print(f"  - Талантів: {talent_count}")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"Помилка: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
