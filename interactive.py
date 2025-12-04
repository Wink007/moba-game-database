#!/usr/bin/env python3
"""
Інтерактивний інтерфейс для роботи з базою даних ігор
"""

from database import GameDatabase
import sys


def print_menu():
    """Виведення головного меню"""
    print("\n" + "=" * 60)
    print("🎮 БАЗА ДАНИХ ІГОР - ГОЛОВНЕ МЕНЮ")
    print("=" * 60)
    print("1. 📖 Переглянути всі ігри")
    print("2. ➕ Додати нову гру")
    print("3. 👥 Переглянути героїв гри")
    print("4. 🦸 Додати героя")
    print("5. ⚔️  Додати навичку герою")
    print("6. 🎒 Переглянути предмети гри")
    print("7. 📦 Додати предмет")
    print("8. 🔍 Пошук предметів")
    print("9. 📊 Статистика гри")
    print("0. ❌ Вихід")
    print("=" * 60)


def view_all_games(db):
    """Перегляд всіх ігор"""
    games = db.get_all_games()
    
    if not games:
        print("\n⚠️  База даних порожня. Додайте першу гру!")
        return
    
    print("\n📖 СПИСОК ІГОР:")
    print("-" * 60)
    for game in games:
        print(f"\n🎮 ID: {game['id']} | {game['name']}")
        print(f"   Жанр: {game['genre'] or 'Не вказано'}")
        print(f"   Опис: {game['description'] or 'Немає опису'}")
        if game['release_date']:
            print(f"   Реліз: {game['release_date']}")


