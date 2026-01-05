import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function PatchForm({ patch, onClose, onSave }) {
  const [formData, setFormData] = useState({
    version: '',
    release_date: '',
    new_hero: null,
    hero_adjustments: {},
    emblem_adjustments: {},
    battlefield_adjustments: {},
    system_adjustments: []
  });

  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (patch) {
      setFormData(patch);
      setJsonText(JSON.stringify(patch, null, 2));
    }
  }, [patch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    setJsonError('');
    
    try {
      const parsed = JSON.parse(text);
      setFormData(parsed);
    } catch (error) {
      setJsonError('Invalid JSON: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (jsonMode && jsonError) {
      alert('Please fix JSON errors before saving');
      return;
    }

    try {
      if (patch) {
        // Update existing patch
        await axios.put(`${API_URL}/patches/${patch.version}`, formData);
      } else {
        // Create new patch
        await axios.post(`${API_URL}/patches`, formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving patch:', error);
      alert('Error saving patch: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleMode = () => {
    if (!jsonMode) {
      // Switching to JSON mode
      setJsonText(JSON.stringify(formData, null, 2));
    } else {
      // Switching to form mode
      try {
        const parsed = JSON.parse(jsonText);
        setFormData(parsed);
      } catch (error) {
        alert('Cannot switch to form mode: Invalid JSON');
        return;
      }
    }
    setJsonMode(!jsonMode);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>
            {patch ? 'Edit Patch' : 'Add Patch'}
          </h2>
          <button
            onClick={toggleMode}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              background: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {jsonMode ? '📝 Form Mode' : '🔧 JSON Mode'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!jsonMode ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Version *
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  required
                  disabled={!!patch}
                  placeholder="e.g., 2.1.40"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    background: patch ? '#f3f4f6' : '#ffffff'
                  }}
                />
                {patch && (
                  <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Version cannot be changed when editing
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Release Date
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                  💡 <strong>Tip:</strong> For advanced editing (hero adjustments, new hero, emblems, etc.), 
                  switch to JSON Mode using the button above. The form mode only supports basic fields.
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  JSON Data
                </label>
                <textarea
                  value={jsonText}
                  onChange={handleJsonChange}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '12px',
                    border: jsonError ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
                {jsonError && (
                  <div style={{ 
                    marginTop: '8px', 
                    color: '#ef4444', 
                    fontSize: '0.875rem',
                    padding: '8px',
                    background: '#fee2e2',
                    borderRadius: '4px'
                  }}>
                    {jsonError}
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                background: '#6b7280',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jsonMode && jsonError}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                background: (jsonMode && jsonError) ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: (jsonMode && jsonError) ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {patch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatchForm;
