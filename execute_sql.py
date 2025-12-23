#!/usr/bin/env python3
"""Execute SQL file on Railway PostgreSQL database."""

import psycopg2
import sys

DATABASE_URL = "postgresql://postgres:FSAXODzLHqRZBCxdgEVqjHUMmBJqjAaO@autorack.proxy.rlwy.net:17295/railway"

def execute_sql_file(filename):
    """Execute SQL from file."""
    try:
        print(f"Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print(f"Reading {filename}...")
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        print(f"Executing SQL statements...")
        cursor.execute(sql)
        conn.commit()
        
        print(f"✅ Successfully executed!")
        print(f"Rows affected: {cursor.rowcount}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if 'conn' in locals():
            conn.rollback()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 execute_sql.py <sql_file>")
        sys.exit(1)
    
    execute_sql_file(sys.argv[1])
