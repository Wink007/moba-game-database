import React from 'react';

function MapBattlefieldList({ battlefields, onEdit, onDelete }) {
  return (
    <div className="list-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {battlefields.map((bf) => (
          <div
            key={bf.id}
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
            {bf.logo && (
              <img
                src={bf.logo}
                alt={bf.name}
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
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{bf.name}</h3>

              {bf.effects && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#4b5563',
                    margin: '0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {bf.effects}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => onEdit(bf)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                ✏️
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(bf.id)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {battlefields.length === 0 && (
        <div className="empty-state">
          <p>Немає battlefields. Додайте перший!</p>
        </div>
      )}
    </div>
  );
}

export default MapBattlefieldList;
