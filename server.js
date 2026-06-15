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

// Escape HTML special characters to prevent XSS in server-injected content
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Inject static SEO content before the React root div.
// Content is visible in the raw HTML so crawlers index it on the first pass.
// An inline script hides it immediately so users only see the React-rendered UI.
// Same data as React renders — no cloaking.
function injectSeoContent(html, content) {
  const hideScript = `<script>try{document.getElementById('seo-prerender').style.display='none';}catch(e){}<\/script>`;
  const div = `<div id="seo-prerender">${content}</div>${hideScript}`;
  return html.replace('<div id="root"></div>', `${div}<div id="root"></div>`);
}

// Build static HTML for the home page (first-pass crawler indexing)
function buildHomeContent(heroCount) {
  const year = new Date().getFullYear();
  const count = heroCount || '120+';
  let html = `<article>`;
  html += `<h1>MOBA Wiki — Mobile Legends: Bang Bang Unofficial Guide</h1>`;
  html += `<p>MOBA Wiki is a free, fan-made reference database for Mobile Legends: Bang Bang players at every skill level. Whether you are a newcomer learning the basics or a Mythic-rank veteran looking for a competitive edge, MOBA Wiki has the data you need — hero guides, tier lists, counter picks, item builds and ranked statistics, all updated daily.</p>`;

  html += `<section><h2>What You'll Find on MOBA Wiki</h2><ul>`;
  html += `<li><strong>Hero Database</strong> — Detailed guides for all ${count} Mobile Legends heroes with base stats, skill descriptions, recommended builds, roles and lanes.</li>`;
  html += `<li><strong>Tier List ${year}</strong> — Heroes ranked S through D by win rate, updated daily from real Mythic rank match data. Pure statistics, no personal opinions.</li>`;
  html += `<li><strong>Counter Pick Tool</strong> — Find the best hero to counter any matchup. Know who your enemies are weak against before the game starts.</li>`;
  html += `<li><strong>Win Rate Statistics</strong> — Pick rate, ban rate and win rate for every hero, updated every 24 hours with the latest Mythic rank data.</li>`;
  html += `<li><strong>Item Database</strong> — Full stats and effects for every item in the game, searchable and filterable by type, stat and use case.</li>`;
  html += `<li><strong>Patch Notes Archive</strong> — Every balance change in Mobile Legends history in one searchable archive. Track every hero buff, nerf and item change over time.</li>`;
  html += `</ul></section>`;

  html += `<section><h2>Why Use MOBA Wiki?</h2>`;
  html += `<p>Mobile Legends: Bang Bang is one of the most popular mobile MOBAs worldwide, with over 100 million registered players. Keeping up with the meta, new hero releases and constant balance patches can be overwhelming. MOBA Wiki was built by a passionate player who wanted a single, reliable source of truth — bringing hero stats, tier lists, counter data and patch notes together in one place, completely free.</p>`;
  html += `<p>All win rate and ranking statistics are derived exclusively from Mythic rank matches — the highest and most competitive tier in Mobile Legends. This ensures that tier lists and hero rankings reflect the true competitive meta, not casual play averages.</p>`;
  html += `</section>`;

  html += `<section><h2>About Mobile Legends: Bang Bang</h2>`;
  html += `<p>Mobile Legends: Bang Bang (MLBB) is a multiplayer online battle arena (MOBA) game developed and published by Moonton Technology. In each 5v5 match, two teams compete to destroy the enemy base. Players choose from a roster of unique heroes across six roles: Tank, Fighter, Assassin, Mage, Marksman and Support. Each hero has a distinctive set of abilities that define their playstyle, strengths and role in team fights.</p>`;
  html += `<p>The game features a ranked ladder from Warrior to Mythic Glory, with Mythic being the most competitive tier. Balance patches arrive roughly every two weeks, regularly shifting the meta with hero buffs, nerfs and new additions — making up-to-date statistics essential for ranked play.</p>`;
  html += `</section>`;

  html += `<nav><h2>Explore MOBA Wiki</h2><ul>`;
  html += `<li><a href="/2/tier-list">Mobile Legends Tier List ${year}</a></li>`;
  html += `<li><a href="/2/heroes">All MLBB Heroes</a></li>`;
  html += `<li><a href="/2/hero-ranks">Hero Win Rate Rankings</a></li>`;
  html += `<li><a href="/2/counter-pick">Counter Pick Guide</a></li>`;
  html += `<li><a href="/2/items">Items Database</a></li>`;
  html += `<li><a href="/2/patches">Patch Notes</a></li>`;
  html += `<li><a href="/about">About MOBA Wiki</a></li>`;
  html += `</ul></nav>`;

  html += `<p><small>MOBA Wiki is an independent fan project and is not affiliated with or endorsed by Moonton Technology Co., Ltd. All game content, character names, images and trademarks remain the property of their respective owners.</small></p>`;
  html += `</article>`;
  return html;
}

