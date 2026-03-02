#!/usr/bin/env python3
"""
Fetch MLBB patch notes from Reddit (posted by u/Tigreal) and merge into patches_data.json.

Usage:
  python3 fetch_reddit_patches.py              # fetch new posts, merge into patches_data.json
  python3 fetch_reddit_patches.py --dry-run    # print parsed result, don't save
  python3 fetch_reddit_patches.py --url <url>  # parse a specific Reddit post URL
"""

import re
import json
import sys
import ssl
import time
import urllib.request
import urllib.parse
import os
from datetime import datetime

REDDIT_AUTHOR = 'Tigreal'
SUBREDDIT = 'MobileLegendsGame'
PATCHES_FILE = os.path.join(os.path.dirname(__file__), 'patches_data.json')
USER_AGENT = 'MLBBWikiBot/1.0 (patch notes collector)'

# ─── HTTP helpers ─────────────────────────────────────────────

_ssl_ctx = ssl.create_default_context()
try:
    import certifi
    _ssl_ctx = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl_ctx.check_hostname = False
    _ssl_ctx.verify_mode = ssl.CERT_NONE


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=15, context=_ssl_ctx) as r:
        return json.loads(r.read().decode('utf-8'))


# ─── Reddit search ────────────────────────────────────────────

def search_patch_posts(limit: int = 25) -> list[dict]:
    """Search r/MobileLegendsGame for Tigreal's patch note posts."""
    url = (
        f'https://www.reddit.com/r/{SUBREDDIT}/search.json'
        f'?q=author:{REDDIT_AUTHOR}+patch+notes&sort=new&restrict_sr=1&limit={limit}'
    )
    data = fetch_json(url)
    posts = data.get('data', {}).get('children', [])
    results = []
    for p in posts:
        d = p.get('data', {})
        title = d.get('title', '')
        # Only actual patch note posts
        if 'patch' in title.lower() and 'note' in title.lower():
            results.append({
                'title': title,
                'url': d.get('url', ''),
                'permalink': d.get('permalink', ''),
                'created_utc': d.get('created_utc', 0),
                'id': d.get('id', ''),
            })
    return results


def fetch_post_text(permalink: str) -> str | None:
    url = f'https://www.reddit.com{permalink.rstrip("/")}/.json'
    data = fetch_json(url)
    post = data[0]['data']['children'][0]['data']
    return post.get('selftext', '')


# ─── Version/date parsing ──────────────────────────────────────

VERSION_RE = re.compile(
    r'[Pp]atch\s+[Nn]otes?\s+(\d+\.\d+(?:\.\d+)?)(?:\s*[-–]\s*[Aa]dv)?',
    re.IGNORECASE
)
ADV_RE = re.compile(r'adv\.?\s*(?:anced)?\s+server', re.IGNORECASE)
DATE_RE = re.compile(
    r'(?:update\s+)?released?\s+on\s+'
    r'(\w+ \d{1,2},? \d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{4})',
    re.IGNORECASE
)
DATE_FORMATS = ['%B %d, %Y', '%B %d %Y', '%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']


def parse_version(title: str, text: str = '') -> str:
    m = VERSION_RE.search(title)
    ver = m.group(1) if m else 'unknown'
    suffix = '-adv' if (ADV_RE.search(title) or ADV_RE.search(text[:300])) else ''
    return ver + suffix


def parse_release_date(text: str, created_utc: float = 0) -> str:
    m = DATE_RE.search(text[:300])
    if m:
        raw = m.group(1).replace(',', '').strip()
        for fmt in DATE_FORMATS:
            try:
                return datetime.strptime(raw, fmt).strftime('%Y-%m-%d')
            except ValueError:
                continue
    if created_utc:
        return datetime.utcfromtimestamp(created_utc).strftime('%Y-%m-%d')
    return datetime.now().strftime('%Y-%m-%d')


# ─── Markdown parser ──────────────────────────────────────────

BADGE_SYMBOLS = {'↑': 'BUFF', '↓': 'NERF', '~': 'ADJUST'}

