#!/usr/bin/env python3
import sqlite3

# Правильні URL іконок з Liquipedia (без /thumb/)
# Формат: https://liquipedia.net/commons/images/.../Item_Name_ML.png
item_icons = {
    # Attack (Tier 3)
    "Berserker's Fury": "https://liquipedia.net/commons/images/c/c1/Berserker%27s_Fury_ML.png",
    "Blade of Despair": "https://liquipedia.net/commons/images/5/5a/Blade_of_Despair_ML.png",
    "Blade of the Heptaseas": "https://liquipedia.net/commons/images/a/a0/Blade_of_the_Heptaseas_ML.png",
    "Corrosion Scythe": "https://liquipedia.net/commons/images/4/4e/Corrosion_Scythe_ML.png",
    "Demon Hunter Sword": "https://liquipedia.net/commons/images/3/3d/Demon_Hunter_Sword_ML.png",
    "Endless Battle": "https://liquipedia.net/commons/images/8/8f/Endless_Battle_ML.png",
    "Golden Staff": "https://liquipedia.net/commons/images/f/ff/Golden_Staff_ML.png",
    "Great Dragon Spear": "https://liquipedia.net/commons/images/b/b5/Great_Dragon_Spear_ML.png",
    "Haas's Claws": "https://liquipedia.net/commons/images/e/e9/Haas%27s_Claws_ML.png",
    "Hunter Strike": "https://liquipedia.net/commons/images/1/1f/Hunter_Strike_ML.png",
    "Malefic Roar": "https://liquipedia.net/commons/images/9/9f/Malefic_Roar_ML.png",
    "Rose Gold Meteor": "https://liquipedia.net/commons/images/8/88/Rose_Gold_Meteor_ML.png",
    "Sea Halberd": "https://liquipedia.net/commons/images/7/72/Sea_Halberd_ML.png",
    "Sky Piercer": "https://liquipedia.net/commons/images/d/d9/Sky_Piercer_ML.png",
    "War Axe": "https://liquipedia.net/commons/images/2/2d/War_Axe_ML.png",
    "Wind of Nature": "https://liquipedia.net/commons/images/4/44/Wind_of_Nature_ML.png",
    "Windtalker": "https://liquipedia.net/commons/images/1/19/Windtalker_ML.png",
    "Winter Truncheon": "https://liquipedia.net/commons/images/a/a9/Winter_Truncheon_ML.png",
    
    # Attack (Tier 2)
    "Fury Hammer": "https://liquipedia.net/commons/images/5/5c/Fury_Hammer_ML.png",
    "Legion Sword": "https://liquipedia.net/commons/images/a/a4/Legion_Sword_ML.png",
    "Scarlet Blade": "https://liquipedia.net/commons/images/6/6c/Scarlet_Blade_ML.png",
    "Regular Spear": "https://liquipedia.net/commons/images/e/e1/Regular_Spear_ML.png",
    "Rogue Meteor": "https://liquipedia.net/commons/images/2/28/Rogue_Meteor_ML.png",
    "Swift Crossbow": "https://liquipedia.net/commons/images/7/7a/Swift_Crossbow_ML.png",
    
    # Attack (Tier 1)
    "Dagger": "https://liquipedia.net/commons/images/0/0e/Dagger_ML.png",
    "Ogre Tomahawk": "https://liquipedia.net/commons/images/b/b0/Ogre_Tomahawk_ML.png",
    "Iron Hunting Bow": "https://liquipedia.net/commons/images/5/51/Iron_Hunting_Bow_ML.png",
    "Javelin": "https://liquipedia.net/commons/images/2/2f/Javelin_ML.png",
    "Knife": "https://liquipedia.net/commons/images/f/fa/Knife_ML.png",
    "Vampire Mallet": "https://liquipedia.net/commons/images/8/8c/Vampire_Mallet_ML.png",
    "Expert Gloves": "https://liquipedia.net/commons/images/d/d9/Expert_Gloves_ML.png",
    "Power Potion": "https://liquipedia.net/commons/images/7/7a/Power_Potion_ML.png",
    
    # Magic (Tier 3)
    "Blood Wings": "https://liquipedia.net/commons/images/b/b4/Blood_Wings_ML.png",
    "Clock of Destiny": "https://liquipedia.net/commons/images/f/fc/Clock_of_Destiny_ML.png",
    "Concentrated Energy": "https://liquipedia.net/commons/images/5/57/Concentrated_Energy_ML.png",
    "Divine Glaive": "https://liquipedia.net/commons/images/7/7b/Divine_Glaive_ML.png",
    "Enchanted Talisman": "https://liquipedia.net/commons/images/2/2a/Enchanted_Talisman_ML.png",
    "Feather of Heaven": "https://liquipedia.net/commons/images/1/1a/Feather_of_Heaven_ML.png",
    "Flask of the Oasis": "https://liquipedia.net/commons/images/d/df/Flask_of_the_Oasis_ML.png",
    "Ice Queen Wand": "https://liquipedia.net/commons/images/5/5f/Ice_Queen_Wand_ML.png",
    "Lightning Truncheon": "https://liquipedia.net/commons/images/1/14/Lightning_Truncheon_ML.png",
    "Glowing Wand": "https://liquipedia.net/commons/images/8/82/Glowing_Wand_ML.png",
    "Genius Wand": "https://liquipedia.net/commons/images/3/30/Genius_Wand_ML.png",
    "Starlium Scythe": "https://liquipedia.net/commons/images/a/a6/Starlium_Scythe_ML.png",
    "Winter Crown": "https://liquipedia.net/commons/images/9/93/Winter_Crown_ML.png",
    "Necklace Lantern": "https://liquipedia.net/commons/images/e/e3/Necklace_Lantern_ML.png",
    "Holy Crystal": "https://liquipedia.net/commons/images/c/c7/Holy_Crystal_ML.png",
    "Calamity Reaper": "https://liquipedia.net/commons/images/b/bf/Calamity_Reaper_ML.png",
    
    # Magic (Tier 2)
    "Tome of Evil": "https://liquipedia.net/commons/images/8/8a/Tome_of_Evil_ML.png",
    "Exotic Veil": "https://liquipedia.net/commons/images/6/62/Exotic_Veil_ML.png",
    "Mystic Container": "https://liquipedia.net/commons/images/4/4f/Mystic_Container_ML.png",
    "Magic Wand": "https://liquipedia.net/commons/images/c/cf/Magic_Wand_ML.png",
    "Azure Blade": "https://liquipedia.net/commons/images/7/7c/Azure_Blade_ML.png",
    
    # Magic (Tier 1)
    "Book of Sages": "https://liquipedia.net/commons/images/b/b5/Book_of_Sages_ML.png",
    "Mystery Codex": "https://liquipedia.net/commons/images/4/4f/Mystery_Codex_ML.png",
    "Power Crystal": "https://liquipedia.net/commons/images/2/23/Power_Crystal_ML.png",
    "Elegant Gem": "https://liquipedia.net/commons/images/3/38/Elegant_Gem_ML.png",
    "Magic Necklace": "https://liquipedia.net/commons/images/1/1e/Magic_Necklace_ML.png",
    "Lantern of Hope": "https://liquipedia.net/commons/images/0/0d/Lantern_of_Hope_ML.png",
    "Magic Potion": "https://liquipedia.net/commons/images/5/5f/Magic_Potion_ML.png",
    "Flower of Hope": "https://liquipedia.net/commons/images/e/ef/Flower_of_Hope_ML.png",
    
    # Defense (Tier 3)
    "Antique Cuirass": "https://liquipedia.net/commons/images/9/9f/Antique_Cuirass_ML.png",
    "Athena's Shield": "https://liquipedia.net/commons/images/7/7f/Athena%27s_Shield_ML.png",
    "Blade Armor": "https://liquipedia.net/commons/images/a/a7/Blade_Armor_ML.png",
    "Brute Force Breastplate": "https://liquipedia.net/commons/images/4/48/Brute_Force_Breastplate_ML.png",
    "Chastise Pauldron": "https://liquipedia.net/commons/images/6/62/Chastise_Pauldron_ML.png",
    "Cursed Helmet": "https://liquipedia.net/commons/images/c/ce/Cursed_Helmet_ML.png",
    "Dominance Ice": "https://liquipedia.net/commons/images/d/d0/Dominance_Ice_ML.png",
    "Guardian Helmet": "https://liquipedia.net/commons/images/8/88/Guardian_Helmet_ML.png",
    "Immortality": "https://liquipedia.net/commons/images/7/71/Immortality_ML.png",
    "Oracle": "https://liquipedia.net/commons/images/a/af/Oracle_ML.png",
    "Queen's Wings": "https://liquipedia.net/commons/images/2/23/Queen%27s_Wings_ML.png",
    "Radiant Armor": "https://liquipedia.net/commons/images/1/1f/Radiant_Armor_ML.png",
    "Thunder Belt": "https://liquipedia.net/commons/images/e/e0/Thunder_Belt_ML.png",
    "Twilight Armor": "https://liquipedia.net/commons/images/d/d4/Twilight_Armor_ML.png",
    
    # Defense (Tier 2)
    "Black Ice Shield": "https://liquipedia.net/commons/images/f/f4/Black_Ice_Shield_ML.png",
    "Dreadnaught Armor": "https://liquipedia.net/commons/images/6/69/Dreadnaught_Armor_ML.png",
    "Silence Robe": "https://liquipedia.net/commons/images/9/93/Silence_Robe_ML.png",
    "Steel Legplates": "https://liquipedia.net/commons/images/2/26/Steel_Legplates_ML.png",
    
    # Defense (Tier 1)
    "Ares Belt": "https://liquipedia.net/commons/images/7/7d/Ares_Belt_ML.png",
    "Argi Belt": "https://liquipedia.net/commons/images/6/69/Argi_Belt_ML.png",
    "Heavy's Ring": "https://liquipedia.net/commons/images/9/99/Heavy%27s_Ring_ML.png",
    "Healing Necklace": "https://liquipedia.net/commons/images/2/2f/Healing_Necklace_ML.png",
    "Leather Jerkin": "https://liquipedia.net/commons/images/a/a4/Leather_Jerkin_ML.png",
    "Magic Resist Cloak": "https://liquipedia.net/commons/images/1/1f/Magic_Resist_Cloak_ML.png",
    "Vitality Crystal": "https://liquipedia.net/commons/images/f/ff/Vitality_Crystal_ML.png",
    "Rock Potion": "https://liquipedia.net/commons/images/a/a6/Rock_Potion_ML.png",
    
    # Movement
    "Arcane Boots": "https://liquipedia.net/commons/images/3/32/Arcane_Boots_ML.png",
    "Demon Boots": "https://liquipedia.net/commons/images/8/87/Demon_Boots_ML.png",
    "Magic Boots": "https://liquipedia.net/commons/images/f/f4/Magic_Boots_ML.png",
    "Rapid Boots": "https://liquipedia.net/commons/images/6/69/Rapid_Boots_ML.png",
    "Swift Boots": "https://liquipedia.net/commons/images/c/c4/Swift_Boots_ML.png",
    "Tough Boots": "https://liquipedia.net/commons/images/5/57/Tough_Boots_ML.png",
    "Warrior Boots": "https://liquipedia.net/commons/images/a/a3/Warrior_Boots_ML.png",
    "Boots": "https://liquipedia.net/commons/images/b/ba/Boots_ML.png",
    
    # Jungling
    "Bloody Retribution": "https://liquipedia.net/commons/images/d/d8/Bloody_Retribution_ML.png",
    "Flame Retribution": "https://liquipedia.net/commons/images/b/bc/Flame_Retribution_ML.png",
    "Ice Retribution": "https://liquipedia.net/commons/images/6/60/Ice_Retribution_ML.png",
    
    # Roaming
    "Conceal": "https://liquipedia.net/commons/images/4/4b/Conceal_ML.png",
    "Dire Hit": "https://liquipedia.net/commons/images/0/00/Dire_Hit_ML.png",
    "Encourage": "https://liquipedia.net/commons/images/2/20/Encourage_ML.png",
    "Favor": "https://liquipedia.net/commons/images/f/fa/Favor_ML.png",
}

conn = sqlite3.connect('test_games.db')
cursor = conn.cursor()

updated = 0
for item_name, icon_url in item_icons.items():
    cursor.execute("UPDATE equipment SET icon_url = ? WHERE name = ?", (icon_url, item_name))
    if cursor.rowcount > 0:
        updated += 1

conn.commit()
print(f"✅ Оновлено іконки (Liquipedia) для {updated} предметів")

# Перевіряємо
cursor.execute("SELECT COUNT(*) FROM equipment WHERE icon_url IS NOT NULL AND icon_url != ''")
total = cursor.fetchone()[0]
print(f"📊 Всього предметів з іконками: {total}/109")

# Список без іконок
cursor.execute("SELECT name FROM equipment WHERE game_id = 3 AND (icon_url IS NULL OR icon_url = '') ORDER BY name")
missing = cursor.fetchall()
if missing:
    print(f"\n❌ Предмети без іконок ({len(missing)}):")
    for item in missing[:10]:
        print(f"  • {item[0]}")
    if len(missing) > 10:
        print(f"  ... і ще {len(missing) - 10}")

conn.close()
