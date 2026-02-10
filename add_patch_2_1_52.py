#!/usr/bin/env python3
"""
Скрипт для додавання патча 2.1.52 - Adv. Server
Patch Notes від 17 січня 2026 року
"""
import json

# Створюємо патч 2.1.52
patch_2_1_52 = {
    "version": "2.1.52-adv",
    "release_date": "2026-01-17",
    "game_id": 1,
    "designers_note": "Heroes with major changes in this patch: [Floryn] (↑), [Lukas] (↑), and [Miya] (↑).",
    "battlefield_adjustments": {},
    "equipment_adjustments": {
        "War Axe": {
            "badge": "BUFF",
            "description": "Revamped Aulus returns with the reforged War Axe.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "name": "Attribute",
                    "description": "8% Spell Vamp >> 8% Hybrid Lifesteal"
                }
            ]
        }
    },
    "emblem_adjustments": {},
    "hero_adjustments": {
        "Aamon": {
            "badge": "NERF",
            "description": "Fixed some issues and reduced his damage against high-HP targets.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Fixed an issue where the actual damage and shard count of Aamon's Ultimate did not match the displayed values.<br/>Minimum Damage Per Shard: 45-55 (+12% Total Magic Power) >> 35-45 (+10% Total Magic Power)<br/>Maximum Damage Per Shard: 75-90 (+20% Total Magic Power) >> 70-90 (+20% Total Magic Power)"
                }
            ]
        },
        "Floryn": {
            "badge": "BUFF",
            "description": "Increased the bonus that Equipment [Flower of Hope] grants to teammates.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Flower of Hope: +5% Adaptive Attack >> +8% Adaptive Attack<br/>Flower of Hope Damage: 60 (+ 30% Total Physical Attack) (+ 30% Total Magic Power) >> 60 (+ 4* Hero Level) (+40% Total Physical Attack) (+ 30% Total Magic Power)"
                }
            ]
        },
        "Hanzo": {
            "badge": "NERF",
            "description": "After the buff, Hanzo's Ultimate posed too great a threat to the backline in the mid to late game, so we've reduced its cooldown growth.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 24-12s >> 24-16s"
                }
            ]
        },
        "Leomord": {
            "badge": "BUFF",
            "description": "Reverted some adjustments from the last patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Extra Damage Against Creeps: 180% >> 160%"
                }
            ]
        },
        "Lukas": {
            "badge": "BUFF",
            "description": "Lukas's strength has improved significantly since the last buff, but his laning ability is still slightly weak, especially his HP Regen.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Effect Adjustment: Recover 8% Max HP when hitting a hero >> Recover 8% Max HP when hitting a hero or minion."
                }
            ]
        },
        "Marcel": {
            "badge": "BUFF",
            "description": "Adjusted Marcel's stats in the early and late game.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Clemar's True Damage & Shield: 3-6% Max HP >> 5% Max HP"
                }
            ]
        },
        "Miya": {
            "badge": "BUFF",
            "description": "Further increased Miya's survivability.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 46-26s >> 30-20s"
                }
            ]
        },
        "Obsidia": {
            "badge": "ADJUST",
            "description": "To improve the low pick rate of Obsidia's Attack Speed build, we've increased the growth of Bone Shard speed based on Attack Speed, allowing Attack Speed to boost Bone Shard's performance. Meanwhile, to balance her late-game strength, we've reduced Bone Shard Base Damage.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Bone Shard Speed: 18-22 >> 15-45 (scales with Attack Speed, capped at 5.0)<br/>Bone Shard Speed Growth: Every 10% Attack Speed increases Bone Shard speed by 0.1 >> Every 10% Attack Speed increases Bone Shard speed by 0.75<br/>Bone Shard Damage: 7% Total Physical Attack (inherits 7% Attack Effects) >> 6% Total Physical Attack (inherits 6% Attack Effects)"
                }
            ]
        },
        "Sora": {
            "badge": "NERF",
            "description": "Sora's Crowd Control should be decisive and used at key moments, while his entry capabilities should be frequent and fatal. Therefore, we've adjusted the cooldown of his Ultimate in different forms.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Thunder Form's Cooldown: 24-16s >> 20-14s<br/>Torrent Form's Cooldown: 24-16s >> 32-24s"
                }
            ]
        },
        "Suyou": {
            "badge": "BUFF",
            "description": "Improved the hero's skill casting flexibility in the mid to late game.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 8s at all levels >> 9-7s"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 8s at all levels >> 9-7s"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 8s at all levels >> 9-7s"
                }
            ]
        },
        "Yu Zhong": {
            "badge": "NERF",
            "description": "Slightly reduced his dominance in the early to mid game.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Base Damage per Sha Residue Stack: 30 >> 10"
                }
            ]
        }
    },
    "system_adjustments": [
        {
            "name": "In-Match Features",
            "description": "1- Added an Equipment Pre-Order feature when you have 6 pieces of equipment. You can pre-order a 7th item and select a current item to replace. The Gold cost for the replacement is displayed next to the button. Once pre-ordered, a Quick Buy button will appear on the main screen when you have enough Gold. Tap to replace instantly.<br/>2- You can now instantly replace Boots and Active Equipment on the Equipment screen."
        },
        {
            "name": "Mode Update: Frozen Sea Showdown",
            "description": "1- Hooks will no longer be blocked by allies on your side.<br/>2- Added a new type of Crab: White Speed Crab. Defeating it to gain Black Shoes and Deflection Shield skills.<br/>3- Defeating the original Blue Crab still grants Thunderbolt and Gravity Hammer. Destroy Chests still grants Ale and Mystic Reach.<br/>4- Glacial Chests will now always show their HP bars.<br/>5- In addition to increasing hero size, hook range, and hook size, each stack of Glacial Hook now grants an extra 5% Movement Speed.<br/>6- Reduced Flicker's blink distance by 1 unit. It can no longer be used to cross the river.<br/>7- Reduced hero's Base HP by 25%. Shortened the knockback duration and Control Duration.<br/>8- When either side's score exceeds 25, every score change will trigger a global notification that the match is ending soon."
        }
    ],
    "highlights": [],
    "new_hero": None,
    "revamped_heroes": ["Aulus"],
    "revamped_heroes_data": {
        "Aulus": {
            "description": "Hero Feature: A sustained Fighter who weaves Basic Attacks between skills.<br/><br/>In this revamp design for Aulus, we aim to resolve the following issues and make optimizations:<br/><br/>1- Aulus was too reliant on Basic Attacks and lacked pursuit ability. Therefore, we have added a high-damage movement skill to improve his early-game strength and late-game pursuit ability.<br/><br/>2- Aulus's Ultimate feels disconnected from his other skills. In this revamp, we've given him a brand-new Ultimate to improve his ability to charge into battle and slay enemies.<br/><br/>3- We've added new mechanics to Skill 1 to give it higher potential.",
            "skills": [
                {
                    "name": "Passive - Fighting Spirit",
                    "description": "Each time Aulus casts a skill, he gains an enhanced Basic Attack. This effect can stack up to 3 times."
                },
                {
                    "name": "Skill 1 - Aulus, Charge!",
                    "description": "Aulus increases his Movement Speed for 5s. If Aulus does not perform a Basic Attack or receive high-level control effects within 2s, he gains Control Immunity for the remaining duration."
                },
                {
                    "name": "Skill 2 - The Power of Axe",
                    "description": "Aulus dashes forward and slashes enemies in front, dealing damage. If he hits an enemy, he can cast this skill again."
                },
                {
                    "name": "Ultimate - Undying Fury",
                    "description": "Aulus continuously swings his axe to slash nearby enemies, then into the air and smashes the target direction, dealing massive damage to enemies in a large area. During this skill, Aulus gains Damage Reduction and Movement Speed."
                }
            ]
        }
    }
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
patches_dict["2.1.52-adv"] = patch_2_1_52

# Зберігаємо оновлений файл
with open("patches_data.json", "w", encoding="utf-8") as f:
    json.dump(patches_dict, f, ensure_ascii=False, indent=4)

print(f"\n✅ ПАТЧ 2.1.52 УСПІШНО ДОДАНО!")
print(f"📊 Всього патчів у базі: {len(patches_dict)}")
print(f"📅 Дата релізу: 2026-01-17")
print(f"🎯 Героїв змінено: {len(patch_2_1_52['hero_adjustments'])}")
print(f"⚔️  Екіпіровки змінено: {len(patch_2_1_52['equipment_adjustments'])}")
print(f"🎮 Системні зміни: {len(patch_2_1_52['system_adjustments'])}")
print(f"🔄 Revamped героїв: {len(patch_2_1_52['revamped_heroes'])}")
