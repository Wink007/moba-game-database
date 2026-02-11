import os
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway'

import database as db

# Add counter_data and compatibility_data columns to heroes table
conn = db.get_connection()
cursor = conn.cursor()

try:
    # Check if columns exist
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='heroes' 
        AND column_name IN ('counter_data', 'compatibility_data')
    """)
    existing = {row[0] for row in cursor.fetchall()}
    
    if 'counter_data' not in existing:
        print("Adding counter_data column...")
        cursor.execute("ALTER TABLE heroes ADD COLUMN counter_data JSONB")
        print("✅ counter_data column added")
    else:
        print("⚠️  counter_data column already exists")
    
    if 'compatibility_data' not in existing:
        print("Adding compatibility_data column...")
        cursor.execute("ALTER TABLE heroes ADD COLUMN compatibility_data JSONB")
        print("✅ compatibility_data column added")
    else:
        print("⚠️  compatibility_data column already exists")
    
    conn.commit()
    print("\n✅ Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    db.release_connection(conn)
