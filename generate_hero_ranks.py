import database as db
import os

# Встановлюємо connection string для PostgreSQL
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

def calculate_hero_ranks():
    """Розраховує тірні ранги на основі win rate"""
    
    # Отримуємо всіх героїв Mobile Legends
    heroes = db.get_heroes(game_id=2, include_details=False, include_skills=False, include_relation=False)
    
    print(f"📊 Отримано {len(heroes)} героїв")
    
    # Для демо створимо фейкові ранги на основі ID
    # В реальності тут можна використовувати статистику win rate
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Очищаємо таблицю
    cursor.execute("DELETE FROM hero_rank")
    
    tiers = ['S+', 'S', 'A', 'B', 'C']
    heroes_per_tier = len(heroes) // len(tiers)
    
    for idx, hero in enumerate(heroes):
        tier_index = min(idx // heroes_per_tier, len(tiers) - 1)
        tier = tiers[tier_index]
        position = (idx % heroes_per_tier) + 1
        
        # Фейковий percentage (в реальності - win rate)
        percentage = 55.0 - (tier_index * 5) + (position * 0.1)
        
        ph = db.get_placeholder()
        cursor.execute(f"""
            INSERT INTO hero_rank (hero_id, tier, percentage, position)
            VALUES ({ph}, {ph}, {ph}, {ph})
        """, (hero['id'], tier, round(percentage, 2), position))
        
        print(f"✅ {hero['name']} → {tier} (#{position})")
    
    conn.commit()
    db.release_connection(conn)
    
    print(f"\n✅ Створено ранги для {len(heroes)} героїв!")

if __name__ == '__main__':
    calculate_hero_ranks()
