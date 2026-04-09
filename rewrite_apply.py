"""
After reviewing full_description_wiki, run this to apply it as the main description.
Also copies to full_description_uk if the uk column is empty (English fallback).
Run: python3 rewrite_apply.py
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ["DATABASE_URL"]


def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*) FROM heroes
        WHERE full_description_wiki IS NOT NULL AND full_description_wiki != ''
    """)
    ready = cur.fetchone()[0]
    print(f"Heroes with wiki description ready: {ready}")

    confirm = input("Apply wiki descriptions to full_description? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        conn.close()
        return

    cur.execute("""
        UPDATE heroes
        SET full_description = full_description_wiki
        WHERE full_description_wiki IS NOT NULL AND full_description_wiki != ''
    """)
    updated = cur.rowcount
    conn.commit()
    print(f"Updated {updated} hero descriptions.")

    conn.close()


if __name__ == "__main__":
    main()
