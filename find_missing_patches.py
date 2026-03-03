"""Find Reddit posts for patches not yet imported from Reddit."""
import urllib.request, urllib.parse, json, ssl, time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'MLBB-Wiki-Bot/1.0'})
    with urllib.request.urlopen(req, context=ctx) as r:
        return json.loads(r.read())

def search(query):
    q = urllib.parse.quote(f'author:Tigreal {query}')
    url = f'https://www.reddit.com/r/MobileLegendsGame/search.json?q={q}&sort=new&restrict_sr=1&limit=5'
    return fetch_json(url)

patches = json.load(open('patches_data.json', encoding='utf-8'))
missing = [k for k, v in sorted(patches.items()) if not v.get('reddit_source')]
print(f"Patches without Reddit data: {missing}\n")

for ver in ['2.1.48', '2.1.46', '2.1.44', '2.1.42', '2.1.40a', '2.1.38',
            '2.1.34', '2.1.30a', '2.1.28', '2.1.26', '2.1.18-org', '2.1.18b',
            '2.1.14', '2.1.10', '2.1.08', '1.9.99a']:
    base_ver = ver.replace('-org', '').replace('a', '').replace('b', '')
    d = search(f'patch notes {base_ver} org')
    posts = d['data']['children']
    hits = [
        (p['data']['title'], p['data']['permalink'])
        for p in posts
        if 'patch' in p['data']['title'].lower() and 'note' in p['data']['title'].lower()
        and base_ver in p['data']['title']
    ]
    print(f"{ver} → {hits[0] if hits else 'NOT FOUND'}")
    time.sleep(0.5)
