#!/usr/bin/env python3
import sqlite3

# Маппінг іконок з Liquipedia для всіх предметів
# Формат: https://liquipedia.net/commons/images/thumb/...
item_icons = {
    # Attack
    "Berserker's Fury": "https://liquipedia.net/commons/images/thumb/c/c1/Berserker%27s_Fury_ML.png/60px-Berserker%27s_Fury_ML.png",
    "Blade of Despair": "https://liquipedia.net/commons/images/thumb/5/5a/Blade_of_Despair_ML.png/60px-Blade_of_Despair_ML.png",
    "Blade of the Heptaseas": "https://liquipedia.net/commons/images/thumb/a/a0/Blade_of_the_Heptaseas_ML.png/60px-Blade_of_the_Heptaseas_ML.png",
    "Corrosion Scythe": "https://liquipedia.net/commons/images/thumb/4/4e/Corrosion_Scythe_ML.png/60px-Corrosion_Scythe_ML.png",
    "Demon Hunter Sword": "https://liquipedia.net/commons/images/thumb/3/3d/Demon_Hunter_Sword_ML.png/60px-Demon_Hunter_Sword_ML.png",
    "Endless Battle": "https://liquipedia.net/commons/images/thumb/8/8f/Endless_Battle_ML.png/60px-Endless_Battle_ML.png",
    "Golden Staff": "https://liquipedia.net/commons/images/thumb/f/ff/Golden_Staff_ML.png/60px-Golden_Staff_ML.png",
    "Great Dragon Spear": "https://liquipedia.net/commons/images/thumb/b/b5/Great_Dragon_Spear_ML.png/60px-Great_Dragon_Spear_ML.png",
    "Haas's Claws": "https://liquipedia.net/commons/images/thumb/e/e9/Haas%27s_Claws_ML.png/60px-Haas%27s_Claws_ML.png",
    "Hunter Strike": "https://liquipedia.net/commons/images/thumb/1/1f/Hunter_Strike_ML.png/60px-Hunter_Strike_ML.png",
    "Malefic Gun": "https://liquipedia.net/commons/images/thumb/2/2e/Malefic_Gun_ML.png/60px-Malefic_Gun_ML.png",
    "Malefic Roar": "https://liquipedia.net/commons/images/thumb/9/9f/Malefic_Roar_ML.png/60px-Malefic_Roar_ML.png",
    "Rose Gold Meteor": "https://liquipedia.net/commons/images/thumb/8/88/Rose_Gold_Meteor_ML.png/60px-Rose_Gold_Meteor_ML.png",
    "Sea Halberd": "https://liquipedia.net/commons/images/thumb/7/72/Sea_Halberd_ML.png/60px-Sea_Halberd_ML.png",
    "Sky Piercer": "https://liquipedia.net/commons/images/thumb/d/d9/Sky_Piercer_ML.png/60px-Sky_Piercer_ML.png",
    "War Axe": "https://liquipedia.net/commons/images/thumb/2/2d/War_Axe_ML.png/60px-War_Axe_ML.png",
    "Wind of Nature": "https://liquipedia.net/commons/images/thumb/4/44/Wind_of_Nature_ML.png/60px-Wind_of_Nature_ML.png",
    "Windtalker": "https://liquipedia.net/commons/images/thumb/1/19/Windtalker_ML.png/60px-Windtalker_ML.png",
    "Winter Truncheon": "https://liquipedia.net/commons/images/thumb/a/a9/Winter_Truncheon_ML.png/60px-Winter_Truncheon_ML.png",
    
    # Tier 2 Attack
    "Fury Hammer": "https://liquipedia.net/commons/images/thumb/5/5c/Fury_Hammer_ML.png/60px-Fury_Hammer_ML.png",
    "Legion Sword": "https://liquipedia.net/commons/images/thumb/a/a4/Legion_Sword_ML.png/60px-Legion_Sword_ML.png",
    "Scarlet Blade": "https://liquipedia.net/commons/images/thumb/6/6c/Scarlet_Blade_ML.png/60px-Scarlet_Blade_ML.png",
    "Regular Spear": "https://liquipedia.net/commons/images/thumb/e/e1/Regular_Spear_ML.png/60px-Regular_Spear_ML.png",
    "Rogue Meteor": "https://liquipedia.net/commons/images/thumb/2/28/Rogue_Meteor_ML.png/60px-Rogue_Meteor_ML.png",
    "Swift Crossbow": "https://liquipedia.net/commons/images/thumb/7/7a/Swift_Crossbow_ML.png/60px-Swift_Crossbow_ML.png",
    
    # Tier 1 Attack
    "Dagger": "https://liquipedia.net/commons/images/thumb/0/0e/Dagger_ML.png/60px-Dagger_ML.png",
    "Ogre Tomahawk": "https://liquipedia.net/commons/images/thumb/b/b0/Ogre_Tomahawk_ML.png/60px-Ogre_Tomahawk_ML.png",
    "Iron Hunting Bow": "https://liquipedia.net/commons/images/thumb/5/51/Iron_Hunting_Bow_ML.png/60px-Iron_Hunting_Bow_ML.png",
    "Javelin": "https://liquipedia.net/commons/images/thumb/2/2f/Javelin_ML.png/60px-Javelin_ML.png",
    "Knife": "https://liquipedia.net/commons/images/thumb/f/fa/Knife_ML.png/60px-Knife_ML.png",
    "Vampire Mallet": "https://liquipedia.net/commons/images/thumb/8/8c/Vampire_Mallet_ML.png/60px-Vampire_Mallet_ML.png",
    "Expert Gloves": "https://liquipedia.net/commons/images/thumb/d/d9/Expert_Gloves_ML.png/60px-Expert_Gloves_ML.png",
    
    # Magic
    "Blood Wings": "https://liquipedia.net/commons/images/thumb/b/b4/Blood_Wings_ML.png/60px-Blood_Wings_ML.png",
    "Clock of Destiny": "https://liquipedia.net/commons/images/thumb/f/fc/Clock_of_Destiny_ML.png/60px-Clock_of_Destiny_ML.png",
    "Concentrated Energy": "https://liquipedia.net/commons/images/thumb/5/57/Concentrated_Energy_ML.png/60px-Concentrated_Energy_ML.png",
    "Divine Glaive": "https://liquipedia.net/commons/images/thumb/7/7b/Divine_Glaive_ML.png/60px-Divine_Glaive_ML.png",
    "Enchanted Talisman": "https://liquipedia.net/commons/images/thumb/2/2a/Enchanted_Talisman_ML.png/60px-Enchanted_Talisman_ML.png",
    "Feather of Heaven": "https://liquipedia.net/commons/images/thumb/1/1a/Feather_of_Heaven_ML.png/60px-Feather_of_Heaven_ML.png",
    "Flask of the Oasis": "https://liquipedia.net/commons/images/thumb/d/df/Flask_of_the_Oasis_ML.png/60px-Flask_of_the_Oasis_ML.png",
    "Ice Queen Wand": "https://liquipedia.net/commons/images/thumb/5/5f/Ice_Queen_Wand_ML.png/60px-Ice_Queen_Wand_ML.png",
    "Lightning Truncheon": "https://liquipedia.net/commons/images/thumb/1/14/Lightning_Truncheon_ML.png/60px-Lightning_Truncheon_ML.png",
    "Glowing Wand": "https://liquipedia.net/commons/images/thumb/8/82/Glowing_Wand_ML.png/60px-Glowing_Wand_ML.png",
    "Genius Wand": "https://liquipedia.net/commons/images/thumb/3/30/Genius_Wand_ML.png/60px-Genius_Wand_ML.png",
    "Starlium Scythe": "https://liquipedia.net/commons/images/thumb/a/a6/Starlium_Scythe_ML.png/60px-Starlium_Scythe_ML.png",
    "Winter Crown": "https://liquipedia.net/commons/images/thumb/9/93/Winter_Crown_ML.png/60px-Winter_Crown_ML.png",
    "Necklace Lantern": "https://liquipedia.net/commons/images/thumb/e/e3/Necklace_Lantern_ML.png/60px-Necklace_Lantern_ML.png",
    "Wishing Lantern": "https://liquipedia.net/commons/images/thumb/e/e3/Necklace_Lantern_ML.png/60px-Necklace_Lantern_ML.png",
    "Azure Blade": "https://liquipedia.net/commons/images/thumb/7/7c/Azure_Blade_ML.png/60px-Azure_Blade_ML.png",
    "Calamity Reaper": "https://liquipedia.net/commons/images/thumb/b/bf/Calamity_Reaper_ML.png/60px-Calamity_Reaper_ML.png",
    "Holy Crystal": "https://liquipedia.net/commons/images/thumb/c/c7/Holy_Crystal_ML.png/60px-Holy_Crystal_ML.png",
    
    # Defense
    "Antique Cuirass": "https://liquipedia.net/commons/images/thumb/9/9f/Antique_Cuirass_ML.png/60px-Antique_Cuirass_ML.png",
    "Athena's Shield": "https://liquipedia.net/commons/images/thumb/7/7f/Athena%27s_Shield_ML.png/60px-Athena%27s_Shield_ML.png",
    "Blade Armor": "https://liquipedia.net/commons/images/thumb/a/a7/Blade_Armor_ML.png/60px-Blade_Armor_ML.png",
    "Brute Force Breastplate": "https://liquipedia.net/commons/images/thumb/4/48/Brute_Force_Breastplate_ML.png/60px-Brute_Force_Breastplate_ML.png",
    "Chastise Pauldron": "https://liquipedia.net/commons/images/thumb/6/62/Chastise_Pauldron_ML.png/60px-Chastise_Pauldron_ML.png",
    "Cursed Helmet": "https://liquipedia.net/commons/images/thumb/c/ce/Cursed_Helmet_ML.png/60px-Cursed_Helmet_ML.png",
    "Dominance Ice": "https://liquipedia.net/commons/images/thumb/d/d0/Dominance_Ice_ML.png/60px-Dominance_Ice_ML.png",
    "Guardian Helmet": "https://liquipedia.net/commons/images/thumb/8/88/Guardian_Helmet_ML.png/60px-Guardian_Helmet_ML.png",
    "Immortality": "https://liquipedia.net/commons/images/thumb/7/71/Immortality_ML.png/60px-Immortality_ML.png",
    "Oracle": "https://liquipedia.net/commons/images/thumb/a/af/Oracle_ML.png/60px-Oracle_ML.png",
    "Queen's Wings": "https://liquipedia.net/commons/images/thumb/2/23/Queen%27s_Wings_ML.png/60px-Queen%27s_Wings_ML.png",
    "Radiant Armor": "https://liquipedia.net/commons/images/thumb/1/1f/Radiant_Armor_ML.png/60px-Radiant_Armor_ML.png",
    "Thunder Belt": "https://liquipedia.net/commons/images/thumb/e/e0/Thunder_Belt_ML.png/60px-Thunder_Belt_ML.png",
    "Twilight Armor": "https://liquipedia.net/commons/images/thumb/d/d4/Twilight_Armor_ML.png/60px-Twilight_Armor_ML.png",
    "Ares Belt": "https://liquipedia.net/commons/images/thumb/7/7d/Ares_Belt_ML.png/60px-Ares_Belt_ML.png",
    
    # Movement
    "Arcane Boots": "https://liquipedia.net/commons/images/thumb/3/32/Arcane_Boots_ML.png/60px-Arcane_Boots_ML.png",
    "Demon Boots": "https://liquipedia.net/commons/images/thumb/8/87/Demon_Boots_ML.png/60px-Demon_Boots_ML.png",
    "Magic Boots": "https://liquipedia.net/commons/images/thumb/f/f4/Magic_Boots_ML.png/60px-Magic_Boots_ML.png",
    "Rapid Boots": "https://liquipedia.net/commons/images/thumb/6/69/Rapid_Boots_ML.png/60px-Rapid_Boots_ML.png",
    "Swift Boots": "https://liquipedia.net/commons/images/thumb/c/c4/Swift_Boots_ML.png/60px-Swift_Boots_ML.png",
    "Tough Boots": "https://liquipedia.net/commons/images/thumb/5/57/Tough_Boots_ML.png/60px-Tough_Boots_ML.png",
    "Warrior Boots": "https://liquipedia.net/commons/images/thumb/a/a3/Warrior_Boots_ML.png/60px-Warrior_Boots_ML.png",
    "Boots": "https://liquipedia.net/commons/images/thumb/b/ba/Boots_ML.png/60px-Boots_ML.png",
}

conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

updated = 0
for item_name, icon_url in item_icons.items():
    cursor.execute("UPDATE equipment SET icon_url = ? WHERE name = ?", (icon_url, item_name))
    if cursor.rowcount > 0:
        updated += 1

conn.commit()
print(f"✅ Оновлено іконки для {updated} предметів")

# Перевіряємо результат
cursor.execute("SELECT COUNT(*) FROM equipment WHERE icon_url IS NOT NULL AND icon_url != ''")
result = cursor.fetchone()
print(f"📊 Всього предметів з іконками: {result[0]}/109")

# Показуємо приклади
cursor.execute("SELECT name, icon_url FROM equipment WHERE icon_url IS NOT NULL AND icon_url != '' LIMIT 5")
print("\n🖼️  Приклади:")
for row in cursor.fetchall():
    print(f"  • {row[0]}: {row[1][:50]}...")

conn.close()
