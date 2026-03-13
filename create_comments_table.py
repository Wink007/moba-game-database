#!/usr/bin/env python3
"""Create hero_comments table"""
import database as db

conn = db.get_connection()
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS hero_comments (
    id SERIAL PRIMARY KEY,
    hero_id INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 1000),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("✅ hero_comments table created")

cursor.execute("""
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES hero_comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(comment_id, user_id)
)
""")
print("✅ comment_likes table created")

cursor.execute("CREATE INDEX IF NOT EXISTS idx_comments_hero ON hero_comments(hero_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_comments_user ON hero_comments(user_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id)")
print("✅ indexes created")

conn.commit()
db.release_connection(conn)
print("\n🎉 Comments tables created successfully!")
