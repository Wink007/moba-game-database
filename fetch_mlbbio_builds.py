"""
Fetch ALL pro builds from mlbb.io API and update our database.
Uses existing mlbbio_id mappings for items, emblems, and talents.
Battle spells matched by name.
"""
import requests
import json
import time
import psycopg2

DB_URL = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require"

HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://mlbb.io',
    'Referer': 'https://mlbb.io/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'X-Client-Secret': '259009191be734535393edc59e865dce'
}

API_BASE = "https://api.mlbb.io/api"


def load_mappings(conn):
    """Load all ID mappings from our DB."""
    cur = conn.cursor()

    # Items: mlbbio_id -> our item id (equipment table)
    cur.execute("SELECT id, mlbbio_id FROM equipment WHERE game_id=2 AND mlbbio_id IS NOT NULL")
    item_map = {}
    for row in cur.fetchall():
        item_map[row[1]] = row[0]
    print(f"  Items mapping: {len(item_map)} items")

    # Emblems: mlbbio_id -> our emblem id
    cur.execute("SELECT id, mlbbio_id FROM emblems WHERE game_id=2 AND mlbbio_id IS NOT NULL")
    emblem_map = {}
    for row in cur.fetchall():
        emblem_map[row[1]] = row[0]
    print(f"  Emblems mapping: {len(emblem_map)} emblems")

    # Talents: mlbbio_id -> our talent name
    cur.execute("SELECT id, name, mlbbio_id FROM emblem_talents WHERE mlbbio_id IS NOT NULL")
    talent_map = {}
    for row in cur.fetchall():
        talent_map[row[2]] = row[1]  # mlbbio_id -> name
    print(f"  Talents mapping: {len(talent_map)} talents")

    # Battle spells: name -> our spell id (case-insensitive)
    cur.execute("SELECT id, name FROM battle_spells WHERE game_id=2")
    spell_map = {}
    for row in cur.fetchall():
        spell_map[row[1].lower()] = row[0]
    # Add retribution variants
    if 'retribution' in spell_map:
        spell_map['ice retribution'] = spell_map['retribution']
        spell_map['bloody retribution'] = spell_map['retribution']
        spell_map['flame retribution'] = spell_map['retribution']
    print(f"  Spells mapping: {len(spell_map)} spells")

    # Heroes: name -> our hero id
    cur.execute("SELECT id, name FROM heroes WHERE game_id=2")
    hero_map = {}
    for row in cur.fetchall():
        hero_map[row[1].lower()] = row[0]
    print(f"  Heroes mapping: {len(hero_map)} heroes")

    return item_map, emblem_map, talent_map, spell_map, hero_map


def fetch_all_heroes_mlbbio():
    """Get list of all heroes from mlbb.io."""
    resp = requests.get(f"{API_BASE}/hero/all-heroes", headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return data.get('data', [])


def fetch_builds_mlbbio(hero_name):
    """Get all builds for a hero from mlbb.io."""
    resp = requests.get(f"{API_BASE}/item/item-build/hero/{hero_name}", headers=HEADERS, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    return data.get('data', [])


def convert_build(build, item_map, emblem_map, talent_map, spell_map):
    """Convert a mlbb.io build to our DB format."""
    # Map items
    core_items = []
    for mlbbio_item_id in build.get('items', []):
        our_id = item_map.get(mlbbio_item_id)
        if our_id:
            core_items.append(our_id)
        else:
            core_items.append(mlbbio_item_id)  # fallback

    # Map emblem
    emblems = build.get('emblems', {})
    emblem_id = emblem_map.get(emblems.get('main_id'))

    # Map talents
    talent_names = []
    for mlbbio_talent_id in emblems.get('ability_ids', []):
        name = talent_map.get(mlbbio_talent_id)
        if name:
            talent_names.append(name)

    # Map battle spell
    spell_name_raw = (build.get('battle_spell') or '').lower()
    spell_id = spell_map.get(spell_name_raw)

    return {
        "battle_spell_id": spell_id,
        "core_items": core_items,
        "emblem_id": emblem_id,
        "emblem_talents": talent_names,
        "optional_items": [],
        "source": "mlbb.io",
        "author": build.get('username', ''),
        "likes": build.get('likes_count', 0),
        "description": build.get('description', '')
    }


def main():
    print("=== Fetching pro builds from mlbb.io ===\n")

    conn = psycopg2.connect(DB_URL)
    print("Loading mappings...")
    item_map, emblem_map, talent_map, spell_map, hero_map = load_mappings(conn)

    print("\nFetching hero list from mlbb.io...")
    mlbbio_heroes = fetch_all_heroes_mlbbio()
    print(f"  Found {len(mlbbio_heroes)} heroes on mlbb.io\n")

    cur = conn.cursor()
    updated = 0
    skipped = 0
    errors = 0

    for i, hero in enumerate(mlbbio_heroes):
        hero_name = hero['hero_name']
        hero_name_lower = hero_name.lower()

        # Find our hero
        our_hero_id = hero_map.get(hero_name_lower)
        if not our_hero_id:
            # Try common name variations
            alt = hero_name_lower.replace("'", "").replace("-", " ").replace(".", "")
            our_hero_id = hero_map.get(alt)
        if not our_hero_id:
            print(f"  [{i+1}/{len(mlbbio_heroes)}] {hero_name} — NOT FOUND in our DB, skipping")
            skipped += 1
            continue

        try:
            builds_raw = fetch_builds_mlbbio(hero_name)

            if not builds_raw:
                print(f"  [{i+1}/{len(mlbbio_heroes)}] {hero_name} — no builds on mlbb.io")
                skipped += 1
                continue

            # Sort by likes descending
            builds_raw.sort(key=lambda b: b.get('likes_count', 0), reverse=True)

            # Convert all builds
            our_builds = []
            for b in builds_raw:
                converted = convert_build(b, item_map, emblem_map, talent_map, spell_map)
                our_builds.append(converted)

            # Update DB
            builds_json = json.dumps(our_builds, ensure_ascii=False)
            cur.execute("UPDATE heroes SET pro_builds = %s WHERE id = %s", (builds_json, our_hero_id))
            conn.commit()

            print(f"  [{i+1}/{len(mlbbio_heroes)}] {hero_name} — {len(our_builds)} builds saved")
            updated += 1

        except Exception as e:
            print(f"  [{i+1}/{len(mlbbio_heroes)}] {hero_name} — ERROR: {e}")
            errors += 1
            conn.rollback()

        # Rate limit
        time.sleep(0.3)

    conn.close()
    print(f"\n=== Done! Updated: {updated}, Skipped: {skipped}, Errors: {errors} ===")


if __name__ == "__main__":
    main()