function buildHeroPageContent(hero, heroName, skills, allHeroes, gameId, heroSlug, counterData, compatData, allItems) {
  const roles = Array.isArray(hero.roles) ? hero.roles.join(', ') : (hero.roles || '');
  const lane = Array.isArray(hero.lane) ? hero.lane.join(', ') : (hero.lane || '');
  const specialty = Array.isArray(hero.specialty) ? hero.specialty.join(', ') : (hero.specialty || '');
  const wr = hero.main_hero_win_rate ? parseFloat(hero.main_hero_win_rate).toFixed(1) : null;
  const br = hero.main_hero_ban_rate ? parseFloat(hero.main_hero_ban_rate).toFixed(1) : null;
  const desc = hero.full_description || hero.short_description || '';

  // Helper: resolve hero name by id from allHeroes
  const heroNameById = (id) => {
    const h = Array.isArray(allHeroes) ? allHeroes.find(h => h.id === id) : null;
    return h ? h.name : null;
  };

  let html = `<article>`;
  html += `<h1>${esc(heroName)} Mobile Legends Hero Guide</h1>`;

  const metaItems = [
    roles     && `Role: ${esc(roles)}`,
    lane      && `Lane: ${esc(lane)}`,
    specialty && `Specialty: ${esc(specialty)}`,
    hero.damage_type && `Damage Type: ${esc(hero.damage_type)}`,
    wr        && `Win Rate: ${wr}%`,
    br        && `Ban Rate: ${br}%`,
  ].filter(Boolean);
  if (metaItems.length) {
    html += `<ul>${metaItems.map(m => `<li>${m}</li>`).join('')}</ul>`;
  }

  if (desc) html += `<p>${esc(desc)}</p>`;

  // Meta commentary — unique auto-generated analysis based on real stats
  if (wr) {
    const wrNum = parseFloat(wr);
    const brNum = br ? parseFloat(br) : 0;
    const heroCounter = counterData && counterData[hero.id];
    const heroCompat = compatData && compatData[hero.id];

    // Tier assessment
    let tierLabel, tierContext;
    if (wrNum >= 53) {
      tierLabel = 'S-tier';
      tierContext = `making ${esc(heroName)} one of the strongest picks in the current Mythic meta`;
    } else if (wrNum >= 51) {
      tierLabel = 'A-tier';
      tierContext = `a consistently strong and reliable pick for ranked play`;
    } else if (wrNum >= 49) {
      tierLabel = 'B-tier';
      tierContext = `a viable pick that performs well in the right team composition`;
    } else if (wrNum >= 47) {
      tierLabel = 'C-tier';
      tierContext = `a situational pick that requires specific matchups to perform well`;
    } else {
      tierLabel = 'D-tier';
      tierContext = `currently underperforming in the meta and better options exist in the same role`;
    }

    html += `<section><h2>${esc(heroName)} Meta Analysis</h2>`;
    html += `<p>Based on current Mythic rank data, ${esc(heroName)} holds a <strong>${wr}% win rate</strong>, ${tierContext}. `;
    html += `This places ${esc(heroName)} in the <strong>${tierLabel}</strong> category for the current patch.</p>`;

    // Ban rate commentary
    if (brNum >= 20) {
      html += `<p>With a <strong>${br}% ban rate</strong>, ${esc(heroName)} is frequently targeted in draft phase, `;
      html += `which reflects the hero's high impact and threat level in competitive play.</p>`;
    } else if (brNum >= 5) {
      html += `<p>${esc(heroName)} sees a <strong>${br}% ban rate</strong>, indicating moderate threat perception among players at high rank.</p>`;
    }

    // Lane/role context
    if (lane && roles) {
      html += `<p>${esc(heroName)} is typically played as a <strong>${esc(roles)}</strong> in the <strong>${esc(lane)}</strong> lane. `;
      if (hero.damage_type) {
        html += `This hero deals <strong>${esc(hero.damage_type)}</strong> damage`;
        if (hero.specialty) {
          const spec = Array.isArray(hero.specialty) ? hero.specialty.join('/') : hero.specialty;
          html += ` and specializes in <strong>${esc(spec)}</strong>`;
        }
        html += `.`;
      }
      html += `</p>`;
    }

    // Counter matchup summary
    if (heroCounter) {
      const topCounters = (heroCounter.best_counters || []).slice(0, 3)
        .map(c => heroNameById(c.heroid || c.hero_id)).filter(Boolean);
      const topCountered = (heroCounter.most_countered_by || []).slice(0, 3)
        .map(c => heroNameById(c.heroid || c.hero_id)).filter(Boolean);

      if (topCounters.length) {
        html += `<p><strong>How to beat ${esc(heroName)}:</strong> The most effective counters in the current patch are `;
        html += topCounters.map(n => esc(n)).join(', ');
        html += `. These heroes have statistically superior win rates in direct matchups against ${esc(heroName)}.</p>`;
      }
      if (topCountered.length) {
        html += `<p><strong>Who ${esc(heroName)} counters:</strong> ${esc(heroName)} has favorable matchups against `;
        html += topCountered.map(n => esc(n)).join(', ');
        html += `, consistently winning these lanes in the current meta.</p>`;
      }
    }

    // Synergy summary
    if (heroCompat) {
      const topSynergies = (heroCompat.compatible || []).slice(0, 3)
        .map(c => heroNameById(c.heroid || c.hero_id)).filter(Boolean);
      if (topSynergies.length) {
        html += `<p><strong>Best team compositions with ${esc(heroName)}:</strong> `;
        html += `${esc(heroName)} achieves the highest combined win rate when paired with `;
        html += topSynergies.map(n => esc(n)).join(', ');
        html += `. Consider these heroes when drafting a team around ${esc(heroName)}.</p>`;
      }
    }

    html += `</section>`;
  }

  // Skills section
  if (Array.isArray(skills) && skills.length) {
    const mainSkills = skills
      .filter(s => !s.is_transformed)
      .sort((a, b) => ((a.display_order ?? 99) - (b.display_order ?? 99)));
    if (mainSkills.length) {
      html += `<section><h2>${esc(heroName)} Skills</h2><ul>`;
      mainSkills.forEach(s => {
        const sName = s.skill_name || '';
        const sDesc = s.skill_description || '';
        const sType = s.skill_type === 'passive' ? ' (Passive)' : '';
        html += `<li><strong>${esc(sName)}${sType}</strong>`;
        if (sDesc) html += `: ${esc(sDesc)}`;
        html += `</li>`;
      });
      html += `</ul></section>`;
    }
  }

  // Counters section
  const heroCounter = counterData && counterData[hero.id];
  if (heroCounter) {
    const bestCounters = (heroCounter.best_counters || []).slice(0, 5);
    const mostCounteredBy = (heroCounter.most_countered_by || []).slice(0, 5);

    if (bestCounters.length) {
      html += `<section><h2>Best Counters for ${esc(heroName)}</h2>`;
      html += `<p>These heroes have the highest win rate when playing against ${esc(heroName)} in Mobile Legends:</p><ul>`;
      bestCounters.forEach(c => {
        const cName = heroNameById(c.heroid || c.hero_id);
        if (!cName) return;
        const cWr = c.win_rate ? parseFloat(c.win_rate).toFixed(1) : null;
        const slug = heroToSlug(cName);
        html += `<li><a href="/${gameId}/heroes/${slug}">${esc(cName)}</a>`;
        if (cWr) html += ` — ${cWr}% win rate vs ${esc(heroName)}`;
        html += `</li>`;
      });
      html += `</ul></section>`;
    }

    if (mostCounteredBy.length) {
      html += `<section><h2>Heroes ${esc(heroName)} Counters</h2>`;
      html += `<p>${esc(heroName)} is strong against these heroes in Mobile Legends:</p><ul>`;
      mostCounteredBy.forEach(c => {
        const cName = heroNameById(c.heroid || c.hero_id);
        if (!cName) return;
        const slug = heroToSlug(cName);
        html += `<li><a href="/${gameId}/heroes/${slug}">${esc(cName)}</a></li>`;
      });
      html += `</ul></section>`;
    }
  }

  // Synergies section
  const heroCompat = compatData && compatData[hero.id];
  if (heroCompat) {
    const compatible = (heroCompat.compatible || []).slice(0, 5);
    if (compatible.length) {
      html += `<section><h2>Best Team Synergies with ${esc(heroName)}</h2>`;
      html += `<p>These heroes work best alongside ${esc(heroName)} in Mobile Legends team compositions:</p><ul>`;
      compatible.forEach(c => {
        const cName = heroNameById(c.heroid || c.hero_id);
        if (!cName) return;
        const cWr = c.win_rate ? parseFloat(c.win_rate).toFixed(1) : null;
        const slug = heroToSlug(cName);
        html += `<li><a href="/${gameId}/heroes/${slug}">${esc(cName)}</a>`;
        if (cWr) html += ` — ${cWr}% combined win rate`;
        html += `</li>`;
      });
      html += `</ul></section>`;
    }
  }

  // Pro builds section
  const proBuilds = Array.isArray(hero.pro_builds) ? hero.pro_builds : [];
  if (proBuilds.length && Array.isArray(allItems) && allItems.length) {
    const itemsById = new Map();
    allItems.forEach(it => { if (it && it.id) itemsById.set(it.id, it.name || ''); });
    html += `<section><h2>Recommended Builds for ${esc(heroName)}</h2>`;
    html += `<p>Top item builds for ${esc(heroName)} in Mobile Legends based on win rate and pro player usage:</p>`;
    proBuilds.slice(0, 5).forEach((build, idx) => {
      const coreNames = (build.core_items || []).map(id => itemsById.get(id)).filter(Boolean);
      const optNames  = (build.optional_items || []).map(id => itemsById.get(id)).filter(Boolean);
      if (!coreNames.length) return;
      html += `<div><strong>Build ${idx + 1}</strong>: `;
      html += coreNames.map(n => esc(n)).join(' → ');
      if (optNames.length) html += ` | Optional: ${optNames.map(n => esc(n)).join(', ')}`;
      html += `</div>`;
    });
    html += `</section>`;
  }

  // Internal links for Google to discover all hero pages
  if (Array.isArray(allHeroes) && allHeroes.length) {
    const others = allHeroes
      .filter(h => heroToSlug(h.name) !== heroSlug)
      .slice(0, 30);
    if (others.length) {
      html += `<nav><h2>Other Mobile Legends Heroes</h2><ul>`;
      others.forEach(h => {
        html += `<li><a href="/${gameId}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a></li>`;
      });
      html += `</ul></nav>`;
    }
  }

  html += `</article>`;
  return html;
}

