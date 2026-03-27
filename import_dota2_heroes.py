#!/usr/bin/env python3
"""
Import Dota 2 heroes from official datafeed API into PostgreSQL.
game_id=8 (Dota 2), sets is_visible=false by default.

Usage:
  python3 import_dota2_heroes.py             # dry run (no DB write)
  python3 import_dota2_heroes.py --commit    # write to DB
  python3 import_dota2_heroes.py --update    # update existing records
"""

import sys
import json
import time
import argparse
import requests
import psycopg2
import psycopg2.extras

DATABASE_URL = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"
DOTA_GAME_ID = 8
HERO_LIST_URL = "https://www.dota2.com/datafeed/herolist?language=english"
HERO_DATA_URL = "https://www.dota2.com/datafeed/herodata?language=english&hero_id={}"
CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react"

# primary_attr: 0=strength, 1=agility, 2=intelligence, 3=universal
ATTR_MAP = {0: "Strength", 1: "Agility", 2: "Intelligence", 3: "Universal"}
ATTR_SHORT = {0: "str", 1: "agi", 2: "int", 3: "universal"}

# attack_capability: 1=melee, 2=ranged
ATTACK_MAP = {1: "Melee", 2: "Ranged"}


def hero_slug(internal_name: str) -> str:
    """'npc_dota_hero_antimage' → 'antimage'"""
    return internal_name.replace("npc_dota_hero_", "")


def hero_portrait_url(internal_name: str) -> str:
    slug = hero_slug(internal_name)
    return f"{CDN}/heroes/{slug}.png"


def ability_icon_url(ability_name: str) -> str:
    return f"{CDN}/abilities/{ability_name}.png"


def fetch_hero_list() -> list[dict]:
    r = requests.get(HERO_LIST_URL, timeout=15)
    r.raise_for_status()
    data = r.json()
    heroes = data["result"]["data"]["heroes"]
    return heroes


def fetch_hero_data(hero_id: int) -> dict:
    url = HERO_DATA_URL.format(hero_id)
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    data = r.json()
    return data["result"]["data"]["heroes"][0]


def build_hero_stats(h: dict) -> dict:
    return {
        "primary_attr": ATTR_SHORT.get(h.get("primary_attr", 0)),
        "attack_type": ATTACK_MAP.get(h.get("attack_capability", 1), "Melee"),
        "str_base": h.get("str_base"),
        "str_gain": h.get("str_gain"),
        "agi_base": h.get("agi_base"),
        "agi_gain": h.get("agi_gain"),
        "int_base": h.get("int_base"),
        "int_gain": h.get("int_gain"),
        "movement_speed": h.get("movement_speed"),
        "armor": h.get("armor"),
        "magic_resistance": h.get("magic_resistance"),
        "attack_range": h.get("attack_range"),
        "attack_rate": h.get("attack_rate"),
        "damage_min": h.get("damage_min"),
        "damage_max": h.get("damage_max"),
        "max_health": h.get("max_health"),
        "health_regen": h.get("health_regen"),
        "max_mana": h.get("max_mana"),
        "mana_regen": h.get("mana_regen"),
        "sight_range_day": h.get("sight_range_day"),
        "sight_range_night": h.get("sight_range_night"),
        "turn_rate": h.get("turn_rate"),
        "complexity": h.get("complexity"),
    }


def build_abilities_show(h: dict) -> list[dict]:
    """Build abilityshow-style JSON for hero page display."""
    abilities = []
    for ab in h.get("abilities", []):
        abilities.append({
            "name": ab.get("name_loc", ""),
            "internal_name": ab.get("name", ""),
            "description": ab.get("desc_loc", ""),
            "lore": ab.get("lore_loc", ""),
            "icon": ability_icon_url(ab.get("name", "")),
            "type": ab.get("type"),
            "behavior": ab.get("behavior"),
            "damage": ab.get("damage"),
            "cooldowns": ab.get("cooldowns", []),
            "mana_costs": ab.get("mana_costs", []),
            "cast_ranges": ab.get("cast_ranges", []),
            "has_scepter": ab.get("ability_has_scepter", False),
            "has_shard": ab.get("ability_has_shard", False),
            "is_innate": ab.get("ability_is_innate", False),
            "shard_desc": ab.get("shard_loc", ""),
            "scepter_desc": ab.get("scepter_loc", ""),
        })
    # append talents as a special entry
    talents = h.get("talents", [])
    if talents:
        abilities.append({
            "name": "Talents",
            "internal_name": "_talents",
            "icon": f"{CDN}/talents/talents.png",
            "is_talents": True,
            "items": [{"name": t.get("name_loc", ""), "level": t.get("level")} for t in talents],
        })
    return abilities


def build_roles_list(h: dict) -> list[str]:
    """Build roles list like ['Carry', 'Escape', 'Nuker'].
    role_levels is a 9-element array where index=role and value=weight (0=unused).
    """
    role_by_idx = {
        0: "Carry", 1: "Support", 2: "Nuker", 3: "Disabler",
        4: "Jungler", 5: "Durable", 6: "Escape", 7: "Pusher", 8: "Initiator",
    }
    role_levels = h.get("role_levels", [])
    return [role_by_idx[i] for i, lvl in enumerate(role_levels) if lvl > 0]