def add_game(db):
    """Додати нову гру"""
    print("\n➕ ДОДАТИ НОВУ ГРУ")
    print("-" * 60)
    
    name = input("Назва гри: ").strip()
    if not name:
        print("❌ Назва не може бути порожньою!")
        return
    
    description = input("Опис (Enter щоб пропустити): ").strip() or None
    genre = input("Жанр (наприклад, MOBA, FPS, RPG): ").strip() or None
    release_date = input("Дата релізу (YYYY-MM-DD): ").strip() or None
    
    try:
        game_id = db.add_game(name, description, release_date, genre)
        print(f"\n✅ Гру '{name}' успішно додано! (ID: {game_id})")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def view_heroes(db):
    """Переглянути героїв гри"""
    game_id = input("\nВведіть ID гри: ").strip()
    
    try:
        game_id = int(game_id)
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        heroes = db.get_heroes_by_game(game_id, include_skills=True)
        
        print(f"\n👥 ГЕРОЇ ГРИ '{game['name']}':")
        print("-" * 60)
        
        if not heroes:
            print("⚠️  У цієї гри ще немає героїв.")
            return
        
        for hero in heroes:
            print(f"\n🦸 ID: {hero['id']} | {hero['name']}")
            print(f"   Роль: {hero['role'] or 'Не вказано'}")
            print(f"   Опис: {hero['description'] or 'Немає опису'}")
            
            if hero.get('skills'):
                print(f"   Навички ({len(hero['skills'])}):")
                for skill in hero['skills']:
                    details = []
                    if skill['damage']:
                        details.append(f"Урон: {skill['damage']}")
                    if skill['mana_cost']:
                        details.append(f"Мана: {skill['mana_cost']}")
                    if skill['cooldown']:
                        details.append(f"КД: {skill['cooldown']}с")
                    
                    details_str = " | " + ", ".join(details) if details else ""
                    print(f"      • {skill['skill_name']}{details_str}")
    
    except ValueError:
        print("❌ ID має бути числом!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def add_hero(db):
    """Додати героя"""
    print("\n🦸 ДОДАТИ ГЕРОЯ")
    print("-" * 60)
    
    try:
        game_id = int(input("ID гри: ").strip())
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        print(f"Додаємо героя до гри: {game['name']}")
        
        name = input("Ім'я героя: ").strip()
        if not name:
            print("❌ Ім'я не може бути порожнім!")
            return
        
        hero_game_id = input("ID героя в грі (Enter щоб пропустити): ").strip() or None
        role = input("Роль (наприклад, Tank, Support, Damage): ").strip() or None
        description = input("Опис: ").strip() or None
        image = input("Шлях до зображення (Enter щоб пропустити): ").strip() or None
        
        hero_id = db.add_hero(game_id, name, hero_game_id, image, role, description)
        print(f"\n✅ Героя '{name}' успішно додано! (ID: {hero_id})")
        
    except ValueError:
        print("❌ ID має бути числом!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def add_skill(db):
    """Додати навичку герою"""
    print("\n⚔️  ДОДАТИ НАВИЧКУ")
    print("-" * 60)
    
    try:
        hero_id = int(input("ID героя: ").strip())
        hero = db.get_hero(hero_id, include_skills=False)
        
        if not hero:
            print("❌ Героя не знайдено!")
            return
        
        print(f"Додаємо навичку до героя: {hero['name']}")
        
        skill_name = input("Назва навички: ").strip()
        if not skill_name:
            print("❌ Назва не може бути порожньою!")
            return
        
        skill_description = input("Опис навички: ").strip() or None
        skill_type = input("Тип (Active, Passive, Ultimate тощо): ").strip() or None
        
        damage_str = input("Урон (Enter щоб пропустити): ").strip()
        damage = float(damage_str) if damage_str else None
        
        mana_str = input("Вартість мани (Enter щоб пропустити): ").strip()
        mana_cost = int(mana_str) if mana_str else None
        
        cooldown_str = input("Час відновлення в секундах (Enter щоб пропустити): ").strip()
        cooldown = float(cooldown_str) if cooldown_str else None
        
        skill_id = db.add_hero_skill(hero_id, skill_name, skill_description, 
                                      cooldown, mana_cost, damage, skill_type)
        print(f"\n✅ Навичку '{skill_name}' успішно додано! (ID: {skill_id})")
        
    except ValueError:
        print("❌ Невірний формат даних!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def view_items(db):
    """Переглянути предмети гри"""
    game_id = input("\nВведіть ID гри: ").strip()
    
    try:
        game_id = int(game_id)
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        items = db.get_items_by_game(game_id)
        
        print(f"\n🎒 ПРЕДМЕТИ ГРИ '{game['name']}':")
        print("-" * 60)
        
        if not items:
            print("⚠️  У цієї гри ще немає предметів.")
            return
        
        for item in items:
            print(f"\n📦 ID: {item['id']} | {item['name']}")
            if item['cost']:
                print(f"   Ціна: {item['cost']} золота")
            print(f"   Опис: {item['description'] or 'Немає опису'}")
            print(f"   Тип: {item['item_type'] or 'Не вказано'}")
            
            if item.get('stats'):
                print(f"   Характеристики:")
                for stat, value in item['stats'].items():
                    print(f"      • {stat}: {value}")
    
    except ValueError:
        print("❌ ID має бути числом!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def add_item(db):
    """Додати предмет"""
    print("\n📦 ДОДАТИ ПРЕДМЕТ")
    print("-" * 60)
    
    try:
        game_id = int(input("ID гри: ").strip())
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        print(f"Додаємо предмет до гри: {game['name']}")
        
        name = input("Назва предмета: ").strip()
        if not name:
            print("❌ Назва не може бути порожньою!")
            return
        
        description = input("Опис: ").strip() or None
        item_type = input("Тип (Equipment, Consumable тощо): ").strip() or None
        
        cost_str = input("Ціна (Enter щоб пропустити): ").strip()
        cost = int(cost_str) if cost_str else None
        
        # Характеристики
        stats = {}
        print("\nХарактеристики (Enter щоб закінчити):")
        while True:
            stat_name = input("  Назва характеристики: ").strip()
            if not stat_name:
                break
            stat_value = input(f"  Значення для {stat_name}: ").strip()
            try:
                # Спроба перетворити в число
                stat_value = int(stat_value) if stat_value.isdigit() else float(stat_value)
            except:
                pass  # Залишити як рядок
            stats[stat_name] = stat_value
        
        item_id = db.add_item(game_id, name, None, description, None, 
                             item_type, cost, stats if stats else None)
        print(f"\n✅ Предмет '{name}' успішно додано! (ID: {item_id})")
        
    except ValueError:
        print("❌ Невірний формат даних!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def search_items(db):
    """Пошук предметів"""
    print("\n🔍 ПОШУК ПРЕДМЕТІВ")
    print("-" * 60)
    
    try:
        game_id = int(input("ID гри: ").strip())
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        search_term = input("Введіть пошуковий запит: ").strip()
        
        if not search_term:
            print("❌ Пошуковий запит не може бути порожнім!")
            return
        
        results = db.search_items(game_id, search_term)
        
        print(f"\n🔍 Знайдено результатів: {len(results)}")
        print("-" * 60)
        
        if not results:
            print("⚠️  Нічого не знайдено.")
            return
        
        for item in results:
            print(f"\n📦 {item['name']} (ID: {item['id']})")
            print(f"   {item['description'] or 'Немає опису'}")
            if item['cost']:
                print(f"   Ціна: {item['cost']}")
    
    except ValueError:
        print("❌ ID має бути числом!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def view_stats(db):
    """Статистика гри"""
    game_id = input("\nВведіть ID гри: ").strip()
    
    try:
        game_id = int(game_id)
        game = db.get_game(game_id)
        
        if not game:
            print("❌ Гру не знайдено!")
            return
        
        stats = db.get_game_stats(game_id)
        
        print(f"\n📊 СТАТИСТИКА ДЛЯ '{game['name']}':")
        print("-" * 60)
        print(f"Героїв: {stats['heroes_count']}")
        print(f"Предметів: {stats['items_count']}")
        print(f"Всього навичок: {stats['skills_count']}")
    
    except ValueError:
        print("❌ ID має бути числом!")
    except Exception as e:
        print(f"❌ Помилка: {e}")


def main():
    """Головна функція"""
    db_file = input("Введіть назву файлу БД (Enter для 'games.db'): ").strip()
    db_file = db_file if db_file else "games.db"
    
    db = GameDatabase(db_file)
    db.connect()
    db.create_tables()
    
    print(f"\n✅ Підключено до бази даних: {db_file}")
    
    while True:
        print_menu()
        choice = input("\nВиберіть опцію (0-9): ").strip()
        
        if choice == '1':
            view_all_games(db)
        elif choice == '2':
            add_game(db)
        elif choice == '3':
            view_heroes(db)
        elif choice == '4':
            add_hero(db)
        elif choice == '5':
            add_skill(db)
        elif choice == '6':
            view_items(db)
        elif choice == '7':
            add_item(db)
        elif choice == '8':
            search_items(db)
        elif choice == '9':
            view_stats(db)
        elif choice == '0':
            print("\n👋 До побачення!")
            break
        else:
            print("\n❌ Невірний вибір! Спробуйте ще раз.")
        
        input("\n⏎ Натисніть Enter щоб продовжити...")
    
    db.disconnect()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Програму перервано користувачем.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Критична помилка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
