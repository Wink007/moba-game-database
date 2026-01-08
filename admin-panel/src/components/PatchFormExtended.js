import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const BADGE_OPTIONS = ['BUFF', 'NERF', 'ADJUST'];
const SKILL_TYPES = ['Passive', 'Skill 1', 'Skill 2', 'Ultimate'];

function PatchFormExtended({ patch, onClose, onSave }) {
  const [heroes, setHeroes] = useState([]);
  const [items, setItems] = useState([]);
  const [emblems, setEmblems] = useState([]);
  
  const [formData, setFormData] = useState({
    version: '',
    release_date: '',
    designers_note: '',
    new_hero: null,
    hero_adjustments: [],
    equipment_adjustments: [],
    battlefield_adjustments: [],
    system_adjustments: [],
    emblem_adjustments: [],
    revamped_heroes: []
  });

  useEffect(() => {
    loadData();
    if (patch) {
      // Convert patch data to form format
      const converted = {
        version: patch.version,
        release_date: patch.release_date,
        designers_note: patch.designers_note || '',
        new_hero: patch.new_hero,
        hero_adjustments: convertHeroAdjustments(patch.hero_adjustments || {}),
        equipment_adjustments: convertEquipmentAdjustments(patch.equipment_adjustments || {}),
        battlefield_adjustments: convertBattlefieldAdjustments(patch.battlefield_adjustments || {}),
        system_adjustments: convertSystemAdjustments(patch.system_adjustments || []),
        emblem_adjustments: convertEmblemAdjustments(patch.emblem_adjustments || {}),
        revamped_heroes: patch.revamped_heroes || []
      };
      setFormData(converted);
    }
  }, [patch]);

  const loadData = async () => {
    try {
      const [heroesRes, itemsRes, emblemsRes] = await Promise.all([
        axios.get(`${API_URL}/heroes?game_id=2`),
        axios.get(`${API_URL}/items?game_id=2`),
        axios.get(`${API_URL}/emblems?game_id=2`)
      ]);
      setHeroes(heroesRes.data || []);
      setItems(itemsRes.data || []);
      setEmblems(emblemsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Conversion functions
  const convertHeroAdjustments = (adjustments) => {
    return Object.entries(adjustments).map(([heroName, data]) => ({
      hero_name: heroName,
      badge: data.badge || 'ADJUST',
      description: data.summary || data.description || '',
      skill_changes: data.skills || []
    }));
  };

  const convertEquipmentAdjustments = (adjustments) => {
    return Object.entries(adjustments).map(([itemName, data]) => ({
      item_name: itemName,
      badge: data.badge || 'ADJUST',
      description: data.description || '',
      attribute_changes: data.sections || []
    }));
  };

  const convertBattlefieldAdjustments = (adjustments) => {
    return Object.entries(adjustments).map(([name, data]) => ({
      name,
      description: Array.isArray(data.changes) ? data.changes.join('\n') : (data.description || '')
    }));
  };

  const convertSystemAdjustments = (adjustments) => {
    if (Array.isArray(adjustments)) {
      return adjustments.map(item => ({ description: item }));
    }
    return [];
  };

  const convertEmblemAdjustments = (adjustments) => {
    return Object.entries(adjustments).map(([emblemName, data]) => ({
      emblem_name: emblemName,
      badge: data.badge || 'ADJUST',
      description: data.description || '',
      attribute_changes: data.sections || []
    }));
  };

  // Convert form data back to patch format
  const convertToPatchFormat = () => {
    const hero_adjustments = {};
    formData.hero_adjustments.forEach(adj => {
      hero_adjustments[adj.hero_name] = {
        badge: adj.badge,
        summary: adj.description,
        skills: adj.skill_changes
      };
    });

    const equipment_adjustments = {};
    formData.equipment_adjustments.forEach(adj => {
      equipment_adjustments[adj.item_name] = {
        badge: adj.badge,
        description: adj.description,
        sections: adj.attribute_changes
      };
    });

    const battlefield_adjustments = {};
    formData.battlefield_adjustments.forEach(adj => {
      battlefield_adjustments[adj.name] = {
        changes: adj.description.split('\n').filter(Boolean),
        description: adj.description.split('\n').filter(Boolean)
      };
    });

    const emblem_adjustments = {};
    formData.emblem_adjustments.forEach(adj => {
      emblem_adjustments[adj.emblem_name] = {
        badge: adj.badge,
        description: adj.description,
        sections: adj.attribute_changes
      };
    });

    return {
      version: formData.version,
      release_date: formData.release_date,
      designers_note: formData.designers_note,
      new_hero: formData.new_hero,
      hero_adjustments,
      equipment_adjustments,
      battlefield_adjustments,
      system_adjustments: formData.system_adjustments.map(s => s.description),
      emblem_adjustments,
      revamped_heroes: formData.revamped_heroes
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const patchData = convertToPatchFormat();
      
      if (patch) {
        await axios.put(`${API_URL}/patches/${patch.version}`, patchData);
      } else {
        await axios.post(`${API_URL}/patches`, patchData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving patch:', error);
      alert('Error saving patch: ' + (error.response?.data?.error || error.message));
    }
  };

  // Add/Remove functions
  const addHeroAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: [...prev.hero_adjustments, {
        hero_name: '',
        badge: 'ADJUST',
        description: '',
        skill_changes: []
      }]
    }));
  };

  const removeHeroAdjustment = (index) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: prev.hero_adjustments.filter((_, i) => i !== index)
    }));
  };

  const updateHeroAdjustment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: prev.hero_adjustments.map((adj, i) => 
        i === index ? { ...adj, [field]: value } : adj
      )
    }));
  };

  const addSkillChange = (heroIndex) => {
    setFormData(prev => {
      const newAdjustments = [...prev.hero_adjustments];
      newAdjustments[heroIndex].skill_changes.push({
        skill_type: 'Skill 1',
        name: '',
        badge: 'ADJUST',
        changes: ['']
      });
      return { ...prev, hero_adjustments: newAdjustments };
    });
  };

  const updateSkillChange = (heroIndex, skillIndex, field, value) => {
    setFormData(prev => {
      const newAdjustments = [...prev.hero_adjustments];
      newAdjustments[heroIndex].skill_changes[skillIndex][field] = value;
      return { ...prev, hero_adjustments: newAdjustments };
    });
  };

  const addEquipmentAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      equipment_adjustments: [...prev.equipment_adjustments, {
        item_name: '',
        badge: 'ADJUST',
        description: '',
        attribute_changes: []
      }]
    }));
  };

  const addBattlefieldAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      battlefield_adjustments: [...prev.battlefield_adjustments, { name: '', description: '' }]
    }));
  };

  const addSystemAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      system_adjustments: [...prev.system_adjustments, { description: '' }]
    }));
  };

  const formStyles = {
    section: {
      marginBottom: '30px',
      padding: '20px',
      background: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.9rem'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '0.9rem',
      minHeight: '80px',
      fontFamily: 'inherit'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem'
    },
    button: {
      padding: '8px 16px',
      fontSize: '0.9rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600'
    },
    buttonPrimary: {
      background: '#3b82f6',
      color: 'white'
    },
    buttonSecondary: {
      background: '#6b7280',
      color: 'white'
    },
    buttonDanger: {
      background: '#ef4444',
      color: 'white'
    },
    card: {
      background: 'white',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '15px',
      border: '1px solid #e5e7eb'
    }
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>{patch ? 'Edit Patch' : 'Add Patch'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={formStyles.section}>
            <div style={formStyles.sectionTitle}>📝 Basic Information</div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={formStyles.label}>Version *</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                required
                disabled={!!patch}
                placeholder="e.g., 2.1.40"
                style={{...formStyles.input, background: patch ? '#f3f4f6' : 'white'}}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={formStyles.label}>Release Date</label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                style={formStyles.input}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={formStyles.label}>From The Designers</label>
              <textarea
                value={formData.designers_note}
                onChange={(e) => setFormData({...formData, designers_note: e.target.value})}
                placeholder="In this patch, we continue to optimize..."
                style={formStyles.textarea}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{...formStyles.button, ...formStyles.buttonSecondary}}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{...formStyles.button, ...formStyles.buttonPrimary}}
            >
              {patch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fcd34d' }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
            💡 <strong>Note:</strong> This is a simplified form. For full patch editing with all details (hero adjustments, equipment changes, etc.), 
            please use the JSON Mode after creating the basic patch.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PatchFormExtended;
