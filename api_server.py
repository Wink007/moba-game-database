from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
import json
import os
import gzip
import io
import time
import jwt
import functools
import threading

def _load_env_file(file_path: Path) -> None:
    if not file_path.exists():
        return
    try:
        for raw_line in file_path.read_text(encoding='utf-8').splitlines():
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)
    except Exception as exc:
        print(f"Failed to load env file {file_path}: {exc}")


_base_dir = Path(__file__).resolve().parent
_load_env_file(_base_dir / '.env')
_load_env_file(_base_dir / '.env.local')

import database as db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "max_age": 86400,
}})

# Gzip compression middleware
@app.after_request
def compress_response(response):
    """Стискає JSON відповіді за допомогою gzip"""
    # Тільки для успішних JSON відповідей більше 500 байт
    if (200 <= response.status_code < 300 and 
        response.content_type and 'application/json' in response.content_type and
        response.data and len(response.data) > 500 and
        'gzip' in request.headers.get('Accept-Encoding', '')):
        
        try:
            # Стискаємо відповідь
            gzip_buffer = io.BytesIO()
            with gzip.GzipFile(mode='wb', fileobj=gzip_buffer, compresslevel=6) as gzip_file:
                gzip_file.write(response.data)
            
            response.data = gzip_buffer.getvalue()
            response.headers['Content-Encoding'] = 'gzip'
            response.headers['Content-Length'] = len(response.data)
        except Exception as e:
            # Якщо compression не вдався, повертаємо оригінальну відповідь
            print(f"Compression error: {e}")
            pass
    
    return response

# Для Railway: використовуємо PORT з environment
PORT = int(os.getenv('PORT', 8080))

# ===== AUTH CONFIG =====
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '298925088925-a5l28snnss99vm5hskqnh644nopu85pl.apps.googleusercontent.com')
JWT_SECRET = os.getenv('JWT_SECRET', 'moba-wiki-jwt-secret-change-in-production')
JWT_EXPIRY_HOURS = 24 * 7  # 7 days


def verify_google_token(token):
    """Verify Google OAuth id_token and return user info"""
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except Exception as e:
        print(f"Google id_token verification failed: {e}")
        return None


def verify_google_access_token(access_token, user_info):
    """Verify Google access_token via tokeninfo endpoint and return user info"""
    import requests as ext_requests
    try:
        resp = ext_requests.get(
            'https://oauth2.googleapis.com/tokeninfo',
            params={'access_token': access_token}
        )
        if resp.status_code != 200:
            print(f"Google access_token verification failed: {resp.text}")
            return None
        token_info = resp.json()
        # Security: verify sub from tokeninfo matches sub from user_info
        if token_info.get('sub') != user_info.get('sub'):
            print(f"Google token sub mismatch: token={token_info.get('sub')} vs user_info={user_info.get('sub')}")
            return None
        return {
            'sub': user_info.get('sub'),
            'email': user_info.get('email', ''),
            'name': user_info.get('name', ''),
            'picture': user_info.get('picture', ''),
        }
    except Exception as e:
        print(f"Google access_token verification error: {e}")
        return None


def create_jwt(user_id, email):
    """Create JWT token for our API"""
    import datetime as dt
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': dt.datetime.utcnow() + dt.timedelta(hours=JWT_EXPIRY_HOURS),
        'iat': dt.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def require_auth(f):
    """Decorator: require valid JWT token"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
        token = auth_header[7:]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = payload['user_id']
            request.user_email = payload['email']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

def _log_db_target():
    try:
        db_url = os.getenv('DATABASE_URL', '')
        parsed = urlparse(db_url)
        host = parsed.hostname or 'unknown'
        port = parsed.port or 'default'
        db_name = (parsed.path or '').lstrip('/') or 'unknown'
        print(f"DB: type={os.getenv('DATABASE_TYPE','sqlite')} host={host} port={port} db={db_name}")
    except Exception as exc:
        print(f"DB: failed to parse DATABASE_URL ({exc})")

_log_db_target()

# Games
@app.route('/api/games', methods=['GET'])
def get_games():
    games = db.get_games()
    return jsonify(games)

@app.route('/api/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    game = db.get_game(game_id)
    if game:
        return jsonify(game)
    return jsonify({'error': 'Game not found'}), 404

@app.route('/api/games', methods=['POST'])
def create_game():
    data = request.json
    game_id = db.add_game(
        data['name'],
        data.get('description', ''),
        data.get('release_date', ''),
        data.get('genre', ''),
        data.get('background_image'),
        data.get('video_intro'),
        data.get('subtitle'),
        data.get('preview'),
        data.get('icon')
    )
    return jsonify({'id': game_id}), 201

@app.route('/api/games/<int:game_id>', methods=['PUT'])
def update_game(game_id):
    data = request.json
    db.update_game(
        game_id,
        data['name'],
        data.get('description', ''),
        data.get('release_date', ''),
        data.get('genre', ''),
        data.get('background_image'),
        data.get('video_intro'),
        data.get('subtitle'),
        data.get('preview'),
        data.get('icon')
    )
    return jsonify({'success': True})

@app.route('/api/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    db.delete_game(game_id)
    return jsonify({'success': True})

# Heroes
@app.route('/api/heroes', methods=['GET'])

def get_heroes():
    game_id = request.args.get('game_id')
    page = request.args.get('page', type=int)

    # Paginated response (for hero grid)
    if page is not None:
        size = request.args.get('size', 24, type=int)
        role = request.args.get('role')
        lane = request.args.get('lane')
        search = request.args.get('search')
        complexity = request.args.get('complexity')
        sort = request.args.get('sort', 'name')
        favorite_ids_raw = request.args.get('favorite_ids', '')
        favorite_ids = [int(x) for x in favorite_ids_raw.split(',') if x.strip().isdigit()] if favorite_ids_raw else []
        result = db.get_heroes_paginated(
            game_id=game_id,
            page=page,
            size=size,
            role=role,
            lane=lane,
            search=search,
            complexity=complexity,
            sort=sort,
            favorite_ids=favorite_ids,
        )
        return jsonify(result)

    # Legacy: return all heroes
    name = request.args.get('name')
    limit = request.args.get('limit')
    
    # Завантажуємо без skills, relation, counter_data та compatibility_data (вони в окремих endpoints)
    heroes = db.get_heroes(game_id, include_details=True, include_skills=False, include_relation=False, include_counter_data=False, include_compatibility_data=False)
    
    # Фільтруємо по імені якщо вказано
    if name:
        heroes = [h for h in heroes if h.get('name', '').lower() == name.lower()]
    
    # Обмежуємо кількість якщо вказано
    if limit:
        try:
            heroes = heroes[:int(limit)]
        except ValueError:
            pass
    
    return jsonify(heroes)

@app.route('/api/heroes/<int:hero_id>', methods=['GET'])

def get_hero(hero_id):
    hero = db.get_hero(hero_id)
    if hero:
        return jsonify(hero)
    return jsonify({'error': 'Hero not found'}), 404

@app.route('/api/heroes/<int:hero_id>/skills', methods=['GET'])
def get_hero_skills(hero_id):
    """Окремий endpoint для навичок героя"""
    skills = db.get_hero_skills(hero_id)
    return jsonify(skills)

@app.route('/api/heroes/<int:hero_id>/skills/<int:skill_id>', methods=['PUT'])
def update_hero_skill(hero_id, skill_id):
    """Оновлює навичку героя"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    skill_name = data.get('skill_name')
    skill_description = data.get('skill_description')
    display_order = data.get('display_order')
    replaces_skill_id = data.get('replaces_skill_id')
    is_transformed = data.get('is_transformed')
    transformation_order = data.get('transformation_order')
    skill_name_uk = data.get('skill_name_uk')
    skill_description_uk = data.get('skill_description_uk')
    if all(v is None for v in [skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order, skill_name_uk, skill_description_uk]):
        return jsonify({'error': 'No fields to update'}), 400
    
    success = db.update_hero_skill(skill_id, skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order, skill_name_uk, skill_description_uk)
    
    if success:
        return jsonify({'success': True, 'message': 'Skill updated successfully'})
    else:
        return jsonify({'error': 'Failed to update skill'}), 500

