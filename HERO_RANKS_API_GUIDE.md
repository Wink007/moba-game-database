# Hero Ranks API - Complete Parameters Guide

## 📚 Overview

Наш API тепер повністю підтримує всі параметри з mlbb-stats API для фільтрації та сортування статистики героїв.

---

## 🎯 All Parameters

### 1. **days** — Period Filter
Період за який береться статистика

**Values:** `1`, `3`, `7`, `15`, `30`  
**Default:** `1`

```bash
GET /api/hero-ranks?game_id=2&days=7
```

**Results:**
- `days=1`: Gloo 55.56% WR
- `days=7`: Gloo 55.54% WR
- `days=30`: Gloo 55.57% WR

---

### 2. **rank** — Rank Category Filter
Ранкова категорія гравців

**Values:** `all`, `epic`, `legend`, `mythic`, `honor`, `glory`  
**Default:** `all`

```bash
GET /api/hero-ranks?game_id=2&rank=mythic
```

**Results:**
- `rank=all`: Gloo 55.56% WR
- `rank=epic`: Yve 56.08% WR
- `rank=legend`: Lolita 56.20% WR
- `rank=mythic`: Gloo 55.93% WR

**Insight:** Різні герої домінують на різних рангах! 🎮

---

### 3. **sort_field** — Sort By Field
По якому полю сортувати

**Values:** `win_rate`, `ban_rate`, `pick_rate`  
**Default:** `win_rate`

```bash
GET /api/hero-ranks?game_id=2&sort_field=ban_rate&sort_order=desc
```

**Results:**
- `sort_field=win_rate`: Gloo 55.56% WR (найбільший винрейт)
- `sort_field=ban_rate`: Grock 65.39% (найбільше банять)
- `sort_field=pick_rate`: Granger 2.93% (найчастіше пікають)

---

### 4. **sort_order** — Sort Direction
Напрямок сортування

**Values:** `asc` (ascending), `desc` (descending)  
**Default:** `desc`

```bash
GET /api/hero-ranks?game_id=2&sort_field=win_rate&sort_order=asc
```

**Results:**
- `sort_order=desc`: Gloo 55.56% WR (найкращий)
- `sort_order=asc`: Fanny 41.68% WR (найгірший)

---

### 5. **page** & **size** — Pagination
Пагінація результатів (наша власна додаткова функція)

**Values:** `page` (integer), `size` (integer)  
**Default:** all data if not specified

```bash
GET /api/hero-ranks?game_id=2&page=1&size=20
```

**Response:**
```json
{
  "data": [...],
  "page": 1,
  "size": 20,
  "total": 130,
  "total_pages": 7
}
```

---

## 🔥 Combined Examples

### Example 1: Top 5 Mythic Heroes (7 days, sorted by win rate)

```bash
GET /api/hero-ranks?game_id=2&days=7&rank=mythic&sort_field=win_rate&sort_order=desc&size=5
```

**Result:**
1. Lolita: 56.32% WR, 1.43% Ban
2. Gloo: 56.16% WR, 43.13% Ban
3. Sun: 54.85% WR, 12.82% Ban
4. Argus: 54.35% WR, 3.11% Ban
5. Irithel: 54.11% WR, 1.97% Ban

### Example 2: Most Banned Heroes (30 days)

```bash
GET /api/hero-ranks?game_id=2&days=30&sort_field=ban_rate&sort_order=desc&size=3
```

### Example 3: Most Picked Heroes in Epic Rank (7 days)

```bash
GET /api/hero-ranks?game_id=2&days=7&rank=epic&sort_field=pick_rate&sort_order=desc&size=10
```

---

## 💻 Frontend Usage

### React TypeScript

