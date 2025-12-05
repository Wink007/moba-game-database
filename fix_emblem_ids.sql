-- Виправлення emblem_id в pro_builds (34->1, 35->2, ..., 40->7)

-- Hanabi (ID=1)
UPDATE heroes
SET pro_builds = '[
  {"battle_spell_id": 14, "core_items": [4, 16, 89, 19, 8, 5], "emblem_id": 1, "emblem_talents": ["Swift", "Weapons Master", "Quantum Charge"], "optional_items": [14, 70]},
  {"battle_spell_id": 14, "core_items": [90, 4, 5, 14, 8, 12], "emblem_id": 7, "emblem_talents": ["Swift", "Bargain Hunter", "Weakness Finder"], "optional_items": [18, 70]},
  {"battle_spell_id": 14, "core_items": [19, 92, 10, 12, 1, 14], "emblem_id": 7, "emblem_talents": ["Swift", "Bargain Hunter", "Quantum Charge"], "optional_items": [18, 70]}
]'::jsonb
WHERE id = 1;

-- Перевірка
SELECT id, name, pro_builds FROM heroes WHERE id = 1;