@app.route('/api/heroes/<int:hero_id>/skills', methods=['POST'])
def create_hero_skill(hero_id):
    """Створює нову навичку героя"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    skill_name = data.get('skill_name')
    skill_description = data.get('skill_description', '')
    display_order = data.get('display_order', 0)
    skill_name_uk = data.get('skill_name_uk')
    skill_description_uk = data.get('skill_description_uk')
    if not skill_name:
        return jsonify({'error': 'skill_name is required'}), 400
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        if db.DATABASE_TYPE == 'postgres':
            cursor.execute(f'''
                INSERT INTO hero_skills (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk)
                VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})
                RETURNING id
            ''', (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk))
            skill_id = cursor.fetchone()[0]
        else:
            cursor.execute(f'''
                INSERT INTO hero_skills (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk)
                VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})
            ''', (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk))
            skill_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        db.release_connection(conn)
        
        return jsonify({'success': True, 'message': 'Skill created successfully', 'id': skill_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/<int:hero_id>/skills/<int:skill_id>', methods=['DELETE'])
def delete_hero_skill(hero_id, skill_id):
    """Видаляє навичку героя"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        cursor.execute(f'DELETE FROM hero_skills WHERE id = {ph} AND hero_id = {ph}', (skill_id, hero_id))
        
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        db.release_connection(conn)
        
        if deleted:
            return jsonify({'success': True, 'message': 'Skill deleted successfully'})
        else:
            return jsonify({'error': 'Skill not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/skills', methods=['GET'])
def get_all_heroes_skills():
    """Навички для всіх героїв гри"""
    game_id = request.args.get('game_id')
    if not game_id:
        return jsonify({'error': 'game_id required'}), 400
    
    # Отримуємо всіх героїв гри
    heroes = db.get_heroes(game_id, include_details=False, include_skills=False, include_relation=False)
    hero_ids = [h['id'] for h in heroes]
    
    # Завантажуємо skills для всіх героїв
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    ph = db.get_placeholder()
    placeholders = ','.join([ph] * len(hero_ids))
    cursor.execute(f"SELECT * FROM hero_skills WHERE hero_id IN ({placeholders}) ORDER BY hero_id, display_order", hero_ids)
    all_skills = cursor.fetchall()
    db.release_connection(conn)
    
    # Групуємо по hero_id
    skills_by_hero = {}
    for skill in all_skills:
        skill_dict = db.dict_from_row(skill)
        hero_id = skill_dict['hero_id']
        if hero_id not in skills_by_hero:
            skills_by_hero[hero_id] = []
        skills_by_hero[hero_id].append(skill_dict)
    
    return jsonify(skills_by_hero)

# Hero Ranks endpoints moved to the end of file (around line 1214)

@app.route('/api/heroes/relations', methods=['GET'])
def get_all_heroes_relations():
    """Relations для всіх героїв гри"""
    game_id = request.args.get('game_id')
    if not game_id:
        return jsonify({'error': 'game_id required'}), 400
    
    # Отримуємо всіх героїв з relation
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    ph = db.get_placeholder()
    cursor.execute(f"SELECT id, relation FROM heroes WHERE game_id = {ph} AND relation IS NOT NULL", (game_id,))
    heroes = cursor.fetchall()
    db.release_connection(conn)
    
    # Групуємо по hero_id
    relations_by_hero = {}
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_id = hero_dict['id']
        relation = hero_dict.get('relation')
        
        if relation and relation.strip():
            try:
                relations_by_hero[hero_id] = json.loads(relation)
            except:
                relations_by_hero[hero_id] = None
    
    return jsonify(relations_by_hero)

VALID_RANKS = {'all', 'epic', 'legend', 'mythic', 'honor', 'glory'}
VALID_DAYS  = {'1', '3', '7', '15', '30'}

def _extract_nested(parsed, days_str, rank):
    """Extract data from nested {days: {rank: {...}}} structure, with fallbacks."""
    if not isinstance(parsed, dict):
        return parsed
    # New format: {"1": {"all": {...}, "epic": {...}}, "7": {...}}
    if days_str in parsed or '1' in parsed:
        by_days = parsed.get(days_str) or parsed.get('1') or {}
        return by_days.get(rank) or by_days.get('all') or {}
    # Old format: {"all": {...}, "epic": {...}}
    if 'all' in parsed or rank in parsed:
        return parsed.get(rank) or parsed.get('all') or {}
    # Flat format
    return parsed

@app.route('/api/heroes/counter-data', methods=['GET'])
def get_all_heroes_counter_data():
    """Counter data. Supports ?rank=epic&days=7"""
    game_id = request.args.get('game_id')
    if not game_id:
        return jsonify({'error': 'game_id required'}), 400
    rank = request.args.get('rank', 'all')
    if rank not in VALID_RANKS:
        rank = 'all'
    days_str = request.args.get('days', '1')
    if days_str not in VALID_DAYS:
        days_str = '1'

    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    ph = db.get_placeholder()
    cursor.execute(f"SELECT id, hero_game_id, counter_data FROM heroes WHERE game_id = {ph} AND counter_data IS NOT NULL", (game_id,))
    heroes = cursor.fetchall()
    db.release_connection(conn)

    counter_data_by_hero = {}
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_game_id = hero_dict.get('hero_game_id')
        raw = hero_dict.get('counter_data')
        if hero_game_id and raw and raw.strip():
            try:
                counter_data_by_hero[hero_game_id] = _extract_nested(json.loads(raw), days_str, rank)
            except:
                counter_data_by_hero[hero_game_id] = None

    return jsonify(counter_data_by_hero)

@app.route('/api/heroes/compatibility-data', methods=['GET'])
def get_all_heroes_compatibility_data():
    """Compatibility data для всіх героїв гри"""
    game_id = request.args.get('game_id')
    if not game_id:
        return jsonify({'error': 'game_id required'}), 400
    
    # Отримуємо всіх героїв з compatibility_data
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    ph = db.get_placeholder()
    cursor.execute(f"SELECT id, hero_game_id, compatibility_data FROM heroes WHERE game_id = {ph} AND compatibility_data IS NOT NULL", (game_id,))
    heroes = cursor.fetchall()
    db.release_connection(conn)
    
    rank = request.args.get('rank', 'all')
    if rank not in VALID_RANKS:
        rank = 'all'
    days_str = request.args.get('days', '1')
    if days_str not in VALID_DAYS:
        days_str = '1'

    compatibility_data_by_hero = {}
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_game_id = hero_dict.get('hero_game_id')
        raw = hero_dict.get('compatibility_data')
        if hero_game_id and raw and raw.strip():
            try:
                compatibility_data_by_hero[hero_game_id] = _extract_nested(json.loads(raw), days_str, rank)
            except:
                compatibility_data_by_hero[hero_game_id] = None

    return jsonify(compatibility_data_by_hero)

@app.route('/api/mlbb/heroes/fetch-and-update-stats', methods=['POST'])
def fetch_and_update_stats_direct():
    """Фетчить свіжі Ban/Pick/Win Rates з публічного Moonton GMS API (без токена) і оновлює heroes таблицю.
    Використовує той самий API що й update_hero_ranks_from_moonton.py — 7 сторінок по 20 героїв."""
    try:
        data = request.get_json() or {}
        game_id = data.get('game_id', 2)
        
        import requests as req
        
        MOONTON_API = "https://api.gms.moontontech.com/api/gms/source/2669606"
        SOURCE_ID = "2756569"  # 7 днів — найрелевантніший період
        
        headers = {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json;charset=UTF-8',
            'x-actid': '2669607',
            'x-appid': '2669606',
            'x-lang': 'en',
        }
        
        # Фетчимо всіх героїв посторінково (7 сторінок по 20 = ~131 героїв)
        url = f"{MOONTON_API}/{SOURCE_ID}"
        all_heroes = []
        
        for page in range(1, 8):
            payload = {
                "pageSize": 20,
                "pageIndex": page,
                "filters": [
                    {"field": "bigrank", "operator": "eq", "value": "101"},  # All ranks
                    {"field": "match_type", "operator": "eq", "value": 1}   # Ranked
                ],
                "sorts": [
                    {"data": {"field": "main_hero_win_rate", "order": "desc"}, "type": "sequence"}
                ],
                "fields": [
                    "main_hero",
                    "main_hero_appearance_rate",
                    "main_hero_ban_rate",
                    "main_hero_win_rate",
                    "main_heroid"
                ]
            }
            
            resp = req.post(url, headers=headers, json=payload, timeout=10)
            resp_data = resp.json()
            
            if resp_data.get('code') == 0 and resp_data.get('data', {}).get('records'):
                records = resp_data['data']['records']
                all_heroes.extend(records)
                if len(records) < 20:
                    break
            else:
                break
            
            time.sleep(0.2)
        
        if not all_heroes:
            return jsonify({'error': 'Failed to fetch hero stats from Moonton GMS API'}), 500
        
        # Оновлюємо heroes таблицю
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        updated = 0
        skipped = 0
        errors_count = 0
        
        for hero_data in all_heroes:
            try:
                stats = hero_data.get('data', {})
                hero_game_id = stats.get('main_heroid')
                if not hero_game_id:
                    skipped += 1
                    continue
                
                ban_rate = round(stats.get('main_hero_ban_rate', 0) * 100, 2)
                pick_rate = round(stats.get('main_hero_appearance_rate', 0) * 100, 2)
                win_rate = round(stats.get('main_hero_win_rate', 0) * 100, 2)
                
                cursor.execute(f"SELECT id FROM heroes WHERE hero_game_id = {ph} AND game_id = {ph}", (hero_game_id, game_id))
                result = cursor.fetchone()
                
                if not result:
                    skipped += 1
                    continue
                
                hero_db_id = result[0] if not isinstance(result, dict) else result['id']
                
                cursor.execute(f"""
                    UPDATE heroes 
                    SET main_hero_ban_rate = {ph},
                        main_hero_appearance_rate = {ph},
                        main_hero_win_rate = {ph}
                    WHERE id = {ph}
                """, (ban_rate, pick_rate, win_rate, hero_db_id))
                
                updated += 1
                
            except Exception as e:
                print(f"Error processing hero {hero_data}: {e}")
                errors_count += 1
                continue
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'updated': updated,
            'skipped': skipped,
            'errors': errors_count,
            'total_fetched': len(all_heroes),
            'message': f'Updated {updated} heroes (Ban/Pick/Win rates) from Moonton GMS API'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mlbb/heroes/fetch-fresh-stats', methods=['POST'])
def fetch_fresh_mlbb_stats():
    """Запускає fetch_all_heroes_stats.py для оновлення mlbb_heroes_stats.json з Moonton API"""
    try:
        data = request.get_json() or {}
        auth_token = data.get('auth_token')
        
        if not auth_token:
            return jsonify({
                'error': 'Authorization token is required. Please provide auth_token in request body.'
            }), 400
        
        import threading
        import subprocess
        import sys
        
        def run_script():
            try:
                print("[INFO] Starting fetch_all_heroes_stats.py...")
                env = os.environ.copy()
                env['MOONTON_AUTH_TOKEN'] = auth_token
                
                result = subprocess.run(
                    [sys.executable, 'fetch_all_heroes_stats.py'],
                    capture_output=True,
                    text=True,
                    timeout=120,
                    cwd=os.path.dirname(os.path.abspath(__file__)),
                    env=env
                )
                print(f"[INFO] Script completed with exit code {result.returncode}")
                if result.stdout:
                    print(f"[STDOUT] {result.stdout}")
                if result.stderr:
                    print(f"[STDERR] {result.stderr}")
            except Exception as e:
                print(f"[ERROR] Failed to run script: {e}")
        
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'Fetching fresh hero statistics from Moonton API started. This will update mlbb_heroes_stats.json file.',
            'estimated_time': '30-60 seconds'
        }), 202
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mlbb/heroes/update-stats', methods=['POST'])
def update_mlbb_heroes_stats():
    """Оновлює статистику героїв (ban/pick/win rates + counter data) з mlbb_heroes_stats.json
    
    Body Parameters:
        game_id: ID гри (optional, default: 2 - MLBB)
    
    Returns:
        {
            'updated': int - кількість оновлених героїв,
            'skipped': int - кількість пропущених,
            'errors': int - кількість помилок,
            'top_banned': list - топ-5 найбанніших героїв
        }
    """
    try:
        data = request.json or {}
        game_id = data.get('game_id', 2)
        
        # Читаємо дані з mlbb_heroes_stats.json
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        stats_file = os.path.join(script_dir, 'mlbb_heroes_stats.json')
        
        if not os.path.exists(stats_file):
            return jsonify({'error': 'mlbb_heroes_stats.json not found. Please run fetch_all_heroes_stats.py first'}), 404
        
        with open(stats_file, 'r', encoding='utf-8') as f:
            api_data = json.load(f)
        
        statistics = api_data.get('statistics', [])
        if not statistics:
            return jsonify({'error': 'No statistics data in file'}), 400
        
        updated = 0
        skipped = 0
        errors = 0
        top_banned = []
        
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        for hero_stat in statistics:
            try:
                hero_id = hero_stat.get('hero_id')
                ban_rate = hero_stat.get('ban_rate')
                pick_rate = hero_stat.get('pick_rate')
                win_rate = hero_stat.get('win_rate')
                raw_data = hero_stat.get('raw_data', {})
                
                # Знаходимо героя в БД
                cursor.execute(f"SELECT id FROM heroes WHERE hero_game_id = {ph} AND game_id = {ph}", (hero_id, game_id))
                result = cursor.fetchone()
                
                if not result:
                    skipped += 1
                    continue
                
                hero_db_id = result[0]
                
                # Оновлюємо тільки ban/pick/win rates (counter_data оновлюється окремим скриптом)
                cursor.execute(f"""
                    UPDATE heroes 
                    SET main_hero_ban_rate = {ph},
                        main_hero_appearance_rate = {ph},
                        main_hero_win_rate = {ph}
                    WHERE id = {ph}
                """, (ban_rate, pick_rate, win_rate, hero_db_id))
                
                updated += 1
                
                # Зберігаємо для топу
                top_banned.append({
                    'name': hero_stat.get('hero_name'),
                    'ban_rate': ban_rate,
                    'win_rate': win_rate,
                    'pick_rate': pick_rate
                })
                
            except Exception as e:
                print(f"Error updating hero {hero_stat.get('hero_name', 'unknown')}: {str(e)}")
                errors += 1
                continue
        
        conn.commit()
        db.release_connection(conn)
        
        # Сортуємо топ-банених
        top_banned.sort(key=lambda x: x['ban_rate'], reverse=True)
        
        return jsonify({
            'success': True,
            'updated': updated,
            'skipped': skipped,
            'errors': errors,
            'total': len(statistics),
            'top_banned': top_banned[:10]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/update-all-skills-moonton', methods=['POST'])
def update_all_skills_moonton():
    """Оновлює скіли для всіх героїв з офіційного Moonton GMS API (name-based matching)"""
    import requests as req
    import re as _re
    
    data = request.get_json() or {}
    game_id = data.get('game_id', 2)
    auth_token = data.get('auth_token')
    
    if not auth_token:
        return jsonify({'error': 'Authorization token is required.'}), 400
    
    MOONTON_API = "https://api.gms.moontontech.com/api/gms/source/2669606"
    headers = {
        'authorization': auth_token,
        'content-type': 'application/json;charset=UTF-8',
    }
    
    results = {
        'total': 0,
        'updated': 0,
        'skipped': 0,
        'failed': 0,
        'errors': []
    }
    
    try:
        # 1. Отримуємо список героїв з Moonton API
        heroes_url = f"{MOONTON_API}/2756564"
        heroes_payload = {
            "pageSize": 200,
            "pageIndex": 1,
            "filters": [],
            "sorts": [{"data": {"field": "hero_id", "order": "desc"}, "type": "sequence"}],
            "object": []
        }
        
        heroes_resp = req.post(heroes_url, json=heroes_payload, headers=headers, timeout=30)
        moonton_heroes = heroes_resp.json().get('data', {}).get('records', [])
        
        if not moonton_heroes:
            return jsonify({'error': 'Failed to fetch heroes from Moonton API. Check auth token.'}), 400
        
        # 2. Будуємо маппінг name → moonton skills
        moonton_map = {}  # name.lower() → skills list
        for mh in moonton_heroes:
            hero_data = mh.get('data', {})
            hero_inner = hero_data.get('hero', {}).get('data', {})
            name = hero_inner.get('name', '').strip()
            skill_lists = hero_inner.get('heroskilllist', [])
            
            if name and skill_lists:
                skills = skill_lists[0].get('skilllist', [])
                if skills:
                    # Видаляємо дублікати
                    seen = set()
                    unique = []
                    for s in skills:
                        sn = s.get('skillname', '')
                        if sn and sn not in seen:
                            seen.add(sn)
                            unique.append(s)
                    moonton_map[name.lower()] = unique
        
        # 3. Отримуємо героїв з нашої БД
        db_heroes = db.get_heroes(game_id, include_details=False, include_skills=False, include_relation=False)
        results['total'] = len(db_heroes)
        
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        def sanitize_html(text):
            """Зберігає кольорові теги від Moonton, видаляє небезпечні"""
            if not text:
                return ''
            import re as _re_local
            # Зберігаємо тільки <font color="..."> та </font>
            # Видаляємо все інше HTML
            allowed = _re_local.findall(r'(<font[^>]*color=[^>]*>|</font>)', text)
            # Спочатку видаляємо всі теги
            clean = _re_local.sub(r'<[^>]+>', lambda m: m.group(0) if m.group(0) in allowed else '', text)
            return clean
        
        for hero in db_heroes:
            hero_name = hero['name']
            hero_id = hero['id']
            
            try:
                # Шукаємо скіли по імені героя
                moonton_skills = moonton_map.get(hero_name.lower())
                
                if not moonton_skills:
                    results['skipped'] += 1
                    results['errors'].append(f"{hero_name}: not found in Moonton API")
                    continue
                
                # Отримуємо існуючі скіли з БД
                cursor.execute(f'SELECT id, skill_name, is_transformed, skill_parameters FROM hero_skills WHERE hero_id = {ph} ORDER BY display_order', (hero_id,))
                db_rows = cursor.fetchall()
                
                # Будуємо список базових (не-трансформ) скілів за іменем
                # Для кожного імені беремо тільки ПЕРШИЙ не-трансформ скіл
                base_skills_by_name = {}
                for row in db_rows:
                    if isinstance(row, dict):
                        sid, sname, is_t = row['id'], row['skill_name'], row.get('is_transformed')
                    else:
                        sid, sname, is_t = row[0], row[1], row[2]
                    
                    # Оновлюємо тільки базові скіли (не трансформи)
                    if not is_t or is_t == 0:
                        if sname not in base_skills_by_name:
                            base_skills_by_name[sname] = sid
                
                skills_updated = 0
                skills_added = 0
                
                for i, ext_skill in enumerate(moonton_skills):
                    skill_name = ext_skill.get('skillname', '')
                    skill_desc = sanitize_html(ext_skill.get('skilldesc', ''))
                    skill_icon = ext_skill.get('skillicon', '')
                    
                    # Парсимо skill_parameters з Moonton skillcd&cost
                    raw_cd = ext_skill.get('skillcd&cost', '')
                    new_params = None
                    if raw_cd and raw_cd.strip():
                        pairs = _re.findall(r'([A-Za-z][A-Za-z ]*?):\s*(\S+)', raw_cd)
                        if pairs:
                            new_params = json.dumps({k.strip(): v.strip() for k, v in pairs})
                    
                    existing_id = base_skills_by_name.get(skill_name)
                    
                    if existing_id:
                        # UPDATE існуючого базового скіла — тільки description, icon, skill_parameters
                        # Зберігаємо: skill_name_uk, skill_description_uk, effect, skill_type,
                        #             level_scaling, effect_types, is_transformed, replaces_skill_id, etc.
                        if new_params:
                            cursor.execute(f'''
                                UPDATE hero_skills 
                                SET skill_description = {ph}, preview = {ph}, image = {ph}, 
                                    display_order = {ph}, skill_parameters = {ph}
                                WHERE id = {ph}
                            ''', (skill_desc, skill_icon, skill_icon, i, new_params, existing_id))
                        else:
                            cursor.execute(f'''
                                UPDATE hero_skills 
                                SET skill_description = {ph}, preview = {ph}, image = {ph}, display_order = {ph}
                                WHERE id = {ph}
                            ''', (skill_desc, skill_icon, skill_icon, i, existing_id))
                        skills_updated += 1
                    else:
                        # INSERT нового скіла (не існує в БД)
                        cursor.execute(f'''
                            INSERT INTO hero_skills (hero_id, skill_name, skill_description, preview, image, 
                                                    display_order, skill_parameters)
                            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
                        ''', (hero_id, skill_name, skill_desc, skill_icon, skill_icon, i, new_params))
                        skills_added += 1
                
                results['updated'] += 1
                conn.commit()
                
            except Exception as e:
                # Rollback щоб не ламати наступних героїв
                try:
                    conn.rollback()
                except:
                    pass
                results['failed'] += 1
                results['errors'].append(f"{hero_name}: {str(e)}")
        
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except req.RequestException as e:
        return jsonify({'error': f'Moonton API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/sync-moonton-data', methods=['POST'])
def sync_moonton_counter_data():
    """Запускає update_moonton_stats_final.py для оновлення counter_data та compatibility_data"""
    try:
        data = request.get_json() or {}
        game_id = data.get('game_id', 2)
        auth_token = data.get('auth_token')
        
        if not auth_token:
            return jsonify({
                'error': 'Authorization token is required. Please provide auth_token in request body.'
            }), 400
        
        # Запускаємо скрипт в окремому потоці
        import threading
        import subprocess
        import sys
        
        def run_script():
            try:
                print("[INFO] Starting update_moonton_stats_final.py...")
                # Створюємо копію environment і додаємо токен
                env = os.environ.copy()
                env['MOONTON_AUTH_TOKEN'] = auth_token
                
                result = subprocess.run(
                    [sys.executable, 'update_moonton_stats_final.py'],
                    capture_output=True,
                    text=True,
                    timeout=600,  # 10 хвилин максимум
                    cwd=os.path.dirname(os.path.abspath(__file__)),
                    env=env
                )
                print(f"[INFO] Script completed with exit code {result.returncode}")
                if result.stdout:
                    print(f"[STDOUT] {result.stdout}")
                if result.stderr:
                    print(f"[STDERR] {result.stderr}")
            except Exception as e:
                print(f"[ERROR] Failed to run script: {e}")
        
        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'Counter & Compatibility data sync started. Updates: best_counters, most_countered_by, compatible, not_compatible for all heroes.',
            'estimated_time': '5-7 minutes (rate limited: 1 request/sec)'
        }), 202  # 202 Accepted
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes', methods=['POST'])
def create_hero():
    
    data = request.json
    
    # Create hero
    hero_id = db.add_hero(
        data['game_id'],
        data['name'],
        data.get('hero_game_id', ''),
        data.get('image', ''),
        data.get('short_description', ''),
        data.get('full_description', ''),
        data.get('lane', ''),
        data.get('roles', []),
        data.get('use_energy', False),
        data.get('specialty', []),
        data.get('damage_type', ''),
        data.get('relation', None),
        data.get('createdAt', None),
        data.get('head', None),
        data.get('main_hero_ban_rate', None),
        data.get('main_hero_appearance_rate', None),
        data.get('main_hero_win_rate', None),
        data.get('hero_stats', None)
    )
    
    # Note: hero_stats is now a JSONB field in heroes table, no need for separate inserts
    # It should be passed in data as an object like: {"hp": 2285, "mana": 500, ...}
    
    # Add skills
    if 'skills' in data:
        for skill in data['skills']:
            add_hero_skill(
                hero_id, 
                skill['skill_name'], 
                skill.get('skill_description', ''), 
                skill.get('effect', []), 
                skill.get('preview', ''), 
                skill.get('skill_type', 'active'),
                skill.get('skill_parameters', {}),
                skill.get('level_scaling', []),
                skill.get('effect_types', []),
                skill.get('is_transformed', 0),
                skill.get('transformation_order', 0),
                skill.get('display_order', 0),
                skill.get('replaces_skill_id'),
                skill.get('skill_name_uk'),
                skill.get('skill_description_uk')
            )
    
    return jsonify({'id': hero_id}), 201

@app.route('/api/heroes/<int:hero_id>', methods=['PUT'])
def update_hero(hero_id):
    try:
        data = request.json
        
        # Обробка pro_builds - додаємо created_at для нових білдів
        pro_builds = data.get('pro_builds', None)
        if pro_builds:
            current_time = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
            
            # Додаємо created_at для білдів які не мають його
            for build in pro_builds:
                if not build.get('created_at'):
                    build['created_at'] = current_time
        
        # Sanitize createdAt - ensure it's an integer or None
        created_at_value = data.get('createdAt', None)
        if created_at_value is not None:
            if isinstance(created_at_value, (list, dict)):
                created_at_value = None  # Invalid format, set to None
            elif isinstance(created_at_value, str):
                try:
                    created_at_value = int(created_at_value)
                except ValueError:
                    created_at_value = None
        
        # Update hero
        db.update_hero(
            hero_id,
            data['name'],
            data.get('hero_game_id', ''),
            data.get('image', ''),
            data.get('short_description', ''),
            data.get('full_description', ''),
            data.get('lane', ''),
            data.get('roles', []),
            data.get('use_energy', False),
            data.get('specialty', []),
            data.get('damage_type', ''),
            data.get('relation', None),
            pro_builds,
            None,  # created_at (автоматичне поле, не змінюємо)
            created_at_value,  # createdAt (timestamp в мілісекундах, sanitized)
            data.get('head', None),
            data.get('painting', None),
            data.get('main_hero_ban_rate', None),
            data.get('main_hero_appearance_rate', None),
            data.get('main_hero_win_rate', None),
            data.get('hero_stats', None),
            data.get('counter_data', None),
            data.get('name_uk', None),  # Ukrainian name
            data.get('short_description_uk', None),  # Ukrainian short description
            data.get('full_description_uk', None),  # Ukrainian full description
            data.get('compatibility_data', None)
        )
        
        # Note: hero_stats is now a JSONB field in heroes table, updated in the main UPDATE query
        # No need for separate stats operations
        
        # Update skills only if explicitly provided in request
        # This prevents accidental deletion when editing hero info without touching skills
        if 'skills' in data and data['skills'] is not None:
            # Delete old skills and add new ones
            db.delete_hero_skills(hero_id)
            for skill in data['skills']:
                # Ensure all string fields are strings
                skill_name = str(skill.get('skill_name', ''))
                skill_desc = str(skill.get('skill_description', ''))
                # Support both 'image' and 'preview' fields
                preview = str(skill.get('image') or skill.get('preview', ''))
                skill_type = str(skill.get('skill_type', 'active'))
                
                # Ensure effect is a string (might be dict/list from React)
                effect = skill.get('effect', '')
                if isinstance(effect, (dict, list)):
                    effect = json.dumps(effect)
                else:
                    effect = str(effect) if effect else ''
                
                db.add_hero_skill(
                    hero_id,
                    skill_name,
                    skill_desc,
                    effect,  # Use converted effect, not skill.get('effect')
                    preview,
                    skill_type,
                    skill.get('skill_parameters', {}),
                    skill.get('level_scaling', []),
                    skill.get('effect_types', []),
                    skill.get('is_transformed', 0),
                    skill.get('transformation_order', 0),
                    skill.get('display_order', 0),
                    skill.get('replaces_skill_id'),
                    skill.get('skill_name_uk'),
                    skill.get('skill_description_uk')
                )
        
        return jsonify({'success': True})
    except Exception as e:
        print(f"ERROR updating hero {hero_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/<int:hero_id>', methods=['DELETE'])
def delete_hero(hero_id):
    
    db.delete_hero(hero_id)
    return jsonify({'success': True})

# Items
@app.route('/api/items', methods=['GET'])

def get_items():
    try:
        game_id = request.args.get('game_id')
        if game_id:
            items = db.get_equipment_by_game(game_id)
            
            # Створюємо мапінг name -> item для швидкого пошуку
            items_map = {item['name']: item for item in items}
            name_to_id = {item['name']: item['id'] for item in items}
            
            # Функція для рекурсивного розгортання рецепту
            def expand_recipe(item_name, visited=None):
                """Розгортає рецепт у деревовидну структуру"""
                if visited is None:
                    visited = set()
                
                if item_name in visited:
                    return None
                visited.add(item_name)
                
                item = items_map.get(item_name)
                if not item:
                    return None
                
                # Парсимо recipe
                recipe_data = item.get('recipe')
                if recipe_data:
                    try:
                        recipe_list = json.loads(recipe_data) if isinstance(recipe_data, str) else recipe_data
                    except:
                        recipe_list = []
                else:
                    recipe_list = []
                
                # Створюємо вузол для цього предмета
                node = {
                    'id': item['id'],
                    'name': item_name,
                    'tier': item.get('tier'),
                    'price': item.get('price_total'),
                    'icon_url': item.get('icon_url'),
                    'components': []
                }
                
                # Якщо є рецепт, рекурсивно розгортаємо компоненти
                if recipe_list:
                    for comp in recipe_list:
                        # recipe зберігається як [{id: X, name: "Y"}, ...] або просто числа [ID1, ID2, ...]
                        if isinstance(comp, dict):
                            comp_name = comp.get('name')
                        elif isinstance(comp, (int, float)):
                            # Шукаємо ім'я за ID
                            comp_item = next((i for i in items_map.values() if i['id'] == comp), None)
                            comp_name = comp_item['name'] if comp_item else None
                        else:
                            comp_name = comp
                        
                        if comp_name:
                            sub_node = expand_recipe(comp_name, visited.copy())
                            if sub_node:
                                node['components'].append(sub_node)
                
                return node
            
            # Парсимо attributes_json та recipe для кожного item
            for item in items:
                # Парсимо attributes_json
                if item.get('attributes_json'):
                    try:
                        item['attributes'] = json.loads(item['attributes_json']) if isinstance(item['attributes_json'], str) else item['attributes_json']
                    except Exception as e:
                        print(f"Error parsing attributes_json for item {item.get('id')} ({item.get('name')}): {e}")
                        print(f"Raw attributes_json: {repr(item.get('attributes_json'))}")
                        item['attributes'] = {}
                else:
                    item['attributes'] = {}
                
                # Парсимо recipe з JSON та конвертуємо в формат [{id, name}, ...]
                if item.get('recipe'):
                    try:
                        recipe_data = json.loads(item['recipe']) if isinstance(item['recipe'], str) else item['recipe']
                        if isinstance(recipe_data, list):
                            # Якщо це масив назв, конвертуємо в масив об'єктів
                            if recipe_data and isinstance(recipe_data[0], str):
                                item['recipe'] = [
                                    {'id': name_to_id.get(name), 'name': name} 
                                    for name in recipe_data
                                ]
                            else:
                                # Вже в правильному форматі
                                item['recipe'] = recipe_data
                        else:
                            item['recipe'] = []
                    except Exception as e:
                        print(f"Error parsing recipe for item {item.get('id')} ({item.get('name')}): {e}")
                        print(f"Raw recipe value: {repr(item.get('recipe'))}")
                        item['recipe'] = []
                else:
                    item['recipe'] = []
                
                # Парсимо upgrades_to з JSON
                if item.get('upgrades_to'):
                    try:
                        item['upgrades_to'] = json.loads(item['upgrades_to']) if isinstance(item['upgrades_to'], str) else item['upgrades_to']
                    except Exception as e:
                        print(f"Error parsing upgrades_to for item {item.get('id')} ({item.get('name')}): {e}")
                        item['upgrades_to'] = None
                
                # Додаємо розгорнутий рецепт (всі базові компоненти)
                item['recipe_full'] = expand_recipe(item['name'])
        else:
            items = []
        return jsonify(items)
    except Exception as e:
        import traceback
        print(f"Error in get_items: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = db.get_equipment(item_id)
    if item:
        # Парсимо attributes_json
        if item.get('attributes_json'):
            try:
                item['attributes'] = json.loads(item['attributes_json'])
            except:
                item['attributes'] = {}
        else:
            item['attributes'] = {}
        
        # Парсимо recipe
        if item.get('recipe'):
            try:
                item['recipe'] = json.loads(item['recipe'])
            except:
                pass
        
        # Парсимо upgrades_to
        if item.get('upgrades_to'):
            try:
                item['upgrades_to'] = json.loads(item['upgrades_to'])
            except:
                pass
        
        return jsonify(item)
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.json
    
    # Якщо є attributes об'єкт, конвертуємо в JSON
    if 'attributes' in data:
        data['attributes_json'] = json.dumps(data['attributes'])
        # Також додаємо окремі поля для зворотної сумісності
        for key, value in data['attributes'].items():
            data[key] = value
    
    # Передаємо всі поля через **kwargs
    item_id = db.add_equipment(
        data['game_id'],
        data['name'],
        data.get('category', 'Attack'),
        data.get('price_total', 0),
        **{k: v for k, v in data.items() if k not in ['game_id', 'name', 'category', 'price_total', 'attributes']}
    )
    return jsonify({'id': item_id}), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.json
    
    # Якщо є attributes об'єкт, конвертуємо в JSON
    if 'attributes' in data:
        data['attributes_json'] = json.dumps(data['attributes'])
        # Також оновлюємо окремі поля
        for key, value in data['attributes'].items():
            data[key] = value
    
    # Передаємо всі поля через **kwargs
    db.update_equipment(item_id, **{k: v for k, v in data.items() if k != 'attributes'})
    return jsonify({'success': True})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    db.delete_equipment(item_id)
    return jsonify({'success': True})

@app.route('/api/items/fetch-from-fandom', methods=['POST'])
def fetch_items_from_fandom():
    """Fetch items data from Fandom (step 1)"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(__file__))
    
    try:
        from fetch_equipment_from_fandom import fetch_item_data
        
        game_id = request.json.get('game_id', 2)
        items = db.get_equipment_by_game(game_id)
        
        results = []
        for item in items:
            if item.get('tier') != '1':  # Skip tier 1
                try:
                    data = fetch_item_data(item['name'])
                    if data:
                        results.append(data)
                except:
                    pass
        
        return jsonify({'items': results, 'count': len(results)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/update-from-fandom', methods=['POST'])
def update_items_from_fandom():
    """Bulk update items from pre-fetched JSON data"""
    try:
        data = request.json
        game_id = data.get('game_id', 2)
        items_data = data.get('items', [])
        
        if not items_data:
            return jsonify({'error': 'No items data provided'}), 400
        
        # Отримуємо всі предмети з бази для маппінгу name -> id
        db_items = db.get_equipment_by_game(game_id)
        name_to_item = {item['name']: item for item in db_items}
        
        results = {
            'total': len(items_data),
            'updated': 0,
            'created': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for fandom_data in items_data:
            try:
                item_name = fandom_data.get('name')
                if not item_name:
                    continue
                
                # Знаходимо предмет в базі
                item = name_to_item.get(item_name)
                
                # Визначаємо tier на основі recipe
                tier = '1'  # Default
                recipe_data = fandom_data.get('recipe', [])
                if recipe_data:
                    tier = '2'  # Має компоненти
                
                # Якщо предмет не існує - створюємо його
                if not item:
                    # Парсимо атрибути для створення
                    import re
                    def parse_stat(value_str):
                        if not value_str:
                            return None
                        match = re.search(r'([+\-]?\d+(?:\.\d+)?)', str(value_str))
                        return float(match.group(1)) if match else None
                    
                    attrs = fandom_data.get('attributes', {})
                    
                    # Створюємо новий предмет
                    new_item_data = {
                        'game_id': game_id,
                        'name': item_name,
                        'tier': tier,
                        'price_total': fandom_data.get('price'),
                        'category': fandom_data.get('type'),
                        'icon_url': fandom_data.get('icon_url'),
                        'physical_attack': parse_stat(attrs.get('Physical Attack')),
                        'magic_power': parse_stat(attrs.get('Magic Power')),
                        'attack_speed': parse_stat(attrs.get('Attack Speed')),
                        'hp': parse_stat(attrs.get('HP')),
                        'physical_defense': parse_stat(attrs.get('Physical Defense')),
                        'magic_defense': parse_stat(attrs.get('Magic Defense')),
                        'movement_speed': parse_stat(attrs.get('Movement Speed') or attrs.get('Move Speed')),
                        'cooldown_reduction': parse_stat(attrs.get('CD Reduction') or attrs.get('Cooldown Reduction')),
                        'lifesteal': parse_stat(attrs.get('Physical Lifesteal') or attrs.get('Lifesteal')),
                        'spell_vamp': parse_stat(attrs.get('Magic Lifesteal') or attrs.get('Spell Vamp')),
                        'mana_regen': parse_stat(attrs.get('Mana Regen')),
                        'crit_chance': parse_stat(attrs.get('Crit Chance')),
                        'attributes_json': json.dumps(attrs, ensure_ascii=False),
                        'recipe': json.dumps([], ensure_ascii=False),  # Порожній рецепт спочатку
                        'sellable': 1,
                        'removed': 0
                    }
                    
                    # Створюємо предмет
                    conn = db.get_connection()
                    cursor = conn.cursor()
                    ph = db.get_placeholder()
                    
                    columns = ', '.join(new_item_data.keys())
                    placeholders = ', '.join([ph] * len(new_item_data))
                    values = tuple(new_item_data.values())
                    
                    cursor.execute(
                        f"INSERT INTO equipment ({columns}) VALUES ({placeholders})",
                        values
                    )
                    conn.commit()
                    
                    # Отримуємо ID нового предмета
                    cursor.execute(f"SELECT id FROM equipment WHERE name = {ph} AND game_id = {ph}", (item_name, game_id))
                    new_id = cursor.fetchone()[0]
                    
                    item = {'id': new_id, 'name': item_name, 'tier': tier}
                    name_to_item[item_name] = item
                    
                    conn.close()
                    results['created'] += 1
                    print(f"✨ Створено новий предмет: {item_name} (ID: {new_id})")
                
                # Пропускаємо базові предмети (tier 1) для оновлення
                if item.get('tier') == '1':
                    results['skipped'] += 1
                    continue
                
                # Парсимо атрибути
                import re
                def parse_stat(value_str):
                    if not value_str:
                        return None
                    match = re.search(r'([+\-]?\d+(?:\.\d+)?)', str(value_str))
                    return float(match.group(1)) if match else None
                
                attrs = fandom_data.get('attributes', {})
                
                # Конвертуємо recipe - шукаємо ID компонентів
                recipe_names = fandom_data.get('recipe', [])
                recipe_json = []
                if recipe_names:
                    for comp_name in recipe_names:
                        comp_item = name_to_item.get(comp_name)
                        if comp_item:
                            recipe_json.append({
                                'id': comp_item['id'],
                                'name': comp_name
                            })
                
                # Унікальні пасивки
                unique_passive = fandom_data.get('unique_passive', [])
                unique_active = fandom_data.get('unique_active')
                passive_text = '\n'.join(unique_passive) if isinstance(unique_passive, list) else str(unique_passive or '')
                if unique_active:
                    passive_text += '\n' + unique_active
                
                # Готуємо дані для оновлення
                update_data = {
                    'price_total': fandom_data.get('price'),
                    'category': fandom_data.get('type'),
                    'icon_url': fandom_data.get('icon_url'),
                    'physical_attack': parse_stat(attrs.get('Physical Attack')),
                    'magic_power': parse_stat(attrs.get('Magic Power')),
                    'attack_speed': parse_stat(attrs.get('Attack Speed')),
                    'hp': parse_stat(attrs.get('HP')),
                    'physical_defense': parse_stat(attrs.get('Physical Defense')),
                    'magic_defense': parse_stat(attrs.get('Magic Defense')),
                    'movement_speed': parse_stat(attrs.get('Movement Speed') or attrs.get('Move Speed')),
                    'cooldown_reduction': parse_stat(attrs.get('CD Reduction') or attrs.get('Cooldown Reduction')),
                    'lifesteal': parse_stat(attrs.get('Physical Lifesteal') or attrs.get('Lifesteal')),
                    'spell_vamp': parse_stat(attrs.get('Magic Lifesteal') or attrs.get('Spell Vamp')),
                    'mana_regen': parse_stat(attrs.get('Mana Regen')),
                    'crit_chance': parse_stat(attrs.get('Crit Chance')),
                    'attributes_json': json.dumps(attrs, ensure_ascii=False),
                    'passive_description': passive_text if passive_text else None,
                    'recipe': json.dumps(recipe_json, ensure_ascii=False) if recipe_json else None
                }
                
                # Оновлюємо тільки поля які мають значення
                filtered_data = {k: v for k, v in update_data.items() if v is not None}
                
                if filtered_data:
                    db.update_equipment(item['id'], **filtered_data)
                    results['updated'] += 1
                else:
                    results['skipped'] += 1
                
            except Exception as e:
                results['errors'].append(f"{item_name}: {str(e)}")
                results['failed'] += 1
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/translations/fetch', methods=['POST'])
def fetch_item_translations():
    """Fetch translations for items from Fandom/Liquipedia"""
    try:
        data = request.json
        game_id = data.get('game_id', 1)
        dry_run = data.get('dry_run', False)
        
        # Import the translation fetcher
        import sys
        import os
        sys.path.insert(0, os.path.dirname(__file__))
        
        from fetch_item_translations import fetch_item_from_fandom, fetch_item_from_liquipedia
        import time
        
        # Get all items for this game
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        cursor.execute(f"""
            SELECT id, name, name_en, description_en
            FROM equipment 
            WHERE game_id = {ph}
            ORDER BY tier DESC, name
        """, (game_id,))
        
        items = cursor.fetchall()
        
        results = {
            'total': len(items),
            'updated': 0,
            'skipped': 0,
            'failed': 0,
            'items': []
        }
        
        for item in items:
            if db.DATABASE_TYPE == 'postgres':
                item_id = item[0]
                name = item[1]
                name_en = item[2]
                description_en = item[3]
            else:
                item_id = item['id']
                name = item['name']
                name_en = item['name_en']
                description_en = item['description_en']
            
            # Skip if already has translation
            if name_en and description_en:
                results['skipped'] += 1
                continue
            
            # Fetch from Fandom
            translation_data = fetch_item_from_fandom(name)
            
            # Fallback to Liquipedia
            if not translation_data or not translation_data.get('description_en'):
                time.sleep(1)
                translation_data = fetch_item_from_liquipedia(name)
            
            if not translation_data:
                results['failed'] += 1
                continue
            
            # Update database if not dry run
            if not dry_run:
                update_fields = []
                update_values = []
                
                if translation_data.get('name_en'):
                    update_fields.append(f"name_en = {ph}")
                    update_values.append(translation_data['name_en'])
                
                if translation_data.get('description_en'):
                    update_fields.append(f"description_en = {ph}")
                    update_values.append(translation_data['description_en'])
                
                if translation_data.get('passive_name'):
                    update_fields.append(f"passive_name = {ph}")
                    update_values.append(translation_data['passive_name'])
                
                if translation_data.get('passive_description'):
                    update_fields.append(f"passive_description = {ph}")
                    update_values.append(translation_data['passive_description'])
                
                if translation_data.get('active_name'):
                    update_fields.append(f"active_name = {ph}")
                    update_values.append(translation_data['active_name'])
                
                if translation_data.get('active_description'):
                    update_fields.append(f"active_description = {ph}")
                    update_values.append(translation_data['active_description'])
                
                if update_fields:
                    update_values.append(item_id)
                    query = f"""
                        UPDATE equipment 
                        SET {', '.join(update_fields)}
                        WHERE id = {ph}
                    """
                    cursor.execute(query, tuple(update_values))
                    conn.commit()
                    results['updated'] += 1
            else:
                results['updated'] += 1
            
            # Add to results
            results['items'].append({
                'id': item_id,
                'name': name,
                'translation': translation_data
            })
            
            # Pause to avoid overloading servers
            time.sleep(2)
        
        db.release_connection(conn)
        
        return jsonify(results)
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/items/translations/stats', methods=['GET'])
def get_translation_stats():
    """Get statistics about translation coverage"""
    try:
        game_id = request.args.get('game_id', 1, type=int)
        
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        cursor.execute(f"""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN name_en IS NOT NULL AND name_en != '' THEN 1 ELSE 0 END) as has_name_en,
                SUM(CASE WHEN description_en IS NOT NULL AND description_en != '' THEN 1 ELSE 0 END) as has_desc_en,
                SUM(CASE WHEN passive_name IS NOT NULL AND passive_name != '' THEN 1 ELSE 0 END) as has_passive,
                SUM(CASE WHEN active_name IS NOT NULL AND active_name != '' THEN 1 ELSE 0 END) as has_active
            FROM equipment 
            WHERE game_id = {ph}
        """, (game_id,))
        
        stats = cursor.fetchone()
        db.release_connection(conn)
        
        if db.DATABASE_TYPE == 'postgres':
            return jsonify({
                'total': stats[0],
                'has_name_en': stats[1],
                'has_desc_en': stats[2],
                'has_passive': stats[3],
                'has_active': stats[4]
            })
        else:
            return jsonify(dict(stats))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== PATCHES ==============

@app.route('/api/patches', methods=['GET'])
def get_patches():
    """Отримує список патчів з кешованого JSON файлу"""
    try:
        import os
        from datetime import datetime
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        if not os.path.exists(patches_file):
            return jsonify({'error': 'Patches data not found. Run fetch_patches_from_liquipedia.py first'}), 404
        
        with open(patches_file, 'r', encoding='utf-8') as f:
            patches_data = json.load(f)
        
        # Якщо запит тільки для списку версій (minimal=true)
        minimal = request.args.get('minimal', '').lower() == 'true'
        
        if minimal:
            # Повертаємо тільки версії та дати
            if isinstance(patches_data, dict):
                result = [
                    {
                        'version': version,
                        'release_date': data.get('release_date', '')
                    }
                    for version, data in patches_data.items()
                ]
            else:
                result = [{'version': p.get('version', ''), 'release_date': p.get('release_date', '')} for p in patches_data]
            
            # Сортуємо за датою
            from datetime import datetime
            result.sort(key=lambda x: datetime.strptime(x.get('release_date', '2000-01-01'), '%Y-%m-%d'), reverse=True)
            
            # Застосовуємо limit
            limit = request.args.get('limit', type=int)
            if limit:
                result = result[:limit]
            
            return jsonify(result)
        
        # Конвертуємо об'єкт в масив патчів (повні дані)
        if isinstance(patches_data, dict):
            result = [
                {
                    'version': version,
                    'release_date': data.get('release_date', ''),
                    'highlights': data.get('highlights', []),
                    'new_hero': data.get('new_hero'),
                    'hero_adjustments': data.get('hero_adjustments', {}),
                    'equipment_adjustments': data.get('equipment_adjustments', {}),
                    'system_adjustments': data.get('system_adjustments', []),
                    'battlefield_adjustments': data.get('battlefield_adjustments', {}),
                    'emblem_adjustments': data.get('emblem_adjustments', {}),
                    'designers_note': data.get('designers_note', ''),
                    'revamped_heroes': data.get('revamped_heroes', []),
                    'revamped_heroes_data': data.get('revamped_heroes_data', {}),
                    'game_id': 1
                }
                for version, data in patches_data.items()
            ]
        else:
            result = patches_data if isinstance(patches_data, list) else []
        
        # Сортуємо патчі за датою (від новіших до старіших)
        result.sort(key=lambda x: datetime.strptime(x.get('release_date', '2000-01-01'), '%Y-%m-%d'), reverse=True)
        
        # Фільтруємо за параметрами
        limit = request.args.get('limit', type=int)
        search = request.args.get('search', type=str)
        
        if search:
            search_lower = search.lower()
            result = [p for p in result if search_lower in p.get('version', '').lower()]
        
        if limit:
            result = result[:limit]
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/patches/<version>', methods=['GET'])
def get_patch_details(version):
    """Отримує деталі конкретного патчу"""
    try:
        import os
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        if not os.path.exists(patches_file):
            return jsonify({'error': 'Patches data not found'}), 404
        
        with open(patches_file, 'r', encoding='utf-8') as f:
            patches_dict = json.load(f)
        
        # Шукаємо патч за версією (тепер це ключ)
        if version in patches_dict:
            return jsonify({'version': version, **patches_dict[version]})
        
        return jsonify({'error': 'Patch not found'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/patches/refresh', methods=['POST'])
def refresh_patches():
    """Оновлює дані патчів з Liquipedia"""
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(__file__))
        
        from fetch_patches_from_liquipedia import fetch_latest_patches
        
        limit = request.json.get('limit', 20) if request.json else 20
        
        print(f"🔄 Оновлення патчів (limit: {limit})...")
        patches = fetch_latest_patches(limit=limit)
        
        # Зберігаємо в файл
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        with open(patches_file, 'w', encoding='utf-8') as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'count': len(patches),
            'message': f'Successfully refreshed {len(patches)} patches'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/patches', methods=['POST'])
def create_patch():
    """Створює новий патч"""
    try:
        import os
        data = request.json
        
        if not data.get('version'):
            return jsonify({'error': 'Version is required'}), 400
        
        version = data['version']
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        # Читаємо існуючі патчі
        patches = {}
        if os.path.exists(patches_file):
            with open(patches_file, 'r', encoding='utf-8') as f:
                patches = json.load(f)
        
        # Перевіряємо чи не існує вже такий патч
        if version in patches:
            return jsonify({'error': 'Patch with this version already exists'}), 400
        
        # Конвертуємо дані з фронтенду в формат JSON файлу
        patch_data = {
            'version': version,
            'release_date': data.get('release_date'),
            'designers_note': data.get('designers_note', ''),
            'new_hero': data.get('new_hero'),
            'hero_adjustments': data.get('hero_adjustments', {}),
            'equipment_adjustments': data.get('equipment_adjustments', {}),
            'system_adjustments': data.get('system_adjustments', []),
            'battlefield_adjustments': data.get('battlefield_adjustments', {}),
            'emblem_adjustments': data.get('emblem_adjustments', {}),
            'revamped_heroes': data.get('revamped_heroes', []),
            'revamped_heroes_data': data.get('revamped_heroes_data', {}),
            'game_id': data.get('game_id', 1)
        }
        
        # Додаємо новий патч
        patches[version] = patch_data
        
        # Зберігаємо
        with open(patches_file, 'w', encoding='utf-8') as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'patch': patch_data}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/patches/<version>', methods=['PUT'])
def update_patch(version):
    """Оновлює патч"""
    try:
        import os
        data = request.json
        
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        if not os.path.exists(patches_file):
            return jsonify({'error': 'Patches data not found'}), 404
        
        # Читаємо існуючі патчі
        with open(patches_file, 'r', encoding='utf-8') as f:
            patches = json.load(f)
        
        # patches - це об'єкт/dict, не масив
        if version not in patches:
            return jsonify({'error': 'Patch not found'}), 404
        
        # Конвертуємо ключі з адмін панелі назад в формат JSON файлу
        patch_data = {
            'version': version,
            'url': data.get('url', patches[version].get('url', '')),
            'release_date': data.get('release_date'),
            'highlights': data.get('highlights', []),
            'new_hero': data.get('new_hero'),
            'hero_adjustments': data.get('hero_adjustments', {}),
            'equipment_adjustments': data.get('equipment_adjustments', {}),
            'system_adjustments': data.get('system_adjustments', [])
        }
        
        # Зберігаємо додаткові поля, якщо є
        for key in ['designers_note', 'battlefield_adjustments', 'emblem_adjustments', 'revamped_heroes', 'revamped_heroes_data', 'game_id']:
            if key in data:
                patch_data[key] = data[key]
        
        # Оновлюємо патч
        patches[version] = patch_data
        
        # Зберігаємо
        with open(patches_file, 'w', encoding='utf-8') as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'patch': patch_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/patches/<version>', methods=['DELETE'])
def delete_patch(version):
    """Видаляє патч"""
    try:
        import os
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        if not os.path.exists(patches_file):
            return jsonify({'error': 'Patches data not found'}), 404
        
        # Читаємо існуючі патчі
        with open(patches_file, 'r', encoding='utf-8') as f:
            patches = json.load(f)
        
        # Перевірка чи patches це словник чи список
        if isinstance(patches, dict):
            # Якщо це словник (як у patches_data.json)
            if version not in patches:
                return jsonify({'error': f'Patch {version} not found'}), 404
            
            # Видаляємо патч
            del patches[version]
        else:
            # Якщо це список (старий формат)
            patches = [p for p in patches if p.get('version') != version]
        
        # Зберігаємо
        with open(patches_file, 'w', encoding='utf-8') as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== EMBLEM TALENTS ==============

@app.route('/api/emblem-talents', methods=['GET'])
def get_emblem_talents():
    game_id = request.args.get('game_id', type=int)
    tier = request.args.get('tier', type=int)
    talents = db.get_emblem_talents(game_id=game_id, tier=tier)
    return jsonify(talents)

@app.route('/api/emblem-talents/<int:talent_id>', methods=['GET'])
def get_emblem_talent(talent_id):
    talent = db.get_emblem_talent(talent_id)
    if talent:
        return jsonify(talent)
    return jsonify({'error': 'Talent not found'}), 404

@app.route('/api/emblem-talents', methods=['POST'])
def create_emblem_talent():
    data = request.json
    talent_id = db.add_emblem_talent(
        game_id=data['game_id'],
        tier=data['tier'],
        name=data['name'],
        effect=data['effect'],
        icon_url=data.get('icon_url')
    )
    return jsonify({'id': talent_id, 'success': True})

@app.route('/api/emblem-talents/<int:talent_id>', methods=['PUT'])
def update_emblem_talent(talent_id):
    data = request.json
    db.update_emblem_talent(talent_id, **data)
    return jsonify({'success': True})

@app.route('/api/emblem-talents/<int:talent_id>', methods=['DELETE'])
def delete_emblem_talent(talent_id):
    db.delete_emblem_talent(talent_id)
    return jsonify({'success': True})

# ============== EMBLEMS ==============

@app.route('/api/emblems', methods=['GET'])

def get_emblems_api():
    game_id = request.args.get('game_id', type=int)
    emblems = db.get_emblems(game_id=game_id)
    return jsonify(emblems)

@app.route('/api/emblems/<int:emblem_id>', methods=['GET'])

def get_emblem_api(emblem_id):
    emblem = db.get_emblem(emblem_id)
    if emblem:
        return jsonify(emblem)
    return jsonify({'error': 'Emblem not found'}), 404

@app.route('/api/emblems/<int:emblem_id>', methods=['PUT'])
def update_emblem_api(emblem_id):
    data = request.json
    db.update_emblem(emblem_id, **data)
    return jsonify({'success': True})

# Battle Spells endpoints
@app.route('/api/battle-spells', methods=['GET', 'POST'])
def battle_spells_api():
    if request.method == 'GET':
        game_id = request.args.get('game_id', type=int)
        spells = db.get_battle_spells(game_id=game_id)
        return jsonify(spells)
    
    elif request.method == 'POST':
        data = request.get_json()
        try:
            spell_id = db.add_battle_spell(
                game_id=data.get('game_id'),
                name=data.get('name'),
                overview=data.get('overview'),
                description=data.get('description'),
                cooldown=data.get('cooldown'),
                unlocked_level=data.get('unlocked_level'),
                icon_url=data.get('icon_url')
            )
            return jsonify({'id': spell_id, 'message': 'Battle spell created'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

@app.route('/api/battle-spells/<int:spell_id>', methods=['GET', 'PUT', 'DELETE'])
def battle_spell_api(spell_id):
    if request.method == 'GET':
        spell = db.get_battle_spell(spell_id)
        if spell:
            return jsonify(spell)
        return jsonify({'error': 'Battle spell not found'}), 404
    
    elif request.method == 'PUT':
        data = request.get_json()
        try:
            db.update_battle_spell(
                spell_id=spell_id,
                name=data.get('name'),
                overview=data.get('overview'),
                description=data.get('description'),
                cooldown=data.get('cooldown'),
                unlocked_level=data.get('unlocked_level'),
                icon_url=data.get('icon_url')
            )
            return jsonify({'message': 'Battle spell updated'})
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            db.delete_battle_spell(spell_id)
            return jsonify({'message': 'Battle spell deleted'})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

# Fix item recipe IDs after migration
@app.route('/api/fix-recipe-ids', methods=['POST'])
def fix_recipe_ids():
    """Fix recipe IDs in items - match by name instead of old IDs"""
    try:
        conn = db.get_connection()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()
        
        # Спробувати обидві таблиці (items в SQLite, equipment в PostgreSQL)
        try:
            cursor.execute("SELECT id, name, recipe_components as recipe FROM equipment")
            items = cursor.fetchall()
            table_name = 'equipment'
            recipe_column = 'recipe_components'
        except:
            cursor.execute("SELECT id, name, recipe FROM items")
            items = cursor.fetchall()
            table_name = 'items'
            recipe_column = 'recipe'
        
        # Створити маппінг name -> id
        name_to_id = {}
        for row in items:
            item_dict = dict(row)
            name_to_id[item_dict['name']] = item_dict['id']
        
        updated_count = 0
        errors = []
        
        for row in items:
            try:
                item_dict = dict(row)
                item_id = item_dict['id']
                item_name = item_dict['name']
                recipe_raw = item_dict['recipe']
                
                # Пропустити якщо recipe пустий
                if not recipe_raw:
                    continue
                
                # Парсинг recipe
                if isinstance(recipe_raw, str):
                    recipe = json.loads(recipe_raw)
                elif isinstance(recipe_raw, list):
                    recipe = recipe_raw
                else:
                    continue
                
                if not isinstance(recipe, list) or len(recipe) == 0:
                    continue
                
                updated = False
                for component in recipe:
                    comp_name = component.get('name')
                    if comp_name and comp_name in name_to_id:
                        correct_id = name_to_id[comp_name]
                        if component.get('id') != correct_id:
                            component['id'] = correct_id
                            updated = True
                
                if updated:
                    ph = db.get_placeholder()
                    cursor.execute(
                        f"UPDATE {table_name} SET {recipe_column} = {ph} WHERE id = {ph}",
                        (json.dumps(recipe), item_id)
                    )
                    updated_count += 1
                    
            except Exception as e:
                errors.append(f"{item_name}: {str(e)}")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'updated': updated_count, 
            'total': len(items),
            'errors': errors[:10]  # Перші 10 помилок
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/fix-json', methods=['POST'])
def fix_items_json():
    """Виправляє невалідні JSON в recipe та attributes_json"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        game_id = request.json.get('game_id', 2) if request.json else 2
        
        # Отримуємо всі предмети
        cursor.execute('SELECT id, name, recipe, attributes_json FROM equipment WHERE game_id = %s', (game_id,))
        items = cursor.fetchall()
        
        fixed = 0
        for item in items:
            item_id, name, recipe, attributes_json = item
            needs_update = False
            new_recipe = recipe
            new_attributes = attributes_json
            
            # Перевіряємо recipe
            if recipe:
                try:
                    if isinstance(recipe, str):
                        json.loads(recipe)
                except:
                    print(f"Fixing recipe for item {item_id} ({name})")
                    new_recipe = '[]'
                    needs_update = True
            
            # Перевіряємо attributes_json
            if attributes_json:
                try:
                    if isinstance(attributes_json, str):
                        json.loads(attributes_json)
                except:
                    print(f"Fixing attributes_json for item {item_id} ({name})")
                    new_attributes = '{}'
                    needs_update = True
            
            if needs_update:
                cursor.execute(
                    'UPDATE equipment SET recipe = %s, attributes_json = %s WHERE id = %s',
                    (new_recipe, new_attributes, item_id)
                )
                fixed += 1
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'fixed': fixed
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Оптимізація: створення індексів
@app.route('/api/create-indexes', methods=['POST'])
def create_indexes():
    """Створює індекси для оптимізації запитів (тільки PostgreSQL)"""
    try:
        if db.DATABASE_TYPE != 'postgres':
            return jsonify({'error': 'Індекси підтримуються тільки для PostgreSQL'}), 400
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        indexes = [
            ("idx_heroes_game_id", "CREATE INDEX IF NOT EXISTS idx_heroes_game_id ON heroes(game_id)"),
            ("idx_hero_stats_hero_id", "CREATE INDEX IF NOT EXISTS idx_hero_stats_hero_id ON hero_stats(hero_id)"),
            ("idx_hero_skills_hero_id", "CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id)"),
            ("idx_equipment_game_id", "CREATE INDEX IF NOT EXISTS idx_equipment_game_id ON equipment(game_id)"),
            ("idx_emblems_game_id", "CREATE INDEX IF NOT EXISTS idx_emblems_game_id ON emblems(game_id)"),
            ("idx_battle_spells_game_id", "CREATE INDEX IF NOT EXISTS idx_battle_spells_game_id ON battle_spells(game_id)")
        ]
        
        created = []
        for idx_name, sql in indexes:
            cursor.execute(sql)
            created.append(idx_name)
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'created': created,
            'count': len(created)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# FIX: Тимчасовий endpoint для оновлення replaces_skill_id
@app.route('/api/fix-replaces', methods=['POST'])
def fix_replaces():
    """Оновлює replaces_skill_id для всіх трансформованих героїв"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        # Отримуємо всіх героїв з їх навичками
        heroes_resp = db.get_heroes(2, include_details=True)
        
        total = 0
        for hero in heroes_resp:
            if hero['name'] not in ['Beatrix', 'Edith', 'Hanzo', 'Julian', 'Lapu-Lapu', 'Leomord', 'Lukas', 'Lunox', 'Popol and Kupa', 'Roger', 'Selena', 'Yin']:
                continue
            
            skill_map = {s['skill_name']: s['id'] for s in hero.get('skills', [])}
            
            # Визначаємо заміни для кожного героя
            replacements = {}
            if hero['name'] == 'Roger':
                replacements = {
                    'Lycan Pounce': 'Open Fire',
                    'Bloodthirsty Howl': "Hunter's Steps",
                    'Restore Human Form': 'Wolf Transformation'
                }
            elif hero['name'] == 'Beatrix':
                # Для Beatrix - трансформовані Mechanical Genius замінюють базову
                base_mg_id = next((s['id'] for s in hero['skills'] if s['skill_name'] == 'Mechanical Genius' and s.get('is_transformed') == 0), None)
                if base_mg_id:
                    for s in hero['skills']:
                        if s['skill_name'] == 'Mechanical Genius' and s.get('is_transformed') == 1:
                            cursor.execute(f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}', (base_mg_id, s['id']))
                            total += 1
                
                replacements = {
                    "Bennett's Rage": "Renner's Apathy",
                    "Wesker's Elation": "Renner's Apathy",
                    "Nibiru's Passion": "Renner's Apathy"
                }
            elif hero['name'] == 'Edith':
                replacements = {
                    'Divine Retribution': 'Earth Shatter',
                    'Lightning Bolt': 'Onward'
                }
            elif hero['name'] == 'Hanzo':
                replacements = {
                    'Forbidden Ninjutsu: Soul Snatch': 'Ninjutsu: Demon Feast',
                    'Forbidden Ninjutsu: Black Mist': 'Ninjutsu: Dark Mist',
                    'Ninjutsu Flee: Return': 'Kinjutsu: Pinnacle Ninja'
                }
            elif hero['name'] == 'Julian':
                replacements = {
                    'Enhanced Scythe': 'Scythe',
                    'Enhanced Sword': 'Sword',
                    'Enhanced Chain': 'Chain'
                }
            elif hero['name'] == 'Lapu-Lapu':
                replacements = {
                    'Storm Sword': 'Justice Blades',
                    'Raging Slash': 'Jungle Warrior',
                    'Land Shaker': 'Bravest Fighter'
                }
            elif hero['name'] == 'Leomord':
                replacements = {
                    'Phantom Stomp': 'Momentum',
                    'Phantom Charge': 'Decimation Assault'
                }
            elif hero['name'] == 'Lukas':
                # Для Lukas навички з однаковими назвами
                for skill_name in ['Flash Combo', 'Flash Step']:
                    base_id = next((s['id'] for s in hero['skills'] if s['skill_name'] == skill_name and s.get('is_transformed') == 0), None)
                    if base_id:
                        for s in hero['skills']:
                            if s['skill_name'] == skill_name and s.get('is_transformed') == 1:
                                cursor.execute(f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}', (base_id, s['id']))
                                total += 1
                
                replacements = {
                    'Shockwave Blast': 'Unleash the Beast'
                }
            elif hero['name'] == 'Lunox':
                replacements = {
                    'Power of Order: Brilliance': 'Order & Chaos',
                    'Power of Chaos: Darkening': 'Order & Chaos'
                }
            elif hero['name'] == 'Popol and Kupa':
                # Навички з однаковими назвами
                for skill_name in ['Bite \'em, Kupa!', 'Kupa, Help!']:
                    base_id = next((s['id'] for s in hero['skills'] if s['skill_name'] == skill_name and s.get('is_transformed') == 0), None)
                    if base_id:
                        for s in hero['skills']:
                            if s['skill_name'] == skill_name and s.get('is_transformed') == 1:
                                cursor.execute(f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}', (base_id, s['id']))
                                total += 1
                replacements = {}
            elif hero['name'] == 'Selena':
                replacements = {
                    'Soul Eater': 'Abyssal Trap',
                    'Garotte': 'Abyssal Arrow',
                    'Blessing of the Moon Goddess': 'Primal Darkness'
                }
            elif hero['name'] == 'Yin':
                # Instant Blast з однаковою назвою
                base_id = next((s['id'] for s in hero['skills'] if s['skill_name'] == 'Instant Blast' and s.get('is_transformed') == 0), None)
                if base_id:
                    for s in hero['skills']:
                        if s['skill_name'] == 'Instant Blast' and s.get('is_transformed') == 1:
                            cursor.execute(f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}', (base_id, s['id']))
                            total += 1
                
                replacements = {
                    'Frenzy Strike': 'Charged Punch'
                }
            
            for trans_skill, base_skill in replacements.items():
                if trans_skill in skill_map and base_skill in skill_map:
                    cursor.execute(
                        f'UPDATE hero_skills SET replaces_skill_id = {ph} WHERE id = {ph}',
                        (skill_map[base_skill], skill_map[trans_skill])
                    )
                    total += 1
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({'success': True, 'updated': total})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Статистика та очищення кешу
@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Очистити весь кеш"""
    
    return jsonify({'success': True, 'message': 'Cache cleared'})

@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """Інформація про кеш"""
    return jsonify({
        'type': 'SimpleCache (in-memory)',
        'timeout': 300,
        'description': 'Кеш на 5 хвилин для всіх GET запитів'
    })

@app.route('/api/debug/relation/<int:hero_id>', methods=['GET'])
def debug_relation(hero_id):
    """Перевіряє RAW значення relation з бази"""
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, relation FROM heroes WHERE id = %s", (hero_id,))
    result = cursor.fetchone()
    db.release_connection(conn)
    if result:
        return jsonify({'name': result[0], 'relation_raw': result[1], 'relation_length': len(result[1]) if result[1] else 0})
    return jsonify({'error': 'Hero not found'}), 404

@app.route('/api/add-indexes', methods=['POST'])
def add_indexes():
    """Додає індекси для оптимізації запитів"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_heroes_game_id ON heroes(game_id)",
            "CREATE INDEX IF NOT EXISTS idx_hero_stats_hero_id ON hero_stats(hero_id)",
            "CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id)",
            "CREATE INDEX IF NOT EXISTS idx_hero_skills_transformed ON hero_skills(is_transformed)",
            "CREATE INDEX IF NOT EXISTS idx_hero_skills_replaces ON hero_skills(replaces_skill_id)",
            "CREATE INDEX IF NOT EXISTS idx_items_game_id ON items(game_id)",
            "CREATE INDEX IF NOT EXISTS idx_equipment_game_id ON equipment(game_id)",
            "CREATE INDEX IF NOT EXISTS idx_emblems_game_id ON emblems(game_id)",
            "CREATE INDEX IF NOT EXISTS idx_battle_spells_game_id ON battle_spells(game_id)",
        ]
        
        created = []
        errors = []
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                index_name = index_sql.split("idx_")[1].split(" ON")[0]
                created.append(f"idx_{index_name}")
            except Exception as e:
                errors.append(str(e))
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'status': 'success',
            'created': created,
            'errors': errors,
            'total': len(created)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-hero-stats', methods=['POST'])
def update_hero_stats():
    """Оновлює статистику героїв з mlbb-stats API"""
    import requests
    import time
    
    try:
        data = request.get_json() or {}
        game_id = data.get('game_id', 2)  # За замовчуванням Mobile Legends
        limit = data.get('limit', None)  # Обмеження кількості
        offset = data.get('offset', 0)  # Зсув для батч-оновлення
        
        # Отримуємо героїв
        conn = db.get_connection()
        cursor = conn.cursor()
        
        if limit:
            cursor.execute(f"SELECT id, name FROM heroes WHERE game_id = %s ORDER BY name LIMIT %s OFFSET %s", (game_id, limit, offset))
        else:
            cursor.execute(f"SELECT id, name FROM heroes WHERE game_id = %s ORDER BY name", (game_id,))
        
        heroes = cursor.fetchall()
        
        updated = 0
        skipped = 0
        errors = []
        
        API_BASE = 'https://mlbb-stats.ridwaanhall.com/api/hero-detail-stats'
        
        for hero in heroes:
            hero_id = hero[0]
            hero_name = hero[1]
            
            # Конвертуємо ім'я в URL-friendly формат
            url_name = hero_name.lower().replace(' ', '-').replace("'", '').replace('.', '')
            url = f"{API_BASE}/{url_name}/"
            
            try:
                response = requests.get(url, timeout=10)
                
                if response.status_code != 200:
                    skipped += 1
                    continue
                
                api_data = response.json()
                
                if api_data.get('code') != 0 or not api_data.get('data', {}).get('records'):
                    skipped += 1
                    continue
                
                record = api_data['data']['records'][0]
                stats_data = record.get('data', {})
                
                # Отримуємо статистику (у форматі 0.023294 тощо)
                ban_rate = stats_data.get('main_hero_ban_rate')
                pick_rate = stats_data.get('main_hero_appearance_rate')
                win_rate = stats_data.get('main_hero_win_rate')
                
                # Множимо на 100 для відсотків
                ban_rate_pct = round(ban_rate * 100, 2) if ban_rate is not None else None
                pick_rate_pct = round(pick_rate * 100, 2) if pick_rate is not None else None
                win_rate_pct = round(win_rate * 100, 2) if win_rate is not None else None
                
                if ban_rate_pct is not None or pick_rate_pct is not None or win_rate_pct is not None:
                    cursor.execute("""
                        UPDATE heroes 
                        SET main_hero_ban_rate = %s, 
                            main_hero_appearance_rate = %s, 
                            main_hero_win_rate = %s
                        WHERE id = %s
                    """, (ban_rate_pct, pick_rate_pct, win_rate_pct, hero_id))
                    updated += 1
                else:
                    skipped += 1
                
                # Пауза між запитами
                time.sleep(0.3)
                
            except Exception as e:
                errors.append(f"{hero_name}: {str(e)}")
                skipped += 1
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'status': 'success',
            'updated': updated,
            'skipped': skipped,
            'total': len(heroes),
            'errors': errors[:10]  # Показуємо тільки перші 10 помилок
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update-hero-ranks-moonton', methods=['POST'])
def update_hero_ranks_moonton():
    """Запустити оновлення hero_ranks з Moonton GMS API (всі 30 комбінацій) в background thread"""
    try:
        data = request.get_json() or {}
        game_id = data.get('game_id', 2)
        auth_token = data.get('auth_token', '')

        import threading

        def run_moonton_update():
            try:
                import update_hero_ranks_from_moonton as moonton
                # Якщо переданий auth token — встановлюємо його
                if auth_token:
                    moonton.AUTH_TOKEN = auth_token
                    moonton.HEADERS['authorization'] = auth_token
                    print(f"[MOONTON] Using provided auth token: {auth_token[:20]}...")

                print("[MOONTON] Starting full update (30 combinations)...")
                moonton.main()
                print("[MOONTON] Update completed successfully!")
            except Exception as e:
                print(f"[MOONTON ERROR] {e}")
                import traceback
                traceback.print_exc()

        thread = threading.Thread(target=run_moonton_update)
        thread.daemon = True
        thread.start()

        return jsonify({
            'status': 'success',
            'message': 'Hero ranks update from Moonton API started (30 combinations). Check server logs for progress.',
            'estimated_time': '15-20 minutes'
        }), 202

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/heroes/update-pro-builds', methods=['POST'])
def update_pro_builds():
    """Запустити fetch_mlbbio_builds.py для оновлення про-білдів з mlbb.io"""
    try:
        import threading
        import subprocess
        import sys

        def run_script():
            try:
                print("[INFO] Starting fetch_mlbbio_builds.py...")
                result = subprocess.run(
                    [sys.executable, 'fetch_mlbbio_builds.py'],
                    capture_output=True,
                    text=True,
                    timeout=600  # 10 хвилин максимум
                )
                print(f"[INFO] fetch_mlbbio_builds.py completed with exit code {result.returncode}")
                if result.stdout:
                    # Показуємо останні рядки
                    lines = result.stdout.strip().split('\n')
                    for line in lines[-10:]:
                        print(f"[BUILDS] {line}")
                if result.stderr:
                    print(f"[STDERR] {result.stderr[:500]}")
            except Exception as e:
                print(f"[ERROR] Failed to run fetch_mlbbio_builds.py: {e}")

        thread = threading.Thread(target=run_script)
        thread.daemon = True
        thread.start()

        return jsonify({
            'status': 'success',
            'message': 'Pro builds update from mlbb.io started in background. Check server logs for progress.',
            'estimated_time': '2-5 minutes'
        }), 202

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update-hero-relation/<hero_name>', methods=['POST'])
def update_hero_relation_endpoint(hero_name):
    """Оновлює relation для конкретного героя з mlbb-stats API"""
    import requests
    
    try:
        # Отримуємо relation з mlbb-stats
        url_name = hero_name.lower().replace(' ', '-')
        url = f'https://mlbb-stats.ridwaanhall.com/api/hero-detail/{url_name}/'
        
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return jsonify({'error': f'Failed to fetch data: HTTP {response.status_code}'}), 500
        
        data = response.json()
        if data.get('code') != 0:
            return jsonify({'error': 'API returned error'}), 500
        
        relation_data = data['data']['records'][0]['data'].get('relation')
        
        if not relation_data:
            return jsonify({'error': 'No relation data found'}), 404
        
        # Зберігаємо оригінальну структуру з mlbb-stats (assist/strong/weak)
        
        # Оновлюємо в БД
        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        
        relation_json = json.dumps(relation_data)
        cursor.execute(
            f"UPDATE heroes SET relation = {ph} WHERE name = {ph}",
            (relation_json, hero_name)
        )
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'hero': hero_name,
            'relation': relation_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/migrate/games-fields', methods=['POST'])
def migrate_games_fields():
    """Тимчасовий endpoint для додавання полів до таблиці games"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        fields_to_add = [
            ('background_image', 'TEXT'),
            ('video_intro', 'TEXT'),
            ('subtitle', 'TEXT'),
            ('preview', 'TEXT')
        ]
        
        results = []
        for field_name, field_type in fields_to_add:
            try:
                if db.DATABASE_TYPE == 'postgres':
                    cursor.execute(f"ALTER TABLE games ADD COLUMN IF NOT EXISTS {field_name} {field_type}")
                else:
                    cursor.execute(f"ALTER TABLE games ADD COLUMN {field_name} {field_type}")
                results.append(f"✅ Added {field_name}")
            except Exception as e:
                if 'already exists' in str(e).lower() or 'duplicate column' in str(e).lower():
                    results.append(f"⚠️  {field_name} already exists")
                else:
                    results.append(f"❌ {field_name}: {str(e)}")
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Fetch external hero skills from MLBB API
@app.route('/api/external/hero-skills/<hero_name>', methods=['GET'])
def fetch_external_hero_skills(hero_name):
    """Proxy endpoint to fetch hero skills from external MLBB API"""
    import requests
    
    try:
        # Format name for external API
        formatted_name = hero_name.lower().replace(' ', '-').replace("'", '')
        external_url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{formatted_name}/"
        
        # Fetch from external API
        response = requests.get(external_url, timeout=10)
        
        if response.status_code != 200:
            return jsonify({'error': f'External API returned status {response.status_code}'}), response.status_code
        
        data = response.json()
        
        if data.get('code') != 0:
            return jsonify({'error': 'Invalid response from external API'}), 400
        
        # Extract skills
        records = data.get('data', {}).get('records', [])
        if not records:
            return jsonify({'error': 'No hero data found'}), 404
        
        hero_data = records[0].get('data', {}).get('hero', {}).get('data', {})
        skill_lists = hero_data.get('heroskilllist', [])
        
        if not skill_lists or not skill_lists[0].get('skilllist'):
            return jsonify({'error': 'No skills found'}), 404
        
        skills = skill_lists[0]['skilllist']
        
        return jsonify({
            'success': True,
            'hero_name': hero_name,
            'skills': skills
        })
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch from external API: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/heroes/update-all-skills', methods=['POST'])
def update_all_heroes_skills():
    """Оновлює скіли для всіх героїв з зовнішнього API"""
    import requests
    
    data = request.get_json() or {}
    game_id = data.get('game_id', 2)  # Default to MLBB
    
    try:
        # Отримуємо всіх героїв гри
        heroes = db.get_heroes(game_id, include_details=False, include_skills=False, include_relation=False)
        
        results = {
            'total': len(heroes),
            'updated': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for hero in heroes:
            hero_name = hero['name']
            hero_id = hero['id']
            
            try:
                # Format name for external API
                formatted_name = hero_name.lower().replace(' ', '-').replace("'", '')
                external_url = f"https://mlbb-stats.ridwaanhall.com/api/hero-detail/{formatted_name}/"
                
                # Fetch from external API
                response = requests.get(external_url, timeout=10)
                
                if response.status_code != 200:
                    results['skipped'] += 1
                    results['errors'].append(f"{hero_name}: External API returned {response.status_code}")
                    continue
                
                api_data = response.json()
                
                if api_data.get('code') != 0:
                    results['skipped'] += 1
                    results['errors'].append(f"{hero_name}: Invalid API response")
                    continue
                
                # Extract skills
                records = api_data.get('data', {}).get('records', [])
                if not records:
                    results['skipped'] += 1
                    results['errors'].append(f"{hero_name}: No hero data found")
                    continue
                
                hero_data = records[0].get('data', {}).get('hero', {}).get('data', {})
                skill_lists = hero_data.get('heroskilllist', [])
                
                if not skill_lists or not skill_lists[0].get('skilllist'):
                    results['skipped'] += 1
                    results['errors'].append(f"{hero_name}: No skills found")
                    continue
                
                external_skills = skill_lists[0]['skilllist']
                
                # Remove duplicates
                seen_skills = set()
                unique_skills = []
                for skill in external_skills:
                    if skill['skillname'] not in seen_skills:
                        seen_skills.add(skill['skillname'])
                        unique_skills.append(skill)
                
                # Get database skills
                db_skills = db.get_hero_skills(hero_id)
                
                # Compare external skills with database
                ext_skill_names = set(skill['skillname'] for skill in unique_skills)
                db_skill_names = set(skill['skill_name'] for skill in db_skills)
                
                # If skill sets are different, only update descriptions/icons for matching skills
                # and add truly new skills (DO NOT delete existing skills to preserve all metadata)
                if ext_skill_names != db_skill_names:
                    conn = db.get_connection()
                    cursor = conn.cursor()
                    ph = db.get_placeholder()
                    
                    # Update existing skills that match by name
                    for i, ext_skill in enumerate(unique_skills):
                        skill_name = ext_skill['skillname']
                        skill_desc = ext_skill.get('skilldesc', '')
                        skill_icon = ext_skill.get('skillicon', '')
                        
                        matching_skill = next((s for s in db_skills if s['skill_name'] == skill_name), None)
                        if matching_skill:
                            # Only update description and icon, preserve everything else
                            cursor.execute(f'''
                                UPDATE hero_skills 
                                SET skill_description = {ph}, preview = {ph}, image = {ph}, display_order = {ph}
                                WHERE id = {ph}
                            ''', (skill_desc, skill_icon, skill_icon, i, matching_skill['id']))
                        else:
                            # New skill - insert with basic data
                            cursor.execute(f'''
                                INSERT INTO hero_skills (hero_id, skill_name, skill_description, preview, image, display_order)
                                VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})
                            ''', (hero_id, skill_name, skill_desc, skill_icon, skill_icon, i))
                    
                    conn.commit()
                    db.release_connection(conn)
                    results['updated'] += 1
                else:
                    # Skills match, just update descriptions
                    skill_updated = False
                    for i, ext_skill in enumerate(unique_skills):
                        skill_name = ext_skill['skillname']
                        skill_desc = ext_skill['skilldesc']
                        
                        # Find matching skill in database
                        matching_skill = next((s for s in db_skills if s['skill_name'] == skill_name), None)
                        
                        if matching_skill:
                            # Prepare update
                            update_desc = skill_desc if skill_desc and skill_desc.strip() else None
                            
                            # Update skill
                            success = db.update_hero_skill(
                                matching_skill['id'],
                                skill_name=None,
                                skill_description=update_desc,
                                display_order=i
                            )
                            
                            if success:
                                skill_updated = True
                    
                    if skill_updated:
                        results['updated'] += 1
                    else:
                        results['skipped'] += 1
                    
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"{hero_name}: {str(e)}")
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Hero Ranks
@app.route('/api/hero-ranks', methods=['GET'])
def get_hero_ranks_api():
    """Отримати рейтинги всіх героїв з підтримкою пагінації та фільтрації
    
    Query Parameters:
        game_id: ID гри (default: 2)
        page: Номер сторінки (default: 1)
        size: Кількість елементів на сторінку (default: 20)
        days: Період статистики - 1, 3, 7, 15, 30 (default: 1)
        rank: Rank category - all, epic, legend, mythic, honor, glory (default: all)
        sort_field: Field to sort by - pick_rate, ban_rate, win_rate (default: win_rate)
        sort_order: Order of sort - asc, desc (default: desc)
    """
    game_id = request.args.get('game_id', type=int, default=2)
    page = request.args.get('page', type=int, default=1)
    size = request.args.get('size', type=int, default=20)
    days = request.args.get('days', type=int, default=1)
    rank = request.args.get('rank', type=str, default='all')
    sort_field = request.args.get('sort_field', type=str, default='win_rate')
    sort_order = request.args.get('sort_order', type=str, default='desc')
    
    # Отримуємо ранги з бази з фільтрацією
    all_ranks = db.get_hero_ranks(game_id=game_id, days=days, rank=rank)
    
    # Apply sorting if specified
    if sort_field in ['win_rate', 'ban_rate', 'appearance_rate']:
        reverse = (sort_order == 'desc')
        all_ranks = sorted(all_ranks, key=lambda x: x.get(sort_field, 0), reverse=reverse)
    
    # Пагінація
    start_idx = (page - 1) * size
    end_idx = start_idx + size
    
    paginated_ranks = all_ranks[start_idx:end_idx]
    
    # Повертаємо з метаданими
    return jsonify({
        'data': paginated_ranks,
        'page': page,
        'size': size,
        'total': len(all_ranks),
        'total_pages': (len(all_ranks) + size - 1) // size
    })

@app.route('/api/heroes/<int:hero_id>/rank', methods=['GET'])
def get_hero_rank_api(hero_id):
    """Отримати рейтинг конкретного героя"""
    rank = db.get_hero_rank(hero_id)
    if rank:
        return jsonify(rank)
    return jsonify({'error': 'Hero rank not found'}), 404

@app.route('/api/hero-ranks/update', methods=['POST'])
def update_hero_ranks_api():
    """Оновити статистику героїв з mlbb-stats API (асинхронно)
    
    Body Parameters:
        game_id: ID гри (optional, default: 2)
        days: Період статистики (optional, default: 7)
        rank: Ранкова категорія (optional, default: 'all')
        sort_field: Поле сортування (optional, default: 'win_rate')
    """
    try:
        data = request.json or {}
        game_id = data.get('game_id', 2)
        days = data.get('days', 7)
        rank_param = data.get('rank', 'all')
        sort_field = data.get('sort_field', 'win_rate')
        
        # Запускаємо оновлення в окремому потоці
        import threading
        thread = threading.Thread(
            target=background_hero_ranks_update,
            args=(game_id, days, rank_param, sort_field)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Hero ranks update started in background',
            'parameters': {
                'game_id': game_id,
                'days': days,
                'rank': rank_param,
                'sort_field': sort_field
            }
        }), 202  # 202 Accepted
        
    except Exception as e:
        print(f"Error starting hero ranks update: {e}")
        return jsonify({'error': str(e)}), 500

