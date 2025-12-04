import React from 'react';

function RecipeTree({ item, allItems, level = 0 }) {
  if (!item) return null;

  const recipe = item.recipe && Array.isArray(item.recipe) ? item.recipe : [];
  
  return (
    <div style={{ marginLeft: level > 0 ? '40px' : '0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        marginBottom: '8px',
        backgroundColor: level === 0 ? '#dbeafe' : '#f3f4f6',
        borderRadius: '6px',
        border: `2px solid ${level === 0 ? '#3b82f6' : '#e5e7eb'}`
      }}>
        {item.icon_url ? (
          <img 
            src={item.icon_url} 
            alt={item.name}
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              borderRadius: '4px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb'
            }}
          />
        ) : (
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>📦</div>
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: level === 0 ? '700' : '600',
            fontSize: level === 0 ? '1rem' : '0.875rem',
            color: '#1f2937'
          }}>
            {item.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {item.tier ? `Tier ${item.tier}` : 'No tier'} • {item.price_total}💰
            {recipe.length > 0 && ` • ${recipe.length} компонент${recipe.length > 1 ? 'и' : ''}`}
          </div>
        </div>

        {level === 0 && recipe.length === 0 && (
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            Базовий предмет
          </span>
        )}
      </div>

      {recipe.length > 0 && (
        <div style={{
          borderLeft: level > 0 ? '2px solid #e5e7eb' : 'none',
          paddingLeft: level > 0 ? '8px' : '0'
        }}>
          {recipe.map((component, idx) => {
            const componentItem = allItems.find(i => i.id === component.id);
            return (
              <div key={idx}>
                {componentItem ? (
                  <RecipeTree 
                    item={componentItem} 
                    allItems={allItems} 
                    level={level + 1} 
                  />
                ) : (
                  <div style={{
                    marginLeft: '40px',
                    padding: '8px',
                    color: '#9ca3af',
                    fontSize: '0.875rem'
                  }}>
                    ⚠️ {component.name} (не знайдено)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecipeTree;
