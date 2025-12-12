from flask import Flask, request, jsonify
from flask_cors import CORS
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
        data.get('main_hero_win_rate', None)
    )
    
    # Add hero stats
    if 'hero_stats' in data:
        for stat in data['hero_stats']:
            db.add_hero_stat(hero_id, stat['stat_name'], stat['value'])
    
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
                skill.get('passive_description'),
                skill.get('active_description'),
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
            data.get('pro_builds', None),
            None,  # created_at (автоматичне поле, не змінюємо)
            data.get('createdAt', None),  # createdAt (timestamp в мілісекундах)
            data.get('head', None),
            data.get('main_hero_ban_rate', None),
            data.get('main_hero_appearance_rate', None),
            data.get('main_hero_win_rate', None)
        )
        
        # Update stats - delete old and add new
        db.delete_hero_stats(hero_id)
        if 'hero_stats' in data:
            for stat in data['hero_stats']:
                db.add_hero_stat(hero_id, stat['stat_name'], stat['value'])
        
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
                passive_desc = str(skill.get('passive_description', '') or '')
                active_desc = str(skill.get('active_description', '') or '')
                
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
                    passive_desc,
                    active_desc,
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
    game_id = request.args.get('game_id')
    if game_id:
        items = db.get_equipment_by_game(game_id)
        # Парсимо attributes_json та recipe для кожного item
        for item in items:
            if item.get('attributes_json'):
                try:
                    item['attributes'] = json.loads(item['attributes_json'])
                except:
                    item['attributes'] = {}
            else:
                item['attributes'] = {}
            
            # Парсимо recipe з JSON
            if item.get('recipe'):
                try:
                    item['recipe'] = json.loads(item['recipe'])
                except:
                    # Якщо не JSON, залишаємо як є
                    pass
            
            # Парсимо upgrades_to з JSON
            if item.get('upgrades_to'):
                try:
                    item['upgrades_to'] = json.loads(item['upgrades_to'])
                except:
                    pass
    else:
        items = []
    return jsonify(items)

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

# Utility endpoint to fix emblem IDs after migration
@app.route('/api/fix-emblem-ids', methods=['POST'])
def fix_emblem_ids():
    """Fix emblem IDs and battle_spell IDs in pro_builds"""
    EMBLEM_MAPPING = {34: 1, 35: 2, 36: 3, 37: 7, 38: 5, 39: 7, 40: 7}
    SPELL_MAPPING = {13: 1, 14: 2, 15: 3, 16: 4, 17: 5, 18: 6, 19: 7, 20: 8, 21: 9, 22: 10, 23: 11, 24: 12}
    
    conn = db.get_connection()
    if db.DATABASE_TYPE == 'postgres':
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    else:
        cursor = conn.cursor()
    
    cursor.execute("SELECT id, name, pro_builds FROM heroes WHERE pro_builds IS NOT NULL")
    heroes = cursor.fetchall()
    
    updated_count = 0
    for row in heroes:
        hero_dict = dict(row)
        hero_id = hero_dict['id']
        name = hero_dict['name']
        pro_builds_raw = hero_dict['pro_builds']
        
        try:
            if isinstance(pro_builds_raw, str):
                builds = json.loads(pro_builds_raw)
            else:
                builds = pro_builds_raw
            
            if not isinstance(builds, list) or len(builds) == 0:
                continue
            
            updated = False
            for build in builds:
                old_emblem = build.get('emblem_id')
                if old_emblem in EMBLEM_MAPPING:
                    build['emblem_id'] = EMBLEM_MAPPING[old_emblem]
                    updated = True
                
                old_spell = build.get('battle_spell_id')
                if old_spell in SPELL_MAPPING:
                    build['battle_spell_id'] = SPELL_MAPPING[old_spell]
                    updated = True
            
            if updated:
                ph = db.get_placeholder()
                cursor.execute(
                    f"UPDATE heroes SET pro_builds = {ph} WHERE id = {ph}",
                    (json.dumps(builds), hero_id)
                )
                updated_count += 1
        except Exception as e:
            print(f"Error fixing {name}: {e}")
    
    conn.commit()
    conn.close()
    
    return jsonify({'updated': updated_count, 'total': len(heroes)})

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
        size: Кількість елементів на сторінку (optional)
        days: Період статистики - 1, 3, 7, 15, 30 (default: 1)
        rank: Rank category - all, epic, legend, mythic, honor, glory (default: all)
        sort_field: Field to sort by - pick_rate, ban_rate, win_rate (default: win_rate)
        sort_order: Order of sort - asc, desc (default: desc)
        
    Note: days, rank, sort_field, sort_order parameters are for documentation.
    Data is fetched from external API during import with these filters.
    Filtering in this endpoint will be implemented when we store historical data.
    """
    game_id = request.args.get('game_id', type=int, default=2)
    page = request.args.get('page', type=int, default=1)
    size = request.args.get('size', type=int, default=None)
    days = request.args.get('days', type=int, default=None)
    rank = request.args.get('rank', type=str, default=None)
    sort_field = request.args.get('sort_field', type=str, default=None)
    sort_order = request.args.get('sort_order', type=str, default='desc')
    
    # Отримуємо всі ранги
    all_ranks = db.get_hero_ranks(game_id=game_id)
    
    # Apply sorting if specified
    if sort_field in ['win_rate', 'ban_rate', 'appearance_rate']:
        reverse = (sort_order == 'desc')
        all_ranks = sorted(all_ranks, key=lambda x: x.get(sort_field, 0), reverse=reverse)
    
    # Якщо size не вказано, повертаємо всі
    if size is None:
        return jsonify(all_ranks)
    
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
