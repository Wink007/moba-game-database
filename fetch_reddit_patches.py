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


def fetch_json(url: str, retries: int = 4) -> dict:
    for attempt in range(retries):
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=15, context=_ssl_ctx) as r:
                return json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = int(e.headers.get('Retry-After', 10 * (2 ** attempt)))
                print(f'    429 rate limited, waiting {wait}s (attempt {attempt + 1}/{retries})...')
                time.sleep(wait)
            else:
                raise
    raise RuntimeError(f'Failed to fetch {url} after {retries} retries (429)')


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
    text = post.get('selftext', '') or ''
    # Normalize line endings (Reddit API may return CRLF)
    return text.replace('\r\n', '\n').replace('\r', '\n')


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

# Korean filler chars used as indentation in Reddit posts
FILLER = '\uffa0\u3164'

# Hero entity line: 0-1 filler + [Name] (↑)  e.g. "[Aurora] (↑)" or "ㅤ[Aurora] (↑)"
# Also supports old markdown: * **[Name] `(↑)`**
ENTITY_RE = re.compile(
    r'^[' + FILLER + r']{0,1}\[([^\]]+)\]\s*[`(]?([\u2191\u2193~])[)`]?'
    r'|^\*\s*\*\*\[([^\]]+)\]\s*(?:`\(([\u2191\u2193~])\)`)?',
    re.MULTILINE
)

