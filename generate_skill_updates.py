#!/usr/bin/env python3
"""
Batch update hero skills from external API.
This script generates SQL update statements that can be executed directly.
"""

import requests
import json
import re


EXTERNAL_API_BASE = "https://mlbb-stats.ridwaanhall.com/api/hero-detail"


# List of all Mobile Legends heroes
HEROES = [
    "Aamon", "Akai", "Aldous", "Alice", "Alpha", "Alucard", "Angela", "Argus", "Atlas", "Aulus",
    "Aurora", "Badang", "Balmond", "Bane", "Barats", "Baxia", "Beatrix", "Belerick", "Benedetta", "Brody",
    "Bruno", "Carmilla", "Cecilion", "Chang'e", "Chou", "Claude", "Clint", "Cyclops", "Diggie", "Dyrroth",
    "Edith", "Esmeralda", "Estes", "Eudora", "Fanny", "Faramis", "Floryn", "Franco", "Fredrinn", "Freya",
    "Gatotkaca", "Gloo", "Gord", "Granger", "Grock", "Guinevere", "Gusion", "Hanabi", "Hanzo", "Harith",
    "Harley", "Hayabusa", "Helcurt", "Hilda", "Hylos", "Irithel", "Jawhead", "Johnson", "Joy", "Julian",
    "Kagura", "Karina", "Karrie", "Khaleed", "Khufra", "Kimmy", "Lancelot", "Lapu-Lapu", "Layla", "Leomord",
    "Lesley", "Ling", "Lolita", "Lunox", "Luo Yi", "Lylia", "Martis", "Masha", "Mathilda", "Melissa",
    "Minotaur", "Minsitthar", "Miya", "Moskov", "Nana", "Natalia", "Natan", "Odette", "Paquito", "Pharsa",
    "Phoveus", "Popol and Kupa", "Rafaela", "Roger", "Ruby", "Saber", "Selena", "Silvanna", "Sun", "Terizla",
    "Thamuz", "Tigreal", "Uranus", "Vale", "Valentina", "Valir", "Vexana", "Wanwan", "X.Borg", "Xavier",
    "Yi Sun-shin", "Yin", "Yve", "Zhask", "Zilong", "Badang", "Baxia", "Beatrix", "Belerick", "Benedetta",
    "Cici", "Chip", "Arlott", "Novaria", "Zhuxin", "Suyou"
]


def fetch_hero_skills(hero_name):
    """Fetch hero skills from external API."""
    try:
        formatted_name = hero_name.lower().replace(' ', '-').replace("'", "")
        url = f"{EXTERNAL_API_BASE}/{formatted_name}/"
        
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
        print(f"Error for {hero_name}: {e}")
        return None


def escape_sql_string(text):
    """Escape string for SQL."""
    if not text:
        return ""
    return text.replace("'", "''")


def main():
    print("-- SQL UPDATE STATEMENTS FOR HERO SKILLS")
    print("-- Generated from https://mlbb-stats.ridwaanhall.com/api/")
    print("-- Execute these in your PostgreSQL database\n")
    print("BEGIN;\n")
    
    total_skills = 0
    
    for hero_name in sorted(set(HEROES)):
        print(f"-- {hero_name}")
        skills = fetch_hero_skills(hero_name)
        
        if skills:
            for skill in skills:
                skill_name = skill.get('skillname', '')
                skill_desc = skill.get('skilldesc', '')
                
                if skill_name and skill_desc:
                    escaped_name = escape_sql_string(skill_name)
                    escaped_desc = escape_sql_string(skill_desc)
                    
                    sql = f"""UPDATE hero_skills 
SET skill_description = '{escaped_desc}'
WHERE skill_name = '{escaped_name}' 
  AND hero_id IN (SELECT id FROM heroes WHERE name = '{escape_sql_string(hero_name)}' AND game_id = 1);
"""
                    print(sql)
                    total_skills += 1
        
        import time
        time.sleep(0.3)  # Rate limiting
    
    print("\nCOMMIT;")
    print(f"\n-- Total skills processed: {total_skills}")
    print("-- Review the statements above before executing!")


if __name__ == "__main__":
    main()
