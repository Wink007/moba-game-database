#!/usr/bin/env python3
"""
Update hero skills descriptions from mlbb-stats API
Fetches skilldesc from https://mlbb-stats.ridwaanhall.com/api/hero-detail/{name}/
and updates skill_description in our database
"""

import requests
import time
from database import get_connection, release_connection, get_placeholder

def get_heroes_from_db(game_id=2):
    """Get all heroes for Mobile Legends (game_id=2)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM heroes WHERE game_id = %s ORDER BY id", (game_id,))
    
    heroes = []
    for row in cursor.fetchall():
        heroes.append({
            'id': row[0],
            'name': row[1]
        })
    
    release_connection(conn)
    return heroes

def get_hero_skills(hero_id):
    """Get all skills for a hero"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, skill_name, skill_description 
        FROM hero_skills 
        WHERE hero_id = %s 
        ORDER BY display_order, id
    """, (hero_id,))
    
    skills = []
    for row in cursor.fetchall():
        skills.append({
            'id': row[0],
            'skill_name': row[1],
            'skill_description': row[2]
        })
    
    release_connection(conn)
    return skills

def fetch_hero_skills_from_api(hero_name):
    """Fetch skills from mlbb-stats API"""
    api_name = hero_name.replace(' ', '_')
    url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{api_name}/"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Navigate: data -> records -> [0] -> data -> hero -> data -> heroskilllist -> [0] -> skilllist
            if 'data' in data and 'records' in data['data'] and len(data['data']['records']) > 0:
                record = data['data']['records'][0]
                if 'data' in record and 'hero' in record['data'] and 'data' in record['data']['hero']:
                    hero_data = record['data']['hero']['data']
                    if 'heroskilllist' in hero_data and len(hero_data['heroskilllist']) > 0:
                        skilllist = hero_data['heroskilllist'][0].get('skilllist', [])
                        
                        # Extract skill descriptions
                        skills = []
                        for skill in skilllist:
                            skills.append({
                                'name': skill.get('skillname', ''),
                                'description': skill.get('skilldesc', '')
                            })
                        return skills
            return None
        else:
            print(f"API error {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def update_skill_description(skill_id, description):
    """Update skill_description in database"""
    conn = get_connection()
    cursor = conn.cursor()
    ph = get_placeholder()
    
    cursor.execute(f"""
        UPDATE hero_skills 
        SET skill_description = {ph}
        WHERE id = {ph}
    """, (description, skill_id))
    
    conn.commit()
    release_connection(conn)

def clean_html_tags(text):
    """Remove HTML tags from skill description but keep the raw format"""
    # Don't clean - keep original format with HTML tags
    # Just normalize newlines
    if not text:
        return text
    # API returns \\n as string, convert to actual newlines
    text = text.replace('\\n', '\n')
    return text

def main():
    print("🎯 Оновлення описів скілів героїв з mlbb-stats API")
    print("=" * 70)
    
    heroes = get_heroes_from_db(game_id=2)
    print(f"📊 Знайдено героїв: {len(heroes)}")
    print()
    
    total_skills_updated = 0
    total_skills_skipped = 0
    heroes_failed = 0
    
    for i, hero in enumerate(heroes, 1):
        hero_id = hero['id']
        hero_name = hero['name']
        
        print(f"[{i}/{len(heroes)}] {hero_name}...", end=' ')
        
        # Get current skills from DB
        db_skills = get_hero_skills(hero_id)
        if not db_skills:
            print(f"⚠️  Немає скілів у БД")
            continue
        
        # Fetch skills from API
        api_skills = fetch_hero_skills_from_api(hero_name)
        
        if not api_skills:
            print(f"❌ Не знайдено в API")
            heroes_failed += 1
            time.sleep(0.5)
            continue
        
        # Match and update skills
        skills_updated = 0
        for j, db_skill in enumerate(db_skills):
            if j < len(api_skills):
                api_skill = api_skills[j]
                new_desc = api_skill['description']
                old_desc = db_skill['skill_description'] or ''
                
                # Normalize for comparison
                new_desc_normalized = clean_html_tags(new_desc) if new_desc else ''
                old_desc_normalized = old_desc.replace('\\n', '\n')
                
                if new_desc_normalized and new_desc_normalized != old_desc_normalized:
                    update_skill_description(db_skill['id'], new_desc_normalized)
                    skills_updated += 1
        
        if skills_updated > 0:
            print(f"✅ Оновлено {skills_updated}/{len(db_skills)} скілів")
            total_skills_updated += skills_updated
        else:
            print(f"⏭️  Без змін ({len(db_skills)} скілів)")
            total_skills_skipped += len(db_skills)
        
        # Rate limiting
        if i < len(heroes):
            time.sleep(0.5)
    
    print()
    print("=" * 70)
    print(f"✅ Оновлено скілів: {total_skills_updated}")
    print(f"⏭️  Пропущено: {total_skills_skipped}")
    print(f"❌ Героїв з помилками: {heroes_failed}")
    print(f"📊 Всього героїв оброблено: {len(heroes)}")

if __name__ == '__main__':
    main()
