#!/usr/bin/env python3
import sqlite3
import json

DB_FILE = 'test_games.db'

talent_icons = {
    'Thrill': 'https://static.wikia.nocookie.net/mobile-legends/images/2/2e/Thrill.png',
    'Swift': 'https://static.wikia.nocookie.net/mobile-legends/images/0/00/Swift.png',
    'Vitality': 'https://static.wikia.nocookie.net/mobile-legends/images/b/be/Vitality.png',
    'Rupture': 'https://static.wikia.nocookie.net/mobile-legends/images/3/38/Rupture.png',
    'Inspire': 'https://static.wikia.nocookie.net/mobile-legends/images/3/32/Inspire_%28Talent%29.png',
    'Firmness': 'https://static.wikia.nocookie.net/mobile-legends/images/b/b9/Firmness.png',
    'Agility': 'https://static.wikia.nocookie.net/mobile-legends/images/1/14/Agility.png',
    'Fatal': 'https://static.wikia.nocookie.net/mobile-legends/images/a/a5/Fatal.png',
    'Wilderness Blessing': 'https://static.wikia.nocookie.net/mobile-legends/images/b/b2/Wilderness_Blessing.png',
    'Seasoned Hunter': 'https://static.wikia.nocookie.net/mobile-legends/images/8/8b/Seasoned_Hunter.png',
    'Tenacity': 'https://static.wikia.nocookie.net/mobile-legends/images/9/99/Tenacity.png',
    'Master Assassin': 'https://static.wikia.nocookie.net/mobile-legends/images/9/9d/Master_Assassin.png',
    'Bargain Hunter': 'https://static.wikia.nocookie.net/mobile-legends/images/6/69/Bargain_Hunter.png',
    'Festival of Blood': 'https://static.wikia.nocookie.net/mobile-legends/images/0/0c/Festival_of_Blood.png',
    'Pull Yourself Together': 'https://static.wikia.nocookie.net/mobile-legends/images/6/69/Pull_Yourself_Together.png',
    'Weapons Master': 'https://static.wikia.nocookie.net/mobile-legends/images/f/f3/Weapons_Master.png',
    'Impure Rage': 'https://static.wikia.nocookie.net/mobile-legends/images/e/ed/Impure_Rage.png',
    'Quantum Charge': 'https://static.wikia.nocookie.net/mobile-legends/images/c/c7/Quantum_Charge.png',
    'War Cry': 'https://static.wikia.nocookie.net/mobile-legends/images/9/98/War_Cry.png',
    'Temporal Reign': 'https://static.wikia.nocookie.net/mobile-legends/images/3/3e/Temporal_Reign.png',
    'Concussive Blast': 'https://static.wikia.nocookie.net/mobile-legends/images/5/52/Concussive_Blast.png',
    'Killing Spree': 'https://static.wikia.nocookie.net/mobile-legends/images/0/02/Killing_Spree.png',
    'Lethal Ignition': 'https://static.wikia.nocookie.net/mobile-legends/images/f/f3/Lethal_Ignition.png',
    'Brave Smite': 'https://static.wikia.nocookie.net/mobile-legends/images/5/51/Brave_Smite.png',
    'Focusing Mark': 'https://static.wikia.nocookie.net/mobile-legends/images/4/4f/Focusing_Mark.png',
    'Weakness Finder': 'https://static.wikia.nocookie.net/mobile-legends/images/a/af/Weakness_Finder.png'
}

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

cursor.execute("SELECT id, name, tier1_talents, tier2_talents, tier3_talents FROM emblems WHERE game_id = 3")
emblems = cursor.fetchall()

print("Додавання іконок до талантів...\n")

for emblem_id, emblem_name, tier1, tier2, tier3 in emblems:
    print(f"Емблема: {emblem_name}")
    
    for tier_num, tier_data in enumerate([tier1, tier2, tier3], 1):
        if not tier_data:
            continue
        
        talents = json.loads(tier_data)
        
        for talent in talents:
            talent_name = talent.get('name')
            if talent_name and talent_name in talent_icons:
                talent['icon_url'] = talent_icons[talent_name]
                print(f"  T{tier_num}: {talent_name} ✓")
        
        tier_field = f'tier{tier_num}_talents'
        cursor.execute(f"UPDATE emblems SET {tier_field} = ? WHERE id = ?", 
                      (json.dumps(talents), emblem_id))
    print()

conn.commit()
conn.close()
print("✅ Готово!")