def import_skills(cur, hero_db_id: int, h: dict):
    """Insert abilities into hero_skills."""
    for idx, ab in enumerate(h.get("abilities", [])):
        name = ab.get("name_loc") or ab.get("name", "")
        if not name:
            continue
        description = ab.get("desc_loc", "") or ""
        icon = ability_icon_url(ab.get("name", ""))
        skill_type = "active"
        behavior = ab.get("behavior", 0)
        try:
            behavior_int = int(behavior)
        except (TypeError, ValueError):
            behavior_int = 0
        # behavior flags: 0x10 = passive
        if behavior_int & 16:
            skill_type = "passive"

        # Build cooldown/mana as readable text for skill_parameters
        params = {}
        cds = ab.get("cooldowns", [])
        mana = ab.get("mana_costs", [])
        ranges = ab.get("cast_ranges", [])
        if cds:
            params["cooldown"] = cds
        if mana:
            params["mana_cost"] = mana
        if ranges:
            params["cast_range"] = ranges
        special = ab.get("special_values", [])
        if special:
            for sv in special[:5]:  # limit to first 5 special values
                sname = sv.get("name", "")
                vals = sv.get("values_float") or sv.get("values_int") or []
                if sname and vals:
                    params[sname] = vals

        cur.execute("""
            INSERT INTO hero_skills
              (hero_id, skill_name, skill_description, image, skill_type,
               skill_parameters, display_order, is_transformed)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0)
        """, (
            hero_db_id,
            name[:500],
            description[:2000] if description else None,
            icon,
            skill_type,
            json.dumps(params, ensure_ascii=False) if params else None,
            idx,
        ))


def run(commit: bool, update: bool):
    print(f"[INFO] Fetching hero list...")
    hero_list = fetch_hero_list()
    print(f"[INFO] Got {len(hero_list)} heroes")

    conn = None
    if commit:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

    inserted = 0
    updated = 0
    skipped = 0
    errors = []

    for i, hero_stub in enumerate(hero_list):
        hero_id = hero_stub["id"]
        hero_name = hero_stub.get("name_loc", f"hero_{hero_id}")
        print(f"  [{i+1}/{len(hero_list)}] {hero_name} (id={hero_id})", end=" ", flush=True)

        try:
            h = fetch_hero_data(hero_id)
        except Exception as e:
            print(f"ERROR fetching: {e}")
            errors.append((hero_id, str(e)))
            time.sleep(0.5)
            continue

        internal_name = h.get("name", "")
        slug = hero_slug(internal_name)
        portrait = hero_portrait_url(internal_name)
        primary_attr = ATTR_MAP.get(h.get("primary_attr", 0), "Strength")
        roles_list = build_roles_list(h)
        roles_json = json.dumps(roles_list, ensure_ascii=False)
        short_desc = (h.get("npe_desc_loc") or h.get("hype_loc") or "").strip()[:1000]
        full_desc = (h.get("bio_loc") or "").strip()
        hero_stats = build_hero_stats(h)
        ability_show = build_abilities_show(h)

        if not commit:
            print(f"→ DRY: {slug}, attr={primary_attr}, roles={roles[:40]}, abilities={len(h.get('abilities',[]))}")
            time.sleep(0.1)
            continue

        # Check if already exists
        cur.execute("SELECT id FROM heroes WHERE game_id=%s AND hero_game_id=%s", (DOTA_GAME_ID, hero_id))
        existing = cur.fetchone()

        if existing and not update:
            print(f"→ SKIP (exists, id={existing[0]})")
            skipped += 1
            time.sleep(0.1)
            continue

        if existing and update:
            db_hero_id = existing[0]
            cur.execute("""
                UPDATE heroes SET
                  name=%s, image=%s, role=%s, roles=%s,
                  short_description=%s, full_description=%s,
                  hero_stats=%s, abilityshow=%s
                WHERE id=%s
            """, (
                hero_name, portrait, primary_attr, roles_json,
                short_desc, full_desc,
                json.dumps(hero_stats, ensure_ascii=False),
                json.dumps(ability_show, ensure_ascii=False),
                db_hero_id,
            ))
            # Refresh skills
            cur.execute("DELETE FROM hero_skills WHERE hero_id=%s", (db_hero_id,))
            import_skills(cur, db_hero_id, h)
            conn.commit()
            print(f"→ UPDATED (id={db_hero_id})")
            updated += 1
        else:
            cur.execute("""
                INSERT INTO heroes
                  (game_id, name, hero_game_id, image, role, roles,
                   short_description, full_description,
                   hero_stats, abilityshow)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
            """, (
                DOTA_GAME_ID, hero_name, hero_id, portrait,
                primary_attr, roles_json,
                short_desc, full_desc,
                json.dumps(hero_stats, ensure_ascii=False),
                json.dumps(ability_show, ensure_ascii=False),
            ))
            db_hero_id = cur.fetchone()[0]
            import_skills(cur, db_hero_id, h)
            conn.commit()
            print(f"→ INSERTED (id={db_hero_id})")
            inserted += 1

        time.sleep(0.15)  # polite delay for Valve API

    if conn:
        conn.close()

    print()
    print("=" * 50)
    if commit:
        print(f"DONE: inserted={inserted}, updated={updated}, skipped={skipped}, errors={len(errors)}")
    else:
        print(f"DRY RUN complete for {len(hero_list)} heroes. Use --commit to write to DB.")
    if errors:
        print("Errors:")
        for hid, msg in errors:
            print(f"  hero_id={hid}: {msg}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", action="store_true", help="Write to DB")
    parser.add_argument("--update", action="store_true", help="Update existing records")
    args = parser.parse_args()

    run(commit=args.commit, update=args.update)
