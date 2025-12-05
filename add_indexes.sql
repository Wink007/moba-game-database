-- Створення індексів для оптимізації запитів
-- Це значно прискорить JOIN запити та WHERE фільтрацію

-- Індекс для heroes по game_id (для SELECT * FROM heroes WHERE game_id = ?)
CREATE INDEX IF NOT EXISTS idx_heroes_game_id ON heroes(game_id);

-- Індекс для hero_stats по hero_id (для JOIN з heroes)
CREATE INDEX IF NOT EXISTS idx_hero_stats_hero_id ON hero_stats(hero_id);

-- Індекс для hero_skills по hero_id (для JOIN з heroes)
CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id);

-- Індекс для equipment по game_id (для SELECT * FROM equipment WHERE game_id = ?)
CREATE INDEX IF NOT EXISTS idx_equipment_game_id ON equipment(game_id);

-- Індекс для emblems по game_id
CREATE INDEX IF NOT EXISTS idx_emblems_game_id ON emblems(game_id);

-- Індекс для battle_spells по game_id
CREATE INDEX IF NOT EXISTS idx_battle_spells_game_id ON battle_spells(game_id);

-- Індекс для emblem_talents по emblem_id
CREATE INDEX IF NOT EXISTS idx_emblem_talents_emblem_id ON emblem_talents(emblem_id);

-- Перевірка створених індексів (для PostgreSQL)
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
