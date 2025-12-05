import os
import json
from datetime import datetime

# Визначаємо тип бази даних з environment змінної
DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'sqlite')  # 'sqlite' або 'postgres'
DATABASE_URL = os.getenv('DATABASE_URL', 'test_games.db')

# Connection Pool для PostgreSQL
_connection_pool = None

def get_connection_pool():
    """Ініціалізація connection pool для PostgreSQL"""
    global _connection_pool
    if DATABASE_TYPE == 'postgres' and _connection_pool is None:
        from psycopg2 import pool
        _connection_pool = pool.SimpleConnectionPool(
            minconn=2,
            maxconn=20,
            dsn=DATABASE_URL
        )
    return _connection_pool

# Параметр placeholder залежно від типу БД
def get_placeholder():
    return '%s' if DATABASE_TYPE == 'postgres' else '?'

def get_connection():
    """Отримати з'єднання з базою даних (SQLite або PostgreSQL)"""
    if DATABASE_TYPE == 'postgres':
        pool = get_connection_pool()
        if pool:
            return pool.getconn()
        else:
            # Fallback якщо pool не ініціалізувався
            import psycopg2
            return psycopg2.connect(DATABASE_URL)
    else:
        # SQLite (для локальної розробки)
        import sqlite3
        conn = sqlite3.connect(DATABASE_URL)
        conn.row_factory = sqlite3.Row
        return conn

def release_connection(conn):
    """Повернути з'єднання в pool"""
    if DATABASE_TYPE == 'postgres':
        pool = get_connection_pool()
        if pool:
            pool.putconn(conn)
        else:
            conn.close()
    else:
        conn.close()

def dict_from_row(row):
    """Конвертує row в dict"""
    return dict(row)

# Games
def get_games():
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        if DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()
    cursor.execute("SELECT * FROM games")
    games = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    return games

def get_game(game_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        if DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()
    
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM games WHERE id = {ph}", (game_id,))
    game = cursor.fetchone()
    release_connection(conn)
    return dict_from_row(game) if game else None

def add_game(name, description, release_date, genre):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    
    if DATABASE_TYPE == 'postgres':
        cursor.execute(f"""
            INSERT INTO games (name, description, release_date, genre)
            VALUES ({ph}, {ph}, {ph}, {ph})
            RETURNING id
        """, (name, description, release_date, genre))
        game_id = cursor.fetchone()[0]
    else:
        cursor.execute(f"""
            INSERT INTO games (name, description, release_date, genre)
            VALUES ({ph}, {ph}, {ph}, {ph})
        """, (name, description, release_date, genre))
        game_id = cursor.lastrowid
    
    conn.commit()
    release_connection(conn)
    return game_id

def update_game(game_id, name, description, release_date, genre):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"""
        UPDATE games 
        SET name = {ph}, description = {ph}, release_date = {ph}, genre = {ph}
        WHERE id = {ph}
    """, (name, description, release_date, genre, game_id))
    conn.commit()
    release_connection(conn)
    return cursor.rowcount > 0