// Assign tier based on win rate (mirrors TierListPage/constants.ts)
function assignTier(winRate) {
  if (winRate >= 53) return 'S';
  if (winRate >= 51) return 'A';
  if (winRate >= 49) return 'B';
  if (winRate >= 47) return 'C';
  return 'D';
}

// Build static HTML for the tier list page
function buildTierListContent(heroRanks, gameId) {
  const tierYear = new Date().getFullYear();
  const groups = { S: [], A: [], B: [], C: [], D: [] };
  heroRanks.forEach(h => {
    const wr = typeof h.win_rate === 'number' ? h.win_rate * (h.win_rate <= 1 ? 100 : 1) : 0;
    const tier = assignTier(wr);
    groups[tier].push({ ...h, wr });
  });

  let html = `<article>`;
  html += `<h1>Mobile Legends Tier List ${tierYear}</h1>`;
  html += `<p>Best heroes ranked S to D based on win rate statistics. Updated daily for Mythic rank.</p>`;
  html += `<ul><li>S Tier: Win Rate ≥ 53% — Dominant, must-pick or ban</li>`;
  html += `<li>A Tier: Win Rate ≥ 51% — Strong, consistent performers</li>`;
  html += `<li>B Tier: Win Rate ≥ 49% — Average, viable in most situations</li>`;
  html += `<li>C Tier: Win Rate ≥ 47% — Situational</li>`;
  html += `<li>D Tier: Below 47% — Weak in current meta</li></ul>`;

  for (const tier of ['S', 'A', 'B', 'C', 'D']) {
    const heroes = groups[tier];
    if (!heroes.length) continue;
    html += `<section><h2>${tier} Tier Mobile Legends Heroes</h2><ul>`;
    heroes
      .sort((a, b) => b.wr - a.wr)
      .forEach(h => {
        const roles = Array.isArray(h.roles) ? h.roles.join(', ') : '';
        html += `<li><a href="/${gameId}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a>`;
        if (roles)  html += ` — ${esc(roles)}`;
        html += ` — Win Rate: ${h.wr.toFixed(2)}%`;
        html += `</li>`;
      });
    html += `</ul></section>`;
  }

  html += `</article>`;
  return html;
}

