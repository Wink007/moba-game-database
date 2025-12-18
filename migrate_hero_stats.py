#!/usr/bin/env python3
"""
Міграція hero_stats з окремої таблиці в JSONB поле в таблиці heroes
"""
import os

# Встановлюємо connection string для PostgreSQL на Railway
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

from database import get_connection, release_connection, get_placeholder, DATABASE_TYPE

def migrate_hero_stats():
    """
    Переносить hero_stats з окремої таблиці в JSONB поле hero_stats в таблиці heroes
    """
    conn = get_connection()
    cursor = conn.cursor()
    ph = get_placeholder()
    
    print("🔄 Міграція hero_stats...\n")
    
    try:
        # 1. Додаємо нову колонку hero_stats типу JSONB в таблицю heroes
        print("1️⃣ Додаємо колонку hero_stats...")
        if DATABASE_TYPE == 'postgres':
            cursor.execute("""
                ALTER TABLE heroes 
                ADD COLUMN IF NOT EXISTS hero_stats JSONB DEFAULT '{}'::jsonb
            """)
        else:
            cursor.execute("""
                ALTER TABLE heroes 
                ADD COLUMN hero_stats TEXT DEFAULT '{}'
            """)
        conn.commit()
        print("   ✅ Колонка додана\n")
        
        # 2. Отримуємо всі герої
        print("2️⃣ Завантажуємо героїв...")
        cursor.execute("SELECT id FROM heroes")
        heroes = cursor.fetchall()
        print(f"   ✅ Знайдено {len(heroes)} героїв\n")
        
        # 3. Для кожного героя конвертуємо stats
        print("3️⃣ Конвертуємо статистику...")
        updated_count = 0
        
        for hero in heroes:
            hero_id = hero[0] if isinstance(hero, tuple) else hero['id']
            
            # Отримуємо stats з старої таблиці
            cursor.execute(f"SELECT stat_name, value FROM hero_stats WHERE hero_id = {ph}", (hero_id,))
            old_stats = cursor.fetchall()
            
            if not old_stats:
                continue
            
            # Конвертуємо в новий формат
            stats_dict = {}
            for stat in old_stats:
                stat_name = stat[0] if isinstance(stat, tuple) else stat['stat_name']
                value = stat[1] if isinstance(stat, tuple) else stat['value']
                
                # Конвертуємо назву в snake_case ключ
                key = stat_name.lower().replace(' ', '_')
                stats_dict[key] = value
            
            # Оновлюємо героя новою структурою
            import json
            stats_json = json.dumps(stats_dict)
            
            cursor.execute(f"""
                UPDATE heroes 
                SET hero_stats = {ph}
                WHERE id = {ph}
            """, (stats_json, hero_id))
            
            updated_count += 1
            
            if updated_count % 10 == 0:
                print(f"   ... оброблено {updated_count} героїв")
        
        conn.commit()
        print(f"   ✅ Оновлено {updated_count} героїв\n")
        
        # 4. Видаляємо стару таблицю hero_stats
        print("4️⃣ Видаляємо стару таблицю hero_stats...")
        cursor.execute("DROP TABLE IF EXISTS hero_stats")
        conn.commit()
        print("   ✅ Таблиця видалена\n")
        
        print("✅ Міграція успішно завершена!")
        print("\n📊 Нова структура hero_stats:")
        print("""
{
  "hp": 2285,
  "hp_regen": 7.2,
  "mana": 500,
  "mana_regen": 4,
  "physical_attack": 120,
  "magic_power": 0,
  "physical_defense": 20,
  "magic_defense": 15,
  "attack_speed": 1.05,
  "attack_speed_ratio": 100,
  "movement_speed": 240
}
        """)
        
    except Exception as e:
        print(f"❌ Помилка міграції: {e}")
        conn.rollback()
        raise
    finally:
        release_connection(conn)

if __name__ == '__main__':
    # Для тестування на SQLite
    # migrate_hero_stats()
    
    # Для Production PostgreSQL
    print("⚠️  УВАГА: Ця міграція змінить структуру бази даних!")
    print("Рекомендується зробити backup перед запуском.\n")
    
    response = input("Продовжити міграцію? (yes/no): ")
    if response.lower() == 'yes':
        migrate_hero_stats()
    else:
        print("❌ Міграція скасована")
