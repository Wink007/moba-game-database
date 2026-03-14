"""Create tier_votes table for community tier list feature"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import database as db

DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite')
conn = db.get_connection()
cursor = conn.cursor()

if DATABASE_TYPE == 'postgres':
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tier_votes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            hero_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            tier VARCHAR(1) NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, hero_id, game_id)
        )
    """)
else:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tier_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            hero_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            tier VARCHAR(1) NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D')),
            created_at DATETIME DEFAULT (datetime('now')),
            updated_at DATETIME DEFAULT (datetime('now')),
            UNIQUE(user_id, hero_id, game_id)
        )
    """)

print("✅ tier_votes table created")

cursor.execute("CREATE INDEX IF NOT EXISTS idx_tier_votes_game ON tier_votes(game_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_tier_votes_hero ON tier_votes(hero_id, game_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_tier_votes_user ON tier_votes(user_id, game_id)")
print("✅ indexes created")

conn.commit()
db.release_connection(conn)
print("\n🎉 Tier votes table created successfully!")
