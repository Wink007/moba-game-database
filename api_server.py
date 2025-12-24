from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
import gzip
import io
import database as db

app = Flask(__name__)
CORS(app)

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
    
    if skill_name is None and skill_description is None and display_order is None:
        return jsonify({'error': 'No fields to update'}), 400
    
    success = db.update_hero_skill(skill_id, skill_name, skill_description, display_order)
    
    if success:
        return jsonify({'success': True, 'message': 'Skill updated successfully'})
    else:
        return jsonify({'error': 'Failed to update skill'}), 500

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

@app.route('/api/heroes/counter-data', methods=['GET'])
def get_all_heroes_counter_data():
    """Counter data для всіх героїв гри"""
    game_id = request.args.get('game_id')
    if not game_id:
        return jsonify({'error': 'game_id required'}), 400
    
    # Отримуємо всіх героїв з counter_data
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    ph = db.get_placeholder()
    cursor.execute(f"SELECT id, counter_data FROM heroes WHERE game_id = {ph} AND counter_data IS NOT NULL", (game_id,))
    heroes = cursor.fetchall()
    db.release_connection(conn)
    
    # Групуємо по hero_id
    counter_data_by_hero = {}
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_id = hero_dict['id']
        counter_data = hero_dict.get('counter_data')
        
        if counter_data and counter_data.strip():
            try:
                counter_data_by_hero[hero_id] = json.loads(counter_data)
            except:
                counter_data_by_hero[hero_id] = None
    
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
    cursor.execute(f"SELECT id, compatibility_data FROM heroes WHERE game_id = {ph} AND compatibility_data IS NOT NULL", (game_id,))
    heroes = cursor.fetchall()
    db.release_connection(conn)
    
    # Групуємо по hero_id
    compatibility_data_by_hero = {}
    for hero in heroes:
        hero_dict = db.dict_from_row(hero)
        hero_id = hero_dict['id']
        compatibility_data = hero_dict.get('compatibility_data')
        
        if compatibility_data and compatibility_data.strip():
            try:
                compatibility_data_by_hero[hero_id] = json.loads(compatibility_data)
            except:
                compatibility_data_by_hero[hero_id] = None
    
    return jsonify(compatibility_data_by_hero)

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
                skill.get('replaces_skill_id')
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
            data.get('createdAt', None),  # createdAt (timestamp в мілісекундах)
            data.get('head', None),
            data.get('main_hero_ban_rate', None),
            data.get('main_hero_appearance_rate', None),
            data.get('main_hero_win_rate', None),
            data.get('hero_stats', None)
        )
        
        # Note: hero_stats is now a JSONB field in heroes table, updated in the main UPDATE query
        # No need for separate stats operations
        
        # Update skills - delete old and add new
        db.delete_hero_skills(hero_id)
        if 'skills' in data:
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
                    effect = str(effect)
                
                db.add_hero_skill(
                    hero_id,
                    skill_name,
                    skill_desc,
                    skill.get('effect', ''),
                    preview,
                    skill_type,
                    skill.get('skill_parameters', {}),
                    skill.get('level_scaling', []),
                    skill.get('effect_types', []),
                    skill.get('is_transformed', 0),
                    skill.get('transformation_order', 0),
                    skill.get('display_order', 0),
                    skill.get('replaces_skill_id')
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

# ============== PATCHES ==============

@app.route('/api/patches', methods=['GET'])
def get_patches():
    """Отримує список патчів з кешованого JSON файлу"""
    try:
        import os
        patches_file = os.path.join(os.path.dirname(__file__), 'patches_data.json')
        
        if not os.path.exists(patches_file):
            return jsonify({'error': 'Patches data not found. Run fetch_patches_from_liquipedia.py first'}), 404
        
        with open(patches_file, 'r', encoding='utf-8') as f:
            patches_dict = json.load(f)
        
        # Фільтруємо за параметрами
        limit = request.args.get('limit', type=int)
        search = request.args.get('search', type=str)
        
        if search:
            search_lower = search.lower()
            patches_dict = {k: v for k, v in patches_dict.items() if search_lower in k.lower()}
        
        # Конвертуємо в список для відповіді
        result = []
        for version, data in patches_dict.items():
            result.append({'version': version, **data})
        
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
@app.route('/api/battle-spells', methods=['GET'])

def get_battle_spells_api():
    game_id = request.args.get('game_id', type=int)
    spells = db.get_battle_spells(game_id=game_id)
    return jsonify(spells)

@app.route('/api/battle-spells/<int:spell_id>', methods=['GET'])

def get_battle_spell_api(spell_id):
    spell = db.get_battle_spell(spell_id)
    if spell:
        return jsonify(spell)
    return jsonify({'error': 'Battle spell not found'}), 404

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
                
                # If skill sets are different, delete old skills and insert new ones
                if ext_skill_names != db_skill_names:
                    # Delete all old skills
                    conn = db.get_db_connection()
                    cursor = conn.cursor()
                    cursor.execute(f'DELETE FROM hero_skills WHERE hero_id = {db.placeholder()}', (hero_id,))
                    
                    # Insert new skills
                    for i, ext_skill in enumerate(unique_skills):
                        skill_name = ext_skill['skillname']
                        skill_desc = ext_skill.get('skilldesc', '')
                        skill_icon = ext_skill.get('skillicon', '')
                        
                        cursor.execute(f'''
                            INSERT INTO hero_skills (hero_id, skill_name, skill_description, skill_icon, display_order)
                            VALUES ({db.placeholder()}, {db.placeholder()}, {db.placeholder()}, {db.placeholder()}, {db.placeholder()})
                        ''', (hero_id, skill_name, skill_desc, skill_icon, i))
                    
                    conn.commit()
                    cursor.close()
                    conn.close()
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

if __name__ == '__main__':
    # Використовуємо PORT з environment або 8080 для локальної розробки
    app.run(host='0.0.0.0', port=PORT, debug=os.getenv('DATABASE_TYPE') != 'postgres')

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
    """Оновити статистику героїв з mlbb-stats API
    
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
        
        # Import the update functions
        import import_hero_ranks as ihr
        
        # Fetch data from mlbb-stats API
        records = ihr.fetch_hero_ranks(
            days=days,
            rank=rank_param,
            sort_field=sort_field,
            sort_order='desc'
        )
        
        if not records:
            return jsonify({'error': 'Failed to fetch data from mlbb-stats API'}), 500
        
        # Update database with correct days and rank parameters
        result = ihr.update_hero_ranks(records, days=days, rank=rank_param)
        
        return jsonify({
            'success': True,
            'inserted': result.get('inserted', 0),
            'updated': result.get('updated', 0),
            'skipped': result.get('skipped', 0),
            'message': f'Successfully updated {result.get("inserted", 0)} hero ranks'
        })
        
    except Exception as e:
        print(f"Error updating hero ranks: {e}")
        return jsonify({'error': str(e)}), 500

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