// Build static HTML for the hero ranks page
function buildHeroRanksContent(heroRanks, gameId) {
  const rankYear = new Date().getFullYear();
  let html = `<article>`;
  html += `<h1>Mobile Legends Hero Rankings ${rankYear}</h1>`;
  html += `<p>Win rate, pick rate and ban rate for all ${heroRanks.length} Mobile Legends heroes. Updated daily with Mythic rank data.</p>`;
  html += `<table><thead><tr><th>#</th><th>Hero</th><th>Win Rate</th><th>Pick Rate</th><th>Ban Rate</th></tr></thead><tbody>`;

  heroRanks
    .slice(0, 100)
    .forEach((h, i) => {
      const wr = typeof h.win_rate === 'number'     ? (h.win_rate <= 1 ? h.win_rate * 100 : h.win_rate)         : 0;
      const pr = typeof h.appearance_rate === 'number' ? (h.appearance_rate <= 1 ? h.appearance_rate * 100 : h.appearance_rate) : 0;
      const br = typeof h.ban_rate === 'number'     ? (h.ban_rate <= 1 ? h.ban_rate * 100 : h.ban_rate)         : 0;
      html += `<tr>`;
      html += `<td>${i + 1}</td>`;
      html += `<td><a href="/${gameId}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a></td>`;
      html += `<td>${wr.toFixed(2)}%</td>`;
      html += `<td>${pr.toFixed(2)}%</td>`;
      html += `<td>${br.toFixed(2)}%</td>`;
      html += `</tr>`;
    });

  html += `</tbody></table></article>`;
  return html;
}

// Build static HTML for a role/lane/specialty filtered heroes page
function buildRolePageContent(heroes, gameId, filterType, filterValue) {
  const year = new Date().getFullYear();
  const label = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
  const filterLabel = filterType === 'role' ? 'Role' : filterType === 'lane' ? 'Lane' : 'Specialty';
  const sorted = [...heroes].sort((a, b) => (parseFloat(b.main_hero_win_rate) || 0) - (parseFloat(a.main_hero_win_rate) || 0));

  let html = `<article>`;
  html += `<h1>Best ${esc(label)} Heroes in Mobile Legends ${year}</h1>`;
  html += `<p>${sorted.length} ${esc(label)} heroes ranked by win rate in Mobile Legends ${year}. Updated daily with Mythic rank data.</p>`;
  html += `<ul>`;
  sorted.forEach((h, i) => {
    const wr = h.main_hero_win_rate ? ` — Win Rate ${parseFloat(h.main_hero_win_rate).toFixed(1)}%` : '';
    const lane = Array.isArray(h.lane) ? h.lane.join('/') : (h.lane || '');
    html += `<li><a href="/${gameId}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a>`;
    if (wr) html += esc(wr);
    if (lane) html += ` (${esc(lane)} lane)`;
    html += `</li>`;
  });
  html += `</ul>`;
  html += `<p>Browse all <a href="/${gameId}/heroes">Mobile Legends heroes</a> or check the <a href="/${gameId}/tier-list">tier list</a> for ranking details.</p>`;
  html += `</article>`;
  return html;
}

