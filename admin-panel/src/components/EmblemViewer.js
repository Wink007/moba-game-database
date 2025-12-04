import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

function EmblemViewer({ emblems, gameId, onUpdate }) {
  const [talents, setTalents] = useState({ tier1: [], tier2: [], tier3: [] });
  const [editingTalent, setEditingTalent] = useState(null);
  const [editedEffect, setEditedEffect] = useState('');

  useEffect(() => {
    if (gameId) {
      loadTalents();
    }
  }, [gameId]);

  const loadTalents = async () => {
    try {
      const [tier1Res, tier2Res, tier3Res] = await Promise.all([
        axios.get(`${API_URL}/emblem-talents?game_id=${gameId}&tier=1`),
        axios.get(`${API_URL}/emblem-talents?game_id=${gameId}&tier=2`),
        axios.get(`${API_URL}/emblem-talents?game_id=${gameId}&tier=3`)
      ]);
      
      setTalents({
        tier1: tier1Res.data,
        tier2: tier2Res.data,
        tier3: tier3Res.data
      });
    } catch (error) {
      console.error('Error loading talents:', error);
    }
  };

  if (!emblems || emblems.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        Немає емблем для відображення
      </div>
    );
  }

  const handleEditClick = (talent) => {
    setEditingTalent(talent);
    setEditedEffect(talent.effect);
  };

  const handleSave = async () => {
    if (!editingTalent) return;

    try {
      await axios.put(`${API_URL}/emblem-talents/${editingTalent.id}`, {
        effect: editedEffect
      });

      setEditingTalent(null);
      setEditedEffect('');
      
      // Перезавантажуємо таланти
      await loadTalents();
      
      alert('Талант успішно оновлено!');
    } catch (error) {
      console.error('Помилка при збереженні:', error);
      alert('Помилка при збереженні таланту');
    }
  };

  const handleCancel = () => {
    setEditingTalent(null);
    setEditedEffect('');
  };

  const renderTalentCard = (talent, tierColor) => {
    const isEditing = editingTalent?.id === talent.id;

    return (
      <div
        key={talent.id}
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '16px',
          border: `2px solid ${tierColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {talent.icon_url && (
              <img
                src={talent.icon_url}
                alt={talent.name}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  // border: `2px solid ${tierColor}`
                }}
              />
            )}
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1e3a8a'
            }}>
              {talent.name}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => handleEditClick(talent)}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                background: tierColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✏️ Редагувати
            </button>
          )}
        </div>
        {isEditing ? (
          <div>
            <textarea
              value={editedEffect}
              onChange={(e) => setEditedEffect(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                fontSize: '0.85rem',
                border: `1px solid ${tierColor}`,
                borderRadius: '4px',
                fontFamily: 'inherit',
                marginBottom: '8px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✓ Зберегти
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✗ Скасувати
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: '0.85rem',
            color: '#4b5563',
            lineHeight: '1.5'
          }}>
            {talent.effect}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: '#f9fafb',
      borderRadius: '12px',
      padding: '30px',
      minHeight: '600px'
    }}>
      {/* Секція з емблемами */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          🎖️ Емблеми ({emblems.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {emblems.map((emblem) => (
            <div
              key={emblem.id}
              style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                {emblem.icon_url && (
                  <img
                    src={emblem.icon_url}
                    alt={emblem.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {emblem.name} Emblem
                </div>
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                {emblem.description}
              </div>
              {emblem.base_stats && Object.keys(emblem.base_stats).length > 0 && (
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Атрибути:
                  </div>
                  {Object.entries(emblem.base_stats).map(([stat, value]) => (
                    <div
                      key={stat}
                      style={{
                        fontSize: '0.85rem',
                        color: '#4b5563',
                        padding: '2px 0'
                      }}
                    >
                      {stat}: <span style={{ fontWeight: '600', color: '#059669' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier 1 Talents */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '3px solid #3b82f6'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            ⭐ Tier 1 Talents ({talents.tier1.length})
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {talents.tier1.map(talent => renderTalentCard(talent, '#3b82f6'))}
        </div>
      </div>

      {/* Tier 2 Talents */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '3px solid #9333ea'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            ⭐⭐ Tier 2 Talents ({talents.tier2.length})
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {talents.tier2.map(talent => renderTalentCard(talent, '#9333ea'))}
        </div>
      </div>

      {/* Tier 3 Talents */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '3px solid #dc2626'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            ⭐⭐⭐ Tier 3 Talents ({talents.tier3.length})
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {talents.tier3.map(talent => renderTalentCard(talent, '#dc2626'))}
        </div>
      </div>
    </div>
  );
}

export default EmblemViewer;
