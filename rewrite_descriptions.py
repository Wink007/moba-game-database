"""
Rewrite hero descriptions using Claude to make them original wiki content.
Saves to full_description_wiki column (does NOT overwrite original).
Run: python3 rewrite_descriptions.py
"""

import os
import time
import psycopg2
import anthropic
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ["DATABASE_URL"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

SYSTEM_PROMPT = """You are a writer for MOBA Wiki, an independent fan wiki about Mobile Legends: Bang Bang.
Your task is to rewrite hero lore/background descriptions in the MOBA Wiki editorial style.

Rules:
- Keep all lore facts, story events and character traits from the original
- Rewrite completely using your own words — do NOT copy sentences from the original
- Write in engaging, encyclopedic wiki style (like Fandom/Liquipedia wikis)
- Add brief context about the hero's role or personality at the start if fitting
- Length: roughly equal to the original (±20%)
- Output ONLY the rewritten description, no extra commentary
- Write in English"""

def rewrite_description(client: anthropic.Anthropic, hero_name: str, original: str) -> str:
    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Hero name: {hero_name}\n\nOriginal description:\n{original}\n\nRewrite this for MOBA Wiki:"
            }
        ]
    )
    return message.content[0].text.strip()


def ensure_wiki_column(conn):
    cur = conn.cursor()
    cur.execute("""
        ALTER TABLE heroes
        ADD COLUMN IF NOT EXISTS full_description_wiki TEXT
    """)
    conn.commit()
    cur.close()


def main():
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    conn = psycopg2.connect(DB_URL)

    ensure_wiki_column(conn)

    cur = conn.cursor()
    # Only fetch heroes that haven't been rewritten yet
    cur.execute("""
        SELECT id, name, full_description
        FROM heroes
        WHERE full_description IS NOT NULL
          AND full_description != ''
          AND (full_description_wiki IS NULL OR full_description_wiki = '')
        ORDER BY id
    """)
    heroes = cur.fetchall()
    cur.close()

    total = len(heroes)
    print(f"Heroes to rewrite: {total}")

    for i, (hero_id, hero_name, original) in enumerate(heroes, 1):
        print(f"[{i}/{total}] {hero_name}...", end=" ", flush=True)

        try:
            rewritten = rewrite_description(client, hero_name, original)

            update_cur = conn.cursor()
            update_cur.execute(
                "UPDATE heroes SET full_description_wiki = %s WHERE id = %s",
                (rewritten, hero_id)
            )
            conn.commit()
            update_cur.close()

            print(f"done ({len(rewritten)} chars)")

        except anthropic.RateLimitError:
            print("rate limited — waiting 60s...")
            time.sleep(60)
            # Retry once
            try:
                rewritten = rewrite_description(client, hero_name, original)
                update_cur = conn.cursor()
                update_cur.execute(
                    "UPDATE heroes SET full_description_wiki = %s WHERE id = %s",
                    (rewritten, hero_id)
                )
                conn.commit()
                update_cur.close()
                print(f"retried ok ({len(rewritten)} chars)")
            except Exception as e:
                print(f"retry failed: {e}")

        except Exception as e:
            print(f"ERROR: {e}")

        # Be polite to the API — small delay between requests
        time.sleep(0.5)

    conn.close()
    print("\nDone! All descriptions saved to full_description_wiki column.")
    print("Review them, then run rewrite_apply.py to copy to full_description.")


SKILL_SYSTEM_PROMPT = """You are a writer for MOBA Wiki, an independent fan wiki about Mobile Legends: Bang Bang.
Rewrite skill descriptions using completely different wording while preserving all game mechanics exactly.

CRITICAL rules:
- Preserve ALL <font color="...">...</font> tags EXACTLY as-is — do not change, move, or remove them
- Keep all numbers, percentages, and values exactly as-is
- Rewrite only the surrounding prose/explanation sentences with different wording
- Keep approximately the same length
- English only
- Output ONLY the rewritten description, no commentary"""


def rewrite_skill(client: anthropic.Anthropic, hero_name: str, skill_name: str, original: str) -> str:
    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=512,
        system=SKILL_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Hero: {hero_name}\nSkill: {skill_name}\n\nOriginal:\n{original}\n\nRewrite (preserve all <font> tags exactly):"
            }
        ]
    )
    return message.content[0].text.strip()


def rewrite_skills():
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT hs.id, h.name, hs.skill_name, hs.skill_description
        FROM hero_skills hs
        JOIN heroes h ON h.id = hs.hero_id
        WHERE hs.skill_description IS NOT NULL AND hs.skill_description != ''
        ORDER BY hs.id
    """)
    skills = cur.fetchall()
    cur.close()

    total = len(skills)
    print(f"Skills to rewrite: {total}")

    for i, (skill_id, hero_name, skill_name, original) in enumerate(skills, 1):
        print(f"[{i}/{total}] {hero_name} — {skill_name}...", end=" ", flush=True)
        try:
            rewritten = rewrite_skill(client, hero_name, skill_name, original)
            upd = conn.cursor()
            upd.execute("UPDATE hero_skills SET skill_description = %s WHERE id = %s", (rewritten, skill_id))
            conn.commit()
            upd.close()
            print(f"done ({len(rewritten)} chars)")
        except anthropic.RateLimitError:
            print("rate limited — waiting 60s...")
            time.sleep(60)
            try:
                rewritten = rewrite_skill(client, hero_name, skill_name, original)
                upd = conn.cursor()
                upd.execute("UPDATE hero_skills SET skill_description = %s WHERE id = %s", (rewritten, skill_id))
                conn.commit()
                upd.close()
                print(f"retried ok")
            except Exception as e:
                print(f"retry failed: {e}")
        except Exception as e:
            print(f"ERROR: {e}")
            time.sleep(2)

        time.sleep(0.2)

    conn.close()
    print("\nAll skills done!")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "skills":
        rewrite_skills()
    else:
        main()
