"""
Скрипт для додавання індексів до бази даних для оптимізації запитів
"""
import os
from database import get_connection, release_connection, DATABASE_TYPE

def add_indexes():
    """Додає індекси для покращення продуктивності"""
    conn = get_connection()
    cursor = conn.cursor()
    
    indexes = [
        # Heroes - пошук по game_id (найбільш частий запит)
        "CREATE INDEX IF NOT EXISTS idx_heroes_game_id ON heroes(game_id)",
        
        # Hero stats - JOIN з heroes
        "CREATE INDEX IF NOT EXISTS idx_hero_stats_hero_id ON hero_stats(hero_id)",
        
        # Hero skills - JOIN з heroes + фільтр по is_transformed
        "CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id)",
        "CREATE INDEX IF NOT EXISTS idx_hero_skills_transformed ON hero_skills(is_transformed)",
        "CREATE INDEX IF NOT EXISTS idx_hero_skills_replaces ON hero_skills(replaces_skill_id)",
        
        # Items - пошук по game_id
        "CREATE INDEX IF NOT EXISTS idx_items_game_id ON items(game_id)",
        
        # Equipment - пошук по game_id
        "CREATE INDEX IF NOT EXISTS idx_equipment_game_id ON equipment(game_id)",
        
        # Emblems - пошук по game_id
        "CREATE INDEX IF NOT EXISTS idx_emblems_game_id ON emblems(game_id)",
        
        # Battle spells - пошук по game_id
        "CREATE INDEX IF NOT EXISTS idx_battle_spells_game_id ON battle_spells(game_id)",
        
        # Item recipes - JOIN з items
        "CREATE INDEX IF NOT EXISTS idx_item_recipes_item_id ON item_recipes(item_id)",
        "CREATE INDEX IF NOT EXISTS idx_item_recipes_component_id ON item_recipes(component_item_id)",
        
        # Pro builds - JOIN з heroes
        "CREATE INDEX IF NOT EXISTS idx_pro_builds_hero_id ON pro_builds(hero_id)",
    ]
    
    print(f"🔧 Додаємо індекси до {DATABASE_TYPE} бази даних...")
    
    for index_sql in indexes:
        try:
            cursor.execute(index_sql)
            index_name = index_sql.split("idx_")[1].split(" ON")[0] if "idx_" in index_sql else "unknown"
            print(f"  ✅ Індекс idx_{index_name}")
        except Exception as e:
            print(f"  ⚠️  Помилка: {index_sql[:50]}... - {e}")
    
    conn.commit()
    release_connection(conn)
    print("✅ Індекси успішно додані!")
    print("\n📊 Рекомендації:")
    print("  - Для PostgreSQL: запустіть ANALYZE для оновлення статистики")
    print("  - Індекси покращують SELECT, але сповільнюють INSERT/UPDATE")
    print("  - Для адмінки це не критично (мало записів)")

def show_indexes():
    """Показує всі існуючі індекси"""
    conn = get_connection()
    cursor = conn.cursor()
    
    if DATABASE_TYPE == 'postgres':
        cursor.execute("""
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname
        """)
    else:
        cursor.execute("""
            SELECT name, tbl_name 
            FROM sqlite_master 
            WHERE type = 'index' AND name LIKE 'idx_%'
            ORDER BY tbl_name, name
        """)
    
    indexes = cursor.fetchall()
    release_connection(conn)
    
    if indexes:
        print("\n📋 Існуючі індекси:")
        current_table = None
        for idx in indexes:
            table = idx[1]
            if table != current_table:
                print(f"\n  {table}:")
                current_table = table
            print(f"    - {idx[0]}")
    else:
        print("\n⚠️  Індекси не знайдені")

if __name__ == "__main__":
    print(f"💾 База даних: {DATABASE_TYPE}")
    print(f"🔗 URL: {os.getenv('DATABASE_URL', 'test_games.db')[:50]}...\n")
    
    # Показуємо існуючі індекси
    show_indexes()
    
    # Додаємо нові
    print("\n" + "="*50)
    add_indexes()
    
    # Показуємо оновлений список
    show_indexes()