# Matches:  * **[Hero Name] `(↑)`**  or  * **[Revamped Hero: ... - Name]**
ENTITY_RE = re.compile(
    r'^\*\s*\*\*\[([^\]]+)\]\s*(?:`\(([\u2191\u2193~])\)`)?',
    re.MULTILINE
)
# Matches skill lines (indented with special whitespace): **[Skill Name] `(↑)`**
SKILL_RE = re.compile(
    r'^(?:[\s\t\uffa0\u3164]*)\*\*\[([^\]]+)\]\s*(?:`\(([\u2191\u2193~])\)`)?',
    re.MULTILINE
)

SECTION_RE = re.compile(r'^#+\s*(.*)', re.MULTILINE)

# Stat change:  "HP: 100 >> 200"
STAT_RE = re.compile(r'.+>>\s*.+')


def clean(text: str) -> str:
    """Remove markdown formatting for storage."""
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'^\s*>\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'[\uffa0\u3164\u0020]{2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def html_clean(text: str) -> str:
    """Convert basic markdown to HTML for the frontend."""
    text = text.replace('&gt;', '>').replace('&amp;', '&').replace('&lt;', '<')
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'^\s*[>\uffa0\u3164]+\s?', '', text, flags=re.MULTILINE)
    # stat arrows
    text = text.replace('>>', '→')
    return text.strip()


def split_sections(text: str) -> dict[str, str]:
    """Split post text into named sections by # headers."""
    sections: dict[str, str] = {}
    current = 'intro'
    buf: list[str] = []
    for line in text.splitlines():
        m = SECTION_RE.match(line)
        if m:
            sections[current] = '\n'.join(buf)
            current = m.group(1).strip().lower()
            buf = []
        else:
            buf.append(line)
    sections[current] = '\n'.join(buf)
    return sections


def classify_section(name: str) -> str:
    """Map section heading to category key."""
    n = name.lower()
    if 'revamp' in n:
        return 'revamped'
    if 'hero' in n and ('adjust' in n or 'balance' in n or 'change' in n):
        return 'heroes'
    if 'equipment' in n or 'item' in n:
        return 'equipment'
    if 'emblem' in n:
        return 'emblems'
    if 'battlefield' in n or 'map' in n or 'lord' in n:
        return 'battlefield'
    if 'system' in n or 'bug' in n or 'other' in n or 'misc' in n:
        return 'system'
    return 'other'


def parse_entity_block(text: str) -> list[dict]:
    """
    Parse a section text into a list of entity (hero/item) change objects.
    Returns:
      [{ 'name': str, 'badge': str, 'description': str, 'skills': [...] }, ...]
    """
    results: list[dict] = []
    lines = text.splitlines()
    i = 0
    current_entity: dict | None = None
    current_skill: dict | None = None
    current_skill_buf: list[str] = []
    current_desc_buf: list[str] = []

    def flush_skill():
        nonlocal current_skill, current_skill_buf
        if current_skill:
            desc = html_clean('\n'.join(current_skill_buf).strip())
            current_skill['description_en'] = desc
            current_skill['description_uk'] = ''
            if current_entity:
                current_entity.setdefault('skills', []).append(current_skill)
        current_skill = None
        current_skill_buf = []

    def flush_entity():
        nonlocal current_entity, current_desc_buf
        flush_skill()
        if current_entity:
            desc = html_clean('\n'.join(current_desc_buf).strip())
            current_entity['description_en'] = desc
            current_entity['description_uk'] = ''
            results.append(current_entity)
        current_entity = None
        current_desc_buf = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Entity line: * **[Name] `(badge)`**
        em = ENTITY_RE.match(stripped)
        if em:
            flush_entity()
            raw_name = em.group(1)
            badge_sym = em.group(2) or ''
            badge = BADGE_SYMBOLS.get(badge_sym, 'CHANGE')
            # Extract clean name (handle "Revamped Hero: Subtitle - Name" patterns)
            name = re.sub(r'^.*[-—]\s*', '', raw_name).strip()
            if not name or len(name) > 50:
                name = raw_name.strip()
            current_entity = {'name': name, 'badge': badge, 'skills': []}
            i += 1
            continue

        # Skill line: **[Skill Name] `(badge)`** (indented)
        if current_entity and re.match(r'^[\s\uffa0\u3164]+\*\*\[', line):
            sm = SKILL_RE.match(line)
            if sm:
                flush_skill()
                skill_name = sm.group(1).strip()
                skill_badge_sym = sm.group(2) or ''
                skill_badge = BADGE_SYMBOLS.get(skill_badge_sym, 'CHANGE')
                current_skill = {'skill_name': skill_name, 'badge': skill_badge}
                i += 1
                continue

        # Content lines
        if current_entity:
            if current_skill is not None:
                current_skill_buf.append(line)
            else:
                current_desc_buf.append(line)

        i += 1

    flush_entity()
    return [e for e in results if e.get('name')]


