#!/usr/bin/env python3
"""
Script to check and update hero skills from external API.
Fetches skill descriptions from https://mlbb-stats.ridwaanhall.com/api/hero-detail/{name}/
and updates them in our database if they've changed.
"""

import os
import requests
import json
from urllib.parse import quote
import time

# Use database.py configuration
from database import get_connection

API_BASE_URL = "https://mlbb-stats.ridwaanhall.com/api/hero-detail"


def fetch_hero_skills_from_api(hero_name):
    """Fetch hero skills from external API."""
    try:
        # Format name for URL (lowercase, handle spaces)
        formatted_name = hero_name.lower().replace(' ', '-')
        url = f"{API_BASE_URL}/{formatted_name}/"
        
        print(f"Fetching data for {hero_name} from {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') == 0 and data.get('data', {}).get('records'):
                hero_data = data['data']['records'][0]['data']['hero']['data']
                skill_lists = hero_data.get('heroskilllist', [])
                
                if skill_lists:
                    skills = skill_lists[0].get('skilllist', [])
                    return skills
        else:
            print(f"  API returned status {response.status_code}")
        
        return None
    except Exception as e:
        print(f"  Error fetching from API: {e}")
        return None


def clean_html_tags(text):
    """Remove HTML tags from text for comparison."""
    import re
    if not text:
        return ""
    # Remove font color tags
    text = re.sub(r'<font[^>]*>', '', text)
    text = re.sub(r'</font>', '', text)
    # Remove other HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Normalize whitespace
    text = ' '.join(text.split())
    return text


def compare_skills(db_skills, api_skills):
    """Compare skills from database with API and return differences."""
    changes = []
    
    # Create mapping by skill name
    api_skills_map = {skill['skillname']: skill for skill in api_skills}
    
    for db_skill in db_skills:
        skill_name = db_skill['skill_name']
        
        if skill_name in api_skills_map:
            api_skill = api_skills_map[skill_name]
            
            # Compare descriptions (clean HTML for fair comparison)
            db_desc_clean = clean_html_tags(db_skill.get('skill_description', ''))
            api_desc_clean = clean_html_tags(api_skill.get('skilldesc', ''))
            
            if db_desc_clean != api_desc_clean:
                changes.append({
                    'skill_id': db_skill['id'],
                    'skill_name': skill_name,
                    'old_description': db_skill.get('skill_description', ''),
                    'new_description': api_skill.get('skilldesc', ''),
                    'old_clean': db_desc_clean[:100],
                    'new_clean': api_desc_clean[:100]
                })
    
    return changes


def update_skill_description(conn, skill_id, new_description):
    """Update skill description in database."""
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE hero_skills SET skill_description = %s WHERE id = %s",
            (new_description, skill_id)
        )
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"  Error updating skill: {e}")
        conn.rollback()
        return False


def main():
    """Main function to check and update hero skills."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get all heroes with Mobile Legends game_id (1)
        cursor.execute("""
            SELECT id, name, hero_game_id 
            FROM heroes 
            WHERE game_id = 1
            ORDER BY name
        """)
        heroes = cursor.fetchall()
        
        print(f"\nFound {len(heroes)} heroes in database\n")
        print("=" * 80)
        
        total_changes = 0
        heroes_with_changes = []
        
        for hero_id, hero_name, hero_game_id in heroes:
            print(f"\nChecking: {hero_name} (ID: {hero_game_id})")
            
            # Fetch skills from database
            cursor.execute("""
                SELECT id, skill_name, skill_description, skill_type
                FROM hero_skills
                WHERE hero_id = %s
                ORDER BY display_order
            """, (hero_id,))
            
            db_skills = []
            for row in cursor.fetchall():
                db_skills.append({
                    'id': row[0],
                    'skill_name': row[1],
                    'skill_description': row[2],
                    'skill_type': row[3]
                })
            
            if not db_skills:
                print("  No skills in database")
                continue
            
            # Fetch skills from API
            api_skills = fetch_hero_skills_from_api(hero_name)
            
            if not api_skills:
                print("  Could not fetch from API")
                time.sleep(0.5)  # Rate limiting
                continue
            
            # Compare and find changes
            changes = compare_skills(db_skills, api_skills)
            
            if changes:
                print(f"  Found {len(changes)} skill(s) with changed descriptions:")
                heroes_with_changes.append(hero_name)
                
                for change in changes:
                    print(f"\n  Skill: {change['skill_name']}")
                    print(f"  Old (first 100 chars): {change['old_clean']}")
                    print(f"  New (first 100 chars): {change['new_clean']}")
                    
                    # Ask for confirmation
                    response = input(f"  Update this skill? (y/n/a=all): ").strip().lower()
                    
                    if response == 'a':
                        # Update all remaining skills
                        for ch in changes:
                            if update_skill_description(conn, ch['skill_id'], ch['new_description']):
                                print(f"  ✓ Updated: {ch['skill_name']}")
                                total_changes += 1
                            else:
                                print(f"  ✗ Failed to update: {ch['skill_name']}")
                        break
                    elif response == 'y':
                        if update_skill_description(conn, change['skill_id'], change['new_description']):
                            print(f"  ✓ Updated: {change['skill_name']}")
                            total_changes += 1
                        else:
                            print(f"  ✗ Failed to update: {change['skill_name']}")
                    else:
                        print(f"  Skipped: {change['skill_name']}")
            else:
                print("  ✓ All skills up to date")
            
            time.sleep(0.5)  # Rate limiting
        
        print("\n" + "=" * 80)
        print(f"\nSummary:")
        print(f"  Total heroes checked: {len(heroes)}")
        print(f"  Heroes with changes: {len(heroes_with_changes)}")
        print(f"  Total skills updated: {total_changes}")
        
        if heroes_with_changes:
            print(f"\n  Heroes with updated skills:")
            for hero_name in heroes_with_changes:
                print(f"    - {hero_name}")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()
