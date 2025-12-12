-- Міграція: додавання унікального constraint для (hero_id, days, rank)

-- 1. Видаляємо старий UNIQUE constraint на hero_id (якщо існує)
ALTER TABLE hero_rank DROP CONSTRAINT IF EXISTS hero_rank_hero_id_key;

-- 2. Додаємо новий UNIQUE constraint на комбінацію (hero_id, days, rank)
ALTER TABLE hero_rank ADD CONSTRAINT hero_rank_unique_combination UNIQUE (hero_id, days, rank);

-- 3. Створюємо індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_hero_rank_days_rank ON hero_rank(days, rank);
