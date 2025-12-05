from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import database as db

app = Flask(__name__)
CORS(app)

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
        data.get('genre', '')
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
        data.get('genre', '')
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
    # Для списку героїв НЕ завантажуємо skills (швидше)
    heroes = db.get_heroes(game_id, include_details=False)
    return jsonify(heroes)

@app.route('/api/heroes/<int:hero_id>', methods=['GET'])
def get_hero(hero_id):
    hero = db.get_hero(hero_id)
    if hero:
        return jsonify(hero)
    return jsonify({'error': 'Hero not found'}), 404

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
            db.add_hero_skill(
                hero_id,
                skill.get('skill_name', ''),
                skill.get('skill_description', ''),
                skill.get('effect', ''),
                skill.get('preview', ''),
                skill.get('skill_type', 'active'),
                skill.get('skill_parameters', {}),
                skill.get('level_scaling', []),
                skill.get('passive_description', ''),
                skill.get('active_description', ''),
                skill.get('effect_types', [])
            )
    
    return jsonify({'id': hero_id}), 201

@app.route('/api/heroes/<int:hero_id>', methods=['PUT'])
def update_hero(hero_id):
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
        data.get('createdAt', None),
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
            print(f"DEBUG: Adding skill: {skill.get('skill_name', '')}")
            print(f"DEBUG: Full skill data: {skill}")
            
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
                effect,
                preview,
                skill_type,
                skill.get('skill_parameters', {}),
                skill.get('level_scaling', []),
                passive_desc,
                active_desc,
                skill.get('effect_types', [])
            )
    
    return jsonify({'success': True})

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
    """Fix emblem IDs in pro_builds (old 34-40 -> new 1-7)"""
    EMBLEM_MAPPING = {34: 1, 35: 2, 36: 3, 37: 7, 38: 5, 39: 7, 40: 7}
    
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
                old_id = build.get('emblem_id')
                if old_id in EMBLEM_MAPPING:
                    build['emblem_id'] = EMBLEM_MAPPING[old_id]
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

if __name__ == '__main__':
    # Використовуємо PORT з environment або 8080 для локальної розробки
    app.run(host='0.0.0.0', port=PORT, debug=os.getenv('DATABASE_TYPE') != 'postgres')
