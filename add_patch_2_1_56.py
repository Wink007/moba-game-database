#!/usr/bin/env python3
"""
Скрипт для додавання патча 2.1.56 - Adv. Server
Patch Notes від 30 січня 2026 року
"""
import json

# Створюємо патч 2.1.56
patch_2_1_56 = {
    "version": "2.1.56 (Adv. Server)",
    "release_date": "2026-01-30",
    "game_id": 1,
    "designers_note": "In this patch, we have adjusted the attributes and Mana Costs of most Mid Lane Mages to bring them closer to the average level. We have also made specific adjustments to certain strong and weak Mages. We hope to see more heroes picked in the Mid Lane.",
    "battlefield_adjustments": {
        "Ranged Minion": {
            "badge": "NERF",
            "description": "Base HP: 1288 >> 1188"
        }
    },
    "equipment_adjustments": {
        "Dominance Ice": {
            "badge": "ADJUST",
            "description": "Increased the range of the equipment's Healing Reduction effect, and reduced the Hybrid Defense range to match it.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Unique Passive - Fortress Shield",
                    "description": "Trigger Range: 5 units >> 3.5 units"
                },
                {
                    "badge": "BUFF",
                    "name": "Unique Passive - Lifebane",
                    "description": "Reduces attacker's HP Regen when taking damage >> Reduces HP Regen of enemies within 3.5 units"
                }
            ]
        },
        "Enchanted Talisman": {
            "badge": "ADJUST",
            "description": "After equipping 10% Cooldown Reduction from Talents, purchasing Enchanted Talisman often leads to a 5% excess in Cooldown Reduction. Therefore, the Cooldown Reduction has been reduced and replaced with equivalent Magic Power and Max HP.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "name": "Attributes",
                    "description": "Magic Power: 50 >> 60<br/>Max HP: 250 >> 300<br/>Cooldown Reduction: 20% >> 15%"
                }
            ]
        },
        "Glowing Wand": {
            "badge": "ADJUST",
            "description": "Slightly increased Magic Power and reduced HP.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "name": "Attributes",
                    "description": "Magic Power: 50 >> 60<br/>Max HP: 400 >> 300"
                }
            ]
        },
        "Ice Queen Wand": {
            "badge": "ADJUST",
            "description": "Increased control effects and reduced Magic Power.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "name": "Attribute",
                    "description": "Magic Power: 75 >> 60"
                },
                {
                    "badge": "BUFF",
                    "name": "Unique Passive - Ice Bound",
                    "description": "Internal Cooldown per Stack: 1s >> 0.4s"
                }
            ]
        }
    },
    "emblem_adjustments": {},
    "hero_adjustments": {
        "Aulus": {
            "badge": "BUFF",
            "description": "Revamped the trigger condition for enhanced Basic Attacks and optimized the controls of the Ultimate.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Fighting Spirit",
                    "skill_type": "Passive",
                    "description": "Revamped: Aulus adds a stack of [C7Fighting Spirit] to his axe every second after dealing damage to any unit. Each stack will increase his Attack Speed. Last for 4s, up to 6 stacks. His Basic Attacks are enhanced at max [C7Fighting Spirit] stacks."
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "New Effect: Starts to gain Fighting Spirit stacks upon cast. The stacks apply to both his Passive and War Axe (if equipped)."
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Removed HP Regen effect on the 2nd cast."
                },
                {
                    "badge": "BUFF",
                    "skill_name": "The Power of Axe",
                    "skill_type": "Ultimate",
                    "description": "Movement Speed Boost: Continuous 20% Movement Speed boost >> Brief burst Movement Speed boost when swinging the axe.<br/>Greatly reduced the foreswing of the final hit."
                }
            ]
        },
        "Aurora": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have reduced the cooldown of Skill 2.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 6-4s >> 6-4.5s<br/>Mana Cost: 45-70 >> 60-85"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 14-11s >> 12-9s"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Mana Cost: 120-160 >> 140-180"
                }
            ]
        },
        "Cecilion": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2335 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "18 >> 17"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Movement Speed",
                    "description": "255 >> 250"
                }
            ]
        },
        "Chang'e": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes and Mana Cost adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2380 >> 2320"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "145.5 >> 145"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "16 >> 17"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.7 >> 4"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Movement Speed",
                    "description": "250 >> 240"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 70-95 >> 60-85"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 60-110 >> 60 at all levels"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Mana Cost: 150-250 >> 120-160"
                }
            ]
        },
        "Claude": {
            "badge": "ADJUST",
            "description": "Fixed some issues and adjusted the damage structure of the Ultimate.",
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Fixed an issue where the number of hits would be missing at certain Attack Speeds. The number of hits of the Ultimate now scales with Attack Speed.<br/>Attack Effect: 50% >> 40%"
                }
            ]
        },
        "Cyclops": {
            "badge": "ADJUST",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have reduced Skill 1's cooldown and damage, and adjusted Skill 2's damage scaling ratio across the early and late game.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2400 >> 2440"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "175.1 >> 175"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.2 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 8.5s >> 7.5s<br/>Base Damage: 275-400 >> 240-400"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Decay Ratio: 60%-90% of original damage >> 60%-80% of original damage<br/>Magic Bonus: 40% >> 50%"
                }
            ]
        },
        "Eudora": {
            "badge": "NERF",
            "description": "Adjusted the hero to align with Mage Attributes and Mana Cost adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2403 >> 2440"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "173 >> 175"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "19 >> 18"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.2 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 50-70 >> 70-95"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 70-95 >> 80-105"
                }
            ]
        },
        "Faramis": {
            "badge": "ADJUST",
            "description": "To align with the adjustments to Mage attributes and Mana Costs, we've adjusted the Ultimate's early and late game cooldown.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2422 >> 2500"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "181 >> 185"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.2 >> 4.5"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Movement Speed",
                    "description": "245 >> 240"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 45-70 >> 60-90"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 80s at all levels >> 90-70s"
                }
            ]
        },
        "Gord": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have adjusted the damage distribution and reduced the cooldown of Skill 1.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2357 >> 2380"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "142.5 >> 145"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "13 >> 17"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Movement Speed",
                    "description": "240 >> 250"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Damage: 140 (+ 60% Total Magic Power) >> 140 + (8* Hero Level) (+40% Total Magic Power)"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 10-7.5s >> 8-6s<br/>Mana Cost: 90-115 >> 80-110"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Damage: 30-80 (+14% Total Magic Power) >> 30-60 (+10% Total Magic Power)<br/>Mana Cost: 60-85 >> 60-90"
                }
            ]
        },
        "Kadita": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2370 >> 2440"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "169.7 >> 165"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Movement Speed",
                    "description": "255 >> 250"
                }
            ]
        },
        "Kagura": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have adjusted the damage distribution and reduced the cooldown of the Ultimate.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2375 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "146.8 >> 145"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "19 >> 18"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.9 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Base Damage: 315-590 >> 365-590<br/>Mana Cost: 50-80 >> 45-70"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate (Holding Umbrella)",
                    "skill_type": "Ultimate",
                    "description": "Base Damage: 330-470 >> 280-470<br/>Cooldown: 43-33s >> 36-30s<br/>Mana Cost: 85-115 >> 60-90"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Ultimate (Without Umbrella)",
                    "skill_type": "Ultimate",
                    "description": "1st Damage (Base Damage): 290-390 >> 260-390<br/>2nd Damage (Base Damage): 550-800 >> 530-800<br/>Cooldown: 43-33s >> 36-30s<br/>Mana Cost: 85-115 >> 60-90"
                }
            ]
        },
        "Kimmy": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2450 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "117.5 >> 145"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "22 >> 17"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.3 >> 4"
                }
            ]
        },
        "Lukas": {
            "badge": "NERF",
            "description": "Reverted some of the previous adjustments.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Effect Adjustment: Recover 6% Max HP when hitting a hero or minion >> Recover 5% Max HP when hitting a hero or minion."
                }
            ]
        },
        "Lunox": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2621 >> 2440"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "151 >> 165"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "15 >> 18"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.6 >> 4"
                }
            ]
        },
        "Luo Yi": {
            "badge": "ADJUST",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have adjusted the damage distribution.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2480 >> 2440"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "195 >> 175"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Base Physical Defense",
                    "description": "20 >> 18"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.3 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Base Damage: 365 (+ 20* Hero Level) >> 300 (+ 25* Hero Level)"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Base Damage: 210-510 >> 285-510<br/>Mana Cost: 50-90 >> 50-80"
                }
            ]
        },
        "Lylia": {
            "badge": "BUFF",
            "description": "Adjusted the hero to align with Mage Attributes and Mana Cost adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "147 >> 145"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 50-75 >> 40-70"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 32-72 >> 30-60"
                }
            ]
        },
        "Marcel": {
            "badge": "BUFF",
            "description": "We've noticed a significant gap between Marcel's early and late game strength. Therefore, we've balanced some of his base attributes.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2650 >> 2740"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Control Duration: 0.3s >> 0.5s"
                }
            ]
        },
        "Nana": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have increased Skill 2's damage and cast frequency in the late game.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "142.5 >> 155"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.9 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 5.5-4s >> 6-4.5s<br/>Mana Cost: 50-75 >> 55-80"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 14.5-12s >> 12-9s<br/>Damage: 150-275 (+ 30% Total Magic Power) >> 250-375 (+50% Total Magic Power)<br/>Magic Defense Reduction: 30%-40% >> 30% at all levels"
                }
            ]
        },
        "Novaria": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have increased the slow effect of Skill 1 and the late-game damage of Skill 2.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2280 >> 2260"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "143 >> 135"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "12 >> 15"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.6 >> 3.5"
                }
            ],
            "adjustments": [
                {
                    "badge": "ADJUST",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Slow Effect: 20% (base) / 50% (explosion) >> 20%-50% (increases over time)<br/>Explosion Damage Based on Target's Max HP: 4%-6% >> 4% at all levels<br/>Mana Cost: 60-110 >> 60-100"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Damage: 230-340 (+ 70% Total Magic Power) (+4%-6% of target's Max HP) >> 230-405 (+ 100% Total Magic Power) (+ 4% of target's Max HP)<br/>Mana Cost: 100-200 >> 50-90"
                }
            ]
        },
        "Obsidia": {
            "badge": "ADJUST",
            "description": "To improve Obsidia's performance with Attack Speed builds, we have optimized her recommended Equipment."
        },
        "Odette": {
            "badge": "BUFF",
            "description": "Adjusted the hero to align with Mage Attributes and Mana Cost adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2370 >> 2440"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "154.7 >> 175"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Movement Speed",
                    "description": "240 >> 250"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 80-105 >> 70-100"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 90-115 >> 90-120"
                }
            ]
        },
        "Pharsa": {
            "badge": "NERF",
            "description": "To align with the adjustments to Mage attributes, we have increased the cooldown of Skill 2 and reduced her burst potential in the early and mid game.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2300 >> 2320"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "143.5 >> 145"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "17 >> 16"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 5s at all levels >> 6.5-5s<br/>Base Damage: 525-700 >> 475-700"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Base Damage: 570-870 >> 530-870"
                }
            ]
        },
        "Selena": {
            "badge": "NERF",
            "description": "Adjusted the hero to align with Mage Mana Cost adjustments.",
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Mana Cost: 50-75 >> 60-85"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 80-120 >> 80-130"
                }
            ]
        },
        "Vale": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Costs, we've increased the early-game cooldown of Skill 2 and reduced the Ultimate's cooldown.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2280 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "145.5 >> 145"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "15 >> 17"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 10-8s >> 12-8s<br/>Mana Cost: 90-115 >> 75-100"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 44-36s >> 36-30s<br/>Mana Cost: 150-250 >> 140-180"
                }
            ]
        },
        "Valentina": {
            "badge": "ADJUST",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have adjusted the damage distribution.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2580 >> 2500"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "200 >> 185"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Base Physical Defense",
                    "description": "21 >> 20"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.3 >> 4.5"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Damage: 300-600 (+165% Total Magic Power) >> 475-700 (+145% Total Magic Power)"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Base Damage: 125-225 >> 90-180"
                }
            ]
        },
        "Valir": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have reduced Skill 1 cooldown in the mid and late game.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2395 >> 2440"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "155 >> 165"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Base Physical Defense",
                    "description": "20 >> 18"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Movement Speed",
                    "description": "245 >> 250"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Recharge Interval: 9s at all levels >> 9-7s<br/>Mana Cost: 50-90 >> 40-65"
                },
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Mana Cost: 80-110 >> 75-100"
                }
            ]
        },
        "Vexana": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes, we have reduced the Ultimate cooldown.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2360 >> 2380"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "HP Growth",
                    "description": "150 >> 155"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.2 >> 4"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Movement Speed",
                    "description": "245 >> 250"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 60-46s >> 50-40s"
                }
            ]
        },
        "Xavier": {
            "badge": "NERF",
            "description": "To align with the adjustments to Mage attributes, we have reduced the late-game cooldown of Skill 2.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2495 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "155 >> 155"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "15 >> 17"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.1 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 13s at all levels >> 13-11s"
                }
            ]
        },
        "Yve": {
            "badge": "NERF",
            "description": "To align with the adjustments to Mage attributes, we've increased Skill 1's cooldown and reduced the slow effect.",
            "attribute_adjustments": [
                {
                    "badge": "NERF",
                    "attribute_name": "Base HP",
                    "description": "2530 >> 2320"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "HP Growth",
                    "description": "185 >> 145"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Base Physical Defense",
                    "description": "19 >> 16"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "4.3 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Passive",
                    "skill_type": "Passive",
                    "description": "Shield: 50 (+ 10* Hero Level) (+ 20% Total Magic Power) >> 120 (+ 10* Hero Level) (+50% Total Magic Power)"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Skill 1",
                    "skill_type": "Skill 1",
                    "description": "Cooldown: 3-1.5s >> 3.5-2.5s"
                },
                {
                    "badge": "ADJUST",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Cooldown: 14-12s >> 14-10s<br/>Base Slow Effect: 30% >> 20%<br/>Max Slow Effect: 60% >> 40%"
                },
                {
                    "badge": "NERF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Slow Effect: 60% >> 40%"
                }
            ]
        },
        "Zetian": {
            "badge": "ADJUST",
            "description": "Adjusted the hero to align with Mage Attributes adjustments.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2550 >> 2380"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "135 >> 155"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base Physical Defense",
                    "description": "18 >> 17"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.9 >> 4"
                }
            ]
        },
        "Zhask": {
            "badge": "BUFF",
            "description": "To align with the adjustments to Mage attributes, we have reduced the Ultimate cooldown.",
            "attribute_adjustments": [
                {
                    "badge": "BUFF",
                    "attribute_name": "Base HP",
                    "description": "2280 >> 2380"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Base Physical Defense",
                    "description": "15 >> 17"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.5 >> 4"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Movement Speed",
                    "description": "240 >> 250"
                }
            ],
            "adjustments": [
                {
                    "badge": "BUFF",
                    "skill_name": "Ultimate",
                    "skill_type": "Ultimate",
                    "description": "Cooldown: 60s-50s >> 44s-36s"
                }
            ]
        },
        "Zhuxin": {
            "badge": "NERF",
            "description": "To align with the adjustments to Mage attributes and Mana Cost, we have reduced early and mid game damage and wave-clearing speed.",
            "attribute_adjustments": [
                {
                    "badge": "ADJUST",
                    "attribute_name": "Base HP",
                    "description": "2480 >> 2440"
                },
                {
                    "badge": "ADJUST",
                    "attribute_name": "HP Growth",
                    "description": "145 >> 165"
                },
                {
                    "badge": "NERF",
                    "attribute_name": "Base Physical Defense",
                    "description": "20 >> 18"
                },
                {
                    "badge": "BUFF",
                    "attribute_name": "Physical Defense Growth",
                    "description": "3.5 >> 4"
                }
            ],
            "adjustments": [
                {
                    "badge": "NERF",
                    "skill_name": "Skill 2",
                    "skill_type": "Skill 2",
                    "description": "Base Damage When Hold: 45-95 >> 35-70<br/>Base Damage When Release: 200-300 >> 200-400"
                }
            ]
        }
    },
    "system_adjustments": [
        {
            "name": "Battle Spells - Visual Effects Optimization",
            "description": "We have improved the clarity of the visual effects for the Battle Spells \"Execute\", \"Petrify\", and \"Retribution\"."
        },
        {
            "name": "New Mode: Tide Siege",
            "description": "Welcome to the perilous Tidal Ruins! The new 3-player co-op PVE mode [Tide Siege] is now available on the Advanced Server! This time, you are no longer rivals, but guardians fighting side by side, defending against monsters together, and protecting the base!<br/><br/>In [Tide Siege], you will form a team of guardians with two allies to battle enemies from the deep sea. The enemy will launch 18 waves of relentless attacks that intensify as the waves progress. You must eliminate all monsters before they reach and destroy the Base!<br/><br/>Between enemy waves, take the initiative to defeat creeps in the Jungle Area to earn Gold for the entire team. This reward multiplies with the number of creep kills. Investing in the Jungle Area early on will yield massive returns in the mid to late game.<br/><br/>For every 3 waves successfully defended, each player can choose one of three buffs. These provide bonuses to Attack, Defense, Cooldown Reduction, or grant unique special effects.<br/><br/>Mechanics for respawning, earning Gold, and purchasing equipment have been optimized for the Co-op PVE gameplay, placing greater emphasis on teamwork and sustained combat.<br/><br/>Only select heroes are available in this mode. All available heroes have received ability enhancements to adapt to the PVE combat pace."
        },
        {
            "name": "Mode Update: Frozen Sea Showdown",
            "description": "1- Moved the Crab skill and Ultimate buttons to the 3rd and 4th slots of the right wheel.<br/>2- The Ultimate is no longer automatically obtained. Destroying Chests grants passive effects to the whole team and unlocks the Ultimate for yourself.<br/>3- Skill 2's damage range is increased by 30%.<br/>4- Players start with 1 stack of [Glacial Hook], and their level will match the number of [Glacial Hook] stacks.<br/>5- Iron Hook's base launching speed is increased by 15%.<br/>6- Added a snowfall effect as the match nears its end, appearing alongside the kill count warning."
        },
        {
            "name": "Battlefield Special Gameplay Test",
            "description": "We are launching a special gameplay test this week. To align with related events on the Advanced Server, matches in Classic and Ranked modes will drop extra Chests and Treasure Hunt Coins, which can be exchanged for event rewards. Please note that we may adjust the drop rates based on player feedback and data.<br/><br/><strong>How to Obtain Treasure Hunt Coins:</strong><br/>1- Team Rewards: [Treasure Hunt Coin amount varies by action]<br/>- Each time your team kills the Turtle.<br/>- Each time your team kills the Lord (starting from the 2nd kill).<br/>- Each time your team destroys a Turret.<br/>- When your team picks up Treasure Hunt Coins dropped on the map.<br/>- For every 2,500 Gold increase in your team's total Gold.<br/><br/>2- Individual Rewards: [Treasure Hunt Coin amount varies by action]<br/>- Each time you kill an enemy hero.<br/>- Each time you get an assist.<br/>- Each time you trigger an in-match Highlight Notification.<br/><br/>3- Winning the match grants 100% of the Treasure Hunt Coins, while losing grants only 40%<br/><br/><strong>How to Obtain Chests:</strong><br/>When your team kills the Lord for the first time, all team members get 1 Chest, regardless of the match result.<br/><br/><strong>Match Drop Limits:</strong><br/>Up to 5 Chests per day, and up to 70 Chests during the event.<br/>Up to 300 Treasure Hunt Coins per match, 1,000 per day (excluding Treasure Hunt Coins from Chests), and 14,000 during the event (excluding Treasure Hunt Coins from Chests)."
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
patches_dict["2.1.56-adv"] = patch_2_1_56

# Зберігаємо оновлений файл
with open("patches_data.json", "w", encoding="utf-8") as f:
    json.dump(patches_dict, f, ensure_ascii=False, indent=4)

print(f"\n✅ ПАТЧ 2.1.56 УСПІШНО ДОДАНО!")
print(f"📊 Всього патчів у базі: {len(patches_dict)}")
print(f"📅 Дата релізу: 2026-01-30")
print(f"🎯 Героїв змінено: {len(patch_2_1_56['hero_adjustments'])}")
print(f"⚔️  Екіпіровки змінено: {len(patch_2_1_56['equipment_adjustments'])}")
print(f"🗺️  Зміни поля бою: {len(patch_2_1_56['battlefield_adjustments'])}")
print(f"🎮 Системні зміни: {len(patch_2_1_56['system_adjustments'])}")