def delete_game(game_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    # SQLite має CASCADE для зовнішніх ключів, але треба переконатися що воно увімкнено
    cursor.execute(f"DELETE FROM games WHERE id = {ph}", (game_id,))
    conn.commit()
    release_connection(conn)
    return cursor.rowcount > 0

# Heroes
def get_heroes(game_id=None, include_details=False):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    if game_id:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM heroes WHERE game_id = {ph}", (game_id,))
    else:
        cursor.execute("SELECT * FROM heroes")
    heroes = [dict_from_row(row) for row in cursor.fetchall()]
    
    # Завантажуємо stats та skills одним запитом завжди (для HP/Mana та skill icons)
    stats_by_hero = {}
    skills_by_hero = {}
    
    if heroes:
        hero_ids = [h['id'] for h in heroes]
        ph = get_placeholder()
        placeholders = ','.join([ph] * len(hero_ids))
        
        # Завантажуємо всі stats одним запитом
        cursor.execute(f"SELECT * FROM hero_stats WHERE hero_id IN ({placeholders})", hero_ids)
        all_stats = cursor.fetchall()
        for stat in all_stats:
            stat_dict = dict_from_row(stat)
            hero_id = stat_dict['hero_id']
            if hero_id not in stats_by_hero:
                stats_by_hero[hero_id] = []
            stats_by_hero[hero_id].append(stat_dict)
        
        # Завантажуємо всі skills одним запитом
        cursor.execute(f"SELECT * FROM hero_skills WHERE hero_id IN ({placeholders})", hero_ids)
        all_skills = cursor.fetchall()
        for skill in all_skills:
            skill_dict = dict_from_row(skill)
            hero_id = skill_dict['hero_id']
            if hero_id not in skills_by_hero:
                skills_by_hero[hero_id] = []
            skills_by_hero[hero_id].append(skill_dict)
    
    release_connection(conn)
    
    # Мінімальна обробка для списку героїв
    # Мінімальна обробка для всіх героїв
    for hero in heroes:
        # Завжди конвертуємо use_energy
        hero['use_energy'] = bool(hero.get('use_energy', 0))
        
        # Парсимо JSON поля один раз (roles, specialty, lane)
        for field in ['roles', 'specialty', 'lane']:
            if hero.get(field) and hero[field].strip():
                try:
                    hero[field] = json.loads(hero[field])
                except:
                    hero[field] = []
            else:
                hero[field] = []
        
        if include_details:
            # Повна обробка тільки якщо потрібні деталі
            hero['hero_stats'] = stats_by_hero.get(hero['id'], [])
            hero['skills'] = skills_by_hero.get(hero['id'], [])
        else:
            # Для списку - додати мінімальні stats (тільки HP та Mana)
            hero_stats_all = stats_by_hero.get(hero['id'], [])
            hero['hero_stats'] = [s for s in hero_stats_all if s.get('stat_name') in ['HP', 'Mana']]
            # Для skills - тільки назва та іконка
            all_skills = skills_by_hero.get(hero['id'], [])
            hero['skills'] = [{
                'skill_name': s.get('skill_name', 'Unknown'),
                'image': s.get('image'),
                'preview': s.get('preview'),
                'is_transformed': s.get('is_transformed', 0)
            } for s in all_skills if s.get('skill_name')]
    
    # Тільки для include_details=True робимо додаткові поля
    if include_details:
        for hero in heroes:
            # Видаляємо застаріле поле role якщо є roles
            hero.pop('role', None)
            
            # Парсимо relation
            if hero.get('relation') and hero['relation'].strip():
                try:
                    hero['relation'] = json.loads(hero['relation'])
                except:
                    hero['relation'] = None
            else:
                hero['relation'] = None
            
            # Обробка pro_builds - конвертація старого формату в новий
            if hero.get('pro_builds') and hero['pro_builds'].strip():
                try:
                    builds_data = json.loads(hero['pro_builds'])
                    # Якщо старий формат {"builds": [...]}
                    if isinstance(builds_data, dict) and 'builds' in builds_data:
                        old_builds = builds_data['builds']
                        new_builds = []
                        for old_build in old_builds[:3]:  # максимум 3 білди
                            new_build = {
                                'core_items': [],
                                'optional_items': [],
                                'emblem_id': None,
                                'emblem_talents': []
                            }
                            
                            # Конвертація equipment_build -> core_items, optional_items
                            if 'equipment_build' in old_build:
                                eq = old_build['equipment_build']
                                # main_items -> core_items (тільки ID)
                                if 'main_items' in eq and isinstance(eq['main_items'], list):
                                    new_build['core_items'] = [item.get('id') for item in eq['main_items'] if item.get('id')][:6]
                                # additional_items -> optional_items (тільки ID)
                                if 'additional_items' in eq and isinstance(eq['additional_items'], list):
                                    new_build['optional_items'] = [item.get('id') for item in eq['additional_items'] if item.get('id')][:2]
                            
                            # Конвертація emblem
                            if 'emblem' in old_build and isinstance(old_build['emblem'], dict):
                                emblem = old_build['emblem']
                                new_build['emblem_id'] = emblem.get('emblem_id')
                                new_build['emblem_talents'] = [
                                    emblem.get('tier1'),
                                    emblem.get('tier2'),
                                    emblem.get('tier3')
                                ]
                            
                            new_builds.append(new_build)
                        
                        hero['pro_builds'] = new_builds
                    # Якщо вже новий формат - список білдів
                    elif isinstance(builds_data, list):
                        hero['pro_builds'] = builds_data
                    else:
                        hero['pro_builds'] = []
                except:
                    hero['pro_builds'] = []
            else:
                hero['pro_builds'] = []
            
            # Parse counter_data
            if hero.get('counter_data') and hero['counter_data'].strip():
                try:
                    hero['counter_data'] = json.loads(hero['counter_data'])
                except:
                    hero['counter_data'] = None
            else:
                hero['counter_data'] = None
            
            # Parse compatibility_data
            if hero.get('compatibility_data') and hero['compatibility_data'].strip():
                try:
                    hero['compatibility_data'] = json.loads(hero['compatibility_data'])
                except:
                    hero['compatibility_data'] = None
            else:
                hero['compatibility_data'] = None
    
    return heroes

def get_hero(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM heroes WHERE id = {ph}", (hero_id,))
    hero = cursor.fetchone()
    release_connection(conn)
    
    if hero:
        hero = dict(hero)
        hero['hero_stats'] = get_hero_stats(hero_id)
        hero['skills'] = get_hero_skills(hero_id)
        if hero.get('roles') and hero['roles'].strip():
            try:
                hero['roles'] = json.loads(hero['roles'])
            except:
                hero['roles'] = []
            # Видаляємо role поле якщо є roles
            hero.pop('role', None)
        else:
            hero['roles'] = []
        
        if hero.get('specialty') and hero['specialty'].strip():
            try:
                hero['specialty'] = json.loads(hero['specialty'])
            except:
                hero['specialty'] = []
        else:
            hero['specialty'] = []
        
        if hero.get('lane') and hero['lane'].strip():
            try:
                hero['lane'] = json.loads(hero['lane'])
            except:
                hero['lane'] = []
        else:
            hero['lane'] = []
        
        if hero.get('relation') and hero['relation'].strip():
            try:
                hero['relation'] = json.loads(hero['relation'])
            except:
                hero['relation'] = None
        else:
            hero['relation'] = None
        
        # Конвертуємо use_energy з INTEGER в boolean
        hero['use_energy'] = bool(hero.get('use_energy', 0))
        
        # Конвертуємо created_at -> createdAt для camelCase
        if 'created_at' in hero:
            hero['createdAt'] = hero['created_at']
        
        # Обробка pro_builds - конвертація старого формату в новий
        if hero.get('pro_builds') and hero['pro_builds'].strip():
            try:
                builds_data = json.loads(hero['pro_builds'])
                # Якщо старий формат {"builds": [...]}
                if isinstance(builds_data, dict) and 'builds' in builds_data:
                    old_builds = builds_data['builds']
                    new_builds = []
                    for old_build in old_builds[:3]:  # максимум 3 білди
                        new_build = {
                            'core_items': [],
                            'optional_items': [],
                            'emblem_id': None,
                            'emblem_talents': []
                        }
                        
                        # Конвертація equipment_build -> core_items, optional_items
                        if 'equipment_build' in old_build:
                            eq = old_build['equipment_build']
                            # main_items -> core_items (тільки ID)
                            if 'main_items' in eq and isinstance(eq['main_items'], list):
                                new_build['core_items'] = [item.get('id') for item in eq['main_items'] if item.get('id')][:6]
                            # additional_items -> optional_items (тільки ID)
                            if 'additional_items' in eq and isinstance(eq['additional_items'], list):
                                new_build['optional_items'] = [item.get('id') for item in eq['additional_items'] if item.get('id')][:2]
                        
                        # Конвертація emblem
                        if 'emblem' in old_build and isinstance(old_build['emblem'], dict):
                            emblem = old_build['emblem']
                            new_build['emblem_id'] = emblem.get('emblem_id')
                            new_build['emblem_talents'] = [
                                emblem.get('tier1'),
                                emblem.get('tier2'),
                                emblem.get('tier3')
                            ]
                        
                        new_builds.append(new_build)
                    
                    hero['pro_builds'] = new_builds
                # Якщо вже новий формат - список білдів
                elif isinstance(builds_data, list):
                    hero['pro_builds'] = builds_data
                else:
                    hero['pro_builds'] = []
            except:
                hero['pro_builds'] = []
        else:
            hero['pro_builds'] = []
        
        # Parse counter_data
        if hero.get('counter_data') and hero['counter_data'].strip():
            try:
                hero['counter_data'] = json.loads(hero['counter_data'])
            except:
                hero['counter_data'] = None
        else:
            hero['counter_data'] = None
        
        # Parse compatibility_data
        if hero.get('compatibility_data') and hero['compatibility_data'].strip():
            try:
                hero['compatibility_data'] = json.loads(hero['compatibility_data'])
            except:
                hero['compatibility_data'] = None
        else:
            hero['compatibility_data'] = None
        
        return hero
    return None

def add_hero(game_id, name, hero_game_id, image, short_description, full_description, lane=None, roles=None, use_energy=False, specialty=None, damage_type=None, relation=None, created_at=None, head=None, main_hero_ban_rate=None, main_hero_appearance_rate=None, main_hero_win_rate=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    lane_json = json.dumps(lane) if lane else None
    roles_json = json.dumps(roles) if roles else None
    specialty_json = json.dumps(specialty) if specialty else None
    relation_json = json.dumps(relation, ensure_ascii=False) if relation else None
    
    # Convert hero_game_id to integer if it's a string
    hero_game_id_int = int(hero_game_id) if hero_game_id else None
    
    ph = get_placeholder()
    cursor.execute(f"""
        INSERT INTO heroes (game_id, name, hero_game_id, image, short_description, full_description, lane, roles, use_energy, specialty, damage_type, relation, createdAt, head, main_hero_ban_rate, main_hero_appearance_rate, main_hero_win_rate)
        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
    """, (game_id, name, hero_game_id_int, image, short_description, full_description, lane_json, roles_json, 1 if use_energy else 0, specialty_json, damage_type, relation_json, created_at, head, main_hero_ban_rate, main_hero_appearance_rate, main_hero_win_rate))
    hero_id = cursor.lastrowid
    conn.commit()
    release_connection(conn)
    return hero_id

def update_hero(hero_id, name, hero_game_id, image, short_description, full_description, lane=None, roles=None, use_energy=False, specialty=None, damage_type=None, relation=None, pro_builds=None, created_at=None, createdAt=None, head=None, main_hero_ban_rate=None, main_hero_appearance_rate=None, main_hero_win_rate=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    lane_json = json.dumps(lane) if lane else None
    roles_json = json.dumps(roles) if roles else None
    specialty_json = json.dumps(specialty) if specialty else None
    relation_json = json.dumps(relation, ensure_ascii=False) if relation else None
    pro_builds_json = json.dumps(pro_builds, ensure_ascii=False) if pro_builds else None
    
    # Convert hero_game_id to integer if it's a string
    hero_game_id_int = int(hero_game_id) if hero_game_id else None
    
    ph = get_placeholder()
    cursor.execute(f"""
        UPDATE heroes 
        SET name = {ph}, hero_game_id = {ph}, image = {ph}, 
            short_description = {ph}, full_description = {ph}, lane = {ph}, roles = {ph}, use_energy = {ph}, specialty = {ph}, damage_type = {ph}, relation = {ph}, pro_builds = {ph}, createdAt = {ph}, head = {ph}, main_hero_ban_rate = {ph}, main_hero_appearance_rate = {ph}, main_hero_win_rate = {ph}
        WHERE id = {ph}
    """, (name, hero_game_id_int, image, short_description, full_description, lane_json, roles_json, 1 if use_energy else 0, specialty_json, damage_type, relation_json, pro_builds_json, createdAt, head, main_hero_ban_rate, main_hero_appearance_rate, main_hero_win_rate, hero_id))
    conn.commit()
    release_connection(conn)

def delete_hero(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM heroes WHERE id = {ph}", (hero_id,))
    conn.commit()
    release_connection(conn)

# Hero Stats
def add_hero_stat(hero_id, stat_name, value):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"""
        INSERT INTO hero_stats (hero_id, stat_name, value)
        VALUES ({ph}, {ph}, {ph})
    """, (hero_id, stat_name, value))
    conn.commit()
    release_connection(conn)

def get_hero_stats(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT stat_name, value FROM hero_stats WHERE hero_id = {ph}", (hero_id,))
    stats = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    return stats

def delete_hero_stats(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM hero_stats WHERE hero_id = {ph}", (hero_id,))
    conn.commit()
    release_connection(conn)

# Hero Skills
def add_hero_skill(hero_id, skill_name, skill_description, effect, preview, skill_type, skill_parameters, level_scaling, passive_description=None, active_description=None, effect_types=None, is_transformed=None, transformation_order=None, display_order=None, replaces_skill_id=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    parameters_json = json.dumps(skill_parameters) if skill_parameters else None
    scaling_json = json.dumps(level_scaling) if level_scaling else None
    effect_types_json = json.dumps(effect_types) if effect_types else None
    effect_json = json.dumps(effect) if isinstance(effect, list) else effect
    
    ph = get_placeholder()
    cursor.execute(f"""
        INSERT INTO hero_skills (hero_id, skill_name, skill_description, effect, preview, image,
                                skill_type, skill_parameters, level_scaling, passive_description, active_description, effect_types, is_transformed, transformation_order, display_order, replaces_skill_id)
        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
    """, (hero_id, skill_name, skill_description, effect_json, preview, preview, skill_type, parameters_json, scaling_json, passive_description, active_description, effect_types_json, is_transformed or 0, transformation_order or 0, display_order or 0, replaces_skill_id))
    conn.commit()
    release_connection(conn)

def get_hero_skills(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM hero_skills WHERE hero_id = {ph}", (hero_id,))
    skills = []
    for row in cursor.fetchall():
        skill = dict_from_row(row)
        # Parse skill_parameters
        if skill.get('skill_parameters'):
            try:
                skill['skill_parameters'] = json.loads(skill['skill_parameters'])
            except (json.JSONDecodeError, TypeError):
                skill['skill_parameters'] = {}
        else:
            skill['skill_parameters'] = {}
        
        # Parse level_scaling
        if skill.get('level_scaling'):
            try:
                skill['level_scaling'] = json.loads(skill['level_scaling'])
            except (json.JSONDecodeError, TypeError):
                skill['level_scaling'] = []
        else:
            skill['level_scaling'] = []
        
        # Parse effect_types
        if skill.get('effect_types'):
            try:
                skill['effect_types'] = json.loads(skill['effect_types'])
            except (json.JSONDecodeError, TypeError):
                skill['effect_types'] = []
        else:
            skill['effect_types'] = []
        
        # Parse effect
        if skill.get('effect'):
            try:
                skill['effect'] = json.loads(skill['effect'])
            except (json.JSONDecodeError, TypeError):
                skill['effect'] = {}
        else:
            skill['effect'] = {}
        
        skills.append(skill)
    release_connection(conn)
    return skills

def delete_hero_skills(hero_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM hero_skills WHERE hero_id = {ph}", (hero_id,))
    conn.commit()
    release_connection(conn)

# Items
def get_all_items():
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    cursor.execute("SELECT * FROM items")
    items = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    
    for item in items:
        if item.get('stats'):
            item['stats'] = json.loads(item['stats'])
    return items

def get_items_by_game(game_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM items WHERE game_id = {ph}", (game_id,))
    items = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    
    for item in items:
        if item.get('stats'):
            item['stats'] = json.loads(item['stats'])
    return items

def get_item(item_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM items WHERE id = {ph}", (item_id,))
    item = cursor.fetchone()
    release_connection(conn)
    
    if item:
        item = dict(item)
        if item.get('stats'):
            item['stats'] = json.loads(item['stats'])
        return item
    return None

def add_item(game_id, name, description, item_type, rarity, cost, stats):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    stats_json = json.dumps(stats) if stats else None
    
    ph = get_placeholder()
    cursor.execute(f"""
        INSERT INTO items (game_id, name, description, type, rarity, cost, stats)
        VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
    """, (game_id, name, description, item_type, rarity, cost, stats_json))
    item_id = cursor.lastrowid
    conn.commit()
    release_connection(conn)
    return item_id

def update_item(item_id, name, description, item_type, rarity, cost, stats):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    stats_json = json.dumps(stats) if stats else None
    
    cursor.execute("""
        UPDATE items 
        SET name = ?, description = ?, type = ?, rarity = ?, cost = ?, stats = ?
        WHERE id = ?
    """, (name, description, item_type, rarity, cost, stats_json, item_id))
    conn.commit()
    release_connection(conn)

def delete_item(item_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM items WHERE id = {ph}", (item_id,))
    conn.commit()
    release_connection(conn)

# Equipment
def get_equipment_by_game(game_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM equipment WHERE game_id = {ph}", (game_id,))
    equipment = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    return equipment

def get_equipment(equipment_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM equipment WHERE id = {ph}", (equipment_id,))
    equipment = cursor.fetchone()
    release_connection(conn)
    return dict(equipment) if equipment else None

def add_equipment(game_id, name, category, price_total=0, **kwargs):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    # Базові поля
    fields = ['game_id', 'name', 'category', 'price_total']
    values = [game_id, name, category, price_total]
    
    # Додаємо додаткові поля якщо вони передані
    optional_fields = ['description', 'icon_url', 'price_sell', 'physical_attack', 'magic_power',
                      'hp', 'physical_defense', 'magic_defense', 'movement_speed', 'attack_speed',
                      'cooldown_reduction', 'lifesteal', 'spell_vamp', 'penetration', 'stats_other',
                      'passive_name', 'passive_type', 'passive_description', 'recipe', 'tips',
                      'in_depth_info', 'countered_by', 'builds', 'tier', 'attributes', 'tags']
    
    for field in optional_fields:
        if field in kwargs:
            fields.append(field)
            values.append(kwargs[field])
    
    placeholders = ', '.join(['?' for _ in values])
    field_names = ', '.join(fields)
    
    cursor.execute(f"""
        INSERT INTO equipment ({field_names})
        VALUES ({placeholders})
    """, values)
    equipment_id = cursor.lastrowid
    conn.commit()
    release_connection(conn)
    return equipment_id

def update_equipment(equipment_id, **kwargs):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    # Дозволені поля для оновлення
    allowed_fields = ['name', 'category', 'price_total', 'description', 'icon_url', 'price_sell',
                     'physical_attack', 'magic_power', 'hp', 'physical_defense', 'magic_defense',
                     'movement_speed', 'attack_speed', 'cooldown_reduction', 'lifesteal', 'spell_vamp',
                     'penetration', 'stats_other', 'passive_name', 'passive_type', 'passive_description',
                     'recipe', 'tips', 'in_depth_info', 'countered_by', 'builds', 'tier', 'attributes', 'tags']
    
    updates = []
    values = []
    
    for field in allowed_fields:
        if field in kwargs:
            updates.append(f"{field} = ?")
            values.append(kwargs[field])
    
    if not updates:
        return
    
    values.append(equipment_id)
    update_sql = ', '.join(updates)
    
    cursor.execute(f"""
        UPDATE equipment 
        SET {update_sql}
        WHERE id = ?
    """, values)
    conn.commit()
    release_connection(conn)

def delete_equipment(equipment_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM equipment WHERE id = {ph}", (equipment_id,))
    conn.commit()
    release_connection(conn)

# ============== EMBLEM TALENTS ==============

def get_emblem_talents(game_id=None, tier=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    if game_id and tier:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM emblem_talents WHERE game_id = {ph} AND tier = {ph}", (game_id, tier))
    elif game_id:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM emblem_talents WHERE game_id = {ph}", (game_id,))
    elif tier:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM emblem_talents WHERE tier = {ph}", (tier,))
    else:
        cursor.execute("SELECT * FROM emblem_talents")
    
    talents = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    return talents

def get_emblem_talent(talent_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM emblem_talents WHERE id = {ph}", (talent_id,))
    talent = cursor.fetchone()
    release_connection(conn)
    return dict(talent) if talent else None

def add_emblem_talent(game_id, tier, name, effect, icon_url=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"""
        INSERT INTO emblem_talents (game_id, tier, name, effect, icon_url)
        VALUES ({ph}, {ph}, {ph}, {ph}, {ph})
    """, (game_id, tier, name, effect, icon_url))
    talent_id = cursor.lastrowid
    conn.commit()
    release_connection(conn)
    return talent_id

def update_emblem_talent(talent_id, **kwargs):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    allowed_fields = ['tier', 'name', 'effect', 'icon_url']
    updates = []
    values = []
    
    for field in allowed_fields:
        if field in kwargs:
            updates.append(f"{field} = ?")
            values.append(kwargs[field])
    
    if not updates:
        return
    
    values.append(talent_id)
    update_sql = ', '.join(updates)
    
    cursor.execute(f"""
        UPDATE emblem_talents 
        SET {update_sql}
        WHERE id = ?
    """, values)
    conn.commit()
    release_connection(conn)

def delete_emblem_talent(talent_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"DELETE FROM emblem_talents WHERE id = {ph}", (talent_id,))
    conn.commit()
    release_connection(conn)

# ============== EMBLEMS ==============

def get_emblems(game_id=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    if game_id:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM emblems WHERE game_id = {ph}", (game_id,))
    else:
        cursor.execute("SELECT * FROM emblems")
    emblems = [dict_from_row(row) for row in cursor.fetchall()]
    
    # Парсимо JSON поля та додаємо таланти
    for emblem in emblems:
        if emblem.get('base_stats'):
            try:
                emblem['base_stats'] = json.loads(emblem['base_stats'])
            except:
                emblem['base_stats'] = {}
        
        # Додаємо таланти з окремої таблиці
        emblem['tier1_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=1)
        emblem['tier2_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=2)
        emblem['tier3_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=3)
    
    release_connection(conn)
    return emblems

def get_emblem(emblem_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM emblems WHERE id = {ph}", (emblem_id,))
    emblem = cursor.fetchone()
    release_connection(conn)
    
    if emblem:
        emblem = dict(emblem)
        if emblem.get('base_stats'):
            try:
                emblem['base_stats'] = json.loads(emblem['base_stats'])
            except:
                emblem['base_stats'] = {}
        
        # Додаємо таланти з окремої таблиці
        emblem['tier1_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=1)
        emblem['tier2_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=2)
        emblem['tier3_talents'] = get_emblem_talents(game_id=emblem['game_id'], tier=3)
        
        return emblem
    return None

def update_emblem(emblem_id, **kwargs):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    allowed_fields = ['name', 'category', 'description', 'base_stats', 'icon_url']
    updates = []
    values = []
    
    for field in allowed_fields:
        if field in kwargs:
            value = kwargs[field]
            # Якщо base_stats - конвертуємо в JSON
            if field == 'base_stats' and isinstance(value, dict):
                value = json.dumps(value)
            updates.append(f"{field} = ?")
            values.append(value)
    
    if not updates:
        return
    
    values.append(emblem_id)
    update_sql = ', '.join(updates)
    
    cursor.execute(f"""
        UPDATE emblems 
        SET {update_sql}
        WHERE id = ?
    """, values)
    conn.commit()
    release_connection(conn)

# Battle Spells
def get_battle_spells(game_id=None):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    if game_id:
        ph = get_placeholder()
        cursor.execute(f"SELECT * FROM battle_spells WHERE game_id = {ph}", (game_id,))
    else:
        cursor.execute("SELECT * FROM battle_spells")
    spells = [dict_from_row(row) for row in cursor.fetchall()]
    release_connection(conn)
    return spells

def get_battle_spell(spell_id):
    conn = get_connection()
    if DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = get_placeholder()
    cursor.execute(f"SELECT * FROM battle_spells WHERE id = {ph}", (spell_id,))
    spell = cursor.fetchone()
    release_connection(conn)
    return dict(spell) if spell else None