# ─── Full post parser ─────────────────────────────────────────

def parse_patch_post(text: str, title: str, created_utc: float = 0) -> dict:
    version = parse_version(title, text)
    release_date = parse_release_date(text, created_utc)
    is_adv = 'adv' in version

    sections = split_sections(text)
    hero_adjustments: dict[str, dict] = {}
    equipment_adjustments: dict[str, dict] = {}
    revamped_heroes: list[str] = []
    battlefield_adjustments: dict[str, dict] = {}
    system_adjustments: list[str] = []

    for section_name, section_text in sections.items():
        cat = classify_section(section_name)

        if cat in ('heroes', 'revamped'):
            entities = parse_entity_block(section_text)
            for e in entities:
                name = e['name']
                if cat == 'revamped':
                    revamped_heroes.append(name)
                entry: dict = {
                    'badge': e['badge'],
                    'description_en': e.get('description_en', ''),
                    'description_uk': e.get('description_uk', ''),
                }
                if e.get('skills'):
                    entry['adjustments'] = [
                        {
                            'badge': s['badge'],
                            'skill_name': s['skill_name'],
                            'description_en': s.get('description_en', ''),
                            'description_uk': s.get('description_uk', ''),
                        }
                        for s in e['skills']
                    ]
                hero_adjustments[name] = entry

        elif cat == 'equipment':
            entities = parse_entity_block(section_text)
            for e in entities:
                entry = {
                    'badge': e['badge'],
                    'description_en': e.get('description_en', ''),
                    'description_uk': e.get('description_uk', ''),
                }
                if e.get('skills'):
                    entry['adjustments'] = [
                        {
                            'badge': s['badge'],
                            'skill_name': s['skill_name'],
                            'description_en': s.get('description_en', ''),
                            'description_uk': s.get('description_uk', ''),
                        }
                        for s in e['skills']
                    ]
                equipment_adjustments[e['name']] = entry

        elif cat == 'battlefield':
            entities = parse_entity_block(section_text)
            for e in entities:
                entry = {
                    'badge': e['badge'],
                    'description_en': e.get('description_en', ''),
                    'description_uk': e.get('description_uk', ''),
                }
                battlefield_adjustments[e['name']] = entry

        elif cat == 'system':
            txt = clean(section_text).strip()
            if txt:
                system_adjustments.append({'text_en': txt, 'text_uk': ''})

    result = {
        'version': version,
        'release_date': release_date,
        'game_id': 1,
        'is_adv_server': is_adv,
        'reddit_source': True,
        'hero_adjustments': hero_adjustments,
        'equipment_adjustments': equipment_adjustments,
        'battlefield_adjustments': battlefield_adjustments,
        'system_adjustments': system_adjustments,
        'revamped_heroes': revamped_heroes,
    }
    return result


# ─── Merge into patches_data.json ─────────────────────────────

