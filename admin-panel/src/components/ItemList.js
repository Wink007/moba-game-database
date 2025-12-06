import React, { useState } from 'react';
import RecipeTree from './RecipeTree';

function ItemList({ items, onEdit, onDelete }) {
  const [imageErrors, setImageErrors] = useState({});
  const [showRecipeTree, setShowRecipeTree] = useState(null);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>⚔️ No items in this game</p>
        <p>Click "+ Add Item" to create the first one</p>
      </div>
    );
  }

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  return (
    <>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Icon</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Attributes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>
              {item.icon_url && !imageErrors[item.id] ? (
                <img 
                  src={item.icon_url} 
                  alt={item.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    backgroundColor: '#f3f4f6'
                  }}
                  onError={() => handleImageError(item.id)}
                />
              ) : (
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  📦
                </div>
              )}
            </td>
            <td><strong>{item.name}</strong></td>
            <td>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                backgroundColor: 
                  item.category === 'Attack' ? '#fee2e2' :
                  item.category === 'Magic' ? '#ddd6fe' :
                  item.category === 'Defense' ? '#fef3c7' :
                  item.category === 'Movement' ? '#dbeafe' :
                  item.category === 'Jungling' ? '#d1fae5' :
                  item.category === 'Roaming' ? '#fce7f3' : '#f3f4f6',
                color: '#374151'
              }}>
                {item.category}
              </span>
            </td>
            <td>{item.price_total} 💰</td>
            <td>
              {item.attributes && Object.keys(item.attributes).length > 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <div key={key} style={{ whiteSpace: 'nowrap' }}>
                      {key.replace(/_/g, ' ')}: {value}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#9ca3af' }}>—</span>
              )}
            </td>
            <td>
              <div className="actions">
                <button
                  className="btn btn-primary"
                  onClick={() => onEdit(item)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn"
                  onClick={() => setShowRecipeTree(item)}
                  style={{ backgroundColor: '#10b981', color: 'white' }}
                >
                  🌳 Tree
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(item.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {showRecipeTree && (
      <div className="modal-overlay" onClick={() => setShowRecipeTree(null)}>
        <div 
          className="modal" 
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>🌳 Crafting Tree</h3>
            <button 
              onClick={() => setShowRecipeTree(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >×</button>
          </div>
          
          <RecipeTree item={showRecipeTree} allItems={items} />
          
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
            <strong>Legend:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.875rem', color: '#6b7280' }}>
              <li>Blue background - main item</li>
              <li>Gray background - components</li>
              <li>Indentation shows nesting level</li>
            </ul>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default ItemList;
