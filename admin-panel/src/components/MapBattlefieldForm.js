import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function MapBattlefieldForm({ battlefield, gameId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    effects: '',
    details: '',
    story: '',
  });

  useEffect(() => {
    if (battlefield) {
      setFormData({
        name: battlefield.name || '',
        logo: battlefield.logo || '',
        effects: battlefield.effects || '',
        details: battlefield.details || '',
        story: battlefield.story || '',
      });
    }
  }, [battlefield]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, game_id: gameId };
      if (battlefield) {
        await axios.put(`${API_URL}/map/battlefield/${battlefield.id}`, data);
      } else {
        await axios.post(`${API_URL}/map/battlefield`, data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving battlefield:', error);
      alert('Помилка збереження battlefield');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{battlefield ? 'Редагувати Battlefield' : 'Додати Battlefield'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Назва *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="наприклад: Mythical Honor Battlefield"
                required
              />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/battlefield.png"
              />
            </div>
          </div>

          {formData.logo && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={formData.logo}
                alt="preview"
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
          )}

          <div className="form-group">
            <label>Effects</label>
            <textarea
              value={formData.effects}
              onChange={(e) => setFormData({ ...formData, effects: e.target.value })}
              rows="4"
              placeholder="Ефекти battlefield"
            />
          </div>

          <div className="form-group">
            <label>Details (опис + атрибути)</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows="6"
              placeholder="Детальний опис та атрибути battlefield"
            />
          </div>

          <div className="form-group">
            <label>Story</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows="6"
              placeholder="Лор/сторія battlefield"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {battlefield ? 'Зберегти' : 'Створити'}
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

export default MapBattlefieldForm;
