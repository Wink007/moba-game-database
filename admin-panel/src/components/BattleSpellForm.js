import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

function BattleSpellForm({ spell, gameId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    overview: '',
    description: '',
    cooldown: '',
    unlocked_level: '',
    icon_url: ''
  });

  useEffect(() => {
    if (spell) {
      setFormData({
        name: spell.name || '',
        overview: spell.overview || '',
        description: spell.description || '',
        cooldown: spell.cooldown || '',
        unlocked_level: spell.unlocked_level || '',
        icon_url: spell.icon_url || ''
      });
    }
  }, [spell]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        game_id: gameId,
        cooldown: formData.cooldown ? parseFloat(formData.cooldown) : null,
        unlocked_level: formData.unlocked_level ? parseInt(formData.unlocked_level) : null
      };

      if (spell) {
        await axios.put(`${API_URL}/battle-spells/${spell.id}`, data);
      } else {
        await axios.post(`${API_URL}/battle-spells`, data);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving battle spell:', error);
      alert('Помилка збереження battle spell');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{spell ? 'Редагувати Battle Spell' : 'Додати Battle Spell'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Назва *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Огляд (Overview)</label>
            <input
              type="text"
              value={formData.overview}
              onChange={(e) => setFormData({...formData, overview: e.target.value})}
              placeholder="наприклад: Mobility, Long-range Support"
            />
          </div>

          <div className="form-group">
            <label>Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="6"
              placeholder="Повний опис ефекту заклинання"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cooldown (секунди)</label>
              <input
                type="number"
                step="0.1"
                value={formData.cooldown}
                onChange={(e) => setFormData({...formData, cooldown: e.target.value})}
                placeholder="наприклад: 120"
              />
            </div>

            <div className="form-group">
              <label>Unlocked Level</label>
              <input
                type="number"
                value={formData.unlocked_level}
                onChange={(e) => setFormData({...formData, unlocked_level: e.target.value})}
                placeholder="наприклад: 15"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Icon URL</label>
            <input
              type="url"
              value={formData.icon_url}
              onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
              placeholder="https://example.com/icon.png"
            />
            {formData.icon_url && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={formData.icon_url} 
                  alt="Preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {spell ? 'Зберегти' : 'Створити'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BattleSpellForm;
