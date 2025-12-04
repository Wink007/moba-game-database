#!/usr/bin/env python3
"""
Експорт та імпорт даних з бази даних
"""

import json
from database import GameDatabase


def export_game_to_json(db, game_id, output_file):
    """Експортувати всю інформацію про гру у JSON"""
    
    # Отримати дані гри
    game = db.get_game(game_id)
    if not game:
        print(f"❌ Гру з ID {game_id} не знайдено!")
        return False
    
    # Отримати героїв з навичками
    heroes = db.get_heroes_by_game(game_id, include_skills=True)
    
    # Отримати предмети
    items = db.get_items_by_game(game_id)
    
    # Сформувати дані для експорту
    export_data = {
        "game": game,
        "heroes": heroes,
        "items": items,
        "stats": db.get_game_stats(game_id)
    }
    
    # Записати у файл
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Дані гри '{game['name']}' експортовано до {output_file}")
    print(f"   Героїв: {len(heroes)}, Предметів: {len(items)}")
    return True


def import_game_from_json(db, input_file):
    """Імпортувати гру з JSON файлу"""
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        game_data = data['game']
        
        # Додати гру (без ID, він згенерується автоматично)
        game_id = db.add_game(
            name=game_data['name'],
            description=game_data.get('description'),
            release_date=game_data.get('release_date'),
            genre=game_data.get('genre')
        )
        
        print(f"✅ Імпортовано гру: {game_data['name']} (новий ID: {game_id})")
        
        # Мапінг старих ID героїв на нові
        hero_id_map = {}
        
        # Додати героїв
        heroes_count = 0
        skills_count = 0
        for hero_data in data.get('heroes', []):
            old_hero_id = hero_data['id']
            
            new_hero_id = db.add_hero(
                game_id=game_id,
                name=hero_data['name'],
                hero_game_id=hero_data.get('hero_game_id'),
                image=hero_data.get('image'),
                role=hero_data.get('role'),
                description=hero_data.get('description')
            )
            
            hero_id_map[old_hero_id] = new_hero_id
            heroes_count += 1
            
            # Додати навички героя
            for skill in hero_data.get('skills', []):
                db.add_hero_skill(
                    hero_id=new_hero_id,
                    skill_name=skill['skill_name'],
                    skill_description=skill.get('skill_description'),
                    cooldown=skill.get('cooldown'),
                    mana_cost=skill.get('mana_cost'),
                    damage=skill.get('damage'),
                    skill_type=skill.get('skill_type')
                )
                skills_count += 1
        
        # Додати предмети
        items_count = 0
        for item_data in data.get('items', []):
            db.add_item(
                game_id=game_id,
                name=item_data['name'],
                item_game_id=item_data.get('item_game_id'),
                description=item_data.get('description'),
                image=item_data.get('image'),
                item_type=item_data.get('item_type'),
                cost=item_data.get('cost'),
                stats=item_data.get('stats')
            )
            items_count += 1
        
        print(f"✅ Імпортовано:")
        print(f"   Героїв: {heroes_count}")
        print(f"   Навичок: {skills_count}")
        print(f"   Предметів: {items_count}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ Файл {input_file} не знайдено!")
        return False
    except json.JSONDecodeError:
        print(f"❌ Файл {input_file} містить невірний JSON!")
        return False
    except Exception as e:
        print(f"❌ Помилка імпорту: {e}")
        return False


def export_all_games(db, output_file):
    """Експортувати всі ігри у один JSON файл"""
    
    games = db.get_all_games()
    
    if not games:
        print("❌ База даних порожня!")
        return False
    
    all_data = []
    
    for game in games:
        game_id = game['id']
        heroes = db.get_heroes_by_game(game_id, include_skills=True)
        items = db.get_items_by_game(game_id)
        
        all_data.append({
            "game": game,
            "heroes": heroes,
            "items": items,
            "stats": db.get_game_stats(game_id)
        })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Експортовано {len(games)} ігор до {output_file}")
    return True


def main():
    """Головна функція"""
    print("=" * 60)
    print("📤 ЕКСПОРТ/ІМПОРТ ДАНИХ БАЗи ДАНИХ ІГОР")
    print("=" * 60)
    print("\n1. Експортувати одну гру у JSON")
    print("2. Експортувати всі ігри у JSON")
    print("3. Імпортувати гру з JSON")
    print("0. Вихід")
    
    choice = input("\nВиберіть опцію: ").strip()
    
    if choice == '0':
        return
    
    db_file = input("Введіть назву файлу БД (Enter для 'games.db'): ").strip()
    db_file = db_file if db_file else "games.db"
    
    db = GameDatabase(db_file)
    db.connect()
    db.create_tables()
    
    if choice == '1':
        game_id = int(input("Введіть ID гри для експорту: ").strip())
        output_file = input("Назва вихідного файлу (Enter для 'game_export.json'): ").strip()
        output_file = output_file if output_file else "game_export.json"
        export_game_to_json(db, game_id, output_file)
        
    elif choice == '2':
        output_file = input("Назва вихідного файлу (Enter для 'all_games.json'): ").strip()
        output_file = output_file if output_file else "all_games.json"
        export_all_games(db, output_file)
        
    elif choice == '3':
        input_file = input("Назва файлу для імпорту: ").strip()
        import_game_from_json(db, input_file)
    
    else:
        print("❌ Невірний вибір!")
    
    db.disconnect()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Програму перервано.")
    except Exception as e:
        print(f"\n❌ Помилка: {e}")
        import traceback
        traceback.print_exc()