def load_patches() -> dict:
    if os.path.exists(PATCHES_FILE):
        with open(PATCHES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_patches(data: dict) -> None:
    with open(PATCHES_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def version_key(version: str) -> str:
    """Normalize version string to a dict key like '2.1.52-adv'."""
    v = re.sub(r'\s+', '', version.lower())
    v = re.sub(r'\(adv.*?\)', '-adv', v)
    v = re.sub(r'-adv(?:anced)?server', '-adv', v)
    return v


# ─── Main entry ───────────────────────────────────────────────

def main():
    dry_run = '--dry-run' in sys.argv
    force = '--force' in sys.argv  # overwrite even if already imported
    specific_url = None
    if '--url' in sys.argv:
        idx = sys.argv.index('--url')
        if idx + 1 < len(sys.argv):
            specific_url = sys.argv[idx + 1]

    posts_to_process = []

    if specific_url:
        # Extract permalink from full URL
        parsed_url = urllib.parse.urlparse(specific_url)
        permalink = parsed_url.path.rstrip('/')
        # Ensure it ends properly for .json fetch
        url = f'https://www.reddit.com{permalink.rstrip("/")}/.json'
        data = fetch_json(url)
        post_data = data[0]['data']['children'][0]['data']
        posts_to_process = [{
            'title': post_data['title'],
            'permalink': permalink,
            'created_utc': post_data.get('created_utc', 0),
        }]
    else:
        print(f'Searching r/{SUBREDDIT} for patch notes by u/{REDDIT_AUTHOR}...')
        posts_to_process = search_patch_posts(limit=50)
        print(f'Found {len(posts_to_process)} patch note posts.')

    patches = load_patches()
    added = 0
    skipped = 0

    for post in posts_to_process:
        title = post['title']
        ver = parse_version(title)
        key = version_key(ver)

        if not dry_run and not force and key in patches and patches[key].get('reddit_source'):
            print(f'  SKIP {title} (already imported)')
            skipped += 1
            continue

        print(f'  FETCH {title}...')
        try:
            text = fetch_post_text(post['permalink'])
            if not text:
                print(f'    WARNING: empty post text, skipping.')
                continue
            # Re-parse version with post text for adv-server detection
            ver = parse_version(title, text)
            key = version_key(ver)
            if 'unknown' in key:
                print(f'    SKIP: could not detect version from title/body.')
                skipped += 1
                continue
        except Exception as e:
            print(f'    ERROR fetching: {e}')
            continue

        parsed = parse_patch_post(text, title, post.get('created_utc', 0))
        parsed['reddit_permalink'] = post.get('permalink', '')

        heroes_count = len(parsed['hero_adjustments'])
        items_count = len(parsed['equipment_adjustments'])
        print(f'    version={parsed["version"]} date={parsed["release_date"]} '
              f'heroes={heroes_count} items={items_count}')

        if dry_run:
            print(json.dumps(parsed, ensure_ascii=False, indent=2)[:2000])
            print('...')
            continue

        # Fields preserved from existing (non-Reddit sources)
        PRESERVE_FIELDS = (
            'designers_note', 'emblem_adjustments', 'highlights',
            'new_hero', 'revamped_heroes_data',
        )
        if key not in patches:
            patches[key] = parsed
        else:
            existing = patches[key]
            if force:
                # Replace Reddit-parseable fields, keep enriched fields from other sources
                preserved = {f: existing[f] for f in PRESERVE_FIELDS if f in existing}
                patches[key] = {**parsed, **preserved}
            else:
                # Soft merge: update Reddit fields
                existing['hero_adjustments'] = parsed['hero_adjustments']
                existing['equipment_adjustments'] = parsed['equipment_adjustments']
                existing['battlefield_adjustments'] = parsed['battlefield_adjustments']
                existing['system_adjustments'] = parsed['system_adjustments']
                existing['revamped_heroes'] = parsed['revamped_heroes']
                existing['reddit_source'] = True
                existing['reddit_permalink'] = parsed['reddit_permalink']

        added += 1
        time.sleep(0.5)  # be polite to Reddit

    if not dry_run:
        save_patches(patches)
        print(f'\nDone. Added/updated: {added}, skipped: {skipped}')
        print(f'Total patches in file: {len(patches)}')


if __name__ == '__main__':
    main()
