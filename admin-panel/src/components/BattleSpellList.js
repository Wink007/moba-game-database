import React from 'react';

function BattleSpellList({ spells, onEdit, onDelete }) {
  return (
    <div className="list-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {spells.map(spell => (
          <div key={spell.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '12px 16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            {/* Icon */}
            {spell.icon_url && (
              <img 
                src={spell.icon_url} 
                alt={spell.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  flexShrink: 0
                }}
              />
            )}
            
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{spell.name}</h3>
                {spell.overview && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    background: '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {spell.overview}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#6b7280' }}>
                {spell.cooldown && (
                  <span>⏱️ CD: {spell.cooldown}s</span>
                )}
                {spell.unlocked_level && (
                  <span>🔓 Lvl {spell.unlocked_level}</span>
                )}
              </div>
              
              {spell.description && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#4b5563',
                  margin: '6px 0 0 0',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {spell.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button 
                className="btn btn-secondary"
                onClick={() => onEdit(spell)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                ✏️
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => onDelete(spell.id)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {spells.length === 0 && (
        <div className="empty-state">
          <p>Немає battle spells. Додайте перший!</p>
        </div>
      )}
    </div>
  );
}

export default BattleSpellList;