def background_hero_ranks_update(game_id, days, rank_param, sort_field):
    """Фонова функція для оновлення hero ranks без timeout"""
    try:
        import import_hero_ranks as ihr
        
        print(f"Starting background update: days={days}, rank={rank_param}")
        
        # Fetch data from mlbb-stats API
        records = ihr.fetch_hero_ranks(
            days=days,
            rank=rank_param,
            sort_field=sort_field,
            sort_order='desc'
        )
        
        if not records:
            print("Failed to fetch data from mlbb-stats API")
            return
        
        # Update database
        result = ihr.update_hero_ranks(records, days=days, rank=rank_param)
        
        print(f"Background update completed: inserted={result.get('inserted', 0)}, "
              f"updated={result.get('updated', 0)}, skipped={result.get('skipped', 0)}")
        
    except Exception as e:
        print(f"Error in background update: {e}")
        import traceback
        traceback.print_exc()

def _coerce_json_field(value):
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value, ensure_ascii=False)
    except Exception:
        return None

@app.route('/api/heroes/update-counter-data', methods=['POST'])
def update_heroes_counter_data_api():
    """Оновити counter та compatibility data для всіх героїв (асинхронно)"""
    try:
        data = request.json or {}
        game_id = data.get('game_id', 2)
        hero_id = data.get('hero_id')  # Опціонально: оновити тільки одного героя
        
        if hero_id:
            # Синхронне оновлення для одного героя
            import fetch_hero_counter_compatibility as fhcc
            
            conn = db.get_connection()
            if db.DATABASE_TYPE == 'postgres':
                from psycopg2.extras import RealDictCursor
                cursor = conn.cursor(cursor_factory=RealDictCursor)
            else:
                cursor = conn.cursor()
            
            ph = db.get_placeholder()
            cursor.execute(f"SELECT id, name, hero_game_id, counter_data, compatibility_data FROM heroes WHERE id = {ph}", (hero_id,))
            hero = cursor.fetchone()
            db.release_connection(conn)
            
            if not hero:
                return jsonify({'error': 'Hero not found'}), 404
            
            # RealDictCursor вже повертає dict
            if db.DATABASE_TYPE == 'postgres':
                hero_dict = hero
            else:
                hero_dict = db.dict_from_row(hero)
            
            hero_local_id = hero_dict['id']
            hero_name = hero_dict['name']
            hero_game_id = hero_dict.get('hero_game_id')
            existing_counter_data = _coerce_json_field(hero_dict.get('counter_data'))
            existing_compat_data = _coerce_json_field(hero_dict.get('compatibility_data'))
            
            if not hero_game_id:
                return jsonify({'error': 'Hero has no hero_game_id'}), 400
            
            print(f"Updating [{hero_local_id}] {hero_name} (game_id={hero_game_id})...")
            
            counter_data = fhcc.fetch_hero_counter(hero_game_id)
            compat_data = fhcc.fetch_hero_compatibility(hero_game_id)
            if counter_data is None:
                counter_data = existing_counter_data
            if compat_data is None:
                compat_data = existing_compat_data
            
            if counter_data or compat_data:
                fhcc.update_hero_counter_compat(hero_local_id, counter_data, compat_data)
                return jsonify({
                    'success': True,
                    'message': f'Updated {hero_name}',
                    'hero_id': hero_local_id,
                    'counter_data': counter_data[:100] if counter_data else None
                })
            else:
                return jsonify({'error': 'Failed to fetch data'}), 500
        
        # Запускаємо оновлення в окремому потоці
        import threading
        thread = threading.Thread(
            target=background_counter_data_update,
            args=(game_id,)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Counter and compatibility data update started in background',
            'game_id': game_id
        }), 202  # 202 Accepted
        
    except Exception as e:
        print(f"Error starting counter data update: {e}")
        return jsonify({'error': str(e)}), 500

