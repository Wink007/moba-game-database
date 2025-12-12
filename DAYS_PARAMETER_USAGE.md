# Days Parameter - Usage Examples

## 🎯 Що це?

Параметр `days` дозволяє фільтрувати статистику героїв по періодах часу.

## 📊 Доступні значення

- `days=1` - статистика за останній день
- `days=3` - за останні 3 дні
- `days=7` - за останній тиждень
- `days=15` - за останні 15 днів  
- `days=30` - за останній місяць
- без параметра - всі дані (default)

## 🔧 Backend (Python)

### Import Script

```python
from import_hero_ranks import fetch_hero_ranks

# Без фільтра (всі дані)
records = fetch_hero_ranks()

# За останній тиждень
records = fetch_hero_ranks(days=7)

# За останній місяць
records = fetch_hero_ranks(days=30)
```

### API Endpoints

```bash
# Всі герої за 7 днів
GET /api/hero-ranks?game_id=2&days=7

# З пагінацією + період
GET /api/hero-ranks?game_id=2&page=1&size=20&days=7

# Тільки топ-10 за останні 3 дні
GET /api/hero-ranks?game_id=2&size=10&days=3
```

## ⚛️ Frontend (React/TypeScript)

### API Service

```typescript
import { api } from './services/api';

// Всі герої за 7 днів
const ranks = await api.getHeroRanks(2, undefined, undefined, 7);

// Перша сторінка (20 героїв) за місяць
const ranks = await api.getHeroRanks(2, 1, 20, 30);
```

### React Query Hook

```typescript
// Без фільтра
const { data: allRanks } = useHeroRanks(2);

// За останній тиждень
const { data: weekRanks } = useHeroRanks(2, undefined, undefined, 7);

// З пагінацією за 30 днів
const { data: monthRanks } = useHeroRanks(2, 1, 20, 30);

// Компонент з dropdown
function HeroRankings() {
  const [period, setPeriod] = useState<number | undefined>(7);
  const { data, isLoading } = useHeroRanks(2, undefined, undefined, period);
  
  return (
    <div>
      <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
        <option value="">All time</option>
        <option value="1">Past 1 day</option>
        <option value="3">Past 3 days</option>
        <option value="7">Past 7 days</option>
        <option value="15">Past 15 days</option>
        <option value="30">Past 30 days</option>
      </select>
      
      {/* Render ranks... */}
    </div>
  );
}
```

## 📈 Статистика по періодах

Приклад: Gloo (топ-1 герой)

| Період | Win Rate |
|--------|----------|
| All time | 55.56% |
| 1 day | 55.56% |
| 3 days | 55.43% |
| 7 days | 55.54% |
| 15 days | 55.71% |
| 30 days | 55.57% |

Win rate змінюється в залежності від періоду - статистика працює! 🎉

## 🔄 Приклади cURL

```bash
# За тиждень
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&days=7"

# За місяць з пагінацією
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&page=1&size=10&days=30"
```

## 💡 React Query Caching

Query key включає `days` параметр, тому різні періоди кешуються окремо:

```typescript
// Ці запити будуть закешовані незалежно
useHeroRanks(2, undefined, undefined, 7)   // ['heroRanks', 2, undefined, undefined, 7]
useHeroRanks(2, undefined, undefined, 30)  // ['heroRanks', 2, undefined, undefined, 30]
```

## 🚀 Deployment

Зміни вже задеплоєні на Railway:
- Backend: ✅ Committed and pushed
- Frontend: ✅ Committed and pushed

API ready to use! 🎯
