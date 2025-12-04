#!/usr/bin/env python3
"""
Тести для бази даних ігор
"""

import os
import sys
from database import GameDatabase


def test_database():
    """Тестування функціональності бази даних"""
    
    # Видалити стару тестову БД якщо існує
    test_db = "test_games.db"
    if os.path.exists(test_db):
        os.remove(test_db)
    
    print("=" * 60)
    print("ТЕСТУВАННЯ БАЗИ ДАНИХ ДЛЯ ІГОР")
    print("=" * 60)
    
    # Ініціалізація
    db = GameDatabase(test_db)
    db.connect()
    db.create_tables()
    print("✅ База даних створена та підключена\n")
    
    # ==================== ТЕСТ 1: Додавання ігор ====================
    print("ТЕСТ 1: Додавання ігор")
    print("-" * 60)
    
    game1_id = db.add_game(
        name="Dota 2",
        description="Multiplayer online battle arena",
        release_date="2013-07-09",
        genre="MOBA"
    )
    print(f"✅ Додано гру: Dota 2 (ID: {game1_id})")
    
    game2_id = db.add_game(
        name="League of Legends",
        description="Team-based strategy game",
        release_date="2009-10-27",
        genre="MOBA"
    )
    print(f"✅ Додано гру: League of Legends (ID: {game2_id})")
    
    all_games = db.get_all_games()
    print(f"\n📊 Всього ігор у базі: {len(all_games)}")
    for game in all_games:
        print(f"   - {game['name']} ({game['genre']})")
    print()
    
    # ==================== ТЕСТ 2: Додавання героїв ====================
    print("ТЕСТ 2: Додавання героїв до Dota 2")
    print("-" * 60)
    
    # Додаємо героїв для Dota 2
    hero1_id = db.add_hero(
        game_id=game1_id,
        name="Invoker",
        hero_game_id="invoker",
        image="invoker.png",
        role="Intelligence/Carry",
        description="Мощний маг з 10 здібностями"
    )
    print(f"✅ Додано героя: Invoker (ID: {hero1_id})")
    
    hero2_id = db.add_hero(
        game_id=game1_id,
        name="Pudge",
        hero_game_id="pudge",
        image="pudge.png",
        role="Strength/Tank",
        description="М'ясник з хуком"
    )
    print(f"✅ Додано героя: Pudge (ID: {hero2_id})")
    
    hero3_id = db.add_hero(
        game_id=game1_id,
        name="Crystal Maiden",
        hero_game_id="crystal_maiden",
        image="crystal_maiden.png",
        role="Intelligence/Support",
        description="Крижана підтримка"
    )
    print(f"✅ Додано героя: Crystal Maiden (ID: {hero3_id})")
    
    # ==================== ТЕСТ 3: Додавання навичок ====================
    print("\nТЕСТ 3: Додавання навичок героям")
    print("-" * 60)
    
    # Навички для Invoker
    skill1_id = db.add_hero_skill(
        hero_id=hero1_id,
        skill_name="Cold Snap",
        skill_description="Freezes enemy in place",
        cooldown=17.0,
        mana_cost=100,
        damage=50.0,
        skill_type="Active"
    )
    print(f"✅ Додано навичку: Cold Snap для Invoker")
    
    db.add_hero_skill(
        hero_id=hero1_id,
        skill_name="Sunstrike",
        skill_description="Global damage spell",
        cooldown=25.0,
        mana_cost=175,
        damage=475.0,
        skill_type="Active"
    )
    print(f"✅ Додано навичку: Sunstrike для Invoker")
    
    # Навички для Pudge
    db.add_hero_skill(
        hero_id=hero2_id,
        skill_name="Meat Hook",
        skill_description="Hooks and pulls enemy",
        cooldown=14.0,
        mana_cost=110,
        damage=180.0,
        skill_type="Skillshot"
    )
    print(f"✅ Додано навичку: Meat Hook для Pudge")
    
    db.add_hero_skill(
        hero_id=hero2_id,
        skill_name="Rot",
        skill_description="Damages nearby enemies",
        mana_cost=0,
        damage=35.0,
        skill_type="Toggle"
    )
    print(f"✅ Додано навичку: Rot для Pudge")
    
    # ==================== ТЕСТ 4: Додавання предметів ====================
    print("\nТЕСТ 4: Додавання предметів")
    print("-" * 60)
    
    item1_id = db.add_item(
        game_id=game1_id,
        name="Black King Bar",
        item_game_id="black_king_bar",
        description="Дає імунітет до магії",
        image="bkb.png",
        item_type="Equipment",
        cost=4050,
        stats={
            "strength": 10,
            "damage": 24,
            "spell_immunity_duration": 9
        }
    )
    print(f"✅ Додано предмет: Black King Bar (ID: {item1_id})")
    
    item2_id = db.add_item(
        game_id=game1_id,
        name="Aghanim's Scepter",
        item_game_id="aghanims_scepter",
        description="Покращує ультимейт",
        image="aghs.png",
        item_type="Equipment",
        cost=4200,
        stats={
            "health": 175,
            "mana": 175,
            "all_stats": 10
        }
    )
    print(f"✅ Додано предмет: Aghanim's Scepter (ID: {item2_id})")
    
    item3_id = db.add_item(
        game_id=game1_id,
        name="Blink Dagger",
        item_game_id="blink_dagger",
        description="Телепортація на коротку відстань",
        image="blink.png",
        item_type="Equipment",
        cost=2250,
        stats={
            "blink_range": 1200
        }
    )
    print(f"✅ Додано предмет: Blink Dagger (ID: {item3_id})")
    
    # ==================== ТЕСТ 5: Читання даних ====================
    print("\nТЕСТ 5: Читання та виведення даних")
    print("-" * 60)
    
    # Отримати гру
    game = db.get_game_by_name("Dota 2")
    print(f"📖 Гра: {game['name']}")
    print(f"   Опис: {game['description']}")
    print(f"   Жанр: {game['genre']}")
    print(f"   Дата релізу: {game['release_date']}\n")
    
    # Отримати героїв з навичками
    heroes = db.get_heroes_by_game(game1_id, include_skills=True)
    print(f"👥 Герої Dota 2: {len(heroes)}")
    for hero in heroes:
        print(f"\n   🦸 {hero['name']} ({hero['role']})")
        print(f"      {hero['description']}")
        if hero.get('skills'):
            print(f"      Навички:")
            for skill in hero['skills']:
                print(f"         • {skill['skill_name']}: {skill['skill_description']}")
                if skill['damage']:
                    print(f"           Урон: {skill['damage']}, Мана: {skill['mana_cost']}")
    
    # Отримати предмети
    items = db.get_items_by_game(game1_id)
    print(f"\n\n🎒 Предмети Dota 2: {len(items)}")
    for item in items:
        print(f"\n   ⚔️  {item['name']} (Ціна: {item['cost']} золота)")
        print(f"      {item['description']}")
        if item.get('stats'):
            print(f"      Характеристики:")
            for stat, value in item['stats'].items():
                print(f"         • {stat}: {value}")
    
    # ==================== ТЕСТ 6: Статистика ====================
    print("\n\nТЕСТ 6: Статистика по грі")
    print("-" * 60)
    
    stats = db.get_game_stats(game1_id)
    print(f"📊 Статистика для Dota 2:")
    print(f"   Героїв: {stats['heroes_count']}")
    print(f"   Предметів: {stats['items_count']}")
    print(f"   Навичок: {stats['skills_count']}")
    
    # ==================== ТЕСТ 7: Пошук ====================
    print("\n\nТЕСТ 7: Пошук предметів")
    print("-" * 60)
    
    search_results = db.search_items(game1_id, "Aghanim")
    print(f"🔍 Результати пошуку для 'Aghanim': {len(search_results)}")
    for item in search_results:
        print(f"   - {item['name']}: {item['description']}")
    
    # Закриття
    db.disconnect()
    print("\n" + "=" * 60)
    print("✅ ВСІ ТЕСТИ ПРОЙДЕНО УСПІШНО!")
    print("=" * 60)
    print(f"\n💾 База даних збережена у файлі: {test_db}")
    print("   Можете відкрити її за допомогою SQLite Browser")


if __name__ == "__main__":
    try:
        test_database()
    except Exception as e:
        print(f"\n❌ ПОМИЛКА: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
