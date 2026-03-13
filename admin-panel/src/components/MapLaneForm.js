import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function MapLaneForm({ lane, gameId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    best_for: '',
    small_description: '',
    details: '',
    story: '',
  });

  useEffect(() => {
    if (lane) {
      setFormData({
        name: lane.name || '',
        best_for: lane.best_for || '',
        small_description: lane.small_description || '',
        details: lane.details || '',
        story: lane.story || '',
      });
    }
  }, [lane]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, game_id: gameId };
      if (lane) {
        await axios.put(`${API_URL}/map/lanes/${lane.id}`, data);
      } else {
        await axios.post(`${API_URL}/map/lanes`, data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving lane:', error);
      alert('Помилка збереження лайну');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lane ? 'Редагувати Lane' : 'Додати Lane'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Назва *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="наприклад: EXP Lane"
              required
            />
          </div>

          <div className="form-group">
            <label>Best For</label>
            <input
              type="text"
              value={formData.best_for}
              onChange={(e) => setFormData({ ...formData, best_for: e.target.value })}
              placeholder="наприклад: Fighter, Tank"
            />
          </div>

          <div className="form-group">
            <label>Short Description (необов'язково)</label>
            <input
              type="text"
              value={formData.small_description}
              onChange={(e) => setFormData({ ...formData, small_description: e.target.value })}
              placeholder="Короткий опис лайну"
            />
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows="6"
              placeholder="Детальний опис лайну"
            />
          </div>

          <div className="form-group">
            <label>Story</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows="6"
              placeholder="Лор/сторія лайну"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {lane ? 'Зберегти' : 'Створити'}
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

export default MapLaneForm;
