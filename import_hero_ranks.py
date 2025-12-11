import requests
import database as db
import os
import json

# Встановлюємо connection string для PostgreSQL
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

def fetch_hero_ranks():
    """Отримує дані з API mlbb-stats"""
    base_url = "https://mlbb-stats.ridwaanhall.com/api/hero-rank"
    all_records = []
    page = 1
    
    try:
        while True:
            url = f"{base_url}?page={page}"
            print(f"📥 Завантажую сторінку {page}...")
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Перевіряємо структуру
            if data.get('code') == 0 and 'data' in data and 'records' in data['data']:
                records = data['data']['records']
                total = data['data'].get('total', 0)
                
                if not records:
                    break
                
                all_records.extend(records)
                print(f"   Отримано {len(records)} записів (всього: {len(all_records)}/{total})")
                
                # Якщо отримали всі записи
                if len(all_records) >= total:
                    break
                
                page += 1
            else:
                print(f"❌ Неочікувана структура даних")
                break
        
        print(f"✅ Завантажено {len(all_records)} записів")
        return all_records
            
    except Exception as e:
        print(f"❌ Помилка при отриманні даних: {e}")
        return all_records if all_records else None

def get_hero_id_by_mlbb_id(mlbb_hero_id):
    """Знаходить hero_id по mlbb hero_game_id"""
    conn = db.get_connection()
    cursor = conn.cursor()
    
    ph = db.get_placeholder()
    cursor.execute(
        f"SELECT id FROM heroes WHERE hero_game_id = {ph} AND game_id = 2", 
        (str(mlbb_hero_id),)
    )
    result = cursor.fetchone()
    
    db.release_connection(conn)
    
    if result:
        return result[0] if isinstance(result, tuple) else result['id']
    return None

def update_hero_ranks(records):
    """Оновлює таблицю hero_rank"""
    if not records:
        print("❌ Немає даних для оновлення")
        return
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # НЕ очищаємо таблицю, щоб не втратити дані
    # cursor.execute("DELETE FROM hero_rank")
    
    inserted = 0
    skipped = 0
    processed_heroes = set()  # Відстежуємо оброблених героїв
    
    for record in records:
        record_data = record.get('data', {})
        main_hero_id = record_data.get('main_heroid')
        
        if not main_hero_id:
            continue
        
        # Пропускаємо дублікати в рамках однієї сесії
        if main_hero_id in processed_heroes:
            continue
        processed_heroes.add(main_hero_id)
        
        # Знаходимо hero_id у нашій базі
        hero_id = get_hero_id_by_mlbb_id(main_hero_id)
        
        if not hero_id:
            hero_name = record_data.get('main_hero', {}).get('data', {}).get('name', 'Unknown')
            print(f"⚠️  Герой ID {main_hero_id} ({hero_name}) не знайдений у базі")
            skipped += 1
            continue
        
        # Отримуємо статистику
        appearance_rate = record_data.get('main_hero_appearance_rate')
        ban_rate = record_data.get('main_hero_ban_rate')
        win_rate = record_data.get('main_hero_win_rate')
        
        # Отримуємо synergy heroes
        sub_heroes = record_data.get('sub_hero', [])
        synergy_heroes = []
        
        for sub in sub_heroes[:5]:  # Топ 5 синергій
            synergy_hero_id = sub.get('heroid')
            synergy_our_hero_id = get_hero_id_by_mlbb_id(synergy_hero_id)
            
            if synergy_our_hero_id:
                synergy_heroes.append({
                    'hero_id': synergy_our_hero_id,
                    'increase_win_rate': sub.get('increase_win_rate')
                })
        
        # Вставляємо дані
        ph = db.get_placeholder()
        cursor.execute(f"""
            INSERT INTO hero_rank (hero_id, appearance_rate, ban_rate, win_rate, synergy_heroes)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph})
            ON CONFLICT (hero_id) DO UPDATE SET
                appearance_rate = EXCLUDED.appearance_rate,
                ban_rate = EXCLUDED.ban_rate,
                win_rate = EXCLUDED.win_rate,
                synergy_heroes = EXCLUDED.synergy_heroes,
                updated_at = CURRENT_TIMESTAMP
        """, (hero_id, appearance_rate, ban_rate, win_rate, json.dumps(synergy_heroes)))
        
        inserted += 1
        hero_name = record_data.get('main_hero', {}).get('data', {}).get('name', 'Unknown')
        print(f"✅ {hero_name}: WR={win_rate:.2%}, Ban={ban_rate:.2%}, Pick={appearance_rate:.2%}")
    
    conn.commit()
    db.release_connection(conn)
    
    print(f"\n📊 Результат:")
    print(f"   Додано: {inserted}")
    print(f"   Пропущено: {skipped}")

def main():
    print("🔄 Завантаження hero-rank з API...")
    records = fetch_hero_ranks()
    
    if records:
        print(f"✅ Отримано {len(records)} героїв")
        update_hero_ranks(records)
        print("\n✅ Оновлення hero_rank завершено!")
    else:
        print("❌ Не вдалося отримати дані")

if __name__ == '__main__':
    main()

    main()