// Build static HTML for the heroes list page
function buildHeroListContent(heroes, gameId) {
  let html = `<article>`;
  html += `<h1>All Mobile Legends Heroes</h1>`;
  html += `<p>Complete list of ${heroes.length} Mobile Legends heroes with roles, lanes and win rates.</p>`;
  html += `<ul>`;
  heroes.forEach(h => {
    const roles = Array.isArray(h.roles) ? h.roles.join(', ') : (h.roles || '');
    const wr = h.main_hero_win_rate ? ` — Win Rate ${parseFloat(h.main_hero_win_rate).toFixed(1)}%` : '';
    html += `<li><a href="/${gameId}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a>`;
    if (roles) html += ` (${esc(roles)})`;
    if (wr) html += esc(wr);
    html += `</li>`;
  });
  html += `</ul></article>`;
  return html;
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
    const script = `<script id="__ld-json__" type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
    result = result.replace('</head>', `${script}</head>`);
  }

  return result;
}

function buildHeroFAQ(hero, heroName, counterData, compatData, allHeroes) {
  // Helper: resolve hero name by id
  const nameById = (id) => {
    const h = Array.isArray(allHeroes) ? allHeroes.find(h => h.id === id) : null;
    return h ? h.name : null;
  };

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

  // Counter FAQ from real data
  const heroCounter = counterData && counterData[hero.id];
  if (heroCounter) {
    const counters = (heroCounter.best_counters || []).slice(0, 3)
      .map(c => nameById(c.heroid || c.hero_id)).filter(Boolean);
    if (counters.length) {
      faq.push({
        '@type': 'Question',
        name: `Who counters ${heroName} in Mobile Legends?`,
        acceptedAnswer: { '@type': 'Answer', text: `The best counters for ${heroName} in Mobile Legends are ${counters.join(', ')}. These heroes have the highest win rate when facing ${heroName} in the current meta.` },
      });
    }
    const countered = (heroCounter.most_countered_by || []).slice(0, 3)
      .map(c => nameById(c.heroid || c.hero_id)).filter(Boolean);
    if (countered.length) {
      faq.push({
        '@type': 'Question',
        name: `Who does ${heroName} counter in Mobile Legends?`,
        acceptedAnswer: { '@type': 'Answer', text: `${heroName} is strong against ${countered.join(', ')} in Mobile Legends.` },
      });
    }
  }

  // Synergy FAQ from real data
  const heroCompat = compatData && compatData[hero.id];
  if (heroCompat) {
    const synergies = (heroCompat.compatible || []).slice(0, 3)
      .map(c => nameById(c.heroid || c.hero_id)).filter(Boolean);
    if (synergies.length) {
      faq.push({
        '@type': 'Question',
        name: `Who works best with ${heroName} in Mobile Legends?`,
        acceptedAnswer: { '@type': 'Answer', text: `${heroName} has the best synergy with ${synergies.join(', ')} in Mobile Legends team compositions.` },
      });
    }
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
    // Redirect any non-canonical gameId to /2/... (prevents duplicate-content indexing)
    const wrongGameId = url.match(/^\/(\d+)\//);
    if (wrongGameId && wrongGameId[1] !== '2') {
      const qs = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
      return res.redirect(301, url.replace(/^\/\d+\//, '/2/') + qs);
    }

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
      const homeHeroes = await cachedFetch(`${API_URL}/heroes?game_id=2&lang=en`);
      html = injectSeoContent(html, buildHomeContent(homeHeroes ? homeHeroes.length : null));
      return res.send(html);
    }

    // /:gameId/heroes/:heroSlug
    const heroMatch = url.match(/^\/(\d+)\/heroes\/([^/]+)$/);
    if (heroMatch) {
      const [, gameId, heroSlug] = heroMatch;
      const heroes = await cachedFetch(`${API_URL}/heroes?game_id=${gameId}&lang=en`);
      // Redirect numeric ID to slug (e.g. /2/heroes/77 → /2/heroes/ruby)
      if (heroes && /^\d+$/.test(heroSlug)) {
        const heroById = heroes.find(h => String(h.id) === heroSlug || String(h.hero_game_id) === heroSlug);
        if (heroById) {
          return res.redirect(301, `/${gameId}/heroes/${heroToSlug(heroById.name)}`);
        }
        return res.status(404).send('Not found');
      }
      if (heroes) {
        const hero = heroes.find(h => heroToSlug(h.name) === heroSlug);
        if (hero) {
          const isUk = lang === 'uk';
          const heroName = (isUk && hero.name_uk) ? hero.name_uk : hero.name;
          const shortDesc = (isUk && hero.short_description_uk) ? hero.short_description_uk : (hero.short_description || '');
          const heroImg = hero.image || hero.head || undefined;
          const heroUrl = `https://mobawiki.com${url}`;

          // Fetch all enrichment data before building meta
          const [skills, counterData, compatData, allItems] = await Promise.all([
            cachedFetch(`${API_URL}/heroes/${hero.id}/skills`),
            cachedFetch(`${API_URL}/heroes/counter-data?game_id=${gameId}&rank=all&days=7`),
            cachedFetch(`${API_URL}/heroes/compatibility-data?game_id=${gameId}&rank=all&days=7`),
            cachedFetch(`${API_URL}/items?game_id=${gameId}&lang=en`),
          ]);

          // Build dynamic description with real counter/synergy names
          const heroCounter = counterData && counterData[hero.id];
          const heroCompat = compatData && compatData[hero.id];
          const nameById = (id) => { const h = heroes.find(h => h.id === id); return h ? h.name : null; };
          const wr = hero.main_hero_win_rate ? parseFloat(hero.main_hero_win_rate).toFixed(1) : null;
          const counterNames = heroCounter
            ? (heroCounter.best_counters || []).slice(0, 3).map(c => nameById(c.heroid || c.hero_id)).filter(Boolean)
            : [];
          const synergyNames = heroCompat
            ? (heroCompat.compatible || []).slice(0, 3).map(c => nameById(c.heroid || c.hero_id)).filter(Boolean)
            : [];
          const descParts = [`${heroName} guide MLBB 2026`];
          if (wr) descParts.push(`Win Rate ${wr}%`);
          if (counterNames.length) descParts.push(`Countered by: ${counterNames.join(', ')}`);
          if (synergyNames.length) descParts.push(`Best with: ${synergyNames.join(', ')}`);
          if (shortDesc) descParts.push(shortDesc);
          const heroDescription = descParts.join('. ');

          html = injectMeta(html, {
            title: `${heroName} — Hero Guide`,
            description: heroDescription,
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
                description: heroDescription,
                url: heroUrl,
                ...(heroImg ? { image: heroImg } : {}),
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: buildHeroFAQ(hero, heroName, counterData, compatData, heroes),
              },
            ],
          });

          html = injectSeoContent(html, buildHeroPageContent(hero, heroName, skills, heroes, gameId, heroSlug, counterData, compatData, allItems));
        }
      }
      return res.send(html);
    }

    // /:gameId/heroes?role=X  or  ?lane=X  or  ?specialty=X — role/lane/specialty landing pages
    const heroesFilterMatch = url.match(/^\/(\d+)\/heroes$/) && (req.query.role || req.query.lane || req.query.specialty);
    if (heroesFilterMatch) {
      const [, hgid] = url.match(/^\/(\d+)\/heroes$/);
      const filterType = req.query.role ? 'role' : req.query.lane ? 'lane' : 'specialty';
      const filterValue = (req.query.role || req.query.lane || req.query.specialty).toLowerCase();
      const label = filterValue.charAt(0).toUpperCase() + filterValue.slice(1);
      const year = new Date().getFullYear();
      const allHeroes = await cachedFetch(`${API_URL}/heroes?game_id=${hgid}&lang=en`);
      const filtered = allHeroes
        ? allHeroes.filter(h => {
            const val = h[filterType === 'role' ? 'roles' : filterType] || [];
            const arr = Array.isArray(val) ? val : [val];
            return arr.some(v => String(v).toLowerCase() === filterValue.toLowerCase());
          })
        : [];
      const canonicalUrl = `https://mobawiki.com/${hgid}/heroes?${filterType}=${filterValue}`;
      html = injectMeta(html, {
        title: `Best ${label} Heroes ${year}`,
        description: `Top ${label} heroes in Mobile Legends ${year} — ranked by win rate. Best MLBB ${label} picks for Mythic rank. Updated daily.`,
        canonical: canonicalUrl,
        lang,
        jsonLd: [{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
            { '@type': 'ListItem', position: 2, name: 'Heroes', item: `https://mobawiki.com/${hgid}/heroes` },
            { '@type': 'ListItem', position: 3, name: `${label} Heroes`, item: canonicalUrl },
          ],
        }],
      });
      if (filtered.length) {
        html = injectSeoContent(html, buildRolePageContent(filtered, hgid, filterType, filterValue));
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

      // Inject static body content for Google first-wave crawl
      if (heroesForList) {
        html = injectSeoContent(html, buildHeroListContent(heroesForList, hgid));
      }
      return res.send(html);
    }

    // /:gameId/items
    if (url.match(/^\/\d+\/items/)) {
      const [, igid] = url.match(/^\/(\d+)\/items/) || [];
      const items = igid ? await cachedFetch(`${API_URL}/items?game_id=${igid}&lang=en`) : null;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(404).send('Not found');
      }
      html = injectMeta(html, {
        title: 'Items',
        description: 'All Mobile Legends items for 2026 — stats, effects, tier list and best builds. Find the strongest items for every hero role.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      if (Array.isArray(items) && items.length) {
        let seoHtml = `<article><h1>All Mobile Legends Items ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Complete list of ${items.length} Mobile Legends items — stats, effects and best builds for every hero role.</p><ul>`;
        items.forEach(it => {
          const desc = it.description ? ` — ${esc(it.description.slice(0, 120))}` : '';
          seoHtml += `<li><strong>${esc(it.name)}</strong>${desc}</li>`;
        });
        seoHtml += `</ul></article>`;
        html = injectSeoContent(html, seoHtml);
      }
      return res.send(html);
    }

    // /about
    if (url === '/about') {
      html = injectMeta(html, {
        title: 'About MOBA Wiki',
        description: 'MOBA Wiki is a free, unofficial fan-made guide for Mobile Legends: Bang Bang. Learn about our mission, features and data sources.',
        canonical: 'https://mobawiki.com/about',
        lang,
      });
      const year = new Date().getFullYear();
      let seoHtml = `<article>`;
      seoHtml += `<h1>About MOBA Wiki — Unofficial Mobile Legends Guide</h1>`;
      seoHtml += `<p>MOBA Wiki is a free, fan-made reference database for Mobile Legends: Bang Bang. We provide hero guides, tier lists, counter picks, item builds and ranked statistics — all updated daily from Mythic rank data.</p>`;
      seoHtml += `<section><h2>What We Offer</h2><ul>`;
      seoHtml += `<li><strong>Hero Database</strong> — Full stats, skills, builds and guides for every MLBB hero.</li>`;
      seoHtml += `<li><strong>Tier List ${year}</strong> — Daily updated hero rankings based on Mythic rank win rates.</li>`;
      seoHtml += `<li><strong>Counter Pick Tool</strong> — Find the best counters and synergies for any hero.</li>`;
      seoHtml += `<li><strong>Item Database</strong> — Complete stats and effects for every item in the game.</li>`;
      seoHtml += `<li><strong>Patch Notes Archive</strong> — Every balance change in Mobile Legends history.</li>`;
      seoHtml += `</ul></section>`;
      seoHtml += `<section><h2>About This Project</h2>`;
      seoHtml += `<p>MOBA Wiki is an independent fan project built and maintained by passionate Mobile Legends players. We are not affiliated with or endorsed by Moonton Technology Co., Ltd. All game content, character names, images and trademarks are property of their respective owners.</p>`;
      seoHtml += `<p>Our statistics are sourced from the official game data and updated every 24 hours so you always have access to the latest competitive meta.</p>`;
      seoHtml += `</section></article>`;
      html = injectSeoContent(html, seoHtml);
      return res.send(html);
    }

    // /legal
    if (url === '/legal' || url === '/privacy') {
      html = injectMeta(html, {
        title: 'Legal Information — Privacy Policy & Terms',
        description: 'Privacy policy, terms of service and cookie policy for MOBA Wiki — unofficial Mobile Legends fan guide.',
        canonical: 'https://mobawiki.com/legal',
        lang,
      });
      let seoHtml = `<article>`;
      seoHtml += `<h1>Legal Information</h1>`;
      seoHtml += `<section><h2>Privacy Policy</h2>`;
      seoHtml += `<p>MOBA Wiki collects minimal data — only what is necessary to provide account features (sign-in with Google) and display advertising. We do not sell personal data. Users in the EEA have full GDPR rights including access, deletion and portability. Contact: <a href="mailto:privacy@mobawiki.com">privacy@mobawiki.com</a>.</p>`;
      seoHtml += `</section>`;
      seoHtml += `<section><h2>Terms of Service</h2>`;
      seoHtml += `<p>MOBA Wiki is an unofficial, fan-made application not affiliated with, endorsed by, or sponsored by Moonton Technology Co., Ltd. All Mobile Legends game content, images, character names and trademarks are property of Moonton Technology Co., Ltd. Game assets are used for commentary, criticism and informational reference purposes.</p>`;
      seoHtml += `</section>`;
      seoHtml += `<section><h2>Disclaimer</h2>`;
      seoHtml += `<p>Mobile Legends © Moonton Technology Co., Ltd. MOBA Wiki is an independent project with no affiliation to Moonton.</p>`;
      seoHtml += `</section></article>`;
      html = injectSeoContent(html, seoHtml);
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
      const [, pgid] = url.match(/^\/(\d+)\/patches$/) || [];
      const patches = pgid ? await cachedFetch(`${API_URL}/patches?game_id=${pgid}&limit=20`) : null;
      html = injectMeta(html, {
        title: 'Patch Notes',
        description: 'Mobile Legends patch notes history — all hero buffs, nerfs and item changes. Track every MLBB update since release.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      const patchList = Array.isArray(patches) ? patches : (Array.isArray(patches?.data) ? patches.data : null);
      if (patchList && patchList.length) {
        let seoHtml = `<article><h1>Mobile Legends Patch Notes History ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Complete archive of all Mobile Legends: Bang Bang patch notes — every hero buff, nerf, item change and new content update.</p><ul>`;
        patchList.slice(0, 20).forEach(p => {
          const title = p.version || p.title || p.name || '';
          const date = p.date || p.release_date || '';
          const desc = p.description ? ` — ${esc(p.description.slice(0, 100))}` : '';
          seoHtml += `<li><strong>Patch ${esc(title)}</strong>${date ? ` (${esc(date)})` : ''}${desc}</li>`;
        });
        seoHtml += `</ul></article>`;
        html = injectSeoContent(html, seoHtml);
      } else {
        let seoHtml = `<article><h1>Mobile Legends Patch Notes History ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Complete archive of all Mobile Legends: Bang Bang patch notes — every hero buff, nerf, item change and new content update since the game launched.</p>`;
        seoHtml += `<p>MOBA Wiki tracks every balance change so you can understand how the meta evolved over time and which heroes were buffed or nerfed in each patch.</p></article>`;
        html = injectSeoContent(html, seoHtml);
      }
      return res.send(html);
    }

    // /:gameId/tier-list
    if (url.match(/^\/\d+\/tier-list$/)) {
      const tierYear = new Date().getFullYear();
      const tierUrl = `https://mobawiki.com${url}`;
      const [, tgid] = url.match(/^\/(\d+)\/tier-list$/);
      const tierRankData = await cachedFetch(`${API_URL}/hero-ranks?game_id=${tgid}&days=1&rank=all&sort_field=win_rate&sort_order=desc&size=999`);
      // API returns either an array directly or { data: [...] }
      const tierHeroes = Array.isArray(tierRankData) ? tierRankData
        : (Array.isArray(tierRankData?.data) ? tierRankData.data : null);
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
      if (tierHeroes) {
        html = injectSeoContent(html, buildTierListContent(tierHeroes, tgid));
      }
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
      const [, cpgid] = url.match(/^\/(\d+)\/counter-pick$/) || [];
      const cpHeroes = cpgid ? await cachedFetch(`${API_URL}/heroes?game_id=${cpgid}&lang=en`) : null;
      if (Array.isArray(cpHeroes) && cpHeroes.length) {
        let seoHtml = `<article><h1>Mobile Legends Counter Pick Guide ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Find the best hero counters and team synergies for every Mobile Legends hero. Our counter pick tool uses real Mythic rank data to show you which heroes win and lose matchups.</p>`;
        seoHtml += `<section><h2>How to Use the Counter Pick Tool</h2>`;
        seoHtml += `<p>Select any hero to see their top counters — heroes that consistently beat them — and their best synergies — heroes that pair well with them. Counter scores are calculated from thousands of Mythic rank games.</p></section>`;
        seoHtml += `<section><h2>All Heroes</h2><ul>`;
        cpHeroes.slice(0, 30).forEach(h => {
          const role = h.role ? ` (${esc(h.role)})` : '';
          seoHtml += `<li><a href="/${cpgid}/heroes/${heroToSlug(h.name)}">${esc(h.name)}</a>${role}</li>`;
        });
        seoHtml += `</ul></section></article>`;
        html = injectSeoContent(html, seoHtml);
      }
      return res.send(html);
    }

    // /:gameId/hero-ranks
    if (url.match(/^\/\d+\/hero-ranks$/)) {
      const rankYear = new Date().getFullYear();
      const rankUrl = `https://mobawiki.com${url}`;
      const [, rgid] = url.match(/^\/(\d+)\/hero-ranks$/);
      const rankData = await cachedFetch(`${API_URL}/hero-ranks?game_id=${rgid}&days=1&rank=all&sort_field=win_rate&sort_order=desc&size=999`);
      const rankHeroes = Array.isArray(rankData) ? rankData
        : (Array.isArray(rankData?.data) ? rankData.data : null);
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
      if (rankHeroes) {
        html = injectSeoContent(html, buildHeroRanksContent(rankHeroes, rgid));
      }
      return res.send(html);
    }

    // /:gameId/emblems
    if (url.match(/^\/\d+\/emblems$/)) {
      const [, egid] = url.match(/^\/(\d+)\/emblems$/) || [];
      const emblems = egid ? await cachedFetch(`${API_URL}/emblems?game_id=${egid}`) : null;
      html = injectMeta(html, {
        title: 'Emblems',
        description: 'All Mobile Legends emblems and talents — find the best emblem setup for your hero role. Complete MLBB emblem guide.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      if (Array.isArray(emblems) && emblems.length) {
        let seoHtml = `<article><h1>All Mobile Legends Emblems ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Complete guide to all ${emblems.length} Mobile Legends emblems and talent builds.</p><ul>`;
        emblems.forEach(e => {
          const desc = e.description ? ` — ${esc(e.description.slice(0, 100))}` : '';
          seoHtml += `<li><strong>${esc(e.name)}</strong>${desc}</li>`;
        });
        seoHtml += `</ul></article>`;
        html = injectSeoContent(html, seoHtml);
      }
      return res.send(html);
    }

    // /:gameId/spells
    if (url.match(/^\/\d+\/spells$/)) {
      const [, sgid] = url.match(/^\/(\d+)\/spells$/) || [];
      const spells = sgid ? await cachedFetch(`${API_URL}/battle-spells?game_id=${sgid}`) : null;
      html = injectMeta(html, {
        title: 'Battle Spells',
        description: 'All Mobile Legends battle spells — cooldowns, effects and best picks for every hero role. MLBB spell guide.',
        canonical: `https://mobawiki.com${url}`,
        lang,
      });
      if (Array.isArray(spells) && spells.length) {
        let seoHtml = `<article><h1>All Mobile Legends Battle Spells ${new Date().getFullYear()}</h1>`;
        seoHtml += `<p>Complete list of ${spells.length} Mobile Legends battle spells — cooldowns, effects and best usage tips.</p><ul>`;
        spells.forEach(s => {
          const desc = s.description ? ` — ${esc(s.description.slice(0, 120))}` : '';
          seoHtml += `<li><strong>${esc(s.name)}</strong>${desc}</li>`;
        });
        seoHtml += `</ul></article>`;
        html = injectSeoContent(html, seoHtml);
      }
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
