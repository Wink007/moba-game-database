#!/usr/bin/env python3
"""
Translate all empty _uk fields in patches_data.json using DeepL API.
Handles HTML content (description fields with tags).
"""

import json
import os
import time
import re
from dotenv import load_dotenv

load_dotenv()

DEEPL_KEY = os.environ.get('DEEPL_API_KEY', '')
PATCHES_FILE = os.path.join(os.path.dirname(__file__), 'patches_data.json')

import deepl

translator = deepl.Translator(DEEPL_KEY)

def has_html(text: str) -> bool:
    return bool(re.search(r'<[a-zA-Z]', text))

def translate_text(text: str) -> str:
    if not text or not text.strip():
        return text
    try:
        if has_html(text):
            result = translator.translate_text(
                text, target_lang='UK',
                tag_handling='html'
            )
        else:
            result = translator.translate_text(text, target_lang='UK')
        return result.text
    except Exception as e:
        print(f'  DeepL error: {e}')
        return ''


def collect_translations(obj, to_translate: list, path=''):
    """Recursively collect (path, en_value) pairs where _uk is empty."""
    if isinstance(obj, dict):
        for k in list(obj.keys()):
            if k.endswith('_en') and isinstance(obj[k], str) and obj[k].strip():
                base = k[:-3]
                uk_key = base + '_uk'
                uk_val = obj.get(uk_key, '')
                if not uk_val or not uk_val.strip():
                    to_translate.append({
                        'obj': obj,
                        'uk_key': uk_key,
                        'en_val': obj[k],
                        'path': path + '.' + k,
                    })
            else:
                collect_translations(obj[k], to_translate, path + '.' + k)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            collect_translations(item, to_translate, path + f'[{i}]')


def main():
    with open(PATCHES_FILE, 'r', encoding='utf-8') as f:
        patches = json.load(f)

    to_translate = []
    for version, patch in patches.items():
        collect_translations(patch, to_translate, version)

    total = len(to_translate)
    print(f'Fields to translate: {total}')
    if total == 0:
        print('Nothing to translate.')
        return

    # Check DeepL usage
    usage = translator.get_usage()
    print(f'DeepL usage: {usage.character.count} / {usage.character.limit}')

    translated = 0
    failed = 0

    for i, item in enumerate(to_translate):
        en_val = item['en_val']
        print(f'[{i+1}/{total}] {item["path"][:80]}', end=' ... ', flush=True)

        uk_val = translate_text(en_val)
        if uk_val:
            item['obj'][item['uk_key']] = uk_val
            translated += 1
            print('OK')
        else:
            failed += 1
            print('FAILED')

        # Save every 25 translations to avoid losing progress
        if (i + 1) % 25 == 0:
            with open(PATCHES_FILE, 'w', encoding='utf-8') as f:
                json.dump(patches, f, indent=2, ensure_ascii=False)
            print(f'  >>> Saved progress ({i+1}/{total})')

        # Small delay to avoid rate limits
        if (i + 1) % 10 == 0:
            time.sleep(0.3)

    # Final save
    with open(PATCHES_FILE, 'w', encoding='utf-8') as f:
        json.dump(patches, f, indent=2, ensure_ascii=False)

    print(f'\nDone! Translated: {translated}, Failed: {failed}')


if __name__ == '__main__':
    main()
