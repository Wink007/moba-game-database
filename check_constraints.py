import database as db
import os

# PostgreSQL
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

def check_constraints():
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints 
        WHERE table_name = 'hero_rank'
    """)
    
    print("Constraints in hero_rank table:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]}")
    
    db.release_connection(conn)

if __name__ == '__main__':
    check_constraints()
