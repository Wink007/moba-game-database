import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function ItemForm({ item, gameId, onClose, onSave }) {
  const [allItems, setAllItems] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    name_uk: '',
    category: 'Attack',
    price_total: 0,
    price_sell: 0,
    description: '',
    description_en: '',
    description_uk: '',
    icon_url: '',
    attributes: {},
    passive_name: '',
    passive_name_uk: '',
    passive_description: '',
    passive_description_uk: '',
    active_name: '',
    active_name_uk: '',
    active_description: '',
    active_description_uk: '',
    stats_other: '',
    recipe: [],
    upgrades_to: [],
    tips: '',
    in_depth_info: '',
    countered_by: '',
    builds: '',
    tier: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load the list of all items for recipe
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/items?game_id=${gameId}`);
        setAllItems(response.data);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };
    fetchItems();
  }, [gameId]);

  useEffect(() => {
    if (item) {
      // recipe is already parsed on the backend, so we check the type
      let recipeArray = [];
      if (item.recipe) {
        if (Array.isArray(item.recipe)) {
          // Already an array - use as is
          recipeArray = item.recipe;
        } else if (typeof item.recipe === 'string') {
          try {
            // Try to parse JSON
            recipeArray = JSON.parse(item.recipe);
          } catch (e) {
            // If old format (string), convert to array
            const names = item.recipe.split(', ').filter(Boolean);
            recipeArray = names.map(name => {
              const foundItem = allItems.find(i => i.name === name);
              return foundItem ? { id: foundItem.id, name: foundItem.name } : { id: null, name };
            });
          }
        }
      }
      
      // Parse upgrades_to
      let upgradesArray = [];
      if (item.upgrades_to) {
        if (Array.isArray(item.upgrades_to)) {
          upgradesArray = item.upgrades_to;
        } else if (typeof item.upgrades_to === 'string') {
          try {
            upgradesArray = JSON.parse(item.upgrades_to);
          } catch (e) {
            upgradesArray = [];
          }
        }
      }
      
      setFormData({
        name: item.name || '',
        name_en: item.name_en || '',
        name_uk: item.name_uk || '',
        category: item.category || 'Attack',
        price_total: item.price_total || 0,
        price_sell: item.price_sell || 0,
        description: item.description || '',
        description_en: item.description_en || '',
        description_uk: item.description_uk || '',
        icon_url: item.icon_url || '',
        attributes: item.attributes || {},
        passive_name: item.passive_name || '',
        passive_name_uk: item.passive_name_uk || '',
        passive_description: item.passive_description || '',
        passive_description_uk: item.passive_description_uk || '',
        active_name: item.active_name || '',
        active_name_uk: item.active_name_uk || '',
        active_description: item.active_description || '',
        active_description_uk: item.active_description_uk || '',
        stats_other: item.stats_other || '',
        recipe: recipeArray,
        upgrades_to: upgradesArray,
        tips: item.tips || '',
        in_depth_info: item.in_depth_info || '',
        countered_by: item.countered_by || '',
        builds: item.builds || '',
        tier: item.tier || ''
      });
    }
  }, [item, allItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        game_id: gameId,
        recipe: JSON.stringify(formData.recipe),
        upgrades_to: JSON.stringify(formData.upgrades_to || [])
      };

      if (item) {
        // Editing existing item
        await axios.put(`${API_URL}/items/${item.id}`, payload);
        alert('Item updated!');
      } else {
        // Creating new item
        await axios.post(`${API_URL}/items`, payload);
        alert('Item added!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'}}>
        <h3>{item ? '✏️ Edit Item' : '➕ Add Item'}</h3>
        <form onSubmit={handleSubmit}>
          <h4 style={{marginTop: '0', marginBottom: '1rem', color: '#0066cc'}}>🌐 Names / Назви</h4>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Item Name* (EN)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Haas's Claws"
              />
            </div>

            <div className="form-group">
              <label>🇺🇦 Українська назва</label>
              <input
                type="text"
                value={formData.name_uk || ''}
                onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
                placeholder="Кігті Хааса"
              />
            </div>
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>📝 Descriptions / Описи</h4>
          <div className="form-group">
            <label>Description (EN)</label>
            <textarea
              value={formData.description_en || formData.description}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              placeholder="Grants lifesteal and cooldown reduction..."
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>🇺🇦 Опис українською</label>
            <textarea
              value={formData.description_uk || ''}
              onChange={(e) => setFormData({ ...formData, description_uk: e.target.value })}
              placeholder="Надає крадіжку здоров'я та зменшення перезарядки..."
              rows="2"
            />
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>💰 Price & Category</h4>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Category*</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="Attack">Attack</option>
                <option value="Magic">Magic</option>
                <option value="Defense">Defense</option>
                <option value="Movement">Movement</option>
                <option value="Jungling">Jungling</option>
                <option value="Roaming">Roaming</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purchase Price</label>
              <input
                type="number"
                min="0"
                value={formData.price_total}
                onChange={(e) => setFormData({ ...formData, price_total: parseInt(e.target.value) || 0 })}
                placeholder="2360"
              />
            </div>

            <div className="form-group">
              <label>Sell Price</label>
              <input
                type="number"
                min="0"
                value={formData.price_sell}
                onChange={(e) => setFormData({ ...formData, price_sell: parseInt(e.target.value) || 0 })}
                placeholder="1416"
              />
            </div>

            <div className="form-group">
              <label>Tier</label>
              <input
                type="text"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                placeholder="Tier 3, Advanced"
              />
            </div>

            <div className="form-group">
              <label>Icon URL</label>
              <input
                type="text"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>📊 Attributes</h4>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem'}}>
            <div className="form-group">
              <label>Physical Attack</label>
              <input 
                type="number" 
                value={formData.attributes.physical_attack || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, physical_attack: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Magic Power</label>
              <input 
                type="number" 
                value={formData.attributes.magic_power || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, magic_power: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>HP</label>
              <input 
                type="number" 
                value={formData.attributes.hp || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, hp: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Physical Defense</label>
              <input 
                type="number" 
                value={formData.attributes.physical_defense || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, physical_defense: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Magic Defense</label>
              <input 
                type="number" 
                value={formData.attributes.magic_defense || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, magic_defense: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Movement Speed</label>
              <input 
                type="number" 
                value={formData.attributes.movement_speed || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, movement_speed: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Attack Speed (%)</label>
              <input 
                type="number" 
                value={formData.attributes.attack_speed || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, attack_speed: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>CD Reduction (%)</label>
              <input 
                type="number" 
                value={formData.attributes.cooldown_reduction || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, cooldown_reduction: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Lifesteal (%)</label>
              <input 
                type="number" 
                value={formData.attributes.lifesteal || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, lifesteal: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Spell Vamp (%)</label>
              <input 
                type="number" 
                value={formData.attributes.spell_vamp || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, spell_vamp: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Penetration</label>
              <input 
                type="number" 
                value={formData.attributes.penetration || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, penetration: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Crit Chance (%)</label>
              <input 
                type="number" 
                value={formData.attributes.crit_chance || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, crit_chance: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Adaptive Attack</label>
              <input 
                type="number" 
                value={formData.attributes.adaptive_attack || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, adaptive_attack: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>HP Regen</label>
              <input 
                type="number" 
                value={formData.attributes.hp_regen || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, hp_regen: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
            <div className="form-group">
              <label>Mana Regen</label>
              <input 
                type="number" 
                value={formData.attributes.mana_regen || 0} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  attributes: { ...formData.attributes, mana_regen: parseFloat(e.target.value) || 0 }
                })} 
              />
            </div>
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>⚡ Passive</h4>
          <div className="form-group">
            <label>Unique Attributes</label>
            <textarea
              value={formData.stats_other}
              onChange={(e) => setFormData({ ...formData, stats_other: e.target.value })}
              placeholder="Unique Attribute: +40% Crit Damage"
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Passive Name</label>
            <input
              type="text"
              value={formData.passive_name}
              onChange={(e) => setFormData({ ...formData, passive_name: e.target.value })}
              placeholder="Doom"
            />
          </div>
          <div className="form-group">
            <label>🇺🇦 Назва пасивної українською</label>
            <input
              type="text"
              value={formData.passive_name_uk || ''}
              onChange={(e) => setFormData({ ...formData, passive_name_uk: e.target.value })}
              placeholder="Рок"
            />
          </div>
          <div className="form-group">
            <label>Passive Description</label>
            <textarea
              value={formData.passive_description}
              onChange={(e) => setFormData({ ...formData, passive_description: e.target.value })}
              placeholder="Unique Passive - Doom: Critical strikes grant 5% extra Physical Attack..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>🇺🇦 Опис пасивної українською</label>
            <textarea
              value={formData.passive_description_uk || ''}
              onChange={(e) => setFormData({ ...formData, passive_description_uk: e.target.value })}
              placeholder="Унікальна пасивна - Рок: Критичні удари надають..."
              rows="3"
            />
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>🎯 Active Ability / Активна здібність</h4>
          <div className="form-group">
            <label>Active Name</label>
            <input
              type="text"
              value={formData.active_name || ''}
              onChange={(e) => setFormData({ ...formData, active_name: e.target.value })}
              placeholder="Sprint"
            />
          </div>
          <div className="form-group">
            <label>🇺🇦 Назва активної українською</label>
            <input
              type="text"
              value={formData.active_name_uk || ''}
              onChange={(e) => setFormData({ ...formData, active_name_uk: e.target.value })}
              placeholder="Спринт"
            />
          </div>
          <div className="form-group">
            <label>Active Description</label>
            <textarea
              value={formData.active_description || ''}
              onChange={(e) => setFormData({ ...formData, active_description: e.target.value })}
              placeholder="Increases movement speed by 30%..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>🇺🇦 Опис активної українською</label>
            <textarea
              value={formData.active_description_uk || ''}
              onChange={(e) => setFormData({ ...formData, active_description_uk: e.target.value })}
              placeholder="Збільшує швидкість пересування на 30%..."
              rows="3"
            />
          </div>

          <h4 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>🔧 Additional Information</h4>
          <div className="form-group">
            <label>Recipe (components)</label>
            <input
              type="text"
              placeholder="🔍 Search components..."
              value={recipeSearch}
              onChange={(e) => setRecipeSearch(e.target.value)}
              style={{
                marginBottom: '8px',
                padding: '8px 12px',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                width: '100%'
              }}
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9fafb',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {allItems
                .filter(i => i.tier && parseInt(i.tier) < 3 && i.id !== item?.id)
                .filter(i => !recipeSearch || i.name.toLowerCase().includes(recipeSearch.toLowerCase()))
                .sort((a, b) => {
                  // Sort first by tier, then by name
                  if (a.tier !== b.tier) return a.tier - b.tier;
                  return a.name.localeCompare(b.name);
                })
                .map(availableItem => {
                  const selectedCount = formData.recipe.filter(item => item.id === availableItem.id).length;
                  
                  return (
                    <div
                      key={availableItem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        border: `2px solid ${selectedCount > 0 ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        backgroundColor: selectedCount > 0 ? '#eff6ff' : 'white',
                        transition: 'all 0.2s',
                        boxShadow: selectedCount > 0 ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCount === 0) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCount === 0) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      {availableItem.icon_url ? (
                        <img 
                          src={availableItem.icon_url} 
                          alt={availableItem.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            backgroundColor: '#f3f4f6'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>📦</div>
                      )}
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: selectedCount > 0 ? '600' : '400',
                          color: '#1f2937',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {availableItem.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginTop: '2px'
                        }}>
                          Tier {availableItem.tier} • {availableItem.price_total}💰
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedCount > 0) {
                              // Remove one instance
                              const newRecipe = [...formData.recipe];
                              const index = newRecipe.findIndex(item => item.id === availableItem.id);
                              newRecipe.splice(index, 1);
                              setFormData({ ...formData, recipe: newRecipe });
                            }
                          }}
                          disabled={selectedCount === 0}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: selectedCount > 0 ? '#3b82f6' : '#e5e7eb',
                            color: 'white',
                            cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: selectedCount > 0 ? 1 : 0.5
                          }}
                        >−</button>
                        <span style={{
                          minWidth: '20px',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: selectedCount > 0 ? '#3b82f6' : '#9ca3af'
                        }}>
                          {selectedCount}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add one instance
                            const newRecipe = [...formData.recipe, { id: availableItem.id, name: availableItem.name }];
                            setFormData({ ...formData, recipe: newRecipe });
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              {allItems.filter(i => i.tier && parseInt(i.tier) < 3).length === 0 && (
                <p style={{color: '#9ca3af', margin: 0, padding: '20px', textAlign: 'center', gridColumn: '1 / -1'}}>
                  No available components (Tier 1-2)
                </p>
              )}
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              <strong>Selected ({formData.recipe.length}):</strong>{' '}
              <span style={{color: '#6b7280'}}>
                {formData.recipe.length > 0 ? formData.recipe.map(r => r.name).join(', ') : 'nothing selected'}
              </span>
            </div>
          </div>
          
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Upgrades (items this can be improved into)</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {allItems
                .filter(i => i.id !== item?.id)
                .sort((a, b) => (a.tier || 0) - (b.tier || 0) || a.name.localeCompare(b.name))
                .map(availableItem => {
                  const selectedCount = (formData.upgrades_to || []).filter(up => up.id === availableItem.id).length;
                  
                  return (
                    <div
                      key={availableItem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        border: `2px solid ${selectedCount > 0 ? '#10b981' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        backgroundColor: selectedCount > 0 ? '#d1fae5' : 'white',
                        transition: 'all 0.2s',
                        boxShadow: selectedCount > 0 ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCount === 0) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCount === 0) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e5e7eb';
                        }
                      }}
                    >
                      {availableItem.icon_url ? (
                        <img 
                          src={availableItem.icon_url} 
                          alt={availableItem.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            backgroundColor: '#f3f4f6'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>📦</div>
                      )}
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: selectedCount > 0 ? '600' : '400',
                          color: '#1f2937',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {availableItem.name}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginTop: '2px'
                        }}>
                          {availableItem.tier ? `Tier ${availableItem.tier}` : 'No tier'} • {availableItem.price_total}💰
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentUpgrades = formData.upgrades_to || [];
                          const isSelected = currentUpgrades.some(up => up.id === availableItem.id);
                          
                          if (isSelected) {
                            // Remove
                            const newUpgrades = currentUpgrades.filter(up => up.id !== availableItem.id);
                            setFormData({ ...formData, upgrades_to: newUpgrades });
                          } else {
                            // Add
                            const newUpgrades = [...currentUpgrades, { id: availableItem.id, name: availableItem.name }];
                            setFormData({ ...formData, upgrades_to: newUpgrades });
                          }
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: selectedCount > 0 ? '#10b981' : '#e5e7eb',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}
                      >
                        {selectedCount > 0 ? '✓' : '+'}
                      </button>
                    </div>
                  );
                })}
            </div>
            {(formData.upgrades_to || []).length > 0 && (
              <div style={{marginTop: '8px', fontSize: '0.875rem', color: '#059669'}}>
                ⬆️ Upgrades into ({formData.upgrades_to.length}): {formData.upgrades_to.map(u => u.name).join(', ')}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Tips</label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Best for marksmen..."
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>In-depth Information</label>
            <textarea
              value={formData.in_depth_info}
              onChange={(e) => setFormData({ ...formData, in_depth_info: e.target.value })}
              placeholder="Detailed information..."
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Countered By</label>
            <textarea
              value={formData.countered_by}
              onChange={(e) => setFormData({ ...formData, countered_by: e.target.value })}
              placeholder="Antique Cuirass, Blade Armor..."
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Builds</label>
            <textarea
              value={formData.builds}
              onChange={(e) => setFormData({ ...formData, builds: e.target.value })}
              placeholder="Core build, Damage build..."
              rows="2"
            />
          </div>

          <div className="form-actions" style={{marginTop: '1.5rem'}}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemForm;
