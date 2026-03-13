import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

const emptyAbility = () => ({ name: '', logo_ability: '' });

function MapCreepForm({ creep, gameId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    effects: '',
    stats: '',
    details: '',
    attributes: '',
    story: '',
  });
  const [abilities, setAbilities] = useState([emptyAbility()]);

  useEffect(() => {
    if (creep) {
      setFormData({
        name: creep.name || '',
        logo: creep.logo || '',
        effects: creep.effects || '',
        stats: creep.stats || '',
        details: creep.details || '',
        attributes: creep.attributes || '',
        story: creep.story || '',
      });
      setAbilities(
        (creep.abilities && creep.abilities.length > 0)
          ? creep.abilities
          : [emptyAbility()]
      );
    }
  }, [creep]);

  const handleAbilityChange = (index, field, value) => {
    setAbilities((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const addAbility = () => setAbilities((prev) => [...prev, emptyAbility()]);

  const removeAbility = (index) => {
    setAbilities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        game_id: gameId,
        abilities: abilities.filter((a) => a.name || a.logo_ability),
      };
      if (creep) {
        await axios.put(`${API_URL}/map/creeps/${creep.id}`, data);
      } else {
        await axios.post(`${API_URL}/map/creeps`, data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving creep:', error);
      alert('Помилка збереження creep');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{creep ? 'Редагувати Creep' : 'Додати Creep'}</h2>
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
                placeholder="наприклад: Lord"
                required
              />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/lord.png"
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
              placeholder="Ефекти, які дає creep"
            />
          </div>

          <div className="form-group">
            <label>Stats (необов'язково)</label>
            <textarea
              value={formData.stats}
              onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
              rows="3"
              placeholder="HP, Damage, тощо"
            />
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows="5"
              placeholder="Детальний опис creep"
            />
          </div>

          <div className="form-group">
            <label>Attributes (необов'язково)</label>
            <textarea
              value={formData.attributes}
              onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
              rows="3"
              placeholder="Додаткові атрибути"
            />
          </div>

          <div className="form-group">
            <label>Story</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows="5"
              placeholder="Лор/сторія creep"
            />
          </div>

          {/* Abilities section */}
          <div className="form-group">
            <label style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>
              Abilities (що отримує герой після вбивства)
            </label>

            {abilities.map((ability, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  marginBottom: '10px',
                  padding: '10px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={ability.name}
                    onChange={(e) => handleAbilityChange(index, 'name', e.target.value)}
                    placeholder="Назва здібності"
                    style={{ width: '100%', marginBottom: '8px' }}
                  />
                  <input
                    type="url"
                    value={ability.logo_ability}
                    onChange={(e) => handleAbilityChange(index, 'logo_ability', e.target.value)}
                    placeholder="Logo URL здібності"
                    style={{ width: '100%' }}
                  />
                  {ability.logo_ability && (
                    <div style={{ marginTop: '6px' }}>
                      <img
                        src={ability.logo_ability}
                        alt="ability"
                        style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                {abilities.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeAbility(index)}
                    style={{ padding: '4px 10px', fontSize: '0.8rem', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={addAbility}
              style={{ fontSize: '0.85rem' }}
            >
              + Додати Ability
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {creep ? 'Зберегти' : 'Створити'}
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

export default MapCreepForm;
