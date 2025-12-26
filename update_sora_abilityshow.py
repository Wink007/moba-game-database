#!/usr/bin/env python3
import os
import psycopg2
import json

# Railway PostgreSQL з environment variables
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL not set. Run: export DATABASE_URL='postgresql://...'")
    exit(1)

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

# Update abilityshow for Sora
abilityshow = ["60", "60", "50", "50"]
cursor.execute("""
    UPDATE heroes 
    SET abilityshow = %s
    WHERE hero_game_id = 132 AND game_id = 2
    RETURNING id, name, abilityshow
""", (json.dumps(abilityshow),))

result = cursor.fetchone()
conn.commit()

if result:
    print(f"✅ Updated {result[1]} (ID {result[0]})")
    print(f"   abilityshow: {result[2]}")
else:
    print("❌ No hero found with hero_game_id=132")

cursor.close()
conn.close()
