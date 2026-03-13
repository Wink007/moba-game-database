const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = 'https://web-production-8570.up.railway.app/api';
const BUILD_DIR = path.join(__dirname, 'build');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
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

function heroToSlug(name) {
  return name
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function injectMeta(html, { title, description, image, canonical }) {
  const fullTitle = title ? `${title} | MOBA Wiki` : 'Wiki for Mobile Legends (Unofficial)';
  const desc = description || 'Unofficial fan-made guide for Mobile Legends. Heroes stats, builds, rankings, items and more. Not affiliated with Moonton.';
  const img = image || 'https://mobawiki.com/logo512.png';
  const canon = canonical || 'https://mobawiki.com/';

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,  `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${fullTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${desc}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,  `$1${img}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,  `$1${canon}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,  `$1${canon}$2`);
}

// Serve static assets (js, css, images etc.) directly — no meta injection needed
app.use(express.static(BUILD_DIR, { index: false }));

// All HTML routes go through meta injection
app.get('/{*path}', async (req, res) => {
  const htmlPath = path.join(BUILD_DIR, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  const url = req.path;

  try {
    // /:gameId/heroes/:heroSlug
    const heroMatch = url.match(/^\/(\d+)\/heroes\/([^/]+)$/);
    if (heroMatch) {
      const [, gameId, heroSlug] = heroMatch;
      const heroes = await fetchJSON(`${API_URL}/heroes?game_id=${gameId}&lang=en`);
      if (heroes) {
        const hero = heroes.find(h => heroToSlug(h.name) === heroSlug);
        if (hero) {
          html = injectMeta(html, {
            title: `${hero.name} — Hero Guide`,
            description: `${hero.name} guide for Mobile Legends — skills, builds, counters, synergies and stats.`,
            image: hero.image || undefined,
            canonical: `https://mobawiki.com${url}`,
          });
        }
      }
      return res.send(html);
    }

    // /:gameId/heroes
    const heroesMatch = url.match(/^\/(\d+)\/heroes$/);
    if (heroesMatch) {
      html = injectMeta(html, {
        title: 'Heroes',
        description: 'All Mobile Legends heroes — stats, roles, lanes, builds and guides.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/items
    if (url.match(/^\/\d+\/items/)) {
      html = injectMeta(html, {
        title: 'Items',
        description: 'All Mobile Legends items — stats, effects, and builds.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/patches/:version
    const patchVersionMatch = url.match(/^\/(\d+)\/patches\/([^/]+)$/);
    if (patchVersionMatch) {
      const [, , version] = patchVersionMatch;
      html = injectMeta(html, {
        title: `Patch ${version}`,
        description: `Mobile Legends patch ${version} — hero changes, item updates and new content.`,
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/patches
    if (url.match(/^\/\d+\/patches$/)) {
      html = injectMeta(html, {
        title: 'Patch Notes',
        description: 'Mobile Legends patch notes history — all hero and item changes.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/tier-list
    if (url.match(/^\/\d+\/tier-list$/)) {
      html = injectMeta(html, {
        title: 'Tier List',
        description: 'Mobile Legends tier list — best heroes ranked by win rate and performance.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/counter-pick
    if (url.match(/^\/\d+\/counter-pick$/)) {
      html = injectMeta(html, {
        title: 'Counter Pick',
        description: 'Mobile Legends counter pick tool — find the best hero to counter your opponents.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/hero-ranks
    if (url.match(/^\/\d+\/hero-ranks$/)) {
      html = injectMeta(html, {
        title: 'Hero Ranks',
        description: 'Mobile Legends hero rank statistics — win rate, pick rate and ban rate.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/emblems
    if (url.match(/^\/\d+\/emblems$/)) {
      html = injectMeta(html, {
        title: 'Emblems',
        description: 'All Mobile Legends emblems and talents — find the best emblem setup for your hero.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

    // /:gameId/spells
    if (url.match(/^\/\d+\/spells$/)) {
      html = injectMeta(html, {
        title: 'Battle Spells',
        description: 'All Mobile Legends battle spells — cooldowns, effects and unlock levels.',
        canonical: `https://mobawiki.com${url}`,
      });
      return res.send(html);
    }

  } catch (e) {
    // fallback to default html
  }

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
