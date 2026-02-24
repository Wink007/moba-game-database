"""
Batch update name_uk for all MLBB heroes.
Transliterations based on official Ukrainian gaming community conventions.
"""
import database as db

# Mapping: English name -> Ukrainian transliteration
HERO_NAMES_UK = {
    "Aamon": "Еймон",
    "Akai": "Акай",
    "Aldous": "Алдус",
    "Alice": "Аліса",
    "Alpha": "Альфа",
    "Alucard": "Алукард",
    "Angela": "Анжела",
    "Argus": "Аргус",
    "Arlott": "Арлотт",
    "Atlas": "Атлас",
    "Aulus": "Аулус",
    "Aurora": "Аврора",
    "Badang": "Баданг",
    "Balmond": "Балмонд",
    "Bane": "Бейн",
    "Barats": "Баратс",
    "Baxia": "Баксія",
    "Beatrix": "Беатрікс",
    "Belerick": "Белерік",
    "Benedetta": "Бенедетта",
    "Brody": "Броуді",
    "Bruno": "Бруно",
    "Carmilla": "Карміла",
    "Cecilion": "Сесіліон",
    "Chang'e": "Чень'е",
    "Chip": "Чіп",
    "Chou": "Чоу",
    "Cici": "Чічі",
    "Claude": "Клауд",
    "Clint": "Клінт",
    "Cyclops": "Циклоп",
    "Diggie": "Діггі",
    "Dyrroth": "Даріус",
    "Edith": "Едіт",
    "Esmeralda": "Есмеральда",
    "Estes": "Естес",
    "Eudora": "Ейдора",
    "Fanny": "Фанні",
    "Faramis": "Фараміс",
    "Floryn": "Флорін",
    "Franco": "Франко",
    "Fredrinn": "Фредрінн",
    "Freya": "Фрея",
    "Gatotkaca": "Ґатоткача",
    "Gloo": "Ґлу",
    "Gord": "Горд",
    "Granger": "Ґренджер",
    "Grock": "Ґрок",
    "Guinevere": "Ґвіневра",
    "Gusion": "Ґоссен",
    "Hanabi": "Ханабі",
    "Hanzo": "Хандзо",
    "Harith": "Харіт",
    "Harley": "Харлі",
    "Hayabusa": "Хаябуса",
    "Helcurt": "Хелкарт",
    "Hilda": "Хільда",
    "Hylos": "Хілос",
    "Irithel": "Іритель",
    "Ixia": "Іксія",
    "Jawhead": "Кусака",
    "Johnson": "Джонсон",
    "Joy": "Джой",
    "Julian": "Джуліан",
    "Kadita": "Кадіта",
    "Kagura": "Каґура",
    "Kaja": "Кая",
    "Kalea": "Клея",
    "Karina": "Каріна",
    "Karrie": "Каррі",
    "Khaleed": "Халід",
    "Khufra": "Хуфра",
    "Kimmy": "Кіммі",
    "Lancelot": "Ланселот",
    "Lapu-Lapu": "Лапу-Лапу",
    "Layla": "Лейла",
    "Leomord": "Леоморд",
    "Lesley": "Леслі",
    "Ling": "Лінг",
    "Lolita": "Лоліта",
    "Lukas": "Лукас",
    "Lunox": "Лунокс",
    "Luo Yi": "Лу Ї",
    "Lylia": "Лілія",
    "Martis": "Мартіс",
    "Masha": "Маша",
    "Mathilda": "Матільда",
    "Melissa": "Меліса",
    "Minotaur": "Мінотавр",
    "Minsitthar": "Мінсіттар",
    "Miya": "Мія",
    "Moskov": "Москов",
    "Nana": "Нана",
    "Natalia": "Наталія",
    "Natan": "Натан",
    "Nolan": "Нолан",
    "Novaria": "Новарія",
    "Obsidia": "Обсідія",
    "Odette": "Одетта",
    "Paquito": "Пакіто",
    "Pharsa": "Фарша",
    "Phoveus": "Фовеус",
    "Popol and Kupa": "Попол і Купа",
    "Rafaela": "Рафаела",
    "Roger": "Роджер",
    "Ruby": "Рубі",
    "Saber": "Сабер",
    "Selena": "Селена",
    "Silvanna": "Сільванна",
    "Sora": "Сора",
    "Sun": "Сан",
    "Suyou": "Су Йо",
    "Terizla": "Терізла",
    "Thamuz": "Тамуз",
    "Tigreal": "Тігріл",
    "Uranus": "Уранус",
    "Vale": "Вейл",
    "Valentina": "Валентіна",
    "Valir": "Валір",
    "Vexana": "Вексана",
    "Wanwan": "Ванван",
    "X.Borg": "Ікс.Борг",
    "Xavier": "Ксав'єр",
    "Yi Sun-shin": "Лі Сунсін",
    "Yin": "Інь",
    "Yu Zhong": "Чонг",
    "Yve": "Ів",
    "Zetian": "Цзетянь",
    "Zhask": "Заск",
    "Zhuxin": "Чжусінь",
    "Zilong": "Зілонг",
}

def main():
    conn = db.get_connection()
    ph = db.get_placeholder()
    cursor = conn.cursor()
    
    updated = 0
    skipped = 0
    
    for en_name, uk_name in HERO_NAMES_UK.items():
        cursor.execute(
            f"UPDATE heroes SET name_uk = {ph} WHERE name = {ph} AND game_id = 2",
            (uk_name, en_name)
        )
        if cursor.rowcount > 0:
            updated += 1
            print(f"  ✅ {en_name} -> {uk_name}")
        else:
            skipped += 1
    
    conn.commit()
    db.release_connection(conn)
    print(f"\nDone: {updated} updated, {skipped} skipped (already had name_uk)")

if __name__ == '__main__':
    main()
