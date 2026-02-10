#!/usr/bin/env python3
"""
Скрипт для додавання патча 2.1.50 - Adv. Server
Patch Notes від 8 січня 2026 року
"""
import json

# Створюємо патч 2.1.50
patch_2_1_50 = {
    "version": "2.1.50-adv",
    "release_date": "2026-01-08",
    "game_id": 1,
    "designers_note": "Heroes with major changes in this patch: [Leomord] (↑), [Marcel] (↑), and [Saber] (↑).",
    "battlefield_adjustments": {},
    "equipment_adjustments": {},
    "emblem_adjustments": {},
    "hero_adjustments": {
        "Eudora": {
            "badge": "ADJUST",
            "description": "Increased the range of Skill 1 but reduced its damage in the mid to late game. We've also adjusted the damage scaling to ensure Eudora's burst potential in the early to mid game.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Fan Angle: 40° >> 75°<br/>Delayed Damage: 280-530 (+130% Total Magic Power) >> 275-500 (+ 100% Total Magic Power)"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Diffusion Damage: 200-400+ (130% Total Magic Power) >> 330-550 (+110% Total Magic Power)"
                }
            ]
        },
        "Hanzo": {
            "badge": "NERF",
            "description": "Adjusted the Energy Regen provided by Basic Attacks in the Hanekage form.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Basic Attacks against heroes, the Turtle, and the Lord grant 45 Energy >> Basic Attacks against heroes grant 15 Energy. Basic Attacks against the Turtle and the Lord grant 45 Energy."
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
                    "description": "Extra Damage Against Creeps: 150% >> 180%"
                }
            ]
        },
        "Marcel": {
            "badge": "BUFF",
            "description": "Partially reverted the nerfs from the last patch.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Reverted Effect: Grants a nearby allied hero a shield equal to Clemar's True Damage."
                }
            ]
        },
        "Saber": {
            "badge": "BUFF",
            "description": "Reverted Saber's damage capabilities in the early to mid game.",
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Orbiting Sword Damage: 55-105 (+ 30% Extra Physical Attack) >> 75-125 (+25% Extra Physical Attack)<br/>Extra Damage: 160-260 (+60% Extra Physical Attack) >> 200-300 (+50% Extra Physical Attack)<br/>Removed Effect: Extra damage deals 50 extra damage to creeps."
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Base Damage of the First Two Strikes: 120-180 >> 120-220<br/>Base Damage of the Third Strike: 240-360 >> 240-440"
                }
            ]
        }
    },
    "system_adjustments": [
        {
            "name": "Skins Disabled",
            "description": "Due to the ongoing updates to the model, animations, and visual effects of Alucard \"Obsidian Blade\", this skin will be temporarily unavailable on the Advanced Server."
        },
        {
            "name": "Mode Update: Frozen Sea Showdown",
            "description": "1- Increases damage taken when hooked >> Increases damage taken when on the enemy side<br/>2- Fixed an issue where the True Vision granted to the player with the highest Glacial Hook stacks could persist permanently.<br/>3- Dodging hooks could be difficult. Therefore, we've adjusted Franco's Movement Speed boost from 20% to 30% when out of combat.<br/>4- Franco's Ultimate will be replaced with Z-Hook. The hook moves in a Z-shape and cannot be deflected by the Deflection Shield."
        }
    ],
    "highlights": [],
    "new_hero": None,
    "revamped_heroes": ["Eudora"],
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
patches_dict["2.1.50-adv"] = patch_2_1_50

# Зберігаємо оновлений файл
with open("patches_data.json", "w", encoding="utf-8") as f:
    json.dump(patches_dict, f, ensure_ascii=False, indent=4)

print(f"\n✅ ПАТЧ 2.1.50 УСПІШНО ДОДАНО!")
print(f"📊 Всього патчів у базі: {len(patches_dict)}")
print(f"📅 Дата релізу: 2026-01-08")
print(f"🎯 Героїв змінено: {len(patch_2_1_50['hero_adjustments'])}")
print(f"🎮 Системні зміни: {len(patch_2_1_50['system_adjustments'])}")