```typescript
import { useHeroRanks } from './hooks/useHeroes';

function HeroRankings() {
  const [days, setDays] = useState(7);
  const [rank, setRank] = useState('all');
  const [sortField, setSortField] = useState<'win_rate' | 'ban_rate' | 'pick_rate'>('win_rate');
  
  const { data, isLoading } = useHeroRanks(
    2,              // gameId
    undefined,      // page
    undefined,      // size
    days,           // period
    rank,           // rank category
    sortField,      // sort by
    'desc'          // sort order
  );

  return (
    <div>
      {/* Period Filter */}
      <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
        <option value="1">Past 1 day</option>
        <option value="3">Past 3 days</option>
        <option value="7">Past 7 days</option>
        <option value="15">Past 15 days</option>
        <option value="30">Past 30 days</option>
      </select>

      {/* Rank Filter */}
      <select value={rank} onChange={(e) => setRank(e.target.value)}>
        <option value="all">All Ranks</option>
        <option value="epic">Epic</option>
        <option value="legend">Legend</option>
        <option value="mythic">Mythic</option>
        <option value="honor">Honor</option>
        <option value="glory">Glory</option>
      </select>

      {/* Sort By */}
      <select value={sortField} onChange={(e) => setSortField(e.target.value as any)}>
        <option value="win_rate">Win Rate</option>
        <option value="ban_rate">Ban Rate</option>
        <option value="pick_rate">Pick Rate</option>
      </select>

      {/* Render heroes... */}
      {data?.map(hero => (
        <HeroCard key={hero.id} hero={hero} />
      ))}
    </div>
  );
}
```

### API Service

```typescript
// Simple usage
const allHeroes = await api.getHeroRanks(2);

// With period filter
const weekHeroes = await api.getHeroRanks(2, undefined, undefined, 7);

// Mythic rank, 7 days, sorted by win rate
const mythicTop = await api.getHeroRanks(
  2,           // gameId
  1,           // page
  20,          // size
  7,           // days
  'mythic',    // rank
  'win_rate',  // sortField
  'desc'       // sortOrder
);
```

---

## 🐍 Backend Usage

### Python Import Script

```python
from import_hero_ranks import fetch_hero_ranks

# Basic - all data
records = fetch_hero_ranks()

# With filters
records = fetch_hero_ranks(
    days=7,
    rank='mythic',
    sort_field='win_rate',
    sort_order='desc'
)
```

### Flask API

Endpoint automatically supports all parameters:

```python
@app.route('/api/hero-ranks', methods=['GET'])
def get_hero_ranks_api():
    # Parameters extracted from query string
    days = request.args.get('days', type=int)
    rank = request.args.get('rank', type=str)
    sort_field = request.args.get('sort_field', type=str)
    sort_order = request.args.get('sort_order', type=str, default='desc')
    
    # ... processing
```

---

## 📊 Use Cases

### 1. Meta Analysis Dashboard
```
Days: 7
Rank: Mythic
Sort: Win Rate DESC
→ Shows current meta heroes in high rank
```

### 2. Ban Priority List
```
Days: 3
Rank: All
Sort: Ban Rate DESC
→ Shows which heroes are most banned
```

### 3. Hidden Gems Finder
```
Days: 30
Rank: Legend
Sort: Win Rate DESC
Size: 20
→ Find underrated strong heroes
```

### 4. Pick Trends
```
Days: 1
Rank: Epic
Sort: Pick Rate DESC
→ See what's popular right now
```

---

## 🎯 React Query Caching

Кожна комбінація параметрів кешується окремо:

```typescript
// Different query keys = separate cache
['heroRanks', 2, undefined, undefined, 7, 'mythic', 'win_rate', 'desc']
['heroRanks', 2, undefined, undefined, 30, 'all', 'ban_rate', 'desc']
['heroRanks', 2, 1, 20, 7, 'legend', 'win_rate', 'desc']
```

---

## ✅ Status

- **Backend:** ✅ Deployed to Railway
- **Frontend:** ✅ Committed and pushed
- **Testing:** ✅ All parameters verified
- **Documentation:** ✅ Complete

**API Ready!** 🚀

---

## 🔗 Links

- **Production API:** `https://web-production-8570.up.railway.app/api/hero-ranks`
- **mlbb-stats Source:** `https://mlbb-stats.ridwaanhall.com/api/hero-rank`
- **Documentation:** This file

---

## 🧪 Test Commands

```bash
# Test days parameter
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&days=7"

# Test rank filter
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&rank=mythic"

# Test sorting
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&sort_field=ban_rate&sort_order=desc"

# Combined
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&days=7&rank=mythic&sort_field=win_rate&size=5"
```

Enjoy your powerful hero statistics API! 🎮⚡