# Skill line: 2+ fillers/spaces + [Skill Name] (↑)
# Also supports: ㅤㅤ [Passive] (↑)
SKILL_RE = re.compile(
    r'^[' + FILLER + r'\s]{2,}\[([^\]]+)\]\s*[`(]?([\u2191\u2193~])[)`]?'
    r'|^[' + FILLER + r'\s]{2,}\*\*\[([^\]]+)\]\s*(?:`\(([\u2191\u2193~])\)`)?',
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
    # Strip blockquote markers and special whitespace
    text = re.sub(r'^\s*[>\uffa0\u3164]+\s?', '', text, flags=re.MULTILINE)
    # Strip horizontal rules
    text = re.sub(r'^[-_*]{3,}\s*$', '', text, flags=re.MULTILINE)
    # Bold
    text = re.sub(r'\*\*([^*\n]+)\*\*', r'<strong>\1</strong>', text)
    # Inline code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # Stat arrows
    text = text.replace('>>', '→')
    # Convert markdown bullet lists (* item / - item / • item) → <ul><li>...</li></ul>
    def bullets_to_html(t: str) -> str:
        lines = t.split('\n')
        out: list[str] = []
        in_list = False
        for line in lines:
            m = re.match(r'^\s*[-*•]\s+(.*)', line)
            if m:
                if not in_list:
                    out.append('<ul>')
                    in_list = True
                out.append(f'<li>{m.group(1).strip()}</li>')
            else:
                if in_list:
                    out.append('</ul>')
                    in_list = False
                out.append(line)
        if in_list:
            out.append('</ul>')
        return '\n'.join(out)

    text = bullets_to_html(text)
    # Numbered lists (1- / 1. / 1) at start of line) → <ol><li>
    def numbered_to_html(t: str) -> str:
        lines = t.split('\n')
        out: list[str] = []
        in_list = False
        for line in lines:
            m = re.match(r'^\s*\d+[-.)]\s+(.*)', line)
            if m:
                if not in_list:
                    out.append('<ol>')
                    in_list = True
                out.append(f'<li>{m.group(1).strip()}</li>')
            else:
                if in_list:
                    out.append('</ol>')
                    in_list = False
                out.append(line)
        if in_list:
            out.append('</ol>')
        return '\n'.join(out)

    text = numbered_to_html(text)
    # Convert paragraph breaks (\n\n or more) → </p><p> wrapped in outer <p>
    # First collapse excess blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Split by double newline, wrap each paragraph
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    if len(paras) > 1:
        # Wrap in <p> tags but don't double-wrap block elements
        wrapped = []
        for p in paras:
            if p.startswith('<ul>') or p.startswith('<ol>') or p.startswith('<li>'):
                wrapped.append(p)
            else:
                # Single newlines inside paragraph → <br>
                p = p.replace('\n', '<br>')
                wrapped.append(f'<p>{p}</p>')
        text = ''.join(wrapped)
    else:
        text = text.replace('\n', '<br>')
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
    if 'hero' in n and ('adjust' in n or 'balance' in n or 'change' in n or 'i.' in n or 'i ' in n):
        return 'heroes'
    if 'equipment' in n or ('item' in n and 'adjust' in n):
        return 'equipment'
    if 'emblem' in n:
        return 'emblems'
    if 'battlefield' in n or 'map' in n:
        return 'battlefield'
    # Everything else (system, mode, bug, misc, loading, tide, frozen, etc.) → system text
    return 'system'


def parse_bracketed_block(section_name: str, text: str) -> list[dict]:
    """
    Parse plain-text sections that use [Bracketed Title] + following paragraphs.
    Also handles numbered lists (1- / 1. / •) and freeform paragraphs.
    Handles Reddit formats:
      [Title]              – bare brackets
      **[Title]**          – bold title
      * **[Title]**        – bullet + bold title
    Returns a list of {name, badge, description_en, description_uk}.
    """
    results: list[dict] = []
    # Match [Title] that occupies an entire line.
    # Supports: bare [Title], **[Title]**, * **[Title]**
    LINE_BRACKET_RE = re.compile(
        r'^[ \t\uffa0\u3164\u00a0\u200b\u200c\u200d]*'
        r'(?:\*\s+\*\*|\*\*)?'     # optional "* **" (bullet bold) or "**" (just bold)
        r'\[([^\]\n\r]+)\]'
        r'(?:\*\*)?'                # optional closing "**"
        r'[ \t\uffa0\u3164\u00a0\u200b\u200c\u200d\r]*$',
        re.MULTILINE
    )

    # Find all line-start bracketed titles with their positions
    chunks: list[tuple[str, str]] = []  # (title, text_after)
    last_end = 0
    last_title: str | None = None
    intro_buf: list[str] = []

    for m in LINE_BRACKET_RE.finditer(text):
        before = text[last_end:m.start()].strip()
        if last_title is None:
            if before:
                intro_buf.append(before)
        else:
            chunks.append((last_title, before.strip()))
        last_title = m.group(1)
        last_end = m.end()

    # Remaining text after last bracket
    remainder = text[last_end:].strip()
    if last_title:
        chunks.append((last_title, remainder))

    # Intro text (before first [bracket]) stored under section name itself
    intro_text = html_clean('\n'.join(intro_buf)).strip()
    if intro_text:
        results.append({
            'name': section_name.title(),
            'badge': 'CHANGE',
            'description_en': intro_text,
            'description_uk': '',
        })

    for title, body in chunks:
        body_clean = html_clean(body).strip()
        if not body_clean and not title:
            continue
        results.append({
            'name': title,
            'badge': 'CHANGE',
            'description_en': body_clean,
            'description_uk': '',
        })

    # If nothing found, return whole text as one block
    if not results:
        full = html_clean(text).strip()
        if full:
            results.append({
                'name': section_name.title(),
                'badge': 'CHANGE',
                'description_en': full,
                'description_uk': '',
            })
    return results


def _filler_count(line: str) -> int:
    """Count leading Korean filler / zero-width chars on a line."""
    count = 0
    for ch in line:
        if ch in ('\uffa0', '\u3164', '\u00a0'):
            count += 1
        else:
            break
    return count


def _parse_entity_name_badge(m: re.Match) -> tuple[str, str]:
    """Extract (name, badge) from ENTITY_RE or SKILL_RE match."""
    # Groups: (name_new, badge_new, name_old, badge_old)
    name = (m.group(1) or m.group(3) or '').strip()
    badge_sym = (m.group(2) or m.group(4) or '').strip()
    badge = BADGE_SYMBOLS.get(badge_sym, 'CHANGE')
    return name, badge


def parse_entity_block(text: str) -> list[dict]:
    """
    Parse a hero/item section. Handles real Reddit format:
      [Hero Name] (↑)           <- hero line (0-1 filler prefix)
      Description paragraph
      ㅤㅤ [Skill Name] (↑)     <- skill line (2+ filler prefix)
      Skill description / stat changes
    Also handles old markdown: * **[Hero] `(↑)`**
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
            current_skill['description_en'] = html_clean('\n'.join(current_skill_buf).strip())
            current_skill['description_uk'] = ''
            if current_entity is not None:
                current_entity.setdefault('skills', []).append(current_skill)
        current_skill = None
        current_skill_buf = []

    def flush_entity():
        nonlocal current_entity, current_desc_buf
        flush_skill()
        if current_entity is not None:
            current_entity['description_en'] = html_clean('\n'.join(current_desc_buf).strip())
            current_entity['description_uk'] = ''
            results.append(current_entity)
        current_entity = None
        current_desc_buf = []

    while i < len(lines):
        line = lines[i]
        fc = _filler_count(line)          # number of leading Korean filler chars
        stripped = line.strip()

        # Skip pure filler / blank separator lines
        if not stripped or stripped == '\uffa0' or stripped == '\u3164':
            i += 1
            continue

        # ── Hero / entity line (0-1 filler chars before [Name]) ──────────────
        if fc <= 1:
            em = ENTITY_RE.match(line.lstrip('\uffa0\u3164\u00a0 \t'))
            if em:
                flush_entity()
                name, badge = _parse_entity_name_badge(em)
                # Clean name: drop "Revamped Hero: ...", keep last meaningful part
                name = re.sub(r'^(?:revamped\s+)?', '', name, flags=re.IGNORECASE).strip()
                current_entity = {'name': name, 'badge': badge, 'skills': []}
                i += 1
                continue

        # ── Skill line (2+ filler chars before [Skill Name]) ─────────────────
        if fc >= 2 and current_entity is not None:
            sm = SKILL_RE.match(line)
            if sm:
                flush_skill()
                skill_name = (sm.group(1) or sm.group(3) or '').strip()
                badge_sym = (sm.group(2) or sm.group(4) or '').strip()
                skill_badge = BADGE_SYMBOLS.get(badge_sym, 'CHANGE')
                current_skill = {'skill_name': skill_name, 'badge': skill_badge}
                i += 1
                continue

        # ── Content line ──────────────────────────────────────────────────────
        if current_entity is not None:
            clean_line = line.lstrip('\uffa0\u3164\u00a0')  # strip filler but keep real indent
            if current_skill is not None:
                current_skill_buf.append(clean_line)
            else:
                current_desc_buf.append(clean_line)

        i += 1

    flush_entity()
    return [e for e in results if e.get('name')]


# ─── Full post parser ─────────────────────────────────────────

def parse_patch_post(text: str, title: str, created_utc: float = 0) -> dict:
    # Normalize CRLF → LF
    text = text.replace('\r\n', '\n').replace('\r', '\n')
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
        if not section_text.strip():
            continue
        # Skip the intro header (release date already parsed separately)
        if section_name == 'intro':
            continue
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
            if not entities:
                # Plain text format — try [Bracketed] titles
                entities = parse_bracketed_block(section_name, section_text)
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
            if not entities:
                entities = parse_bracketed_block(section_name, section_text)
            for e in entities:
                entry = {
                    'badge': e['badge'],
                    'description_en': e.get('description_en', ''),
                    'description_uk': e.get('description_uk', ''),
                }
                battlefield_adjustments[e['name']] = entry

        elif cat == 'system':
            # Parse as named blocks (each [Title] becomes a separate entry)
            entries = parse_bracketed_block(section_name, section_text)
            if entries:
                for e in entries:
                    name_part = f'<strong>{e["name"]}</strong>' if e.get('name') else ''
                    desc_part = e.get('description_en', '')
                    combined = f'{name_part}<br/>{desc_part}' if name_part and desc_part else (name_part or desc_part)
                    if combined:
                        system_adjustments.append({'text_en': combined, 'text_uk': ''})
            else:
                txt = html_clean(section_text).strip()
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
            time.sleep(2.0)  # rate limit even in dry-run
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
        time.sleep(2.0)  # be polite to Reddit (avoid 429)

    if not dry_run:
        save_patches(patches)
        print(f'\nDone. Added/updated: {added}, skipped: {skipped}')
        print(f'Total patches in file: {len(patches)}')


if __name__ == '__main__':
    main()
