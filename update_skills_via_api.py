#!/usr/bin/env python3
"""
Script to check and update hero skills via our API server.
Fetches skill descriptions from https://mlbb-stats.ridwaanhall.com/api/hero-detail/{name}/
and updates them through our API.
"""

import requests
import json
import time
import re

EXTERNAL_API_BASE = "https://mlbb-stats.ridwaanhall.com/api/hero-detail"
OUR_API_BASE = "https://game-database-production.up.railway.app"


def fetch_hero_skills_from_external_api(hero_name):
    """Fetch hero skills from external MLBB API."""
    try:
        formatted_name = hero_name.lower().replace(' ', '-')
        url = f"{EXTERNAL_API_BASE}/{formatted_name}/"
        
        print(f"  Fetching from external API: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('code') == 0 and data.get('data', {}).get('records'):
                hero_data = data['data']['records'][0]['data']['hero']['data']
                skill_lists = hero_data.get('heroskilllist', [])
                
                if skill_lists:
                    skills = skill_lists[0].get('skilllist', [])
                    return skills
        
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None


def clean_html_for_comparison(text):
    """Remove HTML tags for comparison purposes."""
    if not text:
        return ""
    text = re.sub(r'<font[^>]*>', '', text)
    text = re.sub(r'</font>', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = ' '.join(text.split())
    return text


def get_all_heroes():
    """Get all Mobile Legends heroes from our API."""
    try:
        url = f"{OUR_API_BASE}/heroes?game_id=1"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching heroes: {e}")
        return []


def get_hero_skills(hero_id):
    """Get hero skills from our API."""
    try:
        url = f"{OUR_API_BASE}/heroes/{hero_id}/skills"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error fetching skills: {e}")
        return []


def update_skill_description(hero_id, skill_id, new_description):
    """Update skill description through our API."""
    try:
        url = f"{OUR_API_BASE}/heroes/{hero_id}/skills/{skill_id}"
        data = {"skill_description": new_description}
        response = requests.put(url, json=data, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"  Error updating: {e}")
        return False


def main():
    print("\n" + "="*80)
    print("HERO SKILLS UPDATE SCRIPT")
    print("="*80 + "\n")
    
    # Get all heroes
    print("Fetching heroes from database...")
    heroes = get_all_heroes()
    print(f"Found {len(heroes)} heroes\n")
    
    total_checked = 0
    total_updated = 0
    heroes_with_changes = []
    
    for hero in heroes:
        hero_id = hero['id']
        hero_name = hero['name']
        
        print(f"\n{'='*80}")
        print(f"Checking: {hero_name} (ID: {hero_id})")
        print(f"{'='*80}")
        
        # Get current skills from our database
        our_skills = get_hero_skills(hero_id)
        if not our_skills:
            print("  No skills in database")
            continue
        
        # Fetch skills from external API
        external_skills = fetch_hero_skills_from_external_api(hero_name)
        if not external_skills:
            print("  Could not fetch from external API")
            time.sleep(0.5)
            continue
        
        # Create mapping by skill name
        external_map = {skill['skillname']: skill for skill in external_skills}
        
        changes_found = False
        skill_changes = []
        
        for our_skill in our_skills:
            skill_name = our_skill['skill_name']
            skill_id = our_skill['id']
            
            if skill_name in external_map:
                external_skill = external_map[skill_name]
                
                our_desc = our_skill.get('skill_description', '')
                new_desc = external_skill.get('skilldesc', '')
                
                # Clean for comparison
                our_clean = clean_html_for_comparison(our_desc)
                new_clean = clean_html_for_comparison(new_desc)
                
                if our_clean != new_clean:
                    changes_found = True
                    skill_changes.append({
                        'skill_id': skill_id,
                        'skill_name': skill_name,
                        'old': our_desc,
                        'new': new_desc,
                        'old_preview': our_clean[:150],
                        'new_preview': new_clean[:150]
                    })
        
        if changes_found:
            print(f"\n  ⚠️  Found {len(skill_changes)} skill(s) with changed descriptions!")
            heroes_with_changes.append(hero_name)
            
            for change in skill_changes:
                print(f"\n  📝 Skill: {change['skill_name']}")
                print(f"  Old: {change['old_preview']}...")
                print(f"  New: {change['new_preview']}...")
                
                response = input(f"\n  Update this skill? (y/n/a=update all for {hero_name}/s=skip hero): ").strip().lower()
                
                if response == 's':
                    print(f"  Skipping {hero_name}")
                    break
                elif response == 'a':
                    # Update all changes for this hero
                    for ch in skill_changes:
                        if update_skill_description(hero_id, ch['skill_id'], ch['new']):
                            print(f"  ✅ Updated: {ch['skill_name']}")
                            total_updated += 1
                        else:
                            print(f"  ❌ Failed: {ch['skill_name']}")
                    break
                elif response == 'y':
                    if update_skill_description(hero_id, change['skill_id'], change['new']):
                        print(f"  ✅ Updated: {change['skill_name']}")
                        total_updated += 1
                    else:
                        print(f"  ❌ Failed: {change['skill_name']}")
                else:
                    print(f"  ⏭️  Skipped: {change['skill_name']}")
        else:
            print("  ✓ All skills up to date")
        
        total_checked += 1
        time.sleep(0.5)  # Rate limiting
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"Heroes checked: {total_checked}")
    print(f"Heroes with changes: {len(heroes_with_changes)}")
    print(f"Skills updated: {total_updated}")
    
    if heroes_with_changes:
        print(f"\nHeroes with updated skills:")
        for name in heroes_with_changes:
            print(f"  • {name}")
    
    print("\n✨ Done!\n")


if __name__ == "__main__":
    main()
