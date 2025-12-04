#!/usr/bin/env python3
import sqlite3

# Оновлені URL іконок з Mobile Legends Fandom Wiki
# Формат: https://static.wikia.nocookie.net/mobile-legends/images/...
item_icons = {
    # Attack
    "Berserker's Fury": "https://static.wikia.nocookie.net/mobile-legends/images/2/26/Berserker%27s_Fury.png",
    "Blade of Despair": "https://static.wikia.nocookie.net/mobile-legends/images/8/85/Blade_of_Despair.png",
    "Blade of the Heptaseas": "https://static.wikia.nocookie.net/mobile-legends/images/d/d5/Blade_of_the_Heptaseas.png",
    "Corrosion Scythe": "https://static.wikia.nocookie.net/mobile-legends/images/5/5c/Corrosion_Scythe.png",
    "Demon Hunter Sword": "https://static.wikia.nocookie.net/mobile-legends/images/0/0f/Demon_Hunter_Sword.png",
    "Endless Battle": "https://static.wikia.nocookie.net/mobile-legends/images/3/3f/Endless_Battle.png",
    "Golden Staff": "https://static.wikia.nocookie.net/mobile-legends/images/4/41/Golden_Staff.png",
    "Great Dragon Spear": "https://static.wikia.nocookie.net/mobile-legends/images/a/a4/Great_Dragon_Spear.png",
    "Haas's Claws": "https://static.wikia.nocookie.net/mobile-legends/images/1/13/Haas%27s_Claws.png",
    "Hunter Strike": "https://static.wikia.nocookie.net/mobile-legends/images/b/bb/Hunter_Strike.png",
    "Malefic Gun": "https://static.wikia.nocookie.net/mobile-legends/images/e/eb/Malefic_Gun.png",
    "Malefic Roar": "https://static.wikia.nocookie.net/mobile-legends/images/0/0f/Malefic_Roar.png",
    "Rose Gold Meteor": "https://static.wikia.nocookie.net/mobile-legends/images/3/36/Rose_Gold_Meteor.png",
    "Sea Halberd": "https://static.wikia.nocookie.net/mobile-legends/images/5/5f/Sea_Halberd.png",
    "Sky Piercer": "https://static.wikia.nocookie.net/mobile-legends/images/c/c7/Sky_Piercer.png",
    "War Axe": "https://static.wikia.nocookie.net/mobile-legends/images/d/d3/War_Axe.png",
    "Wind of Nature": "https://static.wikia.nocookie.net/mobile-legends/images/a/a1/Wind_of_Nature.png",
    "Windtalker": "https://static.wikia.nocookie.net/mobile-legends/images/b/b3/Windtalker.png",
    "Winter Truncheon": "https://static.wikia.nocookie.net/mobile-legends/images/a/a0/Winter_Truncheon.png",
    
    # Magic
    "Blood Wings": "https://static.wikia.nocookie.net/mobile-legends/images/d/dd/Blood_Wings.png",
    "Clock of Destiny": "https://static.wikia.nocookie.net/mobile-legends/images/f/f9/Clock_of_Destiny.png",
    "Concentrated Energy": "https://static.wikia.nocookie.net/mobile-legends/images/a/ab/Concentrated_Energy.png",
    "Divine Glaive": "https://static.wikia.nocookie.net/mobile-legends/images/f/f0/Divine_Glaive.png",
    "Enchanted Talisman": "https://static.wikia.nocookie.net/mobile-legends/images/1/1f/Enchanted_Talisman.png",
    "Genius Wand": "https://static.wikia.nocookie.net/mobile-legends/images/6/64/Genius_Wand.png",
    "Glowing Wand": "https://static.wikia.nocookie.net/mobile-legends/images/2/28/Glowing_Wand.png",
    "Holy Crystal": "https://static.wikia.nocookie.net/mobile-legends/images/9/9c/Holy_Crystal.png",
    "Lightning Truncheon": "https://static.wikia.nocookie.net/mobile-legends/images/5/5a/Lightning_Truncheon.png",
    
    # Defense
    "Antique Cuirass": "https://static.wikia.nocookie.net/mobile-legends/images/5/59/Antique_Cuirass.png",
    "Athena's Shield": "https://static.wikia.nocookie.net/mobile-legends/images/6/68/Athena%27s_Shield.png",
    "Blade Armor": "https://static.wikia.nocookie.net/mobile-legends/images/a/ab/Blade_Armor.png",
    "Dominance Ice": "https://static.wikia.nocookie.net/mobile-legends/images/b/be/Dominance_Ice.png",
    "Guardian Helmet": "https://static.wikia.nocookie.net/mobile-legends/images/4/40/Guardian_Helmet.png",
    "Immortality": "https://static.wikia.nocookie.net/mobile-legends/images/2/23/Immortality.png",
    "Oracle": "https://static.wikia.nocookie.net/mobile-legends/images/7/72/Oracle.png",
    "Thunder Belt": "https://static.wikia.nocookie.net/mobile-legends/images/6/62/Thunder_Belt.png",
    
    # Movement
    "Arcane Boots": "https://static.wikia.nocookie.net/mobile-legends/images/9/9f/Arcane_Boots.png",
    "Demon Boots": "https://static.wikia.nocookie.net/mobile-legends/images/f/f0/Demon_Boots.png",
    "Magic Boots": "https://static.wikia.nocookie.net/mobile-legends/images/c/c7/Magic_Shoes.png",
    "Rapid Boots": "https://static.wikia.nocookie.net/mobile-legends/images/0/09/Rapid_Boots.png",
    "Swift Boots": "https://static.wikia.nocookie.net/mobile-legends/images/2/21/Swift_Boots.png",
    "Tough Boots": "https://static.wikia.nocookie.net/mobile-legends/images/5/50/Tough_Boots.png",
    "Warrior Boots": "https://static.wikia.nocookie.net/mobile-legends/images/3/3f/Warrior_Boots.png",
    "Boots": "https://static.wikia.nocookie.net/mobile-legends/images/b/b1/Boots.png",
    
    # Tier 1
    "Dagger": "https://static.wikia.nocookie.net/mobile-legends/images/d/d5/Dagger.png",
}

conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

updated = 0
for item_name, icon_url in item_icons.items():
    cursor.execute("UPDATE equipment SET icon_url = ? WHERE name = ?", (icon_url, item_name))
    if cursor.rowcount > 0:
        updated += 1

conn.commit()
print(f"✅ Оновлено іконки (Fandom Wiki) для {updated} предметів")

# Перевіряємо результат
cursor.execute("SELECT id, name, icon_url FROM equipment WHERE icon_url LIKE '%wikia%' LIMIT 5")
print("\n🖼️  Приклади (Fandom):")
for row in cursor.fetchall():
    print(f"  {row[0]}. {row[1]}")
    print(f"     {row[2]}")

conn.close()
