"""
Rewrite hero skill descriptions using Claude — preserves HTML <font> tags.
Run: python3 rewrite_skills.py
"""
import os
import time
import psycopg2
import anthropic
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ["DATABASE_URL"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

SYSTEM = """You are a writer for MOBA Wiki, an independent fan wiki about Mobile Legends: Bang Bang.
Rewrite skill descriptions using completely different wording while preserving all game mechanics exactly.

CRITICAL rules:
- Preserve ALL <font color="...">...</font> tags EXACTLY as-is, in the same position
- Keep all numbers, percentages, and values exactly as-is
- Rewrite only the surrounding prose sentences with different wording
- Keep approximately the same length
- English only
- Output ONLY the rewritten description, no commentary"""


def rewrite(client, hero_name, skill_name, original):
    msg = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=512,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": f"Hero: {hero_name}\nSkill: {skill_name}\n\nOriginal:\n{original}\n\nRewrite (preserve all <font> tags exactly):"
        }]
    )
    return msg.content[0].text.strip()


def main():
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
            result = rewrite(client, hero_name, skill_name, original)
            upd = conn.cursor()
            upd.execute("UPDATE hero_skills SET skill_description = %s WHERE id = %s", (result, skill_id))
            conn.commit()
            upd.close()
            print(f"done ({len(result)} chars)")
        except anthropic.RateLimitError:
            print("rate limited — waiting 60s...")
            time.sleep(60)
            try:
                result = rewrite(client, hero_name, skill_name, original)
                upd = conn.cursor()
                upd.execute("UPDATE hero_skills SET skill_description = %s WHERE id = %s", (result, skill_id))
                conn.commit()
                upd.close()
                print("retried ok")
            except Exception as e:
                print(f"retry failed: {e}")
        except Exception as e:
            print(f"ERROR: {e}")
            time.sleep(2)

        time.sleep(0.2)

    conn.close()
    print("\nAll skills done!")


if __name__ == "__main__":
    main()
