import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function HeroRanksManager({ selectedGame }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState(null);

  // Параметри для імпорту
  const [days, setDays] = useState(1);
  const [rank, setRank] = useState('all');
  const [sortField, setSortField] = useState('win_rate');
  const [bulkImport, setBulkImport] = useState(false);

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

    try {
      const response = await axios.get(`${API_URL}/hero-ranks?game_id=${selectedGame.id}&size=5`);
      const data = response.data.data || response.data;
      
      if (data.length > 0) {
        setMessage(`📊 Поточна статистика: ${data.length} героїв. Топ-1: ${data[0].name} (${(data[0].win_rate * 100).toFixed(2)}% WR)`);
      } else {
        setMessage('⚠️ Немає даних про ранги героїв');
      }
    } catch (error) {
      console.error('Check error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>🏆 Hero Ranks Manager</h2>
      
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
              <option value="pick_rate">Pick Rate</option>
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
          <li><strong>🔥 Імпорт всіх 30 комбінацій</strong> - імпортує всі варіанти (1/3/7/15/30 днів × 6 рангів)</li>
          <li>Оновлюйте статистику <strong>щодня</strong> для актуальних даних</li>
          <li>Різні <strong>ranks</strong> показують різну мету гравців (Epic, Legend, Mythic, Glory)</li>
          <li>API за замовчуванням використовує: days=1, rank=all, size=20</li>
          <li>Статистика для: <strong>{selectedGame?.name || 'не обрано'}</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default HeroRanksManager;