def background_counter_data_update(game_id):
    """Фонова функція для оновлення counter/compatibility data"""
    try:
        import fetch_hero_counter_compatibility as fhcc
        import time
        
        print(f"Starting background counter data update for game_id={game_id}")
        
        # Отримуємо всіх героїв гри
        conn = db.get_connection()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()
        
        ph = db.get_placeholder()
        cursor.execute(f"SELECT id, name, hero_game_id, counter_data, compatibility_data FROM heroes WHERE game_id = {ph} ORDER BY id", (game_id,))
        heroes = cursor.fetchall()
        db.release_connection(conn)
        
        updated = 0
        skipped = 0
        
        for hero in heroes:
            # RealDictCursor вже повертає dict
            if db.DATABASE_TYPE == 'postgres':
                hero_dict = hero
            else:
                hero_dict = db.dict_from_row(hero)
            
            hero_id = hero_dict['id']
            hero_name = hero_dict['name']
            hero_game_id = hero_dict.get('hero_game_id')
            existing_counter_data = _coerce_json_field(hero_dict.get('counter_data'))
            existing_compat_data = _coerce_json_field(hero_dict.get('compatibility_data'))
            
            if not hero_game_id:
                print(f"Processing [{hero_id}] {hero_name}... ⊘ Skipped (no hero_game_id)")
                skipped += 1
                continue
            
            print(f"Processing [{hero_id}] {hero_name} (game_id={hero_game_id})...")
            
            counter_data = fhcc.fetch_hero_counter(hero_game_id)
            time.sleep(0.3)
            
            compat_data = fhcc.fetch_hero_compatibility(hero_game_id)
            time.sleep(0.3)
            
            if counter_data is None:
                counter_data = existing_counter_data
            if compat_data is None:
                compat_data = existing_compat_data
            
            if counter_data or compat_data:
                fhcc.update_hero_counter_compat(hero_id, counter_data, compat_data)
                updated += 1
                print(f"  ✓ Updated: {hero_name}")
            else:
                skipped += 1
                print(f"  ⊘ Skipped: {hero_name}")
        
        print(f"Background counter data update completed: updated={updated}, skipped={skipped}")
        
    except Exception as e:
        print(f"Error in background counter data update: {e}")
        import traceback
        traceback.print_exc()


