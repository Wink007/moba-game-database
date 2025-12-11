import database as db
import os

# Встановлюємо connection string для PostgreSQL
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

def create_hero_rank_table():
    """Створює таблицю hero_rank"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Видаляємо таблицю якщо існує
    cursor.execute("DROP TABLE IF EXISTS hero_rank CASCADE")
    
    # Створюємо нову таблицю
    create_table_sql = """
    CREATE TABLE hero_rank (
        id SERIAL PRIMARY KEY,
        hero_id INTEGER NOT NULL UNIQUE,
        appearance_rate REAL,
        ban_rate REAL,
        win_rate REAL,
        synergy_heroes JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hero_id) REFERENCES heroes(id) ON DELETE CASCADE
    )
    """
    
    cursor.execute(create_table_sql)
    
    # Створюємо індекси
    cursor.execute("CREATE INDEX idx_hero_rank_hero_id ON hero_rank(hero_id)")
    cursor.execute("CREATE INDEX idx_hero_rank_win_rate ON hero_rank(win_rate DESC)")
    
    conn.commit()
    
    print("✅ Таблиця hero_rank успішно створена")
    
    db.release_connection(conn)

if __name__ == '__main__':
    create_hero_rank_table()
