import os
import json
from datetime import datetime

# Визначаємо тип бази даних з environment змінної
DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite')  # 'sqlite' або 'postgres'
DATABASE_URL = os.getenv('DATABASE_URL', 'test_games.db')

def get_connection():
    """Отримати з'єднання з базою даних (SQLite або PostgreSQL)"""
    if DATABASE_TYPE == 'postgres':
        import psycopg2
        from psycopg2.extras import RealDictCursor
        
        # Railway автоматично встановлює DATABASE_URL
        conn = psycopg2.connect(DATABASE_URL)
        conn.cursor_factory = RealDictCursor
        return conn
    else:
        # SQLite (для локальної розробки)
        import sqlite3
        conn = sqlite3.connect(DATABASE_URL)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(query, params=None, fetch=True):
    """Універсальний метод для виконання запитів"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch:
            if DATABASE_TYPE == 'postgres':
                result = cursor.fetchall()
            else:
                result = [dict(row) for row in cursor.fetchall()]
        else:
            conn.commit()
            result = cursor.lastrowid if DATABASE_TYPE == 'sqlite' else cursor.fetchone()
        
        conn.close()
        return result
    except Exception as e:
        conn.close()
        raise e

# Games
def get_games():
    return execute_query("SELECT * FROM games")

def get_game(game_id):
    result = execute_query("SELECT * FROM games WHERE id = %s" if DATABASE_TYPE == 'postgres' else "SELECT * FROM games WHERE id = ?", (game_id,))
    return result[0] if result else None

def add_game(name, description, release_date, genre):
    placeholder = "%s" if DATABASE_TYPE == 'postgres' else "?"
    query = f"""
        INSERT INTO games (name, description, release_date, genre)
        VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
        RETURNING id
    """ if DATABASE_TYPE == 'postgres' else """
        INSERT INTO games (name, description, release_date, genre)
        VALUES (?, ?, ?, ?)
    """
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, (name, description, release_date, genre))
    
    if DATABASE_TYPE == 'postgres':
        game_id = cursor.fetchone()['id']
    else:
        game_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    return game_id

def update_game(game_id, name, description, release_date, genre):
    placeholder = "%s" if DATABASE_TYPE == 'postgres' else "?"
    query = f"""
        UPDATE games 
        SET name = {placeholder}, description = {placeholder}, release_date = {placeholder}, genre = {placeholder}
        WHERE id = {placeholder}
    """
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, (name, description, release_date, genre, game_id))
    rowcount = cursor.rowcount
    conn.commit()
    conn.close()
    return rowcount > 0

def delete_game(game_id):
    placeholder = "%s" if DATABASE_TYPE == 'postgres' else "?"
    query = f"DELETE FROM games WHERE id = {placeholder}"
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, (game_id,))
    rowcount = cursor.rowcount
    conn.commit()
    conn.close()
    return rowcount > 0

# Експортуємо всі функції з оригінального database.py
# Тут буде імпорт всіх інших функцій...
