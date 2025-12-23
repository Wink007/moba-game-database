-- Додаємо Hero's Ring
INSERT INTO equipment (game_id, name, tier, price_total, category, icon_url, hp, cooldown_reduction, attributes_json, recipe, sellable, removed)
VALUES (
    2,
    'Hero''s Ring',
    '2',
    450,
    'Defense',
    'https://static.wikia.nocookie.net/mobile-legends/images/9/91/Hero%27s_Ring.png',
    150,
    5,
    '{"HP": "+150", "Cooldown Reduction": "+5%"}',
    '[]',
    1,
    0
);

-- Додаємо Molten Essence
INSERT INTO equipment (game_id, name, tier, price_total, category, icon_url, hp, attributes_json, recipe, sellable, removed)
VALUES (
    2,
    'Molten Essence',
    '2',
    800,
    'Defense',
    'https://static.wikia.nocookie.net/mobile-legends/images/8/8c/Molten_Essence.png',
    540,
    '{"HP": "+540"}',
    '[{"name": "Vitality Crystal"}]',
    1,
    0
);
