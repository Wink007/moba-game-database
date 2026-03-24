#!/usr/bin/env node
/**
 * Prebuild script — runs before `react-scripts build`:
 *  1. Generates public/sitemap.xml (165 URLs)
 *  2. Generates public/games-data.js (window.__GAMES_DATA__)
 *     → eliminates API waterfall for LCP on first visit
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mobawiki.com';
const API_URL = 'https://web-production-8570.up.railway.app/api';
const OUTPUT = path.join(__dirname, '../public/sitemap.xml');
const GAMES_DATA_OUTPUT = path.join(__dirname, '../public/games-data.js');

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

function loc(url, priority = '0.7', changefreq = 'weekly', lastmod = null, hreflang = true, imageUrl = null, imageTitle = null) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  const hreflangTags = hreflang ? `
    <xhtml:link rel="alternate" hreflang="en" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="uk" href="${url}?lang=uk"/>
    <xhtml:link rel="alternate" hreflang="id" href="${url}?lang=id"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>` : '';
  const imageTag = imageUrl ? `\n    <image:image>\n      <image:loc>${imageUrl}</image:loc>${imageTitle ? `\n      <image:title>${imageTitle}</image:title>` : ''}\n    </image:image>` : '';
  return `  <url>\n    <loc>${url}</loc>${lastmodTag}${hreflangTags}${imageTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function heroToSlug(name) {
  return name
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generate() {
  console.log('[sitemap] Fetching games...');
  const games = await fetchJSON(`${API_URL}/games`);

  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Static pages
  urls.push(loc(`${BASE_URL}/`, '1.0', 'daily', today));
  urls.push(loc(`${BASE_URL}/legal`, '0.3', 'monthly', null, false));

  for (const game of games.filter(g => g.id === 2)) {
    const gid = game.id;
    const prefix = `${BASE_URL}/${gid}`;

    // Section pages
    urls.push(loc(`${prefix}/heroes`,     '0.9', 'daily', today));
    urls.push(loc(`${prefix}/hero-ranks`, '0.8', 'daily', today));
    urls.push(loc(`${prefix}/items`,      '0.7', 'weekly'));
    urls.push(loc(`${prefix}/emblems`,    '0.7', 'weekly'));
    urls.push(loc(`${prefix}/spells`,     '0.7', 'weekly'));
    urls.push(loc(`${prefix}/patches`,    '0.8', 'weekly', today));
    urls.push(loc(`${prefix}/counter-pick`, '0.8', 'weekly'));
    urls.push(loc(`${prefix}/tier-list`,  '0.8', 'daily', today));

    // Role landing pages
    for (const role of ['fighter', 'mage', 'marksman', 'tank', 'support', 'assassin']) {
      urls.push(loc(`${prefix}/heroes?role=${role}`, '0.8', 'daily', today, false));
    }
    // Lane landing pages
    for (const lane of ['Jungle', 'Exp+Lane', 'Gold+Lane', 'Mid+Lane', 'Roam']) {
      urls.push(loc(`${prefix}/heroes?lane=${lane}`, '0.8', 'daily', today, false));
    }

    // Hero detail pages (only for games that have heroes in our DB)
    try {
      console.log(`[sitemap] Fetching heroes for game ${gid} (${game.name})...`);
      const heroes = await fetchJSON(`${API_URL}/heroes?game_id=${gid}&lang=en`);
      for (const hero of heroes) {
        const imageUrl = hero.head || hero.image || null;
        urls.push(loc(`${prefix}/heroes/${heroToSlug(hero.name)}`, '0.85', 'weekly', null, true, imageUrl, hero.name));
      }
      console.log(`[sitemap]   → ${heroes.length} heroes`);
    } catch (e) {
      console.warn(`[sitemap]   → no heroes for game ${gid}: ${e.message}`);
    }

    // Patch detail pages (only for primary game — MLBB)
    if (gid === 2) {
      try {
        console.log(`[sitemap] Fetching patches...`);
        const patches = await fetchJSON(`${API_URL}/patches?minimal=true`);
        for (const patch of patches) {
          urls.push(loc(
            `${prefix}/patches/${patch.version}`,
            '0.7',
            'monthly',
            patch.release_date || null
          ));
        }
        console.log(`[sitemap]   → ${patches.length} patches`);
      } catch (e) {
        console.warn(`[sitemap]   → no patches: ${e.message}`);
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(OUTPUT, xml, 'utf8');
  console.log(`[sitemap] Done — ${urls.length} URLs written to ${OUTPUT}`);

  // ── Generate games-data.js ──────────────────────────────────────────────
  // Strips heavy fields (hero_schema, skill_schema, background_image) — only
  // what VideoPreview + useGameStore need for LCP: id, name, preview,
  // video_intro, subtitle, icon.
  // Only include games that are fully supported in the app
  const slim = games.filter(g => g.id === 2).map(g => ({
    id: g.id,
    name: g.name,
    preview: g.preview,
    video_intro: g.video_intro,
    subtitle: g.subtitle,
    icon: g.icon,
    genre: g.genre,
    description: g.description,
  }));

  const gamesDataJs = `/* AUTO-GENERATED by scripts/generate-sitemap.js — do not edit */
window.__GAMES_DATA__ = ${JSON.stringify(slim)};
`;
  fs.writeFileSync(GAMES_DATA_OUTPUT, gamesDataJs, 'utf8');
  console.log(`[games-data] Done — ${slim.length} games written to ${GAMES_DATA_OUTPUT}`);
}

generate().catch(err => {
  console.error('[sitemap] ERROR:', err.message);
  process.exit(1);
});