@app.route('/api/hero-ranks/migrate-constraint', methods=['POST'])
def migrate_hero_ranks_constraint():
    """Додає унікальний constraint для (hero_id, days, rank)"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Видаляємо старий UNIQUE constraint
        cursor.execute("""
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'hero_rank' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%hero_id%'
        """)
        old_constraints = cursor.fetchall()
        
        for constraint in old_constraints:
            constraint_name = constraint[0]
            cursor.execute(f"ALTER TABLE hero_rank DROP CONSTRAINT IF EXISTS {constraint_name}")
        
        # Додаємо новий UNIQUE constraint
        cursor.execute("""
            ALTER TABLE hero_rank 
            ADD CONSTRAINT hero_rank_unique_combination 
            UNIQUE (hero_id, days, rank)
        """)
        
        # Створюємо індекс
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_hero_rank_days_rank 
            ON hero_rank(days, rank)
        """)
        
        conn.commit()
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'message': 'Constraint successfully added'
        })
    
    except Exception as e:
        print(f"Error migrating constraint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/migrate-equipment-fields', methods=['POST'])
def migrate_equipment_fields():
    """Додає відсутні поля до таблиці equipment"""
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        fields_to_add = [
            ("attributes_json", "TEXT"),
            ("mana_regen", "REAL"),
            ("crit_chance", "REAL"),
        ]
        
        results = []
        for field_name, field_type in fields_to_add:
            try:
                cursor.execute(f"ALTER TABLE equipment ADD COLUMN {field_name} {field_type}")
                conn.commit()
                results.append(f"✅ Added {field_name}")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column" in str(e).lower():
                    results.append(f"⏭️  {field_name} already exists")
                    conn.rollback()
                else:
                    results.append(f"❌ Error adding {field_name}: {e}")
                    conn.rollback()
        
        db.release_connection(conn)
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        print(f"Error migrating fields: {e}")
        return jsonify({'error': str(e)}), 500


# ===== AUTH ENDPOINTS =====

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    """Login/Register via Google OAuth token (supports id_token or access_token flow)"""
    try:
        data = request.get_json()
        credential = data.get('credential')
        user_info = data.get('user_info')

        if not credential:
            return jsonify({'error': 'Missing credential'}), 400

        # Try access_token flow first (if user_info is provided from frontend)
        google_user = None
        if user_info and user_info.get('sub'):
            google_user = verify_google_access_token(credential, user_info)

        # Fallback to id_token flow
        if not google_user:
            google_user = verify_google_token(credential)

        if not google_user:
            return jsonify({'error': 'Invalid Google token'}), 401

        google_id = google_user.get('sub')
        email = google_user.get('email', '')
        name = google_user.get('name', '')
        picture = google_user.get('picture', '')

        # Find or create user
        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        cursor.execute(f"SELECT id, google_id, email, name, picture FROM users WHERE google_id = {ph}", (google_id,))
        user = cursor.fetchone()

        if user:
            # Update last login + info
            user_id = user['id'] if isinstance(user, dict) else user[0]
            cursor.execute(f"""
                UPDATE users SET last_login = CURRENT_TIMESTAMP, name = {ph}, picture = {ph}, email = {ph}
                WHERE id = {ph}
            """, (name, picture, email, user_id))
        else:
            # Create new user
            cursor.execute(f"""
                INSERT INTO users (google_id, email, name, picture) 
                VALUES ({ph}, {ph}, {ph}, {ph}) RETURNING id
            """, (google_id, email, name, picture))
            result = cursor.fetchone()
            user_id = result['id'] if isinstance(result, dict) else result[0]

        conn.commit()
        db.release_connection(conn)

        # Create JWT
        token = create_jwt(user_id, email)

        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'picture': picture
            }
        })

    except Exception as e:
        print(f"Google login error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current user info from JWT"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        cursor.execute(f"SELECT id, email, name, picture FROM users WHERE id = {ph}", (request.user_id,))
        user = cursor.fetchone()
        db.release_connection(conn)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_dict = dict(user) if hasattr(user, 'keys') else {
            'id': user[0], 'email': user[1], 'name': user[2], 'picture': user[3]
        }
        return jsonify(user_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== FAVORITES ENDPOINTS =====

@app.route('/api/favorites', methods=['GET'])
@require_auth
def get_favorites():
    """Get user's favorite heroes"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        cursor.execute(f"""
            SELECT f.id, f.hero_id, f.created_at, h.name, h.image, h.head, h.hero_game_id
            FROM favorites f
            JOIN heroes h ON h.id = f.hero_id
            WHERE f.user_id = {ph}
            ORDER BY f.created_at DESC
        """, (request.user_id,))

        favorites = [dict(row) if hasattr(row, 'keys') else {
            'id': row[0], 'hero_id': row[1], 'created_at': str(row[2]),
            'name': row[3], 'image': row[4], 'head': row[5], 'hero_game_id': row[6]
        } for row in cursor.fetchall()]

        db.release_connection(conn)
        return jsonify(favorites)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/favorites/<int:hero_id>', methods=['POST'])
@require_auth
def add_favorite(hero_id):
    """Add hero to favorites"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        cursor = conn.cursor()

        cursor.execute(f"""
            INSERT INTO favorites (user_id, hero_id) VALUES ({ph}, {ph})
            ON CONFLICT (user_id, hero_id) DO NOTHING
        """, (request.user_id, hero_id))

        conn.commit()
        db.release_connection(conn)
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/favorites/<int:hero_id>', methods=['DELETE'])
@require_auth
def remove_favorite(hero_id):
    """Remove hero from favorites"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        cursor = conn.cursor()

        cursor.execute(f"DELETE FROM favorites WHERE user_id = {ph} AND hero_id = {ph}",
                       (request.user_id, hero_id))

        conn.commit()
        db.release_connection(conn)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== USER BUILDS ENDPOINTS =====

@app.route('/api/builds', methods=['GET'])
@require_auth
def get_user_builds():
    """Get user's builds"""
    try:
        hero_id = request.args.get('hero_id')
        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        if hero_id:
            cursor.execute(f"""
                SELECT b.*, h.name as hero_name, h.image as hero_image, h.head as hero_head
                FROM user_builds b
                JOIN heroes h ON h.id = b.hero_id
                WHERE b.user_id = {ph} AND b.hero_id = {ph}
                ORDER BY b.updated_at DESC
            """, (request.user_id, hero_id))
        else:
            cursor.execute(f"""
                SELECT b.*, h.name as hero_name, h.image as hero_image, h.head as hero_head
                FROM user_builds b
                JOIN heroes h ON h.id = b.hero_id
                WHERE b.user_id = {ph}
                ORDER BY b.updated_at DESC
            """, (request.user_id,))

        builds = []
        for row in cursor.fetchall():
            build = dict(row) if hasattr(row, 'keys') else dict(zip(
                ['id', 'user_id', 'hero_id', 'name', 'items', 'emblem_id',
                 'spell1_id', 'spell2_id', 'notes', 'is_public',
                 'created_at', 'updated_at', 'talents', 'hero_name', 'hero_image', 'hero_head'], row))
            # Parse JSON items if string
            if isinstance(build.get('items'), str):
                build['items'] = json.loads(build['items'])
            if isinstance(build.get('talents'), str):
                build['talents'] = json.loads(build['talents'])
            elif not build.get('talents'):
                build['talents'] = []
            # Convert datetime
            for k in ('created_at', 'updated_at'):
                if build.get(k) and not isinstance(build[k], str):
                    build[k] = str(build[k])
            builds.append(build)

        db.release_connection(conn)
        return jsonify(builds)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/builds', methods=['POST'])
@require_auth
def create_build():
    """Create a new build"""
    try:
        data = request.get_json()
        hero_id = data.get('hero_id')
        name = data.get('name', 'My Build')
        items = json.dumps(data.get('items', []))
        emblem_id = data.get('emblem_id')
        spell1_id = data.get('spell1_id')
        spell2_id = data.get('spell2_id')
        talents = json.dumps(data.get('talents', []))
        notes = data.get('notes', '')

        if not hero_id:
            return jsonify({'error': 'hero_id is required'}), 400

        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        cursor.execute(f"""
            INSERT INTO user_builds (user_id, hero_id, name, items, emblem_id, spell1_id, spell2_id, talents, notes)
            VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})
            RETURNING id, created_at
        """, (request.user_id, hero_id, name, items, emblem_id, spell1_id, spell2_id, talents, notes))

        result = cursor.fetchone()
        build_id = result['id'] if isinstance(result, dict) else result[0]

        conn.commit()
        db.release_connection(conn)

        return jsonify({'id': build_id, 'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/builds/<int:build_id>', methods=['PUT'])
@require_auth
def update_build(build_id):
    """Update a build"""
    try:
        data = request.get_json()
        conn = db.get_connection()
        ph = db.get_placeholder()
        cursor = conn.cursor()

        # Verify ownership
        cursor.execute(f"SELECT user_id FROM user_builds WHERE id = {ph}", (build_id,))
        build = cursor.fetchone()
        if not build:
            db.release_connection(conn)
            return jsonify({'error': 'Build not found'}), 404
        owner_id = build['user_id'] if isinstance(build, dict) else build[0]
        if owner_id != request.user_id:
            db.release_connection(conn)
            return jsonify({'error': 'Not authorized'}), 403

        # Build SET clause dynamically
        fields = []
        values = []
        for field in ('name', 'notes', 'emblem_id', 'spell1_id', 'spell2_id'):
            if field in data:
                fields.append(f"{field} = {ph}")
                values.append(data[field])
        if 'items' in data:
            fields.append(f"items = {ph}")
            values.append(json.dumps(data['items']))
        if 'talents' in data:
            fields.append(f"talents = {ph}")
            values.append(json.dumps(data['talents']))

        if fields:
            fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(build_id)
            cursor.execute(f"UPDATE user_builds SET {', '.join(fields)} WHERE id = {ph}", values)

        conn.commit()
        db.release_connection(conn)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/builds/<int:build_id>', methods=['DELETE'])
@require_auth
def delete_build(build_id):
    """Delete a build"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        cursor = conn.cursor()

        cursor.execute(f"DELETE FROM user_builds WHERE id = {ph} AND user_id = {ph}",
                       (build_id, request.user_id))

        conn.commit()
        db.release_connection(conn)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Public builds for a hero
@app.route('/api/heroes/<int:hero_id>/builds', methods=['GET'])
def get_hero_public_builds(hero_id):
    """Get public builds for a hero (excludes current user's own builds)"""
    try:
        conn = db.get_connection()
        ph = db.get_placeholder()
        if db.DATABASE_TYPE == 'postgres':
            from psycopg2.extras import RealDictCursor
            cursor = conn.cursor(cursor_factory=RealDictCursor)
        else:
            cursor = conn.cursor()

        # Optionally exclude current user's builds (they already see them in "My Builds")
        exclude_user_id = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            try:
                payload = jwt.decode(auth_header[7:], JWT_SECRET, algorithms=['HS256'])
                exclude_user_id = payload.get('user_id')
            except Exception:
                pass  # Not logged in or invalid token — show all

        if exclude_user_id:
            cursor.execute(f"""
                SELECT b.id, b.name, b.items, b.emblem_id, b.spell1_id, b.spell2_id,
                       b.talents, b.notes, b.created_at, u.name as author_name, u.picture as author_picture
                FROM user_builds b
                JOIN users u ON u.id = b.user_id
                WHERE b.hero_id = {ph} AND b.is_public = TRUE AND b.user_id != {ph}
                ORDER BY b.created_at DESC
                LIMIT 20
            """, (hero_id, exclude_user_id))
        else:
            cursor.execute(f"""
                SELECT b.id, b.name, b.items, b.emblem_id, b.spell1_id, b.spell2_id,
                       b.talents, b.notes, b.created_at, u.name as author_name, u.picture as author_picture
                FROM user_builds b
                JOIN users u ON u.id = b.user_id
                WHERE b.hero_id = {ph} AND b.is_public = TRUE
                ORDER BY b.created_at DESC
                LIMIT 20
            """, (hero_id,))

        builds = []
        for row in cursor.fetchall():
            build = dict(row) if hasattr(row, 'keys') else dict(zip(
                ['id', 'name', 'items', 'emblem_id', 'spell1_id', 'spell2_id',
                 'talents', 'notes', 'created_at', 'author_name', 'author_picture'], row))
            if isinstance(build.get('items'), str):
                build['items'] = json.loads(build['items'])
            if isinstance(build.get('talents'), str):
                build['talents'] = json.loads(build['talents'])
            elif not build.get('talents'):
                build['talents'] = []
            if build.get('created_at') and not isinstance(build['created_at'], str):
                build['created_at'] = str(build['created_at'])
            builds.append(build)

        db.release_connection(conn)
        return jsonify(builds)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================
# Scheduled Tasks - Auto-update hero stats daily at 18:00 UTC
# ============================================================

def scheduled_update_hero_ranks():
    """Запускає update_hero_ranks_from_moonton.py для оновлення всіх 30 комбінацій hero_rank"""
    print(f"\n{'='*60}")
    print(f"⏰ [{datetime.utcnow().isoformat()}] CRON: Starting scheduled hero ranks update...")
    print(f"{'='*60}")
    try:
        import subprocess
        script_path = _base_dir / 'update_hero_ranks_from_moonton.py'
        result = subprocess.run(
            ['python3', str(script_path)],
            capture_output=True, text=True, timeout=600,
            env={**os.environ}
        )
        print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
        if result.returncode != 0:
            print(f"❌ CRON: hero ranks update failed (exit {result.returncode})")
            if result.stderr:
                print(f"STDERR: {result.stderr[-500:]}")
        else:
            print(f"✅ CRON: hero ranks update completed successfully")
    except Exception as e:
        print(f"❌ CRON: hero ranks update error: {e}")


def scheduled_update_hero_stats():
    """Оновлює Ban/Pick/Win Rates в heroes таблиці через Moonton GMS API"""
    print(f"\n{'='*60}")
    print(f"⏰ [{datetime.utcnow().isoformat()}] CRON: Starting scheduled hero stats update...")
    print(f"{'='*60}")
    try:
        import requests as req

        MOONTON_API = "https://api.gms.moontontech.com/api/gms/source/2669606"
        SOURCE_ID = "2756569"  # 7 днів
        headers = {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json;charset=UTF-8',
            'x-actid': '2669607',
            'x-appid': '2669606',
            'x-lang': 'en',
        }

        all_heroes = []
        for page in range(1, 8):
            payload = {
                "pageSize": 20, "pageIndex": page,
                "filters": [
                    {"field": "bigrank", "operator": "eq", "value": "101"},
                    {"field": "match_type", "operator": "eq", "value": 1}
                ],
                "sorts": [{"data": {"field": "main_hero_win_rate", "order": "desc"}, "type": "sequence"}],
                "fields": ["main_hero", "main_hero_appearance_rate", "main_hero_ban_rate", "main_hero_win_rate", "main_heroid"]
            }
            resp = req.post(f"{MOONTON_API}/{SOURCE_ID}", headers=headers, json=payload, timeout=10)
            resp_data = resp.json()
            if resp_data.get('code') == 0 and resp_data.get('data', {}).get('records'):
                records = resp_data['data']['records']
                all_heroes.extend(records)
                if len(records) < 20:
                    break
            else:
                break
            time.sleep(0.2)

        if not all_heroes:
            print("❌ CRON: Failed to fetch hero stats")
            return

        conn = db.get_connection()
        cursor = conn.cursor()
        ph = db.get_placeholder()
        updated = 0

        for hero_data in all_heroes:
            try:
                stats = hero_data.get('data', {})
                hero_game_id = stats.get('main_heroid')
                if not hero_game_id:
                    continue
                ban_rate = round(stats.get('main_hero_ban_rate', 0) * 100, 2)
                pick_rate = round(stats.get('main_hero_appearance_rate', 0) * 100, 2)
                win_rate = round(stats.get('main_hero_win_rate', 0) * 100, 2)
                cursor.execute(f"SELECT id FROM heroes WHERE hero_game_id = {ph} AND game_id = {ph}", (hero_game_id, 2))
                result = cursor.fetchone()
                if not result:
                    continue
                hero_db_id = result[0] if not isinstance(result, dict) else result['id']
                cursor.execute(f"""UPDATE heroes SET main_hero_ban_rate = {ph}, main_hero_appearance_rate = {ph}, main_hero_win_rate = {ph} WHERE id = {ph}""",
                    (ban_rate, pick_rate, win_rate, hero_db_id))
                updated += 1
            except Exception as e:
                print(f"CRON: Error processing hero: {e}")
                continue

        conn.commit()
        db.release_connection(conn)
        print(f"✅ CRON: Updated {updated}/{len(all_heroes)} heroes (Ban/Pick/Win rates)")

    except Exception as e:
        print(f"❌ CRON: hero stats update error: {e}")


def run_scheduled_updates():
    """Запускає обидва оновлення послідовно"""
    scheduled_update_hero_stats()     # ~15 секунд — оновлює heroes таблицю
    scheduled_update_hero_ranks()     # ~5 хвилин — оновлює hero_rank (30 комбінацій)


@app.route('/api/admin/scheduler/status', methods=['GET'])
def scheduler_status():
    """Показує статус scheduler та наступний запуск"""
    try:
        if not _scheduler:
            return jsonify({'enabled': False, 'message': 'Scheduler not initialized'})
        
        jobs = []
        for job in _scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': str(job.next_run_time) if job.next_run_time else None,
            })
        
        return jsonify({
            'enabled': True,
            'running': _scheduler.running,
            'jobs': jobs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/admin/scheduler/run-now', methods=['POST'])
def scheduler_run_now():
    """Ручний запуск оновлення (в фоновому потоці)"""
    try:
        t = threading.Thread(target=run_scheduled_updates, daemon=True)
        t.start()
        return jsonify({'success': True, 'message': 'Update started in background'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


_scheduler = None


def init_scheduler():
    """Ініціалізує APScheduler для автоматичного оновлення"""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger

        scheduler = BackgroundScheduler(daemon=True)
        
        # Щодня о 18:00 UTC (20:00 Київ зимою, 21:00 літом)
        scheduler.add_job(
            run_scheduled_updates,
            CronTrigger(hour=18, minute=0),
            id='daily_hero_update',
            name='Daily hero stats & ranks update',
            replace_existing=True
        )

        scheduler.start()
        print(f"✅ Scheduler started: daily hero update at 18:00 UTC")
        return scheduler
    except ImportError:
        print("⚠️  APScheduler not installed, scheduled updates disabled")
        return None
    except Exception as e:
        print(f"⚠️  Failed to start scheduler: {e}")
        return None


# Запускаємо scheduler тільки на продакшн (gunicorn), не на кожному werkzeug reload
if os.getenv('DATABASE_TYPE') == 'postgres':
    _scheduler = init_scheduler()


if __name__ == '__main__':
    # Використовуємо PORT з environment або 8080 для локальної розробки
    app.run(host='0.0.0.0', port=PORT, debug=os.getenv('DATABASE_TYPE') != 'postgres')
