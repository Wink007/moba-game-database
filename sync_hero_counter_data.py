#!/usr/bin/env python3
"""
Синхронізація counter_data та compatibility_data з hero_rank в heroes
Використовує дані з hero_rank (days=7, rank='all') як базові
"""

import database as db
import json

def sync_counter_compatibility_data(days=7, rank='all'):
    """Оновлює поля counter_data та compatibility_data в heroes з hero_rank"""
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Отримуємо всі записи з hero_rank для вказаних параметрів
    cursor.execute("""
        SELECT hero_id, counter_data, compatibility_data
        FROM hero_rank
        WHERE days = %s AND rank = %s
    """, (days, rank))
    
    hero_ranks = cursor.fetchall()
    
    updated_count = 0
    
    for row in hero_ranks:
        hero_id = row[0]
        counter_data = row[1]
        compatibility_data = row[2]
        
        # Оновлюємо поля в heroes
        cursor.execute("""
            UPDATE heroes
            SET counter_data = %s,
                compatibility_data = %s
            WHERE id = %s
        """, (counter_data, compatibility_data, hero_id))
        
        updated_count += 1
        print(f"Updated hero_id={hero_id}")
    
    conn.commit()
    db.release_connection(conn)
    
    print(f"\n✅ Successfully synced {updated_count} heroes")
    print(f"Parameters: days={days}, rank={rank}")

if __name__ == "__main__":
    import sys
    
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    rank = sys.argv[2] if len(sys.argv) > 2 else 'all'
    
    print(f"Syncing counter/compatibility data from hero_rank...")
    print(f"Parameters: days={days}, rank={rank}\n")
    
    sync_counter_compatibility_data(days, rank)
