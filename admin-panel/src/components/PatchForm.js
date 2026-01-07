import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const BADGE_TYPES = ['BUFF', 'NERF', 'ADJUST', 'REVAMP', 'NEW'];
const SKILL_TYPES = ['Passive', 'Skill 1', 'Skill 2', 'Ultimate'];

function PatchForm({ patch, onClose, onSave }) {
  const [formData, setFormData] = useState({
    version: '',
    release_date: '',
    designers_note: '',
    new_hero: null,
    hero_adjustments: {},
    equipment_adjustments: {},
    emblem_adjustments: {},
    battlefield_adjustments: {},
    system_adjustments: [],
    revamped_heroes: [],
    revamped_heroes_data: {}
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [heroes, setHeroes] = useState([]);
  const [items, setItems] = useState([]);
  const [emblems, setEmblems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [emblemSearch, setEmblemSearch] = useState('');
  const [heroSkills, setHeroSkills] = useState({});
  const [expandedHeroes, setExpandedHeroes] = useState({});

  useEffect(() => {
    if (patch) {
      // Convert old string-based system_adjustments to new object structure
      const systemAdjustments = Array.isArray(patch.system_adjustments)
        ? patch.system_adjustments.map(item => 
            typeof item === 'string' 
              ? { name: item, description: '' }
              : item
          )
        : [];

      setFormData({
        ...patch,
        system_adjustments: systemAdjustments,
        revamped_heroes: patch.revamped_heroes || [],
        revamped_heroes_data: patch.revamped_heroes_data || {}
      });
    }
  }, [patch]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [heroesRes, itemsRes, emblemsRes] = await Promise.all([
          axios.get(`${API_URL}/heroes`),
          axios.get(`${API_URL}/items?game_id=2`),
          axios.get(`${API_URL}/emblems`)
        ]);
        setHeroes(heroesRes.data.sort((a, b) => a.name.localeCompare(b.name)));
        const itemsList = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        setItems(itemsList.sort((a, b) => a.name.localeCompare(b.name)));
        setEmblems(emblemsRes.data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoadingData(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Load skills for heroes in patch when editing
  useEffect(() => {
    const loadHeroSkills = async () => {
      if (patch && patch.hero_adjustments && heroes.length > 0) {
        const heroNames = Object.keys(patch.hero_adjustments);
        for (const heroName of heroNames) {
          const hero = heroes.find(h => h.name === heroName);
          if (hero && !heroSkills[hero.id]) {
            try {
              const skillsRes = await axios.get(`${API_URL}/heroes/${hero.id}/skills`);
              setHeroSkills(prev => ({ ...prev, [hero.id]: skillsRes.data }));
            } catch (error) {
              console.error(`Error loading skills for ${heroName}:`, error);
            }
          }
        }
      }
    };
    loadHeroSkills();
  }, [patch, heroes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // New Hero handlers
  const handleNewHeroChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      new_hero: prev.new_hero ? { ...prev.new_hero, [field]: value } : { name: '', [field]: value }
    }));
  };

  const addNewHeroSkill = () => {
    setFormData(prev => ({
      ...prev,
      new_hero: {
        ...prev.new_hero,
        skills: [...(prev.new_hero?.skills || []), { skill_type: 'Passive', skill_name: '', description: '' }]
      }
    }));
  };

  const updateNewHeroSkill = (index, field, value) => {
    setFormData(prev => {
      const skills = [...(prev.new_hero?.skills || [])];
      skills[index] = { ...skills[index], [field]: value };
      return {
        ...prev,
        new_hero: { ...prev.new_hero, skills }
      };
    });
  };

  const removeNewHeroSkill = (index) => {
    setFormData(prev => {
      const skills = [...(prev.new_hero?.skills || [])];
      skills.splice(index, 1);
      return {
        ...prev,
        new_hero: { ...prev.new_hero, skills }
      };
    });
  };

  const clearNewHero = () => {
    setFormData(prev => ({ ...prev, new_hero: null }));
  };

  // Hero Adjustments handlers
  const [selectedHeroForAdj, setSelectedHeroForAdj] = useState('');
  
  const addHeroAdjustment = async () => {
    if (selectedHeroForAdj && !formData.hero_adjustments[selectedHeroForAdj]) {
      const hero = heroes.find(h => h.name === selectedHeroForAdj);
      if (hero && !heroSkills[hero.id]) {
        try {
          const skillsRes = await axios.get(`${API_URL}/heroes/${hero.id}/skills`);
          setHeroSkills(prev => ({ ...prev, [hero.id]: skillsRes.data }));
        } catch (error) {
          console.error('Error loading hero skills:', error);
        }
      }
      setFormData(prev => ({
        ...prev,
        hero_adjustments: {
          ...prev.hero_adjustments,
          [selectedHeroForAdj]: {
            badge: 'ADJUST',
            adjustments: []
          }
        }
      }));
      setSelectedHeroForAdj('');
    }
  };

  const updateHeroAdjustmentBadge = (heroName, badge) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: {
        ...prev.hero_adjustments,
        [heroName]: {
          ...prev.hero_adjustments[heroName],
          badge
        }
      }
    }));
  };

  const updateHeroDescription = (heroName, description) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: {
        ...prev.hero_adjustments,
        [heroName]: {
          ...prev.hero_adjustments[heroName],
          description
        }
      }
    }));
  };

  const addHeroAdjustmentSkill = (heroName) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: {
        ...prev.hero_adjustments,
        [heroName]: {
          ...prev.hero_adjustments[heroName],
          adjustments: [
            ...(prev.hero_adjustments[heroName].adjustments || []),
            { skill_type: 'Passive', description: '' }
          ]
        }
      }
    }));
  };

  const updateHeroAdjustmentSkill = (heroName, index, field, value) => {
    setFormData(prev => {
      const adjustments = [...prev.hero_adjustments[heroName].adjustments];
      adjustments[index] = { ...adjustments[index], [field]: value };
      return {
        ...prev,
        hero_adjustments: {
          ...prev.hero_adjustments,
          [heroName]: {
            ...prev.hero_adjustments[heroName],
            adjustments
          }
        }
      };
    });
  };

  const removeHeroAdjustmentSkill = (heroName, index) => {
    setFormData(prev => {
      const adjustments = [...prev.hero_adjustments[heroName].adjustments];
      adjustments.splice(index, 1);
      return {
        ...prev,
        hero_adjustments: {
          ...prev.hero_adjustments,
          [heroName]: {
            ...prev.hero_adjustments[heroName],
            adjustments
          }
        }
      };
    });
  };

  const removeHeroAdjustment = (heroName) => {
    if (window.confirm(`Remove ${heroName}?`)) {
      setFormData(prev => {
        const newAdjustments = { ...prev.hero_adjustments };
        delete newAdjustments[heroName];
        return { ...prev, hero_adjustments: newAdjustments };
      });
      setExpandedHeroes(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[heroName];
        return newExpanded;
      });
    }
  };

  const addHeroAttributeAdjustment = (heroName) => {
    setFormData(prev => ({
      ...prev,
      hero_adjustments: {
        ...prev.hero_adjustments,
        [heroName]: {
          ...prev.hero_adjustments[heroName],
          attribute_adjustments: [
            ...(prev.hero_adjustments[heroName].attribute_adjustments || []),
            { attribute_name: 'Attribute', badge: 'ADJUST', description: '' }
          ]
        }
      }
    }));
  };

  const updateHeroAttributeAdjustment = (heroName, index, field, value) => {
    setFormData(prev => {
      const attribute_adjustments = [...(prev.hero_adjustments[heroName].attribute_adjustments || [])];
      attribute_adjustments[index] = { ...attribute_adjustments[index], [field]: value };
      return {
        ...prev,
        hero_adjustments: {
          ...prev.hero_adjustments,
          [heroName]: {
            ...prev.hero_adjustments[heroName],
            attribute_adjustments
          }
        }
      };
    });
  };

  const removeHeroAttributeAdjustment = (heroName, index) => {
    setFormData(prev => {
      const attribute_adjustments = [...(prev.hero_adjustments[heroName].attribute_adjustments || [])];
      attribute_adjustments.splice(index, 1);
      return {
        ...prev,
        hero_adjustments: {
          ...prev.hero_adjustments,
          [heroName]: {
            ...prev.hero_adjustments[heroName],
            attribute_adjustments
          }
        }
      };
    });
  };

  const toggleHeroExpanded = (heroName) => {
    setExpandedHeroes(prev => ({
      ...prev,
      [heroName]: !prev[heroName]
    }));
  };

  // Equipment Adjustments handlers
  const [selectedItemForAdj, setSelectedItemForAdj] = useState('');
  
  const addEquipmentAdjustment = () => {
    if (selectedItemForAdj && !formData.equipment_adjustments[selectedItemForAdj]) {
      setFormData(prev => ({
        ...prev,
        equipment_adjustments: {
          ...prev.equipment_adjustments,
          [selectedItemForAdj]: {
            badge: 'ADJUST',
            adjustments: []
          }
        }
      }));
      setSelectedItemForAdj('');
    }
  };

  const updateEquipmentBadge = (itemName, badge) => {
    setFormData(prev => ({
      ...prev,
      equipment_adjustments: {
        ...prev.equipment_adjustments,
        [itemName]: {
          ...prev.equipment_adjustments[itemName],
          badge
        }
      }
    }));
  };

  const updateEquipmentDescription = (itemName, description) => {
    setFormData(prev => ({
      ...prev,
      equipment_adjustments: {
        ...prev.equipment_adjustments,
        [itemName]: {
          ...prev.equipment_adjustments[itemName],
          description
        }
      }
    }));
  };

  const addEquipmentChange = (itemName) => {
    setFormData(prev => ({
      ...prev,
      equipment_adjustments: {
        ...prev.equipment_adjustments,
        [itemName]: {
          ...prev.equipment_adjustments[itemName],
          adjustments: [
            ...(prev.equipment_adjustments[itemName].adjustments || []),
            { name: '', badge: 'ADJUST', description: '' }
          ]
        }
      }
    }));
  };

  const updateEquipmentChange = (itemName, index, field, value) => {
    setFormData(prev => {
      const adjustments = [...(prev.equipment_adjustments[itemName].adjustments || [])];
      adjustments[index] = { ...adjustments[index], [field]: value };
      return {
        ...prev,
        equipment_adjustments: {
          ...prev.equipment_adjustments,
          [itemName]: {
            ...prev.equipment_adjustments[itemName],
            adjustments
          }
        }
      };
    });
  };

  const removeEquipmentChange = (itemName, index) => {
    setFormData(prev => {
      const adjustments = [...prev.equipment_adjustments[itemName].adjustments];
      adjustments.splice(index, 1);
      return {
        ...prev,
        equipment_adjustments: {
          ...prev.equipment_adjustments,
          [itemName]: {
            ...prev.equipment_adjustments[itemName],
            adjustments
          }
        }
      };
    });
  };

  const removeEquipmentAdjustment = (itemName) => {
    if (window.confirm(`Remove ${itemName}?`)) {
      setFormData(prev => {
        const newAdjustments = { ...prev.equipment_adjustments };
        delete newAdjustments[itemName];
        return { ...prev, equipment_adjustments: newAdjustments };
      });
    }
  };

  // Emblem Adjustments handlers (similar to equipment)
  const [selectedEmblemForAdj, setSelectedEmblemForAdj] = useState('');
  
  const addEmblemAdjustment = () => {
    if (selectedEmblemForAdj && !formData.emblem_adjustments[selectedEmblemForAdj]) {
      setFormData(prev => ({
        ...prev,
        emblem_adjustments: {
          ...prev.emblem_adjustments,
          [selectedEmblemForAdj]: {
            badge: 'ADJUST',
            adjustments: []
          }
        }
      }));
      setSelectedEmblemForAdj('');
    }
  };

  const updateEmblemBadge = (emblemName, badge) => {
    setFormData(prev => ({
      ...prev,
      emblem_adjustments: {
        ...prev.emblem_adjustments,
        [emblemName]: {
          ...prev.emblem_adjustments[emblemName],
          badge
        }
      }
    }));
  };

  const updateEmblemDescription = (emblemName, description) => {
    setFormData(prev => ({
      ...prev,
      emblem_adjustments: {
        ...prev.emblem_adjustments,
        [emblemName]: {
          ...prev.emblem_adjustments[emblemName],
          description
        }
      }
    }));
  };

  const addEmblemChange = (emblemName) => {
    const change = prompt('Enter adjustment description:');
    if (change && change.trim()) {
      setFormData(prev => ({
        ...prev,
        emblem_adjustments: {
          ...prev.emblem_adjustments,
          [emblemName]: {
            ...prev.emblem_adjustments[emblemName],
            adjustments: [
              ...(prev.emblem_adjustments[emblemName].adjustments || []),
              change.trim()
            ]
          }
        }
      }));
    }
  };

  const removeEmblemChange = (emblemName, index) => {
    setFormData(prev => {
      const adjustments = [...prev.emblem_adjustments[emblemName].adjustments];
      adjustments.splice(index, 1);
      return {
        ...prev,
        emblem_adjustments: {
          ...prev.emblem_adjustments,
          [emblemName]: {
            ...prev.emblem_adjustments[emblemName],
            adjustments
          }
        }
      };
    });
  };

  const removeEmblemAdjustment = (emblemName) => {
    if (window.confirm(`Remove ${emblemName}?`)) {
      setFormData(prev => {
        const newAdjustments = { ...prev.emblem_adjustments };
        delete newAdjustments[emblemName];
        return { ...prev, emblem_adjustments: newAdjustments };
      });
    }
  };

  // Battlefield Adjustments handlers
  const addBattlefieldAdjustment = () => {
    const name = prompt('Enter adjustment name:');
    if (name && name.trim()) {
      setFormData(prev => ({
        ...prev,
        battlefield_adjustments: {
          ...prev.battlefield_adjustments,
          [name.trim()]: {
            badge: 'ADJUST',
            description: ''
          }
        }
      }));
    }
  };

  const updateBattlefieldBadge = (name, badge) => {
    setFormData(prev => ({
      ...prev,
      battlefield_adjustments: {
        ...prev.battlefield_adjustments,
        [name]: {
          ...prev.battlefield_adjustments[name],
          badge
        }
      }
    }));
  };

  const updateBattlefieldDescription = (name, description) => {
    setFormData(prev => ({
      ...prev,
      battlefield_adjustments: {
        ...prev.battlefield_adjustments,
        [name]: {
          ...prev.battlefield_adjustments[name],
          description
        }
      }
    }));
  };

  const removeBattlefieldAdjustment = (name) => {
    if (window.confirm(`Remove ${name}?`)) {
      setFormData(prev => {
        const newAdjustments = { ...prev.battlefield_adjustments };
        delete newAdjustments[name];
        return { ...prev, battlefield_adjustments: newAdjustments };
      });
    }
  };

  // System Adjustments handlers
  const addSystemAdjustment = () => {
    setFormData(prev => ({
      ...prev,
      system_adjustments: [...prev.system_adjustments, { name: 'New Feature', description: '' }]
    }));
  };

  const removeSystemAdjustment = (index) => {
    setFormData(prev => {
      const newAdjustments = [...prev.system_adjustments];
      newAdjustments.splice(index, 1);
      return { ...prev, system_adjustments: newAdjustments };
    });
  };

  // Revamped Heroes handlers
  const [selectedRevampedHero, setSelectedRevampedHero] = useState('');

  const addRevampedHero = () => {
    if (selectedRevampedHero && selectedRevampedHero.trim()) {
      const heroName = selectedRevampedHero.trim();
      setFormData(prev => ({
        ...prev,
        revamped_heroes: [...prev.revamped_heroes, heroName],
        revamped_heroes_data: {
          ...prev.revamped_heroes_data,
          [heroName]: {
            badge: 'REVAMP',
            description: '',
            adjustments: []
          }
        }
      }));
      setSelectedRevampedHero('');
    }
  };

  const removeRevampedHero = (heroName) => {
    if (window.confirm(`Remove ${heroName} from revamped heroes?`)) {
      setFormData(prev => {
        const newRevampedHeroes = prev.revamped_heroes.filter(h => h !== heroName);
        const newRevampedHeroesData = { ...prev.revamped_heroes_data };
        delete newRevampedHeroesData[heroName];
        return {
          ...prev,
          revamped_heroes: newRevampedHeroes,
          revamped_heroes_data: newRevampedHeroesData
        };
      });
    }
  };

  const updateRevampedHeroDescription = (heroName, value) => {
    setFormData(prev => ({
      ...prev,
      revamped_heroes_data: {
        ...prev.revamped_heroes_data,
        [heroName]: {
          ...prev.revamped_heroes_data[heroName],
          description: value
        }
      }
    }));
  };

  const addRevampedHeroAdjustment = (heroName) => {
    setFormData(prev => ({
      ...prev,
      revamped_heroes_data: {
        ...prev.revamped_heroes_data,
        [heroName]: {
          ...prev.revamped_heroes_data[heroName],
          adjustments: [
            ...(prev.revamped_heroes_data[heroName].adjustments || []),
            { skill_type: 'Passive', skill_name: '', description: '' }
          ]
        }
      }
    }));
  };

  const updateRevampedHeroAdjustment = (heroName, index, field, value) => {
    setFormData(prev => {
      const adjustments = [...prev.revamped_heroes_data[heroName].adjustments];
      adjustments[index] = { ...adjustments[index], [field]: value };
      return {
        ...prev,
        revamped_heroes_data: {
          ...prev.revamped_heroes_data,
          [heroName]: {
            ...prev.revamped_heroes_data[heroName],
            adjustments
          }
        }
      };
    });
  };

  const removeRevampedHeroAdjustment = (heroName, index) => {
    setFormData(prev => {
      const adjustments = [...prev.revamped_heroes_data[heroName].adjustments];
      adjustments.splice(index, 1);
      return {
        ...prev,
        revamped_heroes_data: {
          ...prev.revamped_heroes_data,
          [heroName]: {
            ...prev.revamped_heroes_data[heroName],
            adjustments
          }
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (patch) {
        await axios.put(`${API_URL}/patches/${patch.version}`, formData);
      } else {
        await axios.post(`${API_URL}/patches`, formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving patch:', error);
      alert('Error saving patch: ' + (error.response?.data?.error || error.message));
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'new_hero', label: 'New Hero', icon: '⭐' },
    { id: 'hero_adj', label: 'Hero Adjustments', icon: '⚔️' },
    { id: 'equipment', label: 'Equipment', icon: '🛡️' },
    { id: 'battlefield', label: 'Battlefield', icon: '🗺️' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'emblems', label: 'Emblems', icon: '💎' },
    { id: 'revamped', label: 'Revamped', icon: '🔄' }
  ];

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(102, 126, 234, 0.5)'
    }
  };

  const dangerButtonStyle = {
    padding: '8px 16px',
    fontSize: '0.875rem',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(245, 87, 108, 0.4)',
    transition: 'all 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: '#ffffff'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    fontFamily: 'inherit',
    resize: 'vertical',
    lineHeight: '1.6'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '700',
    color: '#1f2937',
    fontSize: '0.875rem',
    letterSpacing: '0.025em',
    textTransform: 'uppercase'
  };

  const cardStyle = {
    padding: '20px',
    background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.3s ease',
        overflowY: 'auto'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          margin: 'auto'
        }}>
        <div style={{ 
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            {patch ? '✏️ Edit Patch' : '✨ Create New Patch'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#ffffff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          borderBottom: '2px solid #f3f4f6',
          overflowX: 'auto',
          background: '#fafafa',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 28px',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
                borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                transform: activeTab === tab.id ? 'translateY(2px)' : 'none',
                minWidth: 'fit-content'
              }}
            >
              <span style={{ fontSize: '1.15rem', marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '32px 36px',
            scrollBehavior: 'smooth',
            maxHeight: 'calc(95vh - 200px)'
          }}>
            {activeTab === 'basic' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Version *</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    required
                    disabled={!!patch}
                    placeholder="e.g., 2.1.40"
                    style={{
                      ...inputStyle,
                      background: patch ? '#f3f4f6' : '#ffffff'
                    }}
                  />
                  {patch && (
                    <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      Version cannot be changed when editing
                    </small>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Release Date</label>
                  <input
                    type="date"
                    name="release_date"
                    value={formData.release_date || ''}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>From The Designers</label>
                  <textarea
                    name="designers_note"
                    value={formData.designers_note || ''}
                    onChange={handleChange}
                    placeholder="In this patch, we continue to optimize the experience..."
                    style={textareaStyle}
                  />
                </div>
              </div>
            )}

            {activeTab === 'new_hero' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>New Hero</h3>
                  {formData.new_hero && (
                    <button type="button" onClick={clearNewHero} style={dangerButtonStyle}>
                      Clear
                    </button>
                  )}
                </div>

                {!formData.new_hero ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No new hero added yet</p>
                    <button
                      type="button"
                      onClick={() => handleNewHeroChange('name', '')}
                      style={{ ...buttonStyle, marginTop: '12px' }}
                    >
                      + Add New Hero
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Hero Name *</label>
                      <input
                        type="text"
                        value={formData.new_hero.name || ''}
                        onChange={(e) => handleNewHeroChange('name', e.target.value)}
                        placeholder="Hero name"
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Title</label>
                      <input
                        type="text"
                        value={formData.new_hero.title || ''}
                        onChange={(e) => handleNewHeroChange('title', e.target.value)}
                        placeholder="e.g., The Shadowblade"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Badge</label>
                      <select
                        value={formData.new_hero.badge || 'NEW'}
                        onChange={(e) => handleNewHeroChange('badge', e.target.value)}
                        style={inputStyle}
                      >
                        {BADGE_TYPES.map(badge => (
                          <option key={badge} value={badge}>{badge}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Hero Feature</label>
                      <textarea
                        value={formData.new_hero.hero_feature || ''}
                        onChange={(e) => handleNewHeroChange('hero_feature', e.target.value)}
                        placeholder="Brief description of hero's main feature..."
                        style={textareaStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={labelStyle}>Skills</label>
                        <button type="button" onClick={addNewHeroSkill} style={buttonStyle}>
                          + Add Skill
                        </button>
                      </div>

                      {(formData.new_hero.skills || []).map((skill, index) => (
                        <div key={index} style={cardStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <strong style={{ fontSize: '0.9rem' }}>Skill {index + 1}</strong>
                            <button
                              type="button"
                              onClick={() => removeNewHeroSkill(index)}
                              style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                            >
                              Remove
                            </button>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Skill Type</label>
                            <select
                              value={skill.skill_type || 'Passive'}
                              onChange={(e) => updateNewHeroSkill(index, 'skill_type', e.target.value)}
                              style={inputStyle}
                            >
                              {SKILL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Skill Name</label>
                            <input
                              type="text"
                              value={skill.skill_name || ''}
                              onChange={(e) => updateNewHeroSkill(index, 'skill_name', e.target.value)}
                              placeholder="Skill name"
                              style={inputStyle}
                            />
                          </div>

                          <div>
                            <label style={labelStyle}>Description</label>
                            <textarea
                              value={skill.description || ''}
                              onChange={(e) => updateNewHeroSkill(index, 'description', e.target.value)}
                              placeholder="Skill description..."
                              style={textareaStyle}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hero_adj' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Hero Adjustments</h3>
                  
                  {loadingData ? (
                    <p style={{ color: '#6b7280' }}>Loading heroes...</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search heroes..."
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <select
                          value={selectedHeroForAdj}
                          onChange={(e) => setSelectedHeroForAdj(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        >
                          <option value="">Select a hero...</option>
                          {heroes
                            .filter(hero => !formData.hero_adjustments[hero.name])
                            .filter(hero => hero.name.toLowerCase().includes(heroSearch.toLowerCase()))
                            .map(hero => (
                              <option key={hero.id} value={hero.name}>{hero.name}</option>
                            ))
                          }
                        </select>
                      <button 
                        type="button" 
                        onClick={addHeroAdjustment} 
                        disabled={!selectedHeroForAdj}
                        style={{
                          ...buttonStyle,
                          opacity: selectedHeroForAdj ? 1 : 0.5,
                          cursor: selectedHeroForAdj ? 'pointer' : 'not-allowed'
                        }}
                      >
                        + Add Hero
                      </button>
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(formData.hero_adjustments).length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No hero adjustments yet</p>
                  </div>
                ) : (
                  Object.entries(formData.hero_adjustments).map(([heroName, data]) => {
                    const isExpanded = expandedHeroes[heroName];
                    return (
                    <div key={heroName} style={cardStyle}>
                      <div 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: isExpanded ? '12px' : '0',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          background: isExpanded ? '#f9fafb' : 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => toggleHeroExpanded(heroName)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▶</span>
                          <strong style={{ fontSize: '1rem' }}>{heroName}</strong>
                          {data.badge && (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: data.badge === 'BUFF' ? '#dcfce7' : data.badge === 'NERF' ? '#fee2e2' : '#e0e7ff',
                              color: data.badge === 'BUFF' ? '#16a34a' : data.badge === 'NERF' ? '#dc2626' : '#4f46e5'
                            }}>
                              {data.badge}
                            </span>
                          )}
                          {(data.adjustments || []).length > 0 && (
                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                              ({data.adjustments.length} skill{data.adjustments.length !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHeroAdjustment(heroName);
                          }}
                          style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ paddingLeft: '8px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Badge</label>
                            <select
                              value={data.badge || 'ADJUST'}
                              onChange={(e) => updateHeroAdjustmentBadge(heroName, e.target.value)}
                              style={inputStyle}
                            >
                              {BADGE_TYPES.map(badge => (
                                <option key={badge} value={badge}>{badge}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Hero Description</label>
                            <textarea
                              value={data.description || ''}
                              onChange={(e) => updateHeroDescription(heroName, e.target.value)}
                              placeholder="General description of hero changes..."
                              style={textareaStyle}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <label style={labelStyle}>Adjustments</label>
                              <button
                                type="button"
                                onClick={() => addHeroAdjustmentSkill(heroName)}
                                style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                + Add
                              </button>
                            </div>

                            {(data.adjustments || []).map((adj, index) => {
                              const hero = heroes.find(h => h.name === heroName);
                              const skills = hero ? heroSkills[hero.id] || [] : [];
                              return (
                          <div key={index} style={{ ...cardStyle, background: '#ffffff', marginBottom: '8px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Skill</label>
                              <select
                                value={adj.skill_type || ''}
                                onChange={(e) => {
                                  const selectedSkill = skills.find(s => s.skill_name === e.target.value);
                                  updateHeroAdjustmentSkill(heroName, index, 'skill_type', e.target.value);
                                  if (selectedSkill) {
                                    updateHeroAdjustmentSkill(heroName, index, 'skill_name', selectedSkill.skill_name);
                                  }
                                }}
                                style={inputStyle}
                              >
                                <option value="">Select skill...</option>
                                {skills.map(skill => (
                                  <option key={skill.id} value={skill.skill_name}>
                                    {skill.skill_name} ({skill.skill_type})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Badge</label>
                              <select
                                value={adj.badge || 'ADJUST'}
                                onChange={(e) => updateHeroAdjustmentSkill(heroName, index, 'badge', e.target.value)}
                                style={inputStyle}
                              >
                                {BADGE_TYPES.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>

                            <div style={{ marginBottom: '8px' }}>
                              <label style={labelStyle}>Description</label>
                              <textarea
                                value={adj.description || ''}
                                onChange={(e) => updateHeroAdjustmentSkill(heroName, index, 'description', e.target.value)}
                                placeholder="Adjustment description..."
                                style={{ ...textareaStyle, minHeight: '60px' }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeHeroAdjustmentSkill(heroName, index)}
                              style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              Remove
                            </button>
                          </div>
                        );
                        })}
                      </div>

                          <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <label style={labelStyle}>Attribute Adjustments</label>
                              <button
                                type="button"
                                onClick={() => addHeroAttributeAdjustment(heroName)}
                                style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                + Add Attribute
                              </button>
                            </div>

                            {(data.attribute_adjustments || []).map((attr, index) => (
                              <div key={index} style={{ ...cardStyle, background: '#ffffff', marginBottom: '8px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                  <label style={labelStyle}>Attribute Name</label>
                                  <input
                                    type="text"
                                    value={attr.attribute_name || ''}
                                    onChange={(e) => updateHeroAttributeAdjustment(heroName, index, 'attribute_name', e.target.value)}
                                    placeholder="e.g., Attack Speed Ratio, HP, Mana"
                                    style={inputStyle}
                                  />
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                  <label style={labelStyle}>Badge</label>
                                  <select
                                    value={attr.badge || 'ADJUST'}
                                    onChange={(e) => updateHeroAttributeAdjustment(heroName, index, 'badge', e.target.value)}
                                    style={inputStyle}
                                  >
                                    {BADGE_TYPES.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                  <label style={labelStyle}>Description</label>
                                  <textarea
                                    value={attr.description || ''}
                                    onChange={(e) => updateHeroAttributeAdjustment(heroName, index, 'description', e.target.value)}
                                    placeholder="e.g., 40% >> 70%"
                                    style={{ ...textareaStyle, minHeight: '60px' }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeHeroAttributeAdjustment(heroName, index)}
                                  style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.75rem' }}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                    </div>
                      )}
                    </div>
                  );
                  })
                )}
              </div>
            )}

            {activeTab === 'equipment' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Equipment Adjustments</h3>
                  
                  {loadingData ? (
                    <p style={{ color: '#6b7280' }}>Loading items...</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search equipment..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <select
                          value={selectedItemForAdj}
                          onChange={(e) => setSelectedItemForAdj(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        >
                          <option value="">Select an item...</option>
                          {items
                            .filter(item => !formData.equipment_adjustments[item.name])
                            .filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase()))
                            .map(item => (
                              <option key={item.id} value={item.name}>{item.name}</option>
                            ))
                          }
                        </select>
                      <button 
                        type="button" 
                        onClick={addEquipmentAdjustment} 
                        disabled={!selectedItemForAdj}
                        style={{
                          ...buttonStyle,
                          opacity: selectedItemForAdj ? 1 : 0.5,
                          cursor: selectedItemForAdj ? 'pointer' : 'not-allowed'
                        }}
                      >
                        + Add Equipment
                      </button>
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(formData.equipment_adjustments).length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No equipment adjustments yet</p>
                  </div>
                ) : (
                  Object.entries(formData.equipment_adjustments).map(([itemName, data]) => (
                    <div key={itemName} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '1rem' }}>{itemName}</strong>
                        <button
                          type="button"
                          onClick={() => removeEquipmentAdjustment(itemName)}
                          style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Badge</label>
                        <select
                          value={data.badge || 'ADJUST'}
                          onChange={(e) => updateEquipmentBadge(itemName, e.target.value)}
                          style={inputStyle}
                        >
                          {BADGE_TYPES.map(badge => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Equipment Description</label>
                        <textarea
                          value={data.description || ''}
                          onChange={(e) => updateEquipmentDescription(itemName, e.target.value)}
                          placeholder="General description of equipment changes..."
                          style={textareaStyle}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={labelStyle}>Adjustments</label>
                          <button
                            type="button"
                            onClick={() => addEquipmentChange(itemName)}
                            style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            + Add
                          </button>
                        </div>

                        {(data.adjustments || []).map((change, index) => {
                          // Підтримка старого формату (string) та нового (object)
                          const isOldFormat = typeof change === 'string';
                          
                          if (isOldFormat) {
                            return (
                              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                <div style={{ flex: 1, padding: '8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                  {change}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEquipmentChange(itemName, index)}
                                  style={{ ...dangerButtonStyle, padding: '6px 10px', fontSize: '0.75rem' }}
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={index} style={{ ...cardStyle, background: '#ffffff', marginBottom: '8px' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={labelStyle}>Name (e.g., "Unique Passive - Magic", "Attribute")</label>
                                <input
                                  type="text"
                                  value={change.name || ''}
                                  onChange={(e) => updateEquipmentChange(itemName, index, 'name', e.target.value)}
                                  placeholder="e.g., Unique Passive - Magic, Attribute"
                                  style={inputStyle}
                                />
                              </div>

                              <div style={{ marginBottom: '8px' }}>
                                <label style={labelStyle}>Badge</label>
                                <select
                                  value={change.badge || 'ADJUST'}
                                  onChange={(e) => updateEquipmentChange(itemName, index, 'badge', e.target.value)}
                                  style={inputStyle}
                                >
                                  {BADGE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>

                              <div style={{ marginBottom: '8px' }}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                  value={change.description || ''}
                                  onChange={(e) => updateEquipmentChange(itemName, index, 'description', e.target.value)}
                                  placeholder="e.g., Magic Power: 75 >> 50"
                                  style={{ ...textareaStyle, minHeight: '60px' }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeEquipmentChange(itemName, index)}
                                style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'battlefield' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Battlefield Adjustments</h3>
                  <button type="button" onClick={addBattlefieldAdjustment} style={buttonStyle}>
                    + Add Adjustment
                  </button>
                </div>

                {Object.keys(formData.battlefield_adjustments).length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No battlefield adjustments yet</p>
                  </div>
                ) : (
                  Object.entries(formData.battlefield_adjustments).map(([name, data]) => (
                    <div key={name} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '1rem' }}>{name}</strong>
                        <button
                          type="button"
                          onClick={() => removeBattlefieldAdjustment(name)}
                          style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Badge</label>
                        <select
                          value={data.badge || 'ADJUST'}
                          onChange={(e) => updateBattlefieldBadge(name, e.target.value)}
                          style={inputStyle}
                        >
                          {BADGE_TYPES.map(badge => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={data.description || ''}
                          onChange={(e) => updateBattlefieldDescription(name, e.target.value)}
                          placeholder="Description..."
                          style={textareaStyle}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>System Adjustments</h3>
                  <button type="button" onClick={addSystemAdjustment} style={buttonStyle}>
                    + Add Adjustment
                  </button>
                </div>

                {formData.system_adjustments.length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No system adjustments yet</p>
                  </div>
                ) : (
                  formData.system_adjustments.map((adjustment, index) => (
                    <div key={index} style={{ ...cardStyle, marginBottom: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>Feature Name</label>
                        <input
                          type="text"
                          value={adjustment.name || ''}
                          onChange={(e) => {
                            setFormData(prev => {
                              const newAdjustments = [...prev.system_adjustments];
                              newAdjustments[index] = { ...newAdjustments[index], name: e.target.value };
                              return { ...prev, system_adjustments: newAdjustments };
                            });
                          }}
                          placeholder="e.g., New Feature"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                          value={adjustment.description || ''}
                          onChange={(e) => {
                            setFormData(prev => {
                              const newAdjustments = [...prev.system_adjustments];
                              newAdjustments[index] = { ...newAdjustments[index], description: e.target.value };
                              return { ...prev, system_adjustments: newAdjustments };
                            });
                          }}
                          placeholder="Describe the system adjustment..."
                          style={{ ...textareaStyle, minHeight: '60px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSystemAdjustment(index)}
                        style={dangerButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'emblems' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Emblem Adjustments</h3>
                  
                  {loadingData ? (
                    <p style={{ color: '#6b7280' }}>Loading emblems...</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search emblems..."
                        value={emblemSearch}
                        onChange={(e) => setEmblemSearch(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <select
                          value={selectedEmblemForAdj}
                          onChange={(e) => setSelectedEmblemForAdj(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        >
                          <option value="">Select an emblem...</option>
                          {emblems
                            .filter(emblem => !formData.emblem_adjustments[emblem.name])
                            .filter(emblem => emblem.name.toLowerCase().includes(emblemSearch.toLowerCase()))
                            .map(emblem => (
                              <option key={emblem.id} value={emblem.name}>{emblem.name}</option>
                            ))
                          }
                        </select>
                      <button 
                        type="button" 
                        onClick={addEmblemAdjustment} 
                        disabled={!selectedEmblemForAdj}
                        style={{
                          ...buttonStyle,
                          opacity: selectedEmblemForAdj ? 1 : 0.5,
                          cursor: selectedEmblemForAdj ? 'pointer' : 'not-allowed'
                        }}
                      >
                        + Add Emblem
                      </button>
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(formData.emblem_adjustments).length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No emblem adjustments yet</p>
                  </div>
                ) : (
                  Object.entries(formData.emblem_adjustments).map(([emblemName, data]) => (
                    <div key={emblemName} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '1rem' }}>{emblemName}</strong>
                        <button
                          type="button"
                          onClick={() => removeEmblemAdjustment(emblemName)}
                          style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={labelStyle}>Badge</label>
                        <select
                          value={data.badge || 'ADJUST'}
                          onChange={(e) => updateEmblemBadge(emblemName, e.target.value)}
                          style={inputStyle}
                        >
                          {BADGE_TYPES.map(badge => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Emblem Description</label>
                        <textarea
                          value={data.description || ''}
                          onChange={(e) => updateEmblemDescription(emblemName, e.target.value)}
                          placeholder="General description of emblem changes..."
                          style={textareaStyle}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={labelStyle}>Adjustments</label>
                          <button
                            type="button"
                            onClick={() => addEmblemChange(emblemName)}
                            style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            + Add
                          </button>
                        </div>

                        {(data.adjustments || []).map((change, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, padding: '8px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                              {change}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEmblemChange(emblemName, index)}
                              style={{ ...dangerButtonStyle, padding: '6px 10px', fontSize: '0.75rem' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'revamped' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Revamped Heroes</h3>
                  
                  {loadingData ? (
                    <p style={{ color: '#6b7280' }}>Loading heroes...</p>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="🔍 Search heroes..."
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        style={{ ...inputStyle, marginBottom: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <select
                          value={selectedRevampedHero}
                          onChange={(e) => setSelectedRevampedHero(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        >
                          <option value="">Select a hero...</option>
                          {heroes
                            .filter(hero => !(formData.revamped_heroes || []).includes(hero.name))
                            .filter(hero => hero.name.toLowerCase().includes(heroSearch.toLowerCase()))
                            .map(hero => (
                              <option key={hero.id} value={hero.name}>{hero.name}</option>
                            ))
                          }
                        </select>
                        <button 
                          type="button" 
                          onClick={addRevampedHero} 
                          disabled={!selectedRevampedHero}
                          style={{
                            ...buttonStyle,
                            opacity: selectedRevampedHero ? 1 : 0.5,
                            cursor: selectedRevampedHero ? 'pointer' : 'not-allowed'
                          }}
                        >
                          + Add Revamped Hero
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {formData.revamped_heroes.length === 0 ? (
                  <div style={cardStyle}>
                    <p style={{ color: '#6b7280', margin: 0 }}>No revamped heroes yet</p>
                  </div>
                ) : (
                  formData.revamped_heroes.map((heroName) => {
                    const data = (formData.revamped_heroes_data && formData.revamped_heroes_data[heroName]) || {};
                    const isExpanded = expandedHeroes[heroName];
                    return (
                      <div key={heroName} style={cardStyle}>
                        <div 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: isExpanded ? '12px' : '0',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            background: isExpanded ? '#f9fafb' : 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => toggleHeroExpanded(heroName)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▶</span>
                            <strong style={{ fontSize: '1rem' }}>{heroName}</strong>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: '#e0e7ff',
                              color: '#4f46e5'
                            }}>
                              REVAMP
                            </span>
                            {(data.adjustments || []).length > 0 && (
                              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                ({data.adjustments.length} skill{data.adjustments.length !== 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRevampedHero(heroName);
                            }}
                            style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>

                        {isExpanded && (
                          <div style={{ paddingLeft: '8px' }}>
                            <div style={{ marginBottom: '16px' }}>
                              <label style={labelStyle}>Revamp Feature</label>
                              <textarea
                                value={data.description || ''}
                                onChange={(e) => updateRevampedHeroDescription(heroName, e.target.value)}
                                placeholder="Description of revamp changes..."
                                style={textareaStyle}
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={labelStyle}>Skills</label>
                                <button
                                  type="button"
                                  onClick={() => addRevampedHeroAdjustment(heroName)}
                                  style={{ ...buttonStyle, padding: '4px 8px', fontSize: '0.8rem' }}
                                >
                                  + Add Skill
                                </button>
                              </div>

                              {(data.adjustments || []).map((adj, index) => (
                                <div key={index} style={{ ...cardStyle, background: '#ffffff', marginBottom: '8px' }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    <label style={labelStyle}>Skill Type</label>
                                    <select
                                      value={adj.skill_type || 'Passive'}
                                      onChange={(e) => updateRevampedHeroAdjustment(heroName, index, 'skill_type', e.target.value)}
                                      style={inputStyle}
                                    >
                                      {SKILL_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div style={{ marginBottom: '8px' }}>
                                    <label style={labelStyle}>Skill Name</label>
                                    <input
                                      type="text"
                                      value={adj.skill_name || ''}
                                      onChange={(e) => updateRevampedHeroAdjustment(heroName, index, 'skill_name', e.target.value)}
                                      placeholder="Skill name"
                                      style={inputStyle}
                                    />
                                  </div>

                                  <div style={{ marginBottom: '8px' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea
                                      value={adj.description || ''}
                                      onChange={(e) => updateRevampedHeroAdjustment(heroName, index, 'description', e.target.value)}
                                      placeholder="Skill description..."
                                      style={{ ...textareaStyle, minHeight: '60px' }}
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeRevampedHeroAdjustment(heroName, index)}
                                    style={{ ...dangerButtonStyle, padding: '4px 8px', fontSize: '0.75rem' }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div style={{ 
            padding: '24px 36px',
            background: 'linear-gradient(to top, #f9fafb 0%, #ffffff 100%)',
            borderTop: '2px solid #f3f4f6',
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px 36px',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #868f96 0%, #596164 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✕ Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '14px 36px',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {patch ? '💾 Update Patch' : '🚀 Create Patch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatchForm;
