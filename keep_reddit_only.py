"""Keep only Reddit-sourced patches in patches_data.json."""
import json

d = json.load(open('patches_data.json', encoding='utf-8'))
before = len(d)
d = {k: v for k, v in d.items() if v.get('reddit_source')}
after = len(d)

json.dump(d, open('patches_data.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'Removed {before - after} non-Reddit patches. Kept: {after}')
print('Patches:', sorted(d.keys()))
