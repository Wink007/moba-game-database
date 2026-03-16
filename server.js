const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const compression = require('compression');

const app = express();
app.disable('x-powered-by');
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const PORT = process.env.PORT || 3000;
const API_URL = 'https://web-production-8570.up.railway.app/api';
const BUILD_DIR = path.join(__dirname, 'build');

// Read once at startup — not on every request
const INDEX_HTML = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');

// Read locale chunk filenames for preload hints
const LOCALE_CHUNKS = (() => {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'asset-manifest.json'), 'utf8'));
    return {
      en: manifest.files['locale-en.js'] || null,
      uk: manifest.files['locale-uk.js'] || null,
      id: manifest.files['locale-id.js'] || null,
    };
  } catch (e) {
    return { en: null, uk: null, id: null };
  }
})();

// Preload heroes into cache at startup so first request is instant
(async () => {
  const url = `${API_URL}/heroes?game_id=2&lang=en`;
  const data = await fetchJSON(url);
  if (data) {
    cache.set(url, { data, ts: Date.now() });
    console.log(`Preloaded ${data.length} heroes into cache`);
  }
})();

function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 хвилин

async function cachedFetch(url) {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < CACHE_TTL) return hit.data;
  const data = await fetchJSON(url);
  if (data) cache.set(url, { data, ts: now });
  return data;
}

// Preload heroes into cache at startup so first request is instant
async function preloadCache() {
  const url = `${API_URL}/heroes?game_id=2&lang=en`;
  const data = await fetchJSON(url);
  if (data) {
    cache.set(url, { data, ts: Date.now() });
    console.log(`Preloaded ${data.length} heroes into cache`);
  }
}

function heroToSlug(name) {
  return name
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncateDesc(text, max = 155) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

function injectMeta(html, { title, description, image, canonical, jsonLd, lang, removeImgDimensions }) {
  const fullTitle = title ? `${title} | MOBA Wiki` : 'Wiki for Mobile Legends (Unofficial)';
  const desc = truncateDesc(description || 'Unofficial fan-made guide for Mobile Legends. Heroes stats, builds, rankings, items and more. Not affiliated with Moonton.');
  const img = image || 'https://mobawiki.com/logo512.png';
  const canon = canonical || 'https://mobawiki.com/';

  // Switch html lang attribute based on language
  const htmlLang = lang === 'uk' ? 'uk' : lang === 'id' ? 'id' : 'en';
  let result = html.replace(/<html lang="[^"]*"/, `<html lang="${htmlLang}"`);

  // Remove hardcoded og:image dimensions when we have a custom image (they were for the 512x512 logo)
  if (removeImgDimensions) {
    result = result
      .replace(/<meta property="og:image:width" content="[^"]*"\/>/, '')
      .replace(/<meta property="og:image:height" content="[^"]*"\/>/, '');
  }

  result = result
    .replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,  `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${fullTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${desc}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,  `$1${img}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,  `$1${canon}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,  `$1${canon}$2`);

  // og:locale
  const ogLocale = lang === 'uk' ? 'uk_UA' : lang === 'id' ? 'id_ID' : 'en_US';
  const localeTag = `<meta property="og:locale" content="${ogLocale}"/>`;
  if (result.includes('og:locale')) {
    result = result.replace(/(<meta property="og:locale" content=")[^"]*("\/>)/, `$1${ogLocale}$2`);
  } else {
    result = result.replace('</head>', `  ${localeTag}\n</head>`);
  }
  result = result
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,  `$1${fullTitle}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,  `$1${desc}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/,  `$1${img}$2`);

  if (jsonLd) {
    const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    result = result.replace('</head>', `${script}</head>`);
  }

  return result;
}

function buildHeroFAQ(hero, heroName) {
  const faq = [];
  const roles = Array.isArray(hero.roles) ? hero.roles.join('/') : hero.roles;
  const lanes = Array.isArray(hero.lane) ? hero.lane.join(' and ') : hero.lane;
  const wr = hero.main_hero_win_rate ? parseFloat(hero.main_hero_win_rate).toFixed(1) : null;

  if (roles) {
    faq.push({
      '@type': 'Question',
      name: `What role is ${heroName} in Mobile Legends?`,
      acceptedAnswer: { '@type': 'Answer', text: `${heroName} is a ${roles} hero in Mobile Legends.` },
    });
  }
  if (lanes) {
    faq.push({
      '@type': 'Question',
      name: `What lane does ${heroName} play?`,
      acceptedAnswer: { '@type': 'Answer', text: `${heroName} is typically played in the ${lanes} lane.` },
    });
  }
  if (wr) {
    const tier = parseFloat(wr) >= 52 ? 'strong' : parseFloat(wr) >= 49 ? 'decent' : 'situational';
    faq.push({
      '@type': 'Question',
      name: `Is ${heroName} good in Mobile Legends?`,
      acceptedAnswer: { '@type': 'Answer', text: `${heroName} has a win rate of ${wr}%, making them ${tier} in the current meta. Check the tier list and builds for the latest recommendations.` },
    });
  }
  if (hero.damage_type) {
    faq.push({
      '@type': 'Question',
      name: `What type of damage does ${heroName} deal?`,
      acceptedAnswer: { '@type': 'Answer', text: `${heroName} deals ${hero.damage_type} damage.` },
    });
  }
  if (hero.specialty) {
    const specialty = Array.isArray(hero.specialty) ? hero.specialty.join(', ') : hero.specialty;
    faq.push({
      '@type': 'Question',
      name: `What is ${heroName}'s specialty?`,
      acceptedAnswer: { '@type': 'Answer', text: `${heroName}'s specialty is ${specialty}.` },
    });
  }

  return faq;
}

