import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import GameList from './components/GameList';
import GameForm from './components/GameForm';
import HeroList from './components/HeroList';
import HeroForm from './components/HeroForm';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import EmblemViewer from './components/EmblemViewer';
import BattleSpellList from './components/BattleSpellList';
import BattleSpellForm from './components/BattleSpellForm';

// Railway API URL (онлайн) або localhost для локальної розробки
const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function App() {
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  const [heroes, setHeroes] = useState([]);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [emblems, setEmblems] = useState([]);
  
  const [battleSpells, setBattleSpells] = useState([]);
  const [showBattleSpellForm, setShowBattleSpellForm] = useState(false);
  const [editingBattleSpell, setEditingBattleSpell] = useState(null);

  // Завантажити ігри при запуску
  useEffect(() => {
    loadGames();
  }, []);

  // Завантажити героїв та предмети коли обрано гру
  useEffect(() => {
    if (selectedGame) {
      loadHeroes(selectedGame.id);
      loadItems(selectedGame.id);
      loadEmblems(selectedGame.id);
      loadBattleSpells(selectedGame.id);
    }
  }, [selectedGame]);

  const loadGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/games`);
      setGames(response.data || []);
      if (response.data && response.data.length > 0 && !selectedGame) {
        setSelectedGame(response.data[0]);
      }
    } catch (error) {
      console.error('Помилка завантаження ігор:', error);
      alert('Помилка завантаження ігор. Переконайтесь що API сервер запущено на порту 8080');
    }
  };

  const loadHeroes = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/heroes?game_id=${gameId}`);
      console.log('📥 Heroes loaded:', response.data?.length || 0);
      if (response.data?.length > 0) {
        console.log('🔍 First hero:', response.data[0].name, {
          lane: response.data[0].lane,
          roles: response.data[0].roles,
          laneType: typeof response.data[0].lane,
          rolesType: typeof response.data[0].roles
        });
      }
      setHeroes(response.data || []);
    } catch (error) {
      console.error('Failed to load heroes', error);
      setHeroes([]);
    }
  };

  const loadItems = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/items?game_id=${gameId}`);
      setItems(response.data || []);
    } catch (error) {
      console.error('Помилка завантаження предметів:', error);
      setItems([]);
    }
  };

  const loadEmblems = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/emblems?game_id=${gameId}`);
      setEmblems(response.data || []);
    } catch (error) {
      console.error('Помилка завантаження емблем:', error);
      setEmblems([]);
    }
  };

  const loadBattleSpells = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/battle-spells?game_id=${gameId}`);
      setBattleSpells(response.data || []);
    } catch (error) {
      console.error('Помилка завантаження battle spells:', error);
      setBattleSpells([]);
    }
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Видалити цю гру? Це також видалить всіх героїв та предмети!')) return;
    
    try {
      await axios.delete(`${API_URL}/games/${id}`);
      loadGames();
      alert('Гру видалено!');
    } catch (error) {
      console.error('Помилка видалення гри:', error);
      alert('Помилка видалення гри');
    }
  };

  const deleteHero = async (id) => {
    if (!window.confirm('Видалити цього героя?')) return;
    
    try {
      await axios.delete(`${API_URL}/heroes/${id}`);
      loadHeroes(selectedGame.id);
      alert('Героя видалено!');
    } catch (error) {
      console.error('Помилка видалення героя:', error);
      alert('Помилка видалення героя');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Видалити цей предмет?')) return;
    
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      loadItems(selectedGame.id);
      alert('Предмет видалено!');
    } catch (error) {
      console.error('Помилка видалення предмета:', error);
      alert('Помилка видалення предмета');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Адмін панель Game Database</h1>
        <div className="game-selector">
          <label>Поточна гра:</label>
          <select 
            value={selectedGame?.id || ''} 
            onChange={(e) => {
              const game = games.find(g => g.id === parseInt(e.target.value));
              setSelectedGame(game);
            }}
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'preview' ? 'active' : ''} 
          onClick={() => setActiveTab('preview')}
        >
          🌐 Preview
        </button>
        <button 
          className={activeTab === 'games' ? 'active' : ''} 
          onClick={() => setActiveTab('games')}
        >
          📖 Ігри
        </button>
        <button 
          className={activeTab === 'heroes' ? 'active' : ''} 
          onClick={() => setActiveTab('heroes')}
          disabled={!selectedGame}
        >
          🦸 Герої
        </button>
        <button 
          className={activeTab === 'items' ? 'active' : ''} 
          onClick={() => setActiveTab('items')}
          disabled={!selectedGame}
        >
          ⚔️ Предмети
        </button>
        <button 
          className={activeTab === 'emblems' ? 'active' : ''} 
          onClick={() => setActiveTab('emblems')}
          disabled={!selectedGame}
        >
          ⚡ Емблеми
        </button>
        <button 
          className={activeTab === 'battleSpells' ? 'active' : ''} 
          onClick={() => setActiveTab('battleSpells')}
          disabled={!selectedGame}
        >
          🔮 Battle Spells
        </button>
      </div>

      <div className="content">
        {activeTab === 'preview' && (
          <div className="tab-content" style={{ 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            minHeight: '80vh',
            padding: '60px 20px',
            margin: '-20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              background: '#22c55e',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
            }}>
              ✓
            </div>

            <h1 style={{
              color: 'white',
              fontSize: '2rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '50px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              ЛУЧШИЕ MOBA-ИГРЫ
            </h1>

            <div style={{
              maxWidth: '900px',
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                height: '300px',
                background: 'url("https://i.ytimg.com/vi/qQe4Nq8M1yc/maxresdefault.jpg") center/cover',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px'
              }}>
                {/* Оверлей для затемнення */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
                }}></div>

                {/* Текст поверх зображення */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    textShadow: '0 4px 8px rgba(0,0,0,0.6)',
                    marginBottom: '8px'
                  }}>
                    Mobile Legends
                  </h2>
                  <p style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.1rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                  }}>
                    Bang Bang
                  </p>
                </div>

                {/* Зелена кнопка */}
                <button style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '16px 40px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#16a34a';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 12px 30px rgba(34, 197, 94, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#22c55e';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.4)';
                }}
                onClick={() => window.open('/', '_blank')}>
                  ENTER
                </button>
              </div>

              {/* Інформаційна панель */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '30px 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '6px'
                  }}>
                    {heroes.length}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Heroes
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '6px'
                  }}>
                    {items.length}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Items
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '6px'
                  }}>
                    {emblems.length}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Emblems
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '6px'
                  }}>
                    {battleSpells.length}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Spells
                  </div>
                </div>
              </div>
            </div>

            {/* Майбутні ігри */}
            <div style={{
              marginTop: '50px',
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <div style={{
                padding: '20px 30px',
                background: 'rgba(100,116,139,0.3)',
                borderRadius: '12px',
                border: '2px solid rgba(100,116,139,0.5)',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  League of Legends
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  🔒 Coming Soon
                </div>
              </div>

              <div style={{
                padding: '20px 30px',
                background: 'rgba(100,116,139,0.3)',
                borderRadius: '12px',
                border: '2px solid rgba(100,116,139,0.5)',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  Dota 2
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  🔒 Coming Soon
                </div>
              </div>

              <div style={{
                padding: '20px 30px',
                background: 'rgba(100,116,139,0.3)',
                borderRadius: '12px',
                border: '2px solid rgba(100,116,139,0.5)',
                textAlign: 'center'
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  Arena of Valor
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  🔒 Coming Soon
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '50px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.9rem'
            }}>
              <p>🎮 More games coming soon • API powered • Open source</p>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Список ігор</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingGame(null);
                  setShowGameForm(true);
                }}
              >
                + Додати гру
              </button>
            </div>

            {showGameForm && (
              <GameForm
                game={editingGame}
                onClose={() => {
                  setShowGameForm(false);
                  setEditingGame(null);
                }}
                onSave={() => {
                  setShowGameForm(false);
                  setEditingGame(null);
                  loadGames();
                }}
              />
            )}

            <GameList
              games={games}
              onEdit={(game) => {
                setEditingGame(game);
                setShowGameForm(true);
              }}
              onDelete={deleteGame}
              onSelect={setSelectedGame}
              selectedId={selectedGame?.id}
            />
          </div>
        )}

        {activeTab === 'heroes' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Герої гри: {selectedGame.name}</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingHero(null);
                  setShowHeroForm(true);
                }}
              >
                + Додати героя
              </button>
            </div>

            {showHeroForm && (
              <HeroForm
                hero={editingHero}
                gameId={selectedGame.id}
                onClose={() => {
                  setShowHeroForm(false);
                  setEditingHero(null);
                }}
                onSave={() => {
                  setShowHeroForm(false);
                  setEditingHero(null);
                  loadHeroes(selectedGame.id);
                }}
              />
            )}

            <HeroList
              heroes={heroes}
              onEdit={async (hero) => {
                try {
                  // Завантажуємо повні дані героя з API
                  const response = await axios.get(`${API_URL}/heroes/${hero.id}`);
                  console.log('📝 Editing hero with full data:', response.data);
                  setEditingHero(response.data);
                  setShowHeroForm(true);
                } catch (error) {
                  console.error('Failed to load hero details', error);
                  alert('Не вдалося завантажити дані героя');
                }
              }}
              onDelete={deleteHero}
            />
          </div>
        )}

        {activeTab === 'items' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Предмети гри: {selectedGame.name}</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingItem(null);
                  setShowItemForm(true);
                }}
              >
                + Додати предмет
              </button>
            </div>

            {showItemForm && (
              <ItemForm
                item={editingItem}
                gameId={selectedGame.id}
                onClose={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
                onSave={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  loadItems(selectedGame.id);
                }}
              />
            )}

            <ItemList
              items={items}
              onEdit={(item) => {
                setEditingItem(item);
                setShowItemForm(true);
              }}
              onDelete={deleteItem}
            />
          </div>
        )}

        {activeTab === 'emblems' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Емблеми - {selectedGame.name}</h2>
            </div>
            
            <EmblemViewer
              emblems={emblems}
              gameId={selectedGame.id}
              onUpdate={() => loadEmblems(selectedGame.id)}
            />
          </div>
        )}

        {activeTab === 'battleSpells' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Battle Spells - {selectedGame.name}</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingBattleSpell(null);
                  setShowBattleSpellForm(true);
                }}
              >
                + Додати Battle Spell
              </button>
            </div>

            {showBattleSpellForm && (
              <BattleSpellForm
                spell={editingBattleSpell}
                gameId={selectedGame.id}
                onClose={() => {
                  setShowBattleSpellForm(false);
                  setEditingBattleSpell(null);
                }}
                onSave={() => {
                  setShowBattleSpellForm(false);
                  setEditingBattleSpell(null);
                  loadBattleSpells(selectedGame.id);
                }}
              />
            )}

            <BattleSpellList
              spells={battleSpells}
              onEdit={(spell) => {
                setEditingBattleSpell(spell);
                setShowBattleSpellForm(true);
              }}
              onDelete={async (spellId) => {
                if (window.confirm('Видалити battle spell?')) {
                  try {
                    await axios.delete(`${API_URL}/battle-spells/${spellId}`);
                    loadBattleSpells(selectedGame.id);
                  } catch (error) {
                    console.error('Error deleting battle spell:', error);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <footer className="App-footer">
        <p>API: {API_URL} • База даних: Railway PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
