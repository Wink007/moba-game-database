#!/usr/bin/env python3
"""
Скрипт для додавання патча 2.1.54 - Adv. Server
Patch Notes від 22 січня 2026 року
"""
import json

# Створюємо патч 2.1.54
patch_2_1_54 = {
    "version": "2.1.54-adv",
    "release_date": "2026-01-22",
    "game_id": 1,
    "designers_note": "In this patch, we are conducting further numerical adjustment tests on some heroes.",
    "battlefield_adjustments": {},
    "equipment_adjustments": {
        "Demon Hunter Sword": {
            "badge": "NERF",
            "description": "Slightly nerfed the equipment's HP recovery potential.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Unique Passive - Devour",
                    "description": "HP Regen: 20 (+ 4* Hero Level) >> 10 (+4* Hero Level)"
                }
            ]
        }
    },
    "emblem_adjustments": {},
    "hero_adjustments": {
        "Floryn": {
            "badge": "BUFF",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Flower of Hope Damage: 60 (+4*Hero Level) (+40% Total Physical Attack) (+ 30% Total Magic Power) >> 120 (+40% Total Physical Attack) (+ 30% Total Magic Power)"
                }
            ]
        },
        "Hanzo": {
            "badge": "BUFF",
            "description": "Reverted some nerfs made from the previous patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 24-16s >> 24-14s"
                }
            ]
        },
        "Lukas": {
            "badge": "NERF",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "HP Regen Upon Hitting Hero/Minion: 8% Max HP >> 6% Max HP"
                }
            ]
        },
        "Sora": {
            "badge": "NERF",
            "description": "Reverted some adjustments made from the previous patch.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Thunder Form's Cooldown: 20-14s >> 24-16s"
                }
            ]
        },
        "Suyou": {
            "badge": "BUFF",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 9-7s >> 8.5-7s"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 9-7s >> 8.5-7s"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 9-7s >> 8.5-7s"
                }
            ]
        },
        "Yu Zhong": {
            "badge": "BUFF",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Base Damage per Sha Residue Stack: 10 >> 20"
                }
            ]
        }
    },
    "system_adjustments": [
        {
            "name": "Hero Adjustments Reverted",
            "description": "Temporarily reverted the adjustments for Revamped Aulus, Saber, Phoveus, Luo Yi, and Obsidia. These adjustments will return to the Advanced Server next week."
        },
        {
            "name": "Hero Adjustments Cancelled",
            "description": "Cancelled the adjustments for Zhuxin, Joy, and Mathilda."
        }
    ],
    "highlights": [],
    "new_hero": None,
    "revamped_heroes": [],
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
patches_dict["2.1.54-adv"] = patch_2_1_54

# Зберігаємо оновлений файл
with open("patches_data.json", "w", encoding="utf-8") as f:
    json.dump(patches_dict, f, ensure_ascii=False, indent=4)

print(f"\n✅ ПАТЧ 2.1.54 УСПІШНО ДОДАНО!")
print(f"📊 Всього патчів у базі: {len(patches_dict)}")
print(f"📅 Дата релізу: 2026-01-22")
print(f"🎯 Героїв змінено: {len(patch_2_1_54['hero_adjustments'])}")
print(f"⚔️  Екіпіровки змінено: {len(patch_2_1_54['equipment_adjustments'])}")
print(f"🎮 Системні зміни: {len(patch_2_1_54['system_adjustments'])}")
