import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

function GameForm({ game, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    description: '',
    background_image: '',
    video_intro: '',
    subtitle: '',
    preview: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        genre: game.genre || '',
        description: game.description || '',
        background_image: game.background_image || '',
        video_intro: game.video_intro || '',
        subtitle: game.subtitle || '',
        preview: game.preview || ''
      });
    }
  }, [game]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (game) {
        // Редагування існуючої гри
        await axios.put(`${API_URL}/games/${game.id}`, formData);
        alert('Гру оновлено!');
      } else {
        // Створення нової гри
        await axios.post(`${API_URL}/games`, formData);
        alert('Гру додано!');
      }
      onSave();
    } catch (error) {
      console.error('Помилка збереження гри:', error);
      alert('Помилка збереження гри: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{game ? '✏️ Редагувати гру' : '➕ Додати гру'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Назва гри*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Dota 2"
            />
          </div>

          <div className="form-group">
            <label>Жанр*</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              required
              placeholder="MOBA"
            />
          </div>

          <div className="form-group">
            <label>Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опис гри..."
            />
          </div>

          <div className="form-group">
            <label>Підзаголовок</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Jump into Mobile Legends: Bang Bang! Discover heroes..."
            />
          </div>

          <div className="form-group">
            <label>Фонове зображення (URL)</label>
            <input
              type="text"
              value={formData.background_image}
              onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
              placeholder="https://example.com/background.jpg"
            />
          </div>

          <div className="form-group">
            <label>Превʼю (URL)</label>
            <input
              type="text"
              value={formData.preview}
              onChange={(e) => setFormData({ ...formData, preview: e.target.value })}
              placeholder="https://example.com/preview.jpg"
            />
          </div>

          <div className="form-group">
            <label>Відео вступ (URL)</label>
            <input
              type="text"
              value={formData.video_intro}
              onChange={(e) => setFormData({ ...formData, video_intro: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GameForm;
