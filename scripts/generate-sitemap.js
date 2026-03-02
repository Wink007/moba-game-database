#!/usr/bin/env node
/**
 * Generates public/sitemap.xml by fetching games + heroes from the API.
 * Run automatically as part of `npm run build` via the prebuild hook.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mobawiki.com';
const API_URL = 'https://web-production-8570.up.railway.app/api';
const OUTPUT = path.join(__dirname, '../public/sitemap.xml');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function loc(url, priority = '0.7', changefreq = 'weekly') {
  return `  <url>\n    <loc>${url}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function generate() {
  console.log('[sitemap] Fetching games...');
  const games = await fetchJSON(`${API_URL}/games`);

  const urls = [];

  // Static pages
  urls.push(loc(`${BASE_URL}/`, '1.0', 'daily'));
  urls.push(loc(`${BASE_URL}/legal`, '0.3', 'monthly'));

  for (const game of games) {
    const gid = game.id;
    const prefix = `${BASE_URL}/${gid}`;

    // Section pages
    urls.push(loc(`${prefix}/heroes`,     '0.9', 'daily'));
    urls.push(loc(`${prefix}/hero-ranks`, '0.8', 'weekly'));
    urls.push(loc(`${prefix}/items`,      '0.7', 'weekly'));
    urls.push(loc(`${prefix}/emblems`,    '0.7', 'weekly'));
    urls.push(loc(`${prefix}/spells`,     '0.7', 'weekly'));
    urls.push(loc(`${prefix}/patches`,    '0.8', 'weekly'));
    urls.push(loc(`${prefix}/counter-pick`, '0.8', 'weekly'));
    urls.push(loc(`${prefix}/tier-list`,  '0.8', 'weekly'));

    // Hero detail pages (only for games that have heroes in our DB)
    try {
      console.log(`[sitemap] Fetching heroes for game ${gid} (${game.name})...`);
      const heroes = await fetchJSON(`${API_URL}/heroes?game_id=${gid}&lang=en`);
      for (const hero of heroes) {
        urls.push(loc(`${prefix}/heroes/${hero.id}`, '0.85', 'weekly'));
      }
      console.log(`[sitemap]   → ${heroes.length} heroes`);
    } catch (e) {
      console.warn(`[sitemap]   → no heroes for game ${gid}: ${e.message}`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(OUTPUT, xml, 'utf8');
  console.log(`[sitemap] Done — ${urls.length} URLs written to ${OUTPUT}`);
}

generate().catch(err => {
  console.error('[sitemap] ERROR:', err.message);
  process.exit(1);
});
