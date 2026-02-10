#!/usr/bin/env python3
"""
Скрипт для додавання патча 2.1.58 - Adv. Server
Patch Notes від 5 лютого 2026 року
"""
import json

# Створюємо патч 2.1.58
patch_2_1_58 = {
    "version": "2.1.58-adv",
    "release_date": "2026-02-05",
    "game_id": 1,
    "designers_note": "Heroes with major changes in this patch: [Cyclops] (↑), [Valentina] (↑), and [Yve] (↑)",
    "battlefield_adjustments": {
        "Special Gameplay Test": {
            "badge": "ADJUST",
            "description": "After this week's update, matches in Classic and Ranked modes will continue to drop Chests and Treasure Hunt Coins. However, related events will close early. Unused Treasure Hunt Coins can be used in the next test. We will close the drop event around next Tuesday."
        }
    },
    "equipment_adjustments": {
        "Concentrated Energy": {
            "badge": "BUFF",
            "description": "Slightly increased its Magic Power.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Attribute",
                    "description": "Magic Power: 70 >> 75"
                }
            ]
        },
        "Enchanted Talisman": {
            "badge": "ADJUST",
            "description": "Increased its Magic Power and Price.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Price",
                    "description": "1870 >> 2070"
                },
                {
                    "badge": "BUFF",
                    "name": "Attribute",
                    "description": "Magic Power: 60 >> 75"
                }
            ]
        },
        "Feather of Heaven": {
            "badge": "BUFF",
            "description": "Slightly increased its Magic Power.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Attribute",
                    "description": "Magic Power: 55 >> 60"
                }
            ]
        },
        "Glowing Wand": {
            "badge": "BUFF",
            "description": "Adjusted price to align with the Sea Halberd.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Price",
                    "description": "2150 >> 2050"
                }
            ]
        },
        "Guardian Helmet": {
            "badge": "BUFF",
            "description": "Improved survivability against burst damage.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Unique Passive - Defender",
                    "description": "HP Regen from Excess Damage: 20% >> 30%"
                }
            ]
        },
        "Holy Crystal": {
            "badge": "NERF",
            "description": "The Magic Power provided by this equipment was too high.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Attribute",
                    "description": "Magic Power: 185 >> 165"
                }
            ]
        },
        "Oracle": {
            "badge": "NERF",
            "description": "Slightly reduced the equipment's shield and HP Regen effect.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Unique Passive - Bless",
                    "description": "Increased Shield and HP Regen Effect: 30% >> 25%"
                }
            ]
        },
        "Starlium Scythe": {
            "badge": "BUFF",
            "description": "Slightly increased its Magic Power.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Attribute",
                    "description": "Magic Power: 70 >> 75"
                }
            ]
        },
        "Tome of Evil": {
            "badge": "ADJUST",
            "description": "Adjusted its attributes and build path for smoother Mana Regen growth.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "name": "Attributes",
                    "description": "Magic Power: 35 >> 30<br/>Cooldown Reduction: 8% >> 10%<br/>Mana Regen: 4 >> 2"
                },
                {
                    "badge": "ADJUST",
                    "name": "Build Path",
                    "description": "Mystery Codex + Book of Sages >> Magic Necklace + Book of Sages"
                }
            ]
        }
    },
    "emblem_adjustments": {
        "Fighter Emblem": {
            "badge": "NERF",
            "description": "The Fighter Emblem was too versatile, so we've slightly reduced its Attack.",
            "sections": [
                {
                    "badge": "NERF",
                    "name": "Attribute",
                    "description": "Hybrid Attack: 22 >> 16"
                }
            ]
        },
        "Marksman Emblem": {
            "badge": "ADJUST",
            "description": "To improve the uniqueness of the Marksman Emblem, we've changed the Lifesteal attribute to Adaptive Penetration.",
            "sections": [
                {
                    "badge": "ADJUST",
                    "name": "Attribute",
                    "description": "5% Lifesteal >> 5% Adaptive Penetration"
                }
            ]
        }
    },
    "hero_adjustments": {
        "Aulus": {
            "badge": "BUFF",
            "description": "Reduced his mobility, but increased his damage and control ability.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Enhanced Basic Attack Damage: 85% Total Physical Attack + (3 + 0.4* Hero Level)% >> 85% Total Physical Attack + (4 +0.4* Hero Level)%"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Removed the dash on the second cast. It now applies a 30% slow effect to targets hit for 2s instead."
                }
            ]
        },
        "Claude": {
            "badge": "BUFF",
            "description": "Increased the coefficient for the number of Ultimate hits based on Attack Speed."
        },
        "Cyclops": {
            "badge": "BUFF",
            "description": "Reverted some nerfs from the previous patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Magic Bonus: 50% >> 55%"
                }
            ]
        },
        "Eudora": {
            "badge": "BUFF",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 70-95 >> 65-90"
                }
            ]
        },
        "Faramis": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 70-120 >> 85-135"
                }
            ]
        },
        "Gloo": {
            "badge": "NERF",
            "description": "Gloo was exceptionally durable given his high damage, making him frustrating to play against.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Damage Reduction per Stack: 4% >> 3%"
                }
            ]
        },
        "Gord": {
            "badge": "NERF",
            "description": "We have slightly reduced its damage following the Skill 1 cooldown reduction in the previous patch.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Damage: 270-495 (+ Total 80% Magic Power) >> 225-425 (+ 65% Total Magic Power)"
                }
            ]
        },
        "Ixia": {
            "badge": "NERF",
            "description": "Ixia's laning ability was too strong, so we've reduced the Base Damage of Skill 1 in the early to mid game and reduced the HP Regen from her Passive when hitting non-hero units.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "HP Regen Against Non-Hero Units: 20 (+150* Lifesteal)% >> 10 (+150* Lifesteal)%"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Base Damage: 75-300 >> 50-300"
                }
            ]
        },
        "Novaria": {
            "badge": "NERF",
            "description": "Reverted some buffs from the previous patch.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Damage: 230-405 (+ 100% Total Magic Power) (+4% Target's Max HP) >> 230-380 (+ 90% Total Magic Power) (+4% Target's Max HP)<br/>Mana Cost: 50-90 >> 60-110"
                }
            ]
        },
        "Obsidia": {
            "badge": "ADJUST",
            "description": "Obsidia's Attack Speed build was performing below expectations. We have increased the damage of her Basic Attack Effects, while reducing her Base Damage for balance.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Ratio of Attack Effects Inherited: 70% >> 100%<br/>Basic Attack Base Damage: 80 >> 70"
                }
            ]
        },
        "Odette": {
            "badge": "NERF",
            "description": "Reverted some buffs from the previous patch.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "175 >> 165"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Base Shield: 1400-1800 >> 1200-1800"
                }
            ]
        },
        "Pharsa": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 60-90 >> 65-90"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 50-80 >> 60-85"
                }
            ]
        },
        "Ruby": {
            "badge": "BUFF",
            "description": "As a Fighter, Ruby was too Gold-dependent. We've increased her early-to-mid game damage while reducing her Physical Bonus to help her return to the Exp Lane.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Damage: 90 (+70%-130% Total Physical Attack) >> 120-245 (+90% Total Physical Attack)"
                }
            ]
        },
        "Selena": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 60-85 >> 70-95"
                }
            ]
        },
        "Vale": {
            "badge": "NERF",
            "description": "Following the Ultimate cooldown reduction in the previous patch, we slightly reduced his damage and adjusted the Mana Cost.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 60-85 >> 60-80"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Base Damage: 1000-1500 >> 900-1400<br/>Mana Cost: 140-180 >> 135-165"
                }
            ]
        },
        "Valentina": {
            "badge": "BUFF",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 45-70 >> 40-60"
                }
            ]
        },
        "Valir": {
            "badge": "NERF",
            "description": "Reverted some buffs from the previous patch.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2440 >> 2380"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "165 >> 155"
                }
            ]
        },
        "Vexana": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 80-130 >> 85-135"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 60-90 >> 60-100"
                }
            ]
        },
        "Xavier": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 30-55 >> 45-70"
                }
            ]
        },
        "Yve": {
            "badge": "BUFF",
            "description": "Reverted some nerfs from the previous patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 3.5-2.5s >> 3-1.5s"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Optimized the camera zoom-out effect during the Ultimate.<br/>Enlarged the Kill Notifications on the left during the Ultimate without blocking the Surrender button."
                }
            ]
        },
        "Zhask": {
            "badge": "NERF",
            "description": "Reverted some buffs from the previous patch and adjusted his Mana Cost.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 60-90 >> 80-110"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 3",
                    "skill_type": "Skill 3",
                    "description": "Mana Cost: 60-120 >> 60-105"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 45-35s >> 48-40s<br/>Mana Cost: 100-200 >> 120-180"
                }
            ]
        },
        "Zhuxin": {
            "badge": "BUFF",
            "description": "Reverted some nerfs from the previous patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Base Damage When Hold: 35-70 >> 35-80"
                }
            ]
        }
    },
    "system_adjustments": [
        {
            "name": "Mode Update: Tide Siege",
            "description": "To help you better complete tasks, we are opening Endless Mode early this week. We will add more Bosses, monster mechanics, affixes, and available heroes in the future.<br/><br/><strong>Update Content:</strong><br/><br/><strong>[Karrie]</strong><br/>The Ultimate has been changed from Quadruple Wield to Double Wield, with increased damage for each lightwheel.<br/>Reduced the Passive's damage scaling based on Attack and Level, but increased the damage cap.<br/><br/><strong>[Molten Dragon]</strong> Elite monster will have an extra skill:<br/>Summons a fire trap at the target location that explodes after a short delay, dealing damage to and stunning enemies in the area.<br/><br/>As the final Boss of Standard Mode, <strong>[Pharsa]</strong> will have an extra skill.<br/>After every 2 Basic Attacks, Pharsa releases 8 Feathered Air Strikes around herself, dealing damage to enemies within range.<br/><br/><strong>Other Adjustments:</strong><br/>1- Added a 1.2s protection duration when selecting buffs to prevent accidental selection.<br/>2- Changed the Shop potion effects. You can now choose an attribute enhancement upon purchase. Price adjusted to 2500.<br/>3- Adjusted the values of some buffs.<br/>4- Reduced Attack Speed provided by some Physical Equipment and increased other attributes.<br/>5- Thunder Belt Hybrid Defense Increase per Stack: 0.05 >> 0.1<br/>6- Adjusted basic attack and skill damage of some minions and bosses.<br/>7- Increased the HP of the third and subsequent creeps.<br/>8- Optimized minions' aggro logic. Minions will now prioritize attacking the nearest enemy (including heroes and buildings).<br/>9- Added Regen effect around the Base, which restores HP and Mana over time."
        }
    ],
    "highlights": [],
    "new_hero": None,
    "revamped_heroes": ["Aulus"],
    "revamped_heroes_data": {}
}

# Завантажуємо існуючі патчі
try:
    with open("patches_data.json", "r", encoding="utf-8") as f:
        patches_dict = json.load(f)
    print(f"📖 Завантажено {len(patches_dict)} існуючих патчів")
except FileNotFoundError:
    patches_dict = {}
    print("📝 Створюється новий файл patches_data.json")

# Додаємо новий патч
patches_dict["2.1.58-adv"] = patch_2_1_58

# Зберігаємо оновлений файл
with open("patches_data.json", "w", encoding="utf-8") as f:
    json.dump(patches_dict, f, ensure_ascii=False, indent=4)

print(f"\n✅ ПАТЧ 2.1.58 УСПІШНО ДОДАНО!")
print(f"📊 Всього патчів у базі: {len(patches_dict)}")
print(f"📅 Дата релізу: 2026-02-05")
print(f"🎯 Героїв змінено: {len(patch_2_1_58['hero_adjustments'])}")
print(f"⚔️  Екіпіровки змінено: {len(patch_2_1_58['equipment_adjustments'])}")
print(f"🎖️  Емблем змінено: {len(patch_2_1_58['emblem_adjustments'])}")
print(f"🎮 Системні зміни: {len(patch_2_1_58['system_adjustments'])}")
