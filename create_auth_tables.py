#!/usr/bin/env python3
"""Create auth tables: users, favorites, user_builds"""
import database as db

conn = db.get_connection()
cursor = conn.cursor()

# Create users table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✅ users table created")

# Create favorites table
cursor.execute("""
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hero_id INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hero_id)
)
""")
print("✅ favorites table created")

# Create user_builds table
cursor.execute("""
CREATE TABLE IF NOT EXISTS user_builds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hero_id INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    items JSON,
    emblem_id INTEGER,
    talents JSON,
    spell1_id INTEGER,
    spell2_id INTEGER,
    notes TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✅ user_builds table created")

# Create indexes
cursor.execute("CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_favorites_hero ON favorites(hero_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_builds_user ON user_builds(user_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_builds_hero ON user_builds(hero_id)")
print("✅ indexes created")

conn.commit()
db.release_connection(conn)
print("\n🎉 All tables created successfully!")
