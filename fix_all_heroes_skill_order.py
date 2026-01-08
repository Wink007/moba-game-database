import json
import urllib.request
import urllib.parse
import time

API_BASE = "https://web-production-8570.up.railway.app/api"
EXTERNAL_API = "https://mlbb-stats.ridwaanhall.com/api/hero-detail"

def get_hero_slug(hero_name):
    """Convert hero name to slug format (e.g., 'Lapu-Lapu' -> 'lapu-lapu')"""
    return hero_name.lower().replace(' ', '-').replace("'", '')

def fetch_json(url):
    """Fetch JSON data from URL"""
    try:
        with urllib.request.urlopen(url) as response:
            return json.load(response)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def update_skill_display_order(hero_id, skill_id, display_order):
    """Update display_order for a skill via API"""
    url = f"{API_BASE}/heroes/{hero_id}/skills/{skill_id}"
    data = json.dumps({"display_order": display_order}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, method='PUT')
        req.add_header('Content-Type', 'application/json')
        with urllib.request.urlopen(req) as response:
            return response.status == 200
    except Exception as e:
        print(f"  ❌ Error updating skill {skill_id}: {e}")
        return False

def normalize_skill_name(name):
    """Normalize skill name for comparison"""
    return name.lower().strip().replace(':', '').replace('.', '').replace('  ', ' ')

def main():
    print("🔍 Fetching all heroes from database...")
    heroes = fetch_json(f"{API_BASE}/heroes?game_id=2")
    
    if not heroes:
        print("❌ Failed to fetch heroes")
        return
    
    print(f"✅ Found {len(heroes)} heroes\n")
    
    heroes_fixed = 0
    heroes_skipped = 0
    heroes_failed = 0
    
    for i, hero in enumerate(heroes, 1):
        hero_id = hero['id']
        hero_name = hero['name']
        hero_slug = get_hero_slug(hero_name)
        
        print(f"[{i}/{len(heroes)}] {hero_name} (ID: {hero_id}, slug: {hero_slug})")
        
        # Fetch correct order from external API
        external_data = fetch_json(f"{EXTERNAL_API}/{hero_slug}/")
        
        if not external_data or 'data' not in external_data:
            print(f"  ⚠️  No external data found, skipping...")
            heroes_skipped += 1
            continue
        
        # Navigate to the correct skills array
        try:
            records = external_data['data'].get('records', [])
            if not records:
                print(f"  ⚠️  No records in external data, skipping...")
                heroes_skipped += 1
                continue
            
            hero_data = records[0]['data']['hero']['data']
            heroskilllist = hero_data.get('heroskilllist', [])
            
            # Get the first skilllist (base skills, not transformed)
            if not heroskilllist or 'skilllist' not in heroskilllist[0]:
                print(f"  ⚠️  No skilllist in external data, skipping...")
                heroes_skipped += 1
                continue
                
            correct_skills = heroskilllist[0]['skilllist']
        except (KeyError, IndexError) as e:
            print(f"  ⚠️  Error parsing external data: {e}, skipping...")
            heroes_skipped += 1
            continue
        
        if not correct_skills:
            print(f"  ⚠️  No skills in external data, skipping...")
            heroes_skipped += 1
            continue
        
        # Fetch current skills from our database
        our_skills = fetch_json(f"{API_BASE}/heroes/{hero_id}/skills")
        
        if not our_skills:
            print(f"  ⚠️  No skills in our database, skipping...")
            heroes_skipped += 1
            continue
        
        # Filter only base skills (not transformed)
        base_skills = [s for s in our_skills if not s.get('is_transformed', False)]
        
        if not base_skills:
            print(f"  ⚠️  No base skills found, skipping...")
            heroes_skipped += 1
            continue
        
        print(f"  📊 External: {len(correct_skills)} skills, Our DB: {len(base_skills)} base skills")
        
        # Match skills by name
        updates_needed = []
        
        for correct_idx, correct_skill in enumerate(correct_skills):
            correct_name = normalize_skill_name(correct_skill.get('skillname', ''))
            
            # Find matching skill in our database
            matched_skill = None
            for our_skill in base_skills:
                our_name = normalize_skill_name(our_skill['skill_name'])
                if our_name == correct_name or correct_name in our_name or our_name in correct_name:
                    matched_skill = our_skill
                    break
            
            if matched_skill:
                current_order = matched_skill.get('display_order')
                if current_order != correct_idx:
                    updates_needed.append({
                        'id': matched_skill['id'],
                        'name': matched_skill['skill_name'],
                        'current': current_order,
                        'correct': correct_idx
                    })
        
        if updates_needed:
            print(f"  🔧 Fixing {len(updates_needed)} skills:")
            all_success = True
            
            for update in updates_needed:
                print(f"    - {update['name']}: {update['current']} -> {update['correct']}")
                success = update_skill_display_order(hero_id, update['id'], update['correct'])
                if not success:
                    all_success = False
                time.sleep(0.1)  # Small delay between updates
            
            if all_success:
                print(f"  ✅ Successfully fixed {hero_name}")
                heroes_fixed += 1
            else:
                print(f"  ⚠️  Partially fixed {hero_name}")
                heroes_failed += 1
        else:
            print(f"  ✓ Order is correct")
            heroes_skipped += 1
        
        print()
        time.sleep(0.2)  # Delay between heroes to avoid rate limiting
    
    print("\n" + "="*60)
    print("📈 SUMMARY:")
    print(f"  ✅ Fixed: {heroes_fixed} heroes")
    print(f"  ✓ Already correct: {heroes_skipped} heroes")
    print(f"  ❌ Failed: {heroes_failed} heroes")
    print("="*60)

if __name__ == "__main__":
    main()
