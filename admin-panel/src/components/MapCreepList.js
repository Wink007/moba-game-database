import React from 'react';

function MapCreepList({ creeps, onEdit, onDelete }) {
  return (
    <div className="list-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {creeps.map((creep) => (
          <div
            key={creep.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '15px',
              padding: '14px 16px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {creep.logo && (
              <img
                src={creep.logo}
                alt={creep.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{creep.name}</h3>

              {creep.effects && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#4b5563',
                    margin: '0 0 6px 0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {creep.effects}
                </p>
              )}

              {creep.abilities && creep.abilities.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {creep.abilities.map((ab, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {ab.logo_ability && (
                        <img
                          src={ab.logo_ability}
                          alt={ab.name}
                          style={{ width: '24px', height: '24px', borderRadius: '3px', objectFit: 'cover' }}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      )}
                      {ab.name && (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{ab.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => onEdit(creep)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                ✏️
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(creep.id)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {creeps.length === 0 && (
        <div className="empty-state">
          <p>Немає creeps. Додайте перший!</p>
        </div>
      )}
    </div>
  );
}

export default MapCreepList;
