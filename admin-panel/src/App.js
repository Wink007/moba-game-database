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
import HeroRanksManager from './components/HeroRanksManager';
import PatchList from './components/PatchList';
import PatchForm from './components/PatchForm';
import MapLaneList from './components/MapLaneList';
import MapLaneForm from './components/MapLaneForm';
import MapCreepList from './components/MapCreepList';
import MapCreepForm from './components/MapCreepForm';
import MapBattlefieldList from './components/MapBattlefieldList';
import MapBattlefieldForm from './components/MapBattlefieldForm';

// Railway API URL (online) or localhost for local development
const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function App() {
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  const [heroes, setHeroes] = useState([]);
  const [heroSkills, setHeroSkills] = useState({}); // Skills окремо
  const [heroRelations, setHeroRelations] = useState({}); // Relations окремо
  const [heroCounterData, setHeroCounterData] = useState({}); // Counter data окремо
  const [heroCompatibilityData, setHeroCompatibilityData] = useState({}); // Compatibility data окремо
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [emblems, setEmblems] = useState([]);
  
  const [battleSpells, setBattleSpells] = useState([]);
  const [showBattleSpellForm, setShowBattleSpellForm] = useState(false);
  const [editingBattleSpell, setEditingBattleSpell] = useState(null);

  const [patches, setPatches] = useState([]);
  const [showPatchForm, setShowPatchForm] = useState(false);
  const [editingPatch, setEditingPatch] = useState(null);

  const [mapSubTab, setMapSubTab] = useState('lanes');
  const [mapLanes, setMapLanes] = useState([]);
  const [showMapLaneForm, setShowMapLaneForm] = useState(false);
  const [editingMapLane, setEditingMapLane] = useState(null);
  const [mapCreeps, setMapCreeps] = useState([]);
  const [showMapCreepForm, setShowMapCreepForm] = useState(false);
  const [editingMapCreep, setEditingMapCreep] = useState(null);
  const [mapBattlefields, setMapBattlefields] = useState([]);
  const [showMapBattlefieldForm, setShowMapBattlefieldForm] = useState(false);
  const [editingMapBattlefield, setEditingMapBattlefield] = useState(null);

  // Load games on startup
  useEffect(() => {
    loadGames();
    loadPatches();
  }, []);

  // Load heroes and items when a game is selected
  useEffect(() => {
    if (selectedGame) {
      loadHeroes(selectedGame.id);
      loadItems(selectedGame.id);
      loadEmblems(selectedGame.id);
      loadBattleSpells(selectedGame.id);
      loadMapLanes(selectedGame.id);
      loadMapCreeps(selectedGame.id);
      loadMapBattlefields(selectedGame.id);
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
      console.error('❌ Error loading games:', error);
      alert('Error loading games. Make sure the API server is running on port 8080');
    }
  };

  const loadHeroes = async (gameId) => {
    try {
      // Завантажуємо heroes без skills, relations, counter_data та compatibility_data (швидше)
      const heroesResponse = await axios.get(`${API_URL}/heroes?game_id=${gameId}`);
      setHeroes(heroesResponse.data || []);
      
      // Завантажуємо skills окремо
      const skillsResponse = await axios.get(`${API_URL}/heroes/skills?game_id=${gameId}`);
      setHeroSkills(skillsResponse.data || {});
      
      // Завантажуємо relations окремо
      const relationsResponse = await axios.get(`${API_URL}/heroes/relations?game_id=${gameId}`);
      setHeroRelations(relationsResponse.data || {});
      
      // Завантажуємо counter_data окремо
      const counterDataResponse = await axios.get(`${API_URL}/heroes/counter-data?game_id=${gameId}`);
      setHeroCounterData(counterDataResponse.data || {});
      
      // Завантажуємо compatibility_data окремо
      const compatibilityDataResponse = await axios.get(`${API_URL}/heroes/compatibility-data?game_id=${gameId}`);
      setHeroCompatibilityData(compatibilityDataResponse.data || {});
    } catch (error) {
      console.error('Failed to load heroes', error);
      setHeroes([]);
      setHeroSkills({});
      setHeroRelations({});
      setHeroCounterData({});
      setHeroCompatibilityData({});
    }
  };

  const loadItems = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/items?game_id=${gameId}`);
      setItems(response.data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  const loadEmblems = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/emblems?game_id=${gameId}`);
      setEmblems(response.data || []);
    } catch (error) {
      console.error('Error loading emblems:', error);
      setEmblems([]);
    }
  };

  const loadBattleSpells = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/battle-spells?game_id=${gameId}`);
      setBattleSpells(response.data || []);
    } catch (error) {
      console.error('Error loading battle spells:', error);
      setBattleSpells([]);
    }
  };

  const loadMapLanes = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/map/lanes?game_id=${gameId}`);
      setMapLanes(response.data || []);
    } catch (error) {
      console.error('Error loading map lanes:', error);
      setMapLanes([]);
    }
  };

  const loadMapCreeps = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/map/creeps?game_id=${gameId}`);
      setMapCreeps(response.data || []);
    } catch (error) {
      console.error('Error loading map creeps:', error);
      setMapCreeps([]);
    }
  };

  const loadMapBattlefields = async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/map/battlefield?game_id=${gameId}`);
      setMapBattlefields(response.data || []);
    } catch (error) {
      console.error('Error loading map battlefields:', error);
      setMapBattlefields([]);
    }
  };

  const loadPatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/patches`);
      setPatches(response.data || []);
    } catch (error) {
      console.error('Error loading patches:', error);
      setPatches([]);
    }
  };

  const updateCounterData = async (gameId, heroId = null) => {
    const confirmMsg = heroId 
      ? 'Update counter/compatibility data for this hero? This will fetch fresh data from official API.'
      : 'Update counter/compatibility data for ALL heroes? This will take 5-7 minutes.';
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const payload = { game_id: gameId };
      if (heroId) payload.hero_id = heroId;
      
      const response = await axios.post(`${API_URL}/heroes/update-counter-data`, payload);
      
      if (heroId) {
        alert(`✅ ${response.data.message || 'Hero updated successfully!'}`);
        loadHeroes(gameId); // Reload heroes to show updated data
      } else {
        alert(`✅ Update started in background! This will take ~5-7 minutes for all heroes.`);
      }
    } catch (error) {
      console.error('Error updating counter data:', error);
      alert('❌ Error updating counter data: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteGame = async (id) => {
    if (!window.confirm('Delete this game? This will also delete all heroes and items!')) return;
    
    try {
      await axios.delete(`${API_URL}/games/${id}`);
      loadGames();
      alert('Game deleted!');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    }
  };

  const deleteHero = async (id) => {
    if (!window.confirm('Delete this hero?')) return;
    
    try {
      await axios.delete(`${API_URL}/heroes/${id}`);
      loadHeroes(selectedGame.id);
      alert('Hero deleted!');
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert('Error deleting hero');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      loadItems(selectedGame.id);
      alert('Item deleted!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const deletePatch = async (version) => {
    if (!window.confirm(`Delete patch ${version}?`)) return;
    
    try {
      await axios.delete(`${API_URL}/patches/${version}`);
      loadPatches();
      alert('Patch deleted!');
    } catch (error) {
      console.error('Error deleting patch:', error);
      alert('Error deleting patch');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Admin Panel Game Database</h1>
        <div className="game-selector">
          <label>Current Game:</label>
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
          📖 Games
        </button>
        <button 
          className={activeTab === 'heroes' ? 'active' : ''} 
          onClick={() => setActiveTab('heroes')}
          disabled={!selectedGame}
        >
          🦸 Heroes
        </button>
        <button 
          className={activeTab === 'items' ? 'active' : ''} 
          onClick={() => setActiveTab('items')}
          disabled={!selectedGame}
        >
          ⚔️ Items
        </button>
        <button 
          className={activeTab === 'emblems' ? 'active' : ''} 
          onClick={() => setActiveTab('emblems')}
          disabled={!selectedGame}
        >
          ⚡ Emblems
        </button>
        <button 
          className={activeTab === 'battleSpells' ? 'active' : ''} 
          onClick={() => setActiveTab('battleSpells')}
          disabled={!selectedGame}
        >
          🔮 Battle Spells
        </button>
        <button 
          className={activeTab === 'heroRanks' ? 'active' : ''} 
          onClick={() => setActiveTab('heroRanks')}
          disabled={!selectedGame}
        >
          🏆 Hero Ranks
        </button>
        <button 
          className={activeTab === 'patches' ? 'active' : ''} 
          onClick={() => setActiveTab('patches')}
        >
          📋 Patches
        </button>
        <button 
          className={activeTab === 'map' ? 'active' : ''} 
          onClick={() => setActiveTab('map')}
          disabled={!selectedGame}
        >
          🗺️ Map
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
              BEST MOBA GAMES
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
                {/* Overlay for darkening */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
                }}></div>

                {/* Text over the image */}
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

                {/* Green button */}
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

              {/* Information panel */}
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

            {/* Upcoming games */}
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
              <h2>List of Games</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingGame(null);
                  setShowGameForm(true);
                }}
              >
                + Add Game
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
              <h2>Heroes of the game: {selectedGame.name}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => updateCounterData(selectedGame.id)}
                  title="Update counter/compatibility data for all heroes from official API"
                >
                  🔄 Update Counter Data
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={async () => {
                    if (!window.confirm('Оновити про-білди з mlbb.io для всіх героїв? Це займе 2-5 хвилин.')) return;
                    try {
                      const response = await axios.post(`${API_URL}/heroes/update-pro-builds`);
                      alert(`✅ ${response.data.message}`);
                    } catch (error) {
                      alert(`❌ Помилка: ${error.response?.data?.error || error.message}`);
                    }
                  }}
                  title="Fetch latest pro builds from mlbb.io"
                >
                  🏗️ Update Pro Builds
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingHero(null);
                    setShowHeroForm(true);
                  }}
                >
                  + Add Hero
                </button>
              </div>
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
              heroSkills={heroSkills}
              onEdit={async (hero) => {
                try {
                  // Loading full hero data from API
                  const response = await axios.get(`${API_URL}/heroes/${hero.id}`);
                  const heroData = response.data;
                  
                  // Додаємо relation зі стейту якщо його немає
                  if (!heroData.relation && heroRelations[hero.id]) {
                    heroData.relation = heroRelations[hero.id];
                  }
                  
                  // Додаємо counter_data зі стейту якщо його немає
                  if (!heroData.counter_data && heroCounterData[hero.id]) {
                    heroData.counter_data = heroCounterData[hero.id];
                  }
                  
                  // Додаємо compatibility_data зі стейту якщо його немає
                  if (!heroData.compatibility_data && heroCompatibilityData[hero.id]) {
                    heroData.compatibility_data = heroCompatibilityData[hero.id];
                  }
                  
                  setEditingHero(heroData);
                  setShowHeroForm(true);
                } catch (error) {
                  console.error('Failed to load hero details', error);
                  alert('Failed to load hero details');
                }
              }}
              onDelete={deleteHero}
            />
          </div>
        )}

        {activeTab === 'items' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Items of the game: {selectedGame.name}</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingItem(null);
                  setShowItemForm(true);
                }}
              >
                + Add Item
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
              gameId={selectedGame.id}
              onEdit={(item) => {
                setEditingItem(item);
                setShowItemForm(true);
              }}
              onDelete={deleteItem}
              onUpdate={loadItems}
            />
          </div>
        )}

        {activeTab === 'emblems' && selectedGame && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Emblems - {selectedGame.name}</h2>
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
                + Add Battle Spell
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
                if (window.confirm('Delete battle spell?')) {
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

        {activeTab === 'heroRanks' && (
          <div className="tab-content">
            <HeroRanksManager selectedGame={selectedGame} />
          </div>
        )}

        {activeTab === 'patches' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Patches</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingPatch(null);
                  setShowPatchForm(true);
                }}
              >
                + Add Patch
              </button>
            </div>

            {showPatchForm && (
              <PatchForm
                patch={editingPatch}
                onClose={() => {
                  setShowPatchForm(false);
                  setEditingPatch(null);
                }}
                onSave={() => {
                  setShowPatchForm(false);
                  setEditingPatch(null);
                  loadPatches();
                }}
              />
            )}

            <PatchList
              patches={patches}
              onEdit={(patch) => {
                setEditingPatch(patch);
                setShowPatchForm(true);
              }}
              onDelete={deletePatch}
              onRefresh={loadPatches}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>🗺️ Map</h2>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
              {['lanes', 'creeps', 'battlefield'].map((sub) => (
                <button
                  key={sub}
                  className={mapSubTab === sub ? 'active' : ''}
                  onClick={() => setMapSubTab(sub)}
                  style={{
                    padding: '8px 18px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: mapSubTab === sub ? '#3b82f6' : '#f3f4f6',
                    color: mapSubTab === sub ? 'white' : '#374151',
                    fontWeight: mapSubTab === sub ? '600' : '400',
                    fontSize: '0.9rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {sub === 'lanes' ? '🛣️ Lanes' : sub === 'creeps' ? '👾 Creeps' : '⚔️ Battlefield'}
                </button>
              ))}
            </div>

            {/* Lanes */}
            {mapSubTab === 'lanes' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setEditingMapLane(null); setShowMapLaneForm(true); }}
                  >
                    + Add Lane
                  </button>
                </div>

                {showMapLaneForm && (
                  <MapLaneForm
                    lane={editingMapLane}
                    gameId={selectedGame.id}
                    onClose={() => { setShowMapLaneForm(false); setEditingMapLane(null); }}
                    onSave={() => { setShowMapLaneForm(false); setEditingMapLane(null); loadMapLanes(selectedGame.id); }}
                  />
                )}

                <MapLaneList
                  lanes={mapLanes}
                  onEdit={(lane) => { setEditingMapLane(lane); setShowMapLaneForm(true); }}
                  onDelete={async (id) => {
                    if (window.confirm('Delete this lane?')) {
                      try {
                        await axios.delete(`${API_URL}/map/lanes/${id}`);
                        loadMapLanes(selectedGame.id);
                      } catch (error) {
                        console.error('Error deleting lane:', error);
                        alert('Помилка видалення lane');
                      }
                    }
                  }}
                />
              </>
            )}

            {/* Creeps */}
            {mapSubTab === 'creeps' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setEditingMapCreep(null); setShowMapCreepForm(true); }}
                  >
                    + Add Creep
                  </button>
                </div>

                {showMapCreepForm && (
                  <MapCreepForm
                    creep={editingMapCreep}
                    gameId={selectedGame.id}
                    onClose={() => { setShowMapCreepForm(false); setEditingMapCreep(null); }}
                    onSave={() => { setShowMapCreepForm(false); setEditingMapCreep(null); loadMapCreeps(selectedGame.id); }}
                  />
                )}

                <MapCreepList
                  creeps={mapCreeps}
                  onEdit={(creep) => { setEditingMapCreep(creep); setShowMapCreepForm(true); }}
                  onDelete={async (id) => {
                    if (window.confirm('Delete this creep?')) {
                      try {
                        await axios.delete(`${API_URL}/map/creeps/${id}`);
                        loadMapCreeps(selectedGame.id);
                      } catch (error) {
                        console.error('Error deleting creep:', error);
                        alert('Помилка видалення creep');
                      }
                    }
                  }}
                />
              </>
            )}

            {/* Mythical Honor Battlefield */}
            {mapSubTab === 'battlefield' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setEditingMapBattlefield(null); setShowMapBattlefieldForm(true); }}
                  >
                    + Add Battlefield
                  </button>
                </div>

                {showMapBattlefieldForm && (
                  <MapBattlefieldForm
                    battlefield={editingMapBattlefield}
                    gameId={selectedGame.id}
                    onClose={() => { setShowMapBattlefieldForm(false); setEditingMapBattlefield(null); }}
                    onSave={() => { setShowMapBattlefieldForm(false); setEditingMapBattlefield(null); loadMapBattlefields(selectedGame.id); }}
                  />
                )}

                <MapBattlefieldList
                  battlefields={mapBattlefields}
                  onEdit={(bf) => { setEditingMapBattlefield(bf); setShowMapBattlefieldForm(true); }}
                  onDelete={async (id) => {
                    if (window.confirm('Delete this battlefield?')) {
                      try {
                        await axios.delete(`${API_URL}/map/battlefield/${id}`);
                        loadMapBattlefields(selectedGame.id);
                      } catch (error) {
                        console.error('Error deleting battlefield:', error);
                        alert('Помилка видалення battlefield');
                      }
                    }
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      <footer className="App-footer">
        <p>API: {API_URL} • Database: Railway PostgreSQL</p>
      </footer>
    </div>
  );
}

export default App;
