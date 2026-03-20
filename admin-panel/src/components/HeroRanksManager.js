import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function HeroRanksManager({ selectedGame }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState(null);

  // Параметри для імпорту
  const [days, setDays] = useState(1);
  const [rank, setRank] = useState('all');
  const [sortField, setSortField] = useState('win_rate');
  
  // Токени авторизації для Moonton API (по одному на кожен period/source_id)
  const [tokens, setTokens] = useState({ t1d: '', t3d: '', t7d: '', t15d: '', t30d: '' });
  const setToken = (key, val) => setTokens(prev => ({ ...prev, [key]: val }));
  const hasAnyToken = Object.values(tokens).some(t => t.trim());

  const updateHeroRanks = async () => {
    if (!selectedGame) {
      setMessage('❌ Спочатку оберіть гру');
      return;
    }

    setLoading(true);
    setMessage('🔄 Оновлення статистики героїв...');

    try {
      const response = await axios.post(`${API_URL}/hero-ranks/update`, {
        game_id: selectedGame.id,
        days: days,
        rank: rank,
        sort_field: sortField
      });

      // Асинхронне оновлення - показуємо що процес запущено
      if (response.status === 202) {
        setMessage(`✅ Оновлення запущено в фоні! Параметри: ${days} днів, ранг: ${rank}`);
        setLastUpdate(new Date().toLocaleString());
      } else {
        // Старий синхронний формат
        setStats(response.data);
        setLastUpdate(new Date().toLocaleString());
        setMessage(`✅ Успішно оновлено! Додано: ${response.data.inserted}, Оновлено: ${response.data.updated}, Пропущено: ${response.data.skipped}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage(`❌ Помилка: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateAllCombinations = async () => {
    if (!selectedGame) {
      setMessage('❌ Спочатку оберіть гру');
      return;
    }

    setLoading(true);
    setMessage('🔄 Імпорт всіх комбінацій (30 запитів)...');

    const combinations = [];
    const daysList = [1, 3, 7, 15, 30];
    const ranksList = ['all', 'epic', 'legend', 'mythic', 'honor', 'glory'];

    for (const d of daysList) {
      for (const r of ranksList) {
        combinations.push({ days: d, rank: r });
      }
    }

    let totalInserted = 0;
    let totalUpdated = 0;
    let completed = 0;

    try {
      for (const combo of combinations) {
        setMessage(`🔄 Імпорт ${combo.days} days, ${combo.rank} rank... (${completed + 1}/${combinations.length})`);
        
        const response = await axios.post(`${API_URL}/hero-ranks/update`, {
          game_id: selectedGame.id,
          days: combo.days,
          rank: combo.rank,
          sort_field: 'win_rate'
        });

        // Асинхронне оновлення - не отримуємо результати одразу
        if (response.status === 202) {
          completed++;
        } else {
          // Старий синхронний формат
          totalInserted += response.data.inserted || 0;
          totalUpdated += response.data.updated || 0;
          completed++;
        }

        // Невелика затримка між запитами
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (completed > 0) {
        setMessage(`✅ Запущено ${completed} оновлень в фоні! Результати будуть через кілька хвилин.`);
      } else {
        setStats({ inserted: totalInserted, updated: totalUpdated, skipped: 0 });
      }
      
      setLastUpdate(new Date().toLocaleString());
      setLastUpdate(new Date().toLocaleString());
      setMessage(`✅ Імпорт завершено! Всього додано: ${totalInserted}, оновлено: ${totalUpdated} (${completed} комбінацій)`);
    } catch (error) {
      console.error('Bulk import error:', error);
      setMessage(`❌ Помилка на комбінації ${completed + 1}: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentStats = async () => {
    if (!selectedGame) return;

    setLoading(true);
    setMessage('🔍 Перевірка поточної статистики...');

    try {
      const response = await axios.get(`${API_URL}/hero-ranks`, {
        params: {
          game_id: selectedGame.id,
          days: days,
          rank: rank,
          page: 1,
          size: 5
        }
      });
      
      const data = response.data.data || response.data;
      const total = response.data.total || 0;
      
      if (data.length > 0) {
        const topHero = data[0];
        setMessage(
          `📊 Статистика (${days}д, ${rank}):\n` +
          `Всього героїв: ${total}\n` +
          `Топ-1: ${topHero.name} - WR: ${topHero.win_rate.toFixed(2)}%, Ban: ${topHero.ban_rate.toFixed(2)}%, Pick: ${(topHero.appearance_rate * 100).toFixed(2)}%\n` +
          `Оновлено: ${new Date(topHero.updated_at).toLocaleString()}`
        );
      } else {
        setMessage(`⚠️ Немає даних для комбінації: ${days} днів, ранг ${rank}`);
      }
    } catch (error) {
      console.error('Check error:', error);
      setMessage(`❌ Помилка перевірки: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateHeroesStats = async () => {
    if (!selectedGame) {
      setMessage('❌ Спочатку оберіть гру');
      return;
    }

    if (!window.confirm('🔄 Оновити статистику героїв (Ban/Pick/Win Rates)?\n\nЦе завантажить свіжі дані з публічного Moonton GMS API (токен не потрібен).\n\n⏱️ Займе ~10-15 секунд')) {
      return;
    }

    setLoading(true);
    setMessage('🔄 Завантаження Ban/Pick/Win Rates з Moonton GMS API...');

    try {
      const response = await axios.post(`${API_URL}/mlbb/heroes/fetch-and-update-stats`, {
        game_id: selectedGame.id
      });

      setLastUpdate(new Date().toLocaleString());
      setMessage(`✅ ${response.data.message}\n\nОновлено: ${response.data.updated}, Пропущено: ${response.data.skipped}, Помилки: ${response.data.errors}`);
    } catch (error) {
      console.error('Update stats error:', error);
      setMessage(`❌ Помилка: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFromMoontonAPI = async () => {
    if (!selectedGame) {
      setMessage('❌ Спочатку оберіть гру');
      return;
    }

    if (!window.confirm('⚠️ Це оновить ВСІ 30 комбінацій (5 періодів × 6 рангів) з офіційного Moonton API.\n\nПроцес займе 1-2 хвилини.\n\nПродовжити?')) {
      return;
    }

    setLoading(true);
    setMessage('🔄 Запуск оновлення з Moonton GMS API... (15-20 хвилин)');

    try {
      const response = await axios.post(`${API_URL}/update-hero-ranks-moonton`, {
        game_id: selectedGame.id,
        source_tokens: {
          '2756567': tokens.t1d.trim() || undefined,
          '2756568': tokens.t3d.trim() || undefined,
          '2756569': tokens.t7d.trim() || undefined,
          '2756565': tokens.t15d.trim() || undefined,
          '2756570': tokens.t30d.trim() || undefined,
        }
      });

      setLastUpdate(new Date().toLocaleString());
      setMessage(
        `✅ ${response.data.message}\n\n` +
        `⏱️ Очікуваний час: ${response.data.estimated_time}\n\n` +
        `📋 Оновлюються всі 30 комбінацій:\n` +
        `   • 5 періодів: 1, 3, 7, 15, 30 днів\n` +
        `   • 6 рангів: All, Epic, Legend, Mythic, Honor, Glory\n\n` +
        `⏳ Автоматична перевірка через 15 хвилин...`
      );

      // Автоматична перевірка через 15 хвилин
      setTimeout(async () => {
        try {
          setMessage(prev => prev + '\n\n🔍 Перевіряємо оновлення...');
          const checkResponse = await axios.get(`${API_URL}/hero-ranks`, {
            params: {
              game_id: selectedGame.id,
              days: 30,
              rank: 'glory',
              page: 1,
              size: 1
            }
          });
          
          const hero = checkResponse.data.data?.[0];
          if (hero) {
            const updateTime = new Date(hero.updated_at);
            const now = new Date();
            const diffMinutes = Math.floor((now - updateTime) / 1000 / 60);
            
            if (diffMinutes < 20) {
              setMessage(prev => prev + `\n\n✅ ОНОВЛЕНО! Дані свіжі (${diffMinutes} хв тому)\n` +
                `Приклад: ${hero.name} (30д, Glory): Pick ${hero.appearance_rate.toFixed(2)}%, Win ${hero.win_rate.toFixed(2)}%, Ban ${hero.ban_rate.toFixed(2)}%`);
            } else {
              setMessage(prev => prev + `\n\n⚠️ Дані не оновилися. Останнє оновлення: ${updateTime.toLocaleString()}\nПеревір логи сервера або спробуй ще раз.`);
            }
          }
        } catch (error) {
          setMessage(prev => prev + '\n\n⚠️ Помилка перевірки. Перевір дані вручну на фронтенді.');
        }
      }, 900000); // 15 хвилин

    } catch (error) {
      console.error('Moonton API update error:', error);
      setMessage(`❌ Помилка: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>🏆 Hero Ranks Manager</h2>
      
      {/* Токени авторизації для Moonton API */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px' }}>
        <h3 style={{ marginTop: 0, color: '#856404' }}>🔐 Moonton API Tokens</h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#856404' }}>
          1. Відкрийте{' '}
          <a href="https://www.mobilelegends.com/en/rank" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>mobilelegends.com/en/rank</a>{' '}
          → DevTools (F12) → Network<br/>
          2. Переключіть кожен часовий фільтр (1д / 3д / 7д / 15д / 30д)<br/>
          3. Знайдіть запит до <b>api.gms.moontontech.com</b> → Headers → скопіюйте <b>authorization</b>
        </p>
        {[
          { key: 't1d',  label: '1 день  (source 2756567)' },
          { key: 't3d',  label: '3 дні   (source 2756568)' },
          { key: 't7d',  label: '7 днів  (source 2756569)' },
          { key: 't15d', label: '15 днів (source 2756565)' },
          { key: 't30d', label: '30 днів (source 2756570)' },
        ].map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ minWidth: '200px', fontSize: '13px', color: '#856404' }}>{label}:</span>
            <input
              type="text"
              value={tokens[key]}
              onChange={(e) => setToken(key, e.target.value)}
              placeholder="вставте токен..."
              style={{
                flex: 1, padding: '6px 10px', borderRadius: '4px',
                border: '1px solid #ddd', fontSize: '13px', fontFamily: 'monospace',
                backgroundColor: tokens[key] ? '#d4edda' : '#fff'
              }}
            />
          </div>
        ))}
        {!hasAnyToken && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#856404' }}>
            ⚠️ Без токенів буде 403. Вставте хоча б токени для потрібних вам періодів.
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '6px' }}>
        <h3>Налаштування імпорту</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
          {/* Days filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📅 Період (days):
            </label>
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="1">Past 1 day</option>
              <option value="3">Past 3 days</option>
              <option value="7">Past 7 days</option>
              <option value="15">Past 15 days</option>
              <option value="30">Past 30 days</option>
            </select>
          </div>

          {/* Rank filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🎯 Ранг (rank):
            </label>
            <select 
              value={rank} 
              onChange={(e) => setRank(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">All Ranks</option>
              <option value="epic">Epic</option>
              <option value="legend">Legend</option>
              <option value="mythic">Mythic</option>
              <option value="honor">Honor</option>
              <option value="glory">Glory</option>
            </select>
          </div>

          {/* Sort field */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📊 Сортування (sort_field):
            </label>
            <select 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="win_rate">Win Rate</option>
              <option value="ban_rate">Ban Rate</option>
              <option value="appearance_rate">Pick Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={updateHeroRanks}
          disabled={loading || !selectedGame}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            flex: 1
          }}
        >
          {loading ? '⏳ Оновлення...' : '🔄 Оновити вибране'}
        </button>

        <button
          onClick={updateAllCombinations}
          disabled={loading || !selectedGame}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            flex: 1
          }}
        >
          {loading ? '⏳ Оновлення...' : '🔥 Імпорт всіх 30 комбінацій'}
        </button>

        <button
          onClick={checkCurrentStats}
          disabled={!selectedGame}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📊 Перевірити дані
        </button>
      </div>

      {/* Кнопки для оновлення статистики */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={updateHeroesStats}
          disabled={loading || !selectedGame}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Оновлення...' : '⚡ Оновити статистику героїв (Ban/Pick/Win Rates)'}
        </button>

        <button
          onClick={updateFromMoontonAPI}
          disabled={loading || !selectedGame}
          style={{
            flex: 1,
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Оновлення...' : '🚀 Оновити через Moonton GMS API (всі 30 комбінацій)'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('✅') ? '#d4edda' : message.includes('❌') ? '#f8d7da' : '#d1ecf1',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : message.includes('❌') ? '#f5c6cb' : '#bee5eb'}`,
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          {message}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '6px',
          border: '1px solid #ddd'
        }}>
          <h3>Результати оновлення:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✅ Додано нових: <strong>{stats.inserted}</strong></li>
            <li>🔄 Оновлено: <strong>{stats.updated}</strong></li>
            <li>⏭️ Пропущено: <strong>{stats.skipped}</strong></li>
            <li>⏰ Час оновлення: <strong>{lastUpdate}</strong></li>
          </ul>
        </div>
      )}

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px'
      }}>
        <h4>💡 Підказки:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>🔄 Оновити вибране</strong> - імпортує дані для однієї комбінації (days + rank)</li>
          <li><strong>🔥 Імпорт всіх 30 комбінацій</strong> - імпортує всі варіанти (5 періодів × 6 рангів)</li>
          <li><strong>⚡ Оновити статистику героїв</strong> - оновлює ban/pick/win rates з mlbb_heroes_stats.json</li>
          <li>Доступні періоди: <strong>1, 3, 7, 15, 30 днів</strong></li>
          <li>Доступні ранги: <strong>all, epic, legend, mythic, honor, glory</strong></li>
          <li>Для оновлення з Moonton API запустіть: <code style={{backgroundColor:'#f5f5f5',padding:'2px 6px',borderRadius:'3px'}}>python3 update_hero_ranks_from_moonton.py</code></li>
        </ul>
        
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>🔗 API Endpoint:</strong><br/>
          <code style={{backgroundColor:'#f5f5f5',padding:'2px 6px',borderRadius:'3px'}}>
            GET /api/hero-ranks?game_id=2&days=1&rank=all&page=1&size=20
          </code>
        </div>
      </div>
    </div>
  );
}

export default HeroRanksManager;
