#!/usr/bin/env python3
"""Collect all _en fields that have empty _uk and export to a flat JSON for manual translation."""
import json

PATCHES_FILE = 'patches_data.json'
OUT_FILE = 'patches_to_translate.json'

with open(PATCHES_FILE, 'r', encoding='utf-8') as f:
    patches = json.load(f)

to_translate = []

def collect(obj, path):
    if isinstance(obj, dict):
        for k in list(obj.keys()):
            if k.endswith('_en') and isinstance(obj[k], str) and obj[k].strip():
                base = k[:-3]
                uk_key = base + '_uk'
                uk_val = obj.get(uk_key, '')
                if not uk_val or not uk_val.strip():
                    to_translate.append({
                        'path': path + '.' + k,
                        'en': obj[k],
                        'uk': ''
                    })
            else:
                collect(obj[k], path + '.' + k)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            collect(item, path + f'[{i}]')

for version, patch in patches.items():
    collect(patch, version)

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(to_translate, f, indent=2, ensure_ascii=False)

print(f'Exported {len(to_translate)} fields to {OUT_FILE}')
