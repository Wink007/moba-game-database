import React, { useState } from 'react';
import axios from 'axios';
import RecipeTree from './RecipeTree';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function ItemList({ items, onEdit, onDelete, gameId, onUpdate }) {
  const [imageErrors, setImageErrors] = useState({});
  const [showRecipeTree, setShowRecipeTree] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateResults, setUpdateResults] = useState(null);

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

  const handleUpdateFromFandom = async () => {
    if (!window.confirm('Update all items from Fandom Wiki? This may take a few minutes.')) {
      return;
    }

    setUpdating(true);
    setUpdateResults(null);

    try {
      // Step 1: Fetch data from Fandom
      alert('⏳ Fetching data from Fandom Wiki... This may take 2-3 minutes.');
      
      const fetchResponse = await axios.post(`${API_URL}/items/fetch-from-fandom`, {
        game_id: gameId
      }, {
        timeout: 180000 // 3 minutes
      });

      const itemsData = fetchResponse.data.items;
      
      if (!itemsData || itemsData.length === 0) {
        alert('❌ No data fetched from Fandom');
        return;
      }

      alert(`✅ Fetched ${itemsData.length} items. Now updating database...`);

      // Step 2: Update database with fetched data
      const updateResponse = await axios.post(`${API_URL}/items/update-from-fandom`, {
        game_id: gameId,
        items: itemsData
      });

      setUpdateResults(updateResponse.data);
      
      if (updateResponse.data.updated > 0) {
        alert(`✅ Successfully updated ${updateResponse.data.updated} items!`);
        if (onUpdate) {
          onUpdate(); // Reload items
        }
      } else {
        alert(`⚠️ No items were updated. ${updateResponse.data.skipped} skipped, ${updateResponse.data.failed} failed.`);
      }
    } catch (error) {
      console.error('Error updating items:', error);
      const errorMsg = error.response?.data?.error || error.message;
      alert('❌ Error updating items: ' + errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
    {/* Bulk Update Banner */}
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>🔄 Bulk Update from Fandom</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
          Update all tier-2 and tier-3 items with latest data from Fandom Wiki
        </p>
      </div>
      <button
        onClick={handleUpdateFromFandom}
        disabled={updating}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 'bold',
          backgroundColor: updating ? '#9ca3af' : 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '6px',
          cursor: updating ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {updating ? '⏳ Updating...' : '🚀 Update All Items'}
      </button>
    </div>

    {/* Update Results */}
    {updateResults && (
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        backgroundColor: updateResults.failed > 0 ? '#fef3c7' : '#d1fae5',
        border: `1px solid ${updateResults.failed > 0 ? '#fbbf24' : '#10b981'}`
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Update Results:</h4>
        <p style={{ margin: '4px 0' }}>✅ Updated: {updateResults.updated}</p>
        <p style={{ margin: '4px 0' }}>❌ Failed: {updateResults.failed}</p>
        <p style={{ margin: '4px 0' }}>📊 Total: {updateResults.total}</p>
        {updateResults.errors && updateResults.errors.length > 0 && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Show Errors ({updateResults.errors.length})
            </summary>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {updateResults.errors.map((error, idx) => (
                <li key={idx} style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    )}

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
