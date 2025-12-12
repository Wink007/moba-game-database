import database as db
import os

# Встановлюємо connection string для PostgreSQL
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

def add_unique_constraint():
    """Додає поля days та rank, та унікальний constraint"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    try:
        # Спочатку перевіряємо чи є поля days та rank
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'hero_rank' 
            AND column_name IN ('days', 'rank')
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
        # Додаємо поле days якщо немає
        if 'days' not in existing_columns:
            print("➕ Додаю поле days...")
            cursor.execute("ALTER TABLE hero_rank ADD COLUMN days INTEGER DEFAULT 7")
            print("✅ Поле days додано")
        else:
            print("✓ Поле days вже існує")
        
        # Додаємо поле rank якщо немає
        if 'rank' not in existing_columns:
            print("➕ Додаю поле rank...")
            cursor.execute("ALTER TABLE hero_rank ADD COLUMN rank VARCHAR(20) DEFAULT 'all'")
            print("✅ Поле rank додано")
        else:
            print("✓ Поле rank вже існує")
        
        # Видаляємо старий UNIQUE constraint на hero_id
        print("🔧 Видаляю старий UNIQUE constraint...")
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'hero_rank' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%hero_id%'
        """)
        old_constraints = cursor.fetchall()
        
        for constraint in old_constraints:
            constraint_name = constraint[0]
            print(f"   Видаляю constraint: {constraint_name}")
            cursor.execute(f"ALTER TABLE hero_rank DROP CONSTRAINT IF EXISTS {constraint_name}")
        
        # Додаємо новий UNIQUE constraint
        print("➕ Додаю новий UNIQUE constraint на (hero_id, days, rank)...")
        cursor.execute("""
            ALTER TABLE hero_rank 
            ADD CONSTRAINT hero_rank_unique_combination 
            UNIQUE (hero_id, days, rank)
        """)
        print("✅ UNIQUE constraint додано")
        
        conn.commit()
        print("\n✅ Міграція успішно завершена!")
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        conn.rollback()
    finally:
        db.release_connection(conn)

if __name__ == '__main__':
    add_unique_constraint()