// Static assets: JS/CSS get 1-year cache (hashed filenames), others 1 day
app.use(express.static(BUILD_DIR, {
  index: false,
  setHeaders(res, filePath) {
    if (filePath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2|woff|ttf)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else if (filePath.match(/\.(xml|txt|json)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
}));

// All HTML routes go through meta injection
app.get('/{*path}', async (req, res) => {
  let html = INDEX_HTML;

  const url = req.path;
  const lang = ['uk', 'id'].includes(req.query.lang) ? req.query.lang : 'en';

  // Preload the active locale chunk so it loads in parallel with main.js
  const localeChunk = LOCALE_CHUNKS[lang] || LOCALE_CHUNKS.en;
  if (localeChunk) {
    const preloadTag = `<link rel="preload" href="${localeChunk}" as="script"/>`;
    html = html.replace('</head>', `${preloadTag}</head>`);
  }

  try {
    // noindex для приватних сторінок
    if (url.match(/^\/(players|profile|favorites)(\/.+)?$/)) {
      html = html.replace(
        /(<meta name="robots" content=")[^"]*(")/,
        '$1noindex, nofollow$2'
      );
      return res.send(html);
    }

    // Home page
    if (url === '/' || url === '') {
      html = injectMeta(html, {
        title: undefined, // uses default full site title
        description: 'MOBA Wiki — unofficial fan guide for Mobile Legends. Hero stats, tier list, counter picks, item builds, patch notes and ranked statistics. Updated daily.',
        canonical: 'https://mobawiki.com/',
        lang,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'MOBA Wiki',
            url: 'https://mobawiki.com/',
            description: 'Unofficial fan guide for Mobile Legends — hero stats, tier list, counter picks and ranked statistics.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://mobawiki.com/2/heroes?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'MOBA Wiki',
            url: 'https://mobawiki.com/',
            logo: 'https://mobawiki.com/logo512.png',
          },
        ],
      });
      return res.send(html);
    }

    // /:gameId/heroes/:heroSlug
    const heroMatch = url.match(/^\/(\d+)\/heroes\/([^/]+)$/);
    if (heroMatch) {
      const [, gameId, heroSlug] = heroMatch;
      const heroes = await cachedFetch(`${API_URL}/heroes?game_id=${gameId}&lang=en`);
      if (heroes) {
        const hero = heroes.find(h => heroToSlug(h.name) === heroSlug);
        if (hero) {
          const isUk = lang === 'uk';
          const heroName = (isUk && hero.name_uk) ? hero.name_uk : hero.name;
          const shortDesc = (isUk && hero.short_description_uk) ? hero.short_description_uk : (hero.short_description || '');
          const winRate = hero.main_hero_win_rate ? ` Win Rate ${parseFloat(hero.main_hero_win_rate).toFixed(1)}%.` : '';
          const heroImg = hero.image || hero.head || undefined;
          const heroUrl = `https://mobawiki.com${url}`;
          html = injectMeta(html, {
            title: `${heroName} — Hero Guide`,
            description: `${heroName} guide for Mobile Legends — skills, builds, counters, synergies and stats.${winRate} ${shortDesc}`,
            image: heroImg,
            canonical: heroUrl,
            lang,
            removeImgDimensions: true,
            jsonLd: [
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
                  { '@type': 'ListItem', position: 2, name: 'Heroes', item: `https://mobawiki.com/${gameId}/heroes` },
                  { '@type': 'ListItem', position: 3, name: heroName, item: heroUrl },
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: `${heroName} — Hero Guide | MOBA Wiki`,
                description: `${heroName} guide — skills, builds, counters and stats for Mobile Legends.`,
                url: heroUrl,
                ...(heroImg ? { image: heroImg } : {}),
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: buildHeroFAQ(hero, heroName),
              },
            ],
          });
        }
      }
      return res.send(html);
    }

    // /:gameId/heroes
    const heroesMatch = url.match(/^\/(\d+)\/heroes$/);
    if (heroesMatch) {
      const [, hgid] = heroesMatch;
      const heroesForList = await cachedFetch(`${API_URL}/heroes?game_id=${hgid}&lang=en`);
      const heroListUrl = `https://mobawiki.com${url}`;
      const itemListJsonLd = heroesForList ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Mobile Legends Heroes',
        description: 'Complete list of all Mobile Legends heroes with roles, lanes and stats.',
        url: heroListUrl,
        numberOfItems: heroesForList.length,
        itemListElement: heroesForList.map((h, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: h.name,
          url: `https://mobawiki.com/${hgid}/heroes/${heroToSlug(h.name)}`,
        })),
      } : null;
      html = injectMeta(html, {
        title: 'Heroes',
        description: `All ${heroesForList ? heroesForList.length + ' ' : ''}Mobile Legends heroes — roles, lanes, skills, win rates and guides. Browse every MLBB hero by role or attribute.`,
        canonical: heroListUrl,
        lang,
        jsonLd: itemListJsonLd ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
              { '@type': 'ListItem', position: 2, name: 'Heroes', item: heroListUrl },
            ],
          },
          itemListJsonLd,
        ] : undefined,
      });
      return res.send(html);
    }

    // /:gameId/items
    if (url.match(/^\/\d+\/items/)) {
      html = injectMeta(html, {
        title: 'Items',
        description: 'All Mobile Legends items for 2026 — stats, effects, tier list and best builds. Find the strongest items for every hero role.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      return res.send(html);
    }

    // /:gameId/patches/:version
    const patchVersionMatch = url.match(/^\/(\d+)\/patches\/([^/]+)$/);
    if (patchVersionMatch) {
      const [, , version] = patchVersionMatch;
      html = injectMeta(html, {
        title: `Patch ${version}`,
        description: `Mobile Legends patch ${version} notes — hero buffs, nerfs, item changes and new content. Stay up to date with the latest MLBB meta.`,
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      return res.send(html);
    }

    // /:gameId/patches
    if (url.match(/^\/\d+\/patches$/)) {
      html = injectMeta(html, {
        title: 'Patch Notes',
        description: 'Mobile Legends patch notes history — all hero buffs, nerfs and item changes. Track every MLBB update since release.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      return res.send(html);
    }

    // /:gameId/tier-list
    if (url.match(/^\/\d+\/tier-list$/)) {
      const tierYear = new Date().getFullYear();
      const tierUrl = `https://mobawiki.com${url}`;
      html = injectMeta(html, {
        title: `Tier List ${tierYear}`,
        description: `Mobile Legends tier list ${tierYear} — best heroes ranked S/A/B/C by win rate, ban rate and current meta. Updated daily for Mythic rank.`,
        canonical: tierUrl,
        lang,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
              { '@type': 'ListItem', position: 2, name: `Tier List ${tierYear}`, item: tierUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Mobile Legends Tier List ${tierYear}`,
            description: `Mobile Legends tier list ${tierYear} — best heroes ranked by win rate and current meta.`,
            url: tierUrl,
            publisher: { '@type': 'Organization', name: 'MOBA Wiki', url: 'https://mobawiki.com' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `What is the best hero in Mobile Legends in ${tierYear}?`,
                acceptedAnswer: { '@type': 'Answer', text: `The best heroes change with each patch. Check our S-tier list on MOBA Wiki — updated daily based on Mythic rank win rates at mobawiki.com.` },
              },
              {
                '@type': 'Question',
                name: 'How often is the MLBB tier list updated?',
                acceptedAnswer: { '@type': 'Answer', text: 'The MOBA Wiki tier list is updated daily, reflecting the latest Mythic rank statistics and patch changes.' },
              },
              {
                '@type': 'Question',
                name: 'What makes a hero S tier in Mobile Legends?',
                acceptedAnswer: { '@type': 'Answer', text: 'S tier heroes typically have win rates above 52%, high ban rates, and are dominant in the current meta. They are consistently strong across most game situations.' },
              },
            ],
          },
        ],
      });
      return res.send(html);
    }

    // /:gameId/counter-pick
    if (url.match(/^\/\d+\/counter-pick$/)) {
      const cpUrl = `https://mobawiki.com${url}`;
      html = injectMeta(html, {
        title: 'Counter Pick',
        description: 'Mobile Legends counter pick tool — find the best heroes to counter your enemies. Check counters and synergies for every MLBB hero.',
        canonical: cpUrl,
        lang,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
              { '@type': 'ListItem', position: 2, name: 'Counter Pick', item: cpUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Mobile Legends Counter Pick Tool',
            description: 'Find the best hero to counter your opponents in Mobile Legends.',
            url: cpUrl,
            applicationCategory: 'GameApplication',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How do I counter pick in Mobile Legends?',
                acceptedAnswer: { '@type': 'Answer', text: 'Use our MLBB counter pick tool — select any hero to instantly see which heroes counter them and which synergize with them. Available at mobawiki.com.' },
              },
              {
                '@type': 'Question',
                name: 'What hero counters most assassins in Mobile Legends?',
                acceptedAnswer: { '@type': 'Answer', text: 'Tanks and fighters with crowd control abilities like Khufra, Jawhead, and Chou are strong counters to most assassins in Mobile Legends.' },
              },
            ],
          },
        ],
      });
      return res.send(html);
    }

    // /:gameId/hero-ranks
    if (url.match(/^\/\d+\/hero-ranks$/)) {
      const rankYear = new Date().getFullYear();
      const rankUrl = `https://mobawiki.com${url}`;
      html = injectMeta(html, {
        title: 'Hero Rankings',
        description: `Mobile Legends hero rankings ${rankYear} — win rate, pick rate and ban rate for all heroes. Real-time Mythic rank statistics updated daily.`,
        canonical: rankUrl,
        lang,
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
              { '@type': 'ListItem', position: 2, name: 'Hero Rankings', item: rankUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Mobile Legends Hero Rankings ${rankYear}`,
            description: `Win rate, pick rate and ban rate for all Mobile Legends heroes in ${rankYear}.`,
            url: rankUrl,
            publisher: { '@type': 'Organization', name: 'MOBA Wiki', url: 'https://mobawiki.com' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `Which Mobile Legends hero has the highest win rate in ${rankYear}?`,
                acceptedAnswer: { '@type': 'Answer', text: `Hero win rates change daily. Check our live hero rankings at mobawiki.com — updated every day with real Mythic rank data.` },
              },
              {
                '@type': 'Question',
                name: 'What is the current Mobile Legends meta?',
                acceptedAnswer: { '@type': 'Answer', text: 'The current MLBB meta is reflected in hero win rates, pick rates and ban rates. High win rate + high ban rate heroes define the meta. See the full breakdown on MOBA Wiki.' },
              },
              {
                '@type': 'Question',
                name: 'How is Mobile Legends win rate calculated?',
                acceptedAnswer: { '@type': 'Answer', text: 'Win rate is the percentage of games a hero wins out of all games played. MOBA Wiki shows win rates from Mythic rank games for the most accurate competitive data.' },
              },
            ],
          },
        ],
      });
      return res.send(html);
    }

    // /:gameId/emblems
    if (url.match(/^\/\d+\/emblems$/)) {
      html = injectMeta(html, {
        title: 'Emblems',
        description: 'All Mobile Legends emblems and talents — find the best emblem setup for your hero role. Complete MLBB emblem guide.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      return res.send(html);
    }

    // /:gameId/spells
    if (url.match(/^\/\d+\/spells$/)) {
      html = injectMeta(html, {
        title: 'Battle Spells',
        description: 'All Mobile Legends battle spells — cooldowns, effects and best picks for every hero role. MLBB spell guide.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      return res.send(html);
    }

  } catch (e) {
    // fallback to default html
  }

  // Unknown route — could be 404, mark noindex
  const knownRoutes = /^\/(\d+\/(heroes|items|patches|tier-list|counter-pick|hero-ranks|emblems|spells)|legal|$)/;
  if (!knownRoutes.test(url.slice(1))) {
    html = html.replace(
      /(<meta name="robots" content=")[^"]*(")/,
      '$1noindex, nofollow$2'
    );
  }

  res.setHeader('Cache-Control', 'no-cache');
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  preloadCache();
});
