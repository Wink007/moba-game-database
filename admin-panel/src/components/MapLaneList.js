import React from 'react';

function MapLaneList({ lanes, onEdit, onDelete }) {
  return (
    <div className="list-container">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lanes.map((lane) => (
          <div
            key={lane.id}
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{lane.name}</h3>
                {lane.best_for && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      background: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {lane.best_for}
                  </span>
                )}
              </div>

              {lane.small_description && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#4b5563',
                    margin: '4px 0 0 0',
                    lineHeight: '1.4',
                  }}
                >
                  {lane.small_description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => onEdit(lane)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                ✏️
              </button>
              <button
                className="btn btn-danger"
                onClick={() => onDelete(lane.id)}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {lanes.length === 0 && (
        <div className="empty-state">
          <p>Немає lanes. Додайте перший!</p>
        </div>
      )}
    </div>
  );
}

export default MapLaneList;
