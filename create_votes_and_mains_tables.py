#!/usr/bin/env python3
"""Create build_votes and user_main_heroes tables"""
import database as db

conn = db.get_connection()
cursor = conn.cursor()

# Create build_votes table
cursor.execute("""
CREATE TABLE IF NOT EXISTS build_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    build_id INTEGER NOT NULL REFERENCES user_builds(id) ON DELETE CASCADE,
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, build_id)
)
""")
print("✅ build_votes table created")

# Create user_main_heroes table
cursor.execute("""
CREATE TABLE IF NOT EXISTS user_main_heroes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hero_id INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hero_id),
    UNIQUE(user_id, position)
)
""")
print("✅ user_main_heroes table created")

# Create indexes
cursor.execute("CREATE INDEX IF NOT EXISTS idx_build_votes_build ON build_votes(build_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_build_votes_user ON build_votes(user_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_main_heroes_user ON user_main_heroes(user_id)")
print("✅ indexes created")

conn.commit()
db.release_connection(conn)
print("\n🎉 build_votes & user_main_heroes tables created successfully!")
