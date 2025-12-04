import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HeroForm.css';
import ItemSelector from './ItemSelector';

const API_URL = 'http://localhost:8080/api';

function HeroForm({ hero, gameId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    hero_game_id: '',
    image: '',
    lane: [],
    roles: [],
    specialty: [],
    damage_type: '',
    use_energy: false,
    short_description: '',
    full_description: '',
    createdAt: null,
    head: '',
    main_hero_ban_rate: null,
    main_hero_appearance_rate: null,
    main_hero_win_rate: null,
    counter_data: null,
    compatibility_data: null,
    relation: {
      assist: { desc: '', target_hero_id: [] },
      strong: { desc: '', target_hero_id: [] },
      weak: { desc: '', target_hero_id: [] }
    }
  });

  const [specialtyDropdownOpen, setSpecialtyDropdownOpen] = useState(false);
  const specialtyRef = useRef(null);
  const skillFormRef = useRef(null);
  const skillsListRef = useRef(null);

  const [activeTab, setActiveTab] = useState('basic');

  const [heroStats, setHeroStats] = useState([
    { stat_name: 'HP', value: '' },
    { stat_name: 'HP Regen', value: '' },
    { stat_name: 'Mana', value: '' },
    { stat_name: 'Mana Regen', value: '' },
    { stat_name: 'Physical Attack', value: '' },
    { stat_name: 'Magic Power', value: '' },
    { stat_name: 'Physical Defense', value: '' },
    { stat_name: 'Magic Defense', value: '' },
    { stat_name: 'Attack Speed', value: '' },
    { stat_name: 'Attack Speed Ratio', value: '' },
    { stat_name: 'Movement Speed', value: '' }
  ]);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    skill_description: '',
    passive_description: '',
    active_description: '',
    effect: [],
    preview: '',
    skill_type: 'active',
    effect_types: []
  });
  const [skillParameters, setSkillParameters] = useState([]);
  const [levelScaling, setLevelScaling] = useState([]);
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [showTransformed, setShowTransformed] = useState(false);

  const [proBuilds, setProBuilds] = useState([]);
  const [items, setItems] = useState([]);
  const [emblems, setEmblems] = useState([]);
  const [battleSpells, setBattleSpells] = useState([]);
  const [allHeroes, setAllHeroes] = useState([]);

  // Функція для отримання head героя по heroid
  const getHeroHeadById = (heroid) => {
    const foundHero = allHeroes.find(h => h.hero_game_id === heroid);
    return foundHero ? foundHero.head : null;
  };

  // Завантажуємо список всіх героїв для превью
  useEffect(() => {
    const fetchAllHeroes = async () => {
      try {
        const response = await axios.get(`${API_URL}/heroes?game_id=${gameId}`);
        setAllHeroes(response.data);
      } catch (error) {
        console.error('Error fetching heroes:', error);
      }
    };
    fetchAllHeroes();
  }, [gameId]);

  // Update stat names when useEnergy changes
  useEffect(() => {
    setHeroStats(prevStats => prevStats.map(stat => {
      if (stat.stat_name === 'Mana' && formData.use_energy) {
        return { ...stat, stat_name: 'Energy' };
      } else if (stat.stat_name === 'Energy' && !formData.use_energy) {
        return { ...stat, stat_name: 'Mana' };
      } else if (stat.stat_name === 'Mana Regen' && formData.use_energy) {
        return { ...stat, stat_name: 'Energy Regen' };
      } else if (stat.stat_name === 'Energy Regen' && !formData.use_energy) {
        return { ...stat, stat_name: 'Mana Regen' };
      }
      return stat;
    }));
  }, [formData.use_energy]);

  // Load hero data when editing
  useEffect(() => {
    if (hero) {
      setFormData({
        name: hero.name || '',
        hero_game_id: hero.hero_game_id || '',
        image: hero.image || '',
        lane: Array.isArray(hero.lane) ? hero.lane : (hero.lane ? [hero.lane] : []),
        roles: Array.isArray(hero.roles) ? hero.roles : [],
        specialty: Array.isArray(hero.specialty) ? hero.specialty : [],
        damage_type: hero.damage_type || '',
        use_energy: hero.use_energy || false,
        short_description: hero.short_description || '',
        full_description: hero.full_description || '',
        createdAt: hero.createdAt || null,
        head: hero.head || '',
        main_hero_ban_rate: hero.main_hero_ban_rate || null,
        main_hero_appearance_rate: hero.main_hero_appearance_rate || null,
        main_hero_win_rate: hero.main_hero_win_rate || null,
        counter_data: hero.counter_data || null,
        compatibility_data: hero.compatibility_data || null,
        relation: hero.relation || {
          assist: { desc: '', target_hero_id: [] },
          strong: { desc: '', target_hero_id: [] },
          weak: { desc: '', target_hero_id: [] }
        }
      });

      // Load stats - create fresh stat list
      const useEnergy = hero.use_energy || false;
      const initialStats = [
        { stat_name: 'HP', value: '' },
        { stat_name: 'HP Regen', value: '' },
        { stat_name: useEnergy ? 'Energy' : 'Mana', value: '' },
        { stat_name: useEnergy ? 'Energy Regen' : 'Mana Regen', value: '' },
        { stat_name: 'Physical Attack', value: '' },
        { stat_name: 'Magic Power', value: '' },
        { stat_name: 'Physical Defense', value: '' },
        { stat_name: 'Magic Defense', value: '' },
        { stat_name: 'Attack Speed', value: '' },
        { stat_name: 'Attack Speed Ratio', value: '' },
        { stat_name: 'Movement Speed', value: '' }
      ];

      if (hero.hero_stats && Array.isArray(hero.hero_stats)) {
        const updatedStats = initialStats.map(stat => {
          const heroStat = hero.hero_stats.find(s => s.stat_name === stat.stat_name);
          if (heroStat) {
            // Convert value to string with dot (not comma)
            const value = String(heroStat.value).replace(',', '.');
            return { ...stat, value: value };
          }
          return stat;
        });
        setHeroStats(updatedStats);
      } else {
        setHeroStats(initialStats);
      }

      // Load skills
      if (hero.skills && Array.isArray(hero.skills)) {
        setSkills(hero.skills);
      } else {
        setSkills([]);
      }

      // Load pro builds
      if (hero.pro_builds && Array.isArray(hero.pro_builds)) {
        setProBuilds(hero.pro_builds);
      } else {
        setProBuilds([]);
      }
    } else {
      // Reset form when no hero (creating new)
      setFormData({
        name: '',
        hero_game_id: '',
        image: '',
        lane: [],
        roles: [],
        specialty: [],
        damage_type: '',
        use_energy: false,
        short_description: '',
        full_description: '',
        relation: {
          assist: { desc: '', target_hero_id: [] },
          strong: { desc: '', target_hero_id: [] },
          weak: { desc: '', target_hero_id: [] }
        }
      });
      setHeroStats([
        { stat_name: 'HP', value: '' },
        { stat_name: 'HP Regen', value: '' },
        { stat_name: 'Mana', value: '' },
        { stat_name: 'Mana Regen', value: '' },
        { stat_name: 'Physical Attack', value: '' },
        { stat_name: 'Magic Power', value: '' },
        { stat_name: 'Physical Defense', value: '' },
        { stat_name: 'Magic Defense', value: '' },
        { stat_name: 'Attack Speed', value: '' },
        { stat_name: 'Attack Speed Ratio', value: '' },
        { stat_name: 'Movement Speed', value: '' }
      ]);
      setSkills([]);
      setProBuilds([]);
    }
  }, [hero]);

  // Load items, emblems, battle spells
  useEffect(() => {
    if (gameId) {
      axios.get(`${API_URL}/items?game_id=${gameId}`)
        .then(res => setItems(res.data || []))
        .catch(err => console.error('Error loading items:', err));
      
      axios.get(`${API_URL}/emblems?game_id=${gameId}`)
        .then(res => setEmblems(res.data || []))
        .catch(err => console.error('Error loading emblems:', err));
      
      axios.get(`${API_URL}/battle-spells?game_id=${gameId}`)
        .then(res => setBattleSpells(res.data || []))
        .catch(err => console.error('Error loading battle spells:', err));
    }
  }, [gameId]);

  // Close specialty dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (specialtyRef.current && !specialtyRef.current.contains(event.target)) {
        setSpecialtyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleToggle = (role) => {
    setFormData(prevData => ({
      ...prevData,
      roles: prevData.roles.includes(role)
        ? prevData.roles.filter(r => r !== role)
        : [...prevData.roles, role]
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prevData => ({
      ...prevData,
      specialty: prevData.specialty.includes(specialty)
        ? prevData.specialty.filter(s => s !== specialty)
        : [...prevData.specialty, specialty]
    }));
  };

  const handleLaneToggle = (lane) => {
    setFormData(prevData => ({
      ...prevData,
      lane: prevData.lane.includes(lane)
        ? prevData.lane.filter(l => l !== lane)
        : [...prevData.lane, lane]
    }));
  };

  const handleEffectTypeToggle = (effectType) => {
    setNewSkill(prevSkill => {
      const currentTypes = Array.isArray(prevSkill.effect_types) ? prevSkill.effect_types : [];
      return {
        ...prevSkill,
        effect_types: currentTypes.includes(effectType)
          ? currentTypes.filter(et => et !== effectType)
          : [...currentTypes, effectType]
      };
    });
  };

  const handleEffectToggle = (effectType) => {
    setNewSkill(prevSkill => {
      const currentEffect = Array.isArray(prevSkill.effect) ? prevSkill.effect : [];
      return {
        ...prevSkill,
        effect: currentEffect.includes(effectType)
          ? currentEffect.filter(e => e !== effectType)
          : [...currentEffect, effectType]
      };
    });
  };

  const handleStatChange = (index, value) => {
    const updatedStats = [...heroStats];
    updatedStats[index].value = value;
    setHeroStats(updatedStats);
  };

  const handleStatBlur = (index) => {
    const updatedStats = [...heroStats];
    const statName = updatedStats[index].stat_name;
    const value = updatedStats[index].value;
    
    // Для Attack Speed Ratio автоматично додаємо % при виході з поля
    if (statName === 'Attack Speed Ratio' && value && !value.toString().includes('%')) {
      updatedStats[index].value = value + '%';
      setHeroStats(updatedStats);
    }
  };

  const handleSkillChange = (e) => {
    const { name, value } = e.target;
    setNewSkill({
      ...newSkill,
      [name]: value
    });

    // Якщо змінюється тип навички на Active, додаємо Cooldown та Mana Cost
    if (name === 'skill_type' && value === 'active') {
      const hasCooldown = skillParameters.some(p => p.name === 'Cooldown');
      const hasManaCost = skillParameters.some(p => p.name === 'Mana Cost');
      
      const newParams = [...skillParameters];
      if (!hasCooldown) {
        newParams.push({ name: 'Cooldown', value: '' });
      }
      if (!hasManaCost) {
        newParams.push({ name: 'Mana Cost', value: '' });
      }
      
      if (!hasCooldown || !hasManaCost) {
        setSkillParameters(newParams);
      }
    }
  };

  // Skill Parameters
  const addSkillParameter = () => {
    setSkillParameters([...skillParameters, { name: '', value: '' }]);
  };

  const updateSkillParameter = (index, field, value) => {
    const updated = [...skillParameters];
    updated[index][field] = value;
    setSkillParameters(updated);
  };

  const removeSkillParameter = (index) => {
    setSkillParameters(skillParameters.filter((_, i) => i !== index));
  };

  // Level Scaling
  const addLevelScaling = () => {
    setLevelScaling([...levelScaling, {
      name: '',
      levels: ['', '', '', '', '', '']
    }]);
  };

  const updateLevelScalingName = (index, value) => {
    const updated = [...levelScaling];
    updated[index].name = value;
    setLevelScaling(updated);
  };

  const updateLevelScalingValue = (scalingIndex, levelIndex, value) => {
    const updated = [...levelScaling];
    updated[scalingIndex].levels[levelIndex] = value;
    setLevelScaling(updated);
  };

  const removeLevelScaling = (index) => {
    setLevelScaling(levelScaling.filter((_, i) => i !== index));
  };

  const addOrUpdateSkill = () => {
    if (!newSkill.skill_name.trim()) {
      alert('Введіть назву навички');
      return;
    }

    const skillData = {
      ...newSkill,
      skill_parameters: skillParameters.reduce((acc, param) => {
        if (param.name) acc[param.name] = param.value;
        return acc;
      }, {}),
      level_scaling: levelScaling
    };

    if (editingSkillIndex !== null) {
      const updatedSkills = [...skills];
      updatedSkills[editingSkillIndex] = skillData;
      setSkills(updatedSkills);
      setEditingSkillIndex(null);
    } else {
      setSkills([...skills, skillData]);
    }

    // Reset form
    setNewSkill({
      skill_name: '',
      skill_description: '',
      passive_description: '',
      active_description: '',
      effect: [],
      preview: '',
      skill_type: 'active',
      effect_types: []
    });
    setSkillParameters([]);
    setLevelScaling([]);
    
    // Scroll to top of skills list
    setTimeout(() => {
      if (skillsListRef.current) {
        skillsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const editSkill = (index) => {
    const skill = skills[index];
    setNewSkill({
      skill_name: skill.skill_name || '',
      skill_description: skill.skill_description || '',
      passive_description: skill.passive_description || '',
      active_description: skill.active_description || '',
      effect: Array.isArray(skill.effect) ? skill.effect : (skill.effect ? [skill.effect] : []),
      preview: skill.preview || '',
      skill_type: skill.skill_type || 'active',
      effect_types: Array.isArray(skill.effect_types) ? skill.effect_types : []
    });

    // Load parameters
    if (skill.skill_parameters && typeof skill.skill_parameters === 'object') {
      const params = Object.entries(skill.skill_parameters).map(([name, value]) => ({
        name,
        value
      }));
      setSkillParameters(params);
    } else {
      setSkillParameters([]);
    }

    // Load level scaling
    if (skill.level_scaling && Array.isArray(skill.level_scaling) && skill.level_scaling.length > 0) {
      // Check format: DB has format [{level: 1, values: {Base Damage: 120, ...}}, ...]
      
      const firstItem = skill.level_scaling[0];
      if (firstItem.name && firstItem.levels) {
        // Already in UI format
        setLevelScaling(skill.level_scaling);
      } else if (firstItem.level !== undefined && firstItem.values) {
        // Convert from DB format to UI format
        const scalingMap = {};
        skill.level_scaling.forEach(levelData => {
          if (levelData.values) {
            Object.keys(levelData.values).forEach(key => {
              if (!scalingMap[key]) {
                scalingMap[key] = { name: key, levels: [] };
              }
              scalingMap[key].levels.push(levelData.values[key]);
            });
          }
        });
        setLevelScaling(Object.values(scalingMap));
      } else {
        setLevelScaling([]);
      }
    } else {
      setLevelScaling([]);
    }

    setEditingSkillIndex(index);
    
    // Scroll to skill form
    setTimeout(() => {
      if (skillFormRef.current) {
        skillFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const heroData = {
      ...formData,
      game_id: gameId,
      hero_stats: heroStats.filter(stat => stat.value !== '').map(stat => ({
        stat_name: stat.stat_name,
        value: parseFloat(String(stat.value).replace(',', '.')) || 0
      })),
      skills: skills,
      pro_builds: proBuilds
    };

    try {
      if (hero) {
        await axios.put(`${API_URL}/heroes/${hero.id}`, heroData);
        alert('Героя оновлено успішно!');
      } else {
        await axios.post(`${API_URL}/heroes`, heroData);
        alert('Героя створено успішно!');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving hero:', error);
      alert('Помилка збереження героя: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{hero ? 'Редагувати героя' : 'Додати героя'}</h2>
        
        {/* Tabs Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {[
            { id: 'basic', label: 'Основна інформація' },
            { id: 'stats', label: 'Base Statistics' },
            { id: 'description', label: 'Опис' },
            { id: 'skills', label: 'Навички' },
            { id: 'pro_builds', label: 'Pro Builds' },
            { id: 'relations', label: 'Зв\'язки' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
          <div className="form-section">
            <label>Ім'я героя</label>
            <input
              type="text"
              name="name"
              placeholder="Ім'я героя"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <label>ID героя в грі</label>
            <input
              type="number"
              name="hero_game_id"
              placeholder="ID героя в грі"
              value={formData.hero_game_id}
              onChange={handleInputChange}
            />
            
            <label>URL зображення героя</label>
            <input
              type="text"
              name="image"
              placeholder="URL зображення"
              value={formData.image}
              onChange={handleInputChange}
            />
            {formData.image && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <img 
                  src={formData.image} 
                  alt="Hero preview" 
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '150px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <label>Head Image URL (from API)</label>
            <input
              type="text"
              name="head"
              placeholder="Head image URL (auto-filled from API)"
              value={formData.head}
              onChange={handleInputChange}
              style={{ marginBottom: '10px' }}
            />
            {formData.head && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <img 
                  src={formData.head} 
                  alt="Head preview" 
                  style={{ 
                    maxWidth: '100px', 
                    maxHeight: '100px', 
                    borderRadius: '50%',
                    border: '2px solid #ddd'
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <label>Created At (timestamp)</label>
            <input
              type="text"
              name="createdAt"
              placeholder="Creation timestamp (auto-filled from API)"
              value={formData.createdAt || ''}
              onChange={(e) => setFormData({ ...formData, createdAt: e.target.value ? parseInt(e.target.value) : null })}
              style={{ marginBottom: '10px' }}
              readOnly
            />
            {formData.createdAt && (
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                📅 {new Date(formData.createdAt).toLocaleString('uk-UA')}
              </div>
            )}

            <div style={{ 
              marginTop: '20px', 
              marginBottom: '20px',
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>📊 Hero Statistics (from API)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#64748b' }}>🚫 Ban Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="main_hero_ban_rate"
                    placeholder="Auto-filled"
                    value={formData.main_hero_ban_rate || ''}
                    onChange={(e) => setFormData({ ...formData, main_hero_ban_rate: e.target.value ? parseFloat(e.target.value) : null })}
                    style={{ 
                      marginTop: '5px',
                      padding: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: formData.main_hero_ban_rate > 40 ? '#dc2626' : '#059669'
                    }}
                    readOnly
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#64748b' }}>🎯 Pick Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="main_hero_appearance_rate"
                    placeholder="Auto-filled"
                    value={formData.main_hero_appearance_rate || ''}
                    onChange={(e) => setFormData({ ...formData, main_hero_appearance_rate: e.target.value ? parseFloat(e.target.value) : null })}
                    style={{ 
                      marginTop: '5px',
                      padding: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: '#2563eb'
                    }}
                    readOnly
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#64748b' }}>🏆 Win Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="main_hero_win_rate"
                    placeholder="Auto-filled"
                    value={formData.main_hero_win_rate || ''}
                    onChange={(e) => setFormData({ ...formData, main_hero_win_rate: e.target.value ? parseFloat(e.target.value) : null })}
                    style={{ 
                      marginTop: '5px',
                      padding: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: formData.main_hero_win_rate >= 50 ? '#059669' : '#dc2626'
                    }}
                    readOnly
                  />
                </div>
              </div>

              {(formData.main_hero_ban_rate || formData.main_hero_appearance_rate || formData.main_hero_win_rate) && (
                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  fontStyle: 'italic'
                }}>
                  💡 Stats are auto-updated from mlbb-stats API. Run fetch_hero_stats.py to refresh.
                </div>
              )}
            </div>
            
            {/* Counter Relationship */}
            {formData.counter_data && (
              <div style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                padding: '15px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#991b1b' }}>⚔️ Counter Relationship</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {/* Best Counters */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#dc2626' }}>
                      🛡️ Best Counters (хто контрить цього героя)
                    </h5>
                    {formData.counter_data.best_counters && formData.counter_data.best_counters.length > 0 ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {formData.counter_data.best_counters.map((counter, idx) => {
                          const heroHead = getHeroHeadById(counter.heroid);
                          return (
                          <div key={idx} style={{ 
                            padding: '8px', 
                            marginBottom: '5px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: '1px solid #fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            {heroHead && (
                              <img 
                                src={heroHead} 
                                alt={`Hero ${counter.heroid}`}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%',
                                  border: '2px solid #fecaca',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold' }}>#{idx + 1} Hero ID: {counter.heroid}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Win: {counter.win_rate}% | Counter Score: +{counter.increase_win_rate}%
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No data</div>
                    )}
                  </div>

                  {/* Most Countered by */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#059669' }}>
                      ⚡ Most Countered by (кого контрить цей герой)
                    </h5>
                    {formData.counter_data.most_countered_by && formData.counter_data.most_countered_by.length > 0 ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {formData.counter_data.most_countered_by.map((counter, idx) => {
                          const heroHead = getHeroHeadById(counter.heroid);
                          return (
                          <div key={idx} style={{ 
                            padding: '8px', 
                            marginBottom: '5px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: '1px solid #d1fae5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            {heroHead && (
                              <img 
                                src={heroHead} 
                                alt={`Hero ${counter.heroid}`}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%',
                                  border: '2px solid #bbf7d0',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold' }}>#{idx + 1} Hero ID: {counter.heroid}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Win: {counter.win_rate}% | Advantage: {counter.increase_win_rate}%
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No data</div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  fontStyle: 'italic'
                }}>
                  💡 Counter data auto-updated from API. Run fetch_hero_counter_compatibility.py to refresh.
                </div>
              </div>
            )}

            {/* Compatibility */}
            {formData.compatibility_data && (
              <div style={{ 
                marginTop: '20px', 
                marginBottom: '20px',
                padding: '15px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#15803d' }}>🤝 Team Compatibility</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {/* Compatible */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#059669' }}>
                      ✅ Best Teammates
                    </h5>
                    {formData.compatibility_data.compatible && formData.compatibility_data.compatible.length > 0 ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {formData.compatibility_data.compatible.map((teammate, idx) => {
                          const heroHead = getHeroHeadById(teammate.heroid);
                          return (
                          <div key={idx} style={{ 
                            padding: '8px', 
                            marginBottom: '5px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: '1px solid #d1fae5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            {heroHead && (
                              <img 
                                src={heroHead} 
                                alt={`Hero ${teammate.heroid}`}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%',
                                  border: '2px solid #bbf7d0',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold' }}>#{idx + 1} Hero ID: {teammate.heroid}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Win: {teammate.win_rate}% | Synergy: +{teammate.increase_win_rate}%
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No data</div>
                    )}
                  </div>

                  {/* Not Compatible */}
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#dc2626' }}>
                      ❌ Bad Teammates
                    </h5>
                    {formData.compatibility_data.not_compatible && formData.compatibility_data.not_compatible.length > 0 ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {formData.compatibility_data.not_compatible.map((teammate, idx) => {
                          const heroHead = getHeroHeadById(teammate.heroid);
                          return (
                          <div key={idx} style={{ 
                            padding: '8px', 
                            marginBottom: '5px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: '1px solid #fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            {heroHead && (
                              <img 
                                src={heroHead} 
                                alt={`Hero ${teammate.heroid}`}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%',
                                  border: '2px solid #fecaca',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold' }}>#{idx + 1} Hero ID: {teammate.heroid}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                Win: {teammate.win_rate}% | Penalty: {teammate.increase_win_rate}%
                              </div>
                            </div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No data</div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  fontStyle: 'italic'
                }}>
                  💡 Compatibility data auto-updated from API. Run fetch_hero_counter_compatibility.py to refresh.
                </div>
              </div>
            )}
            
            <label>Лінія (Lane) (можна обрати кілька)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', marginBottom: '15px' }}>
              {['Gold Lane', 'Jungle', 'Mid Lane', 'Exp Lane', 'Roam'].map(lane => (
                <label key={lane} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.lane.includes(lane)}
                    onChange={() => handleLaneToggle(lane)}
                    style={{ marginRight: '5px' }}
                  />
                  {lane}
                </label>
              ))}
            </div>
            
            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
              <label style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '5px 10px',
                background: '#eff6ff',
                borderRadius: '4px',
                fontSize: '0.85rem',
                border: '1px solid #bfdbfe',
                width: 'fit-content'
              }}>
                <input
                  type="checkbox"
                  name="use_energy"
                  checked={formData.use_energy}
                  onChange={(e) => setFormData({ ...formData, use_energy: e.target.checked })}
                  style={{ marginRight: '6px' }}
                />
                ⚡ Energy
              </label>
            </div>
            
            <label>Ролі (можна обрати кілька)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px', marginBottom: '15px' }}>
              {['Assassin', 'Fighter', 'Marksman', 'Mage', 'Support', 'Tank'].map(role => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    style={{ marginRight: '5px' }}
                  />
                  {role}
                </label>
              ))}
            </div>

            <label>Specialty (можна обрати кілька)</label>
            <div ref={specialtyRef} style={{ position: 'relative', marginBottom: '15px' }}>
              <div
                onClick={() => setSpecialtyDropdownOpen(!specialtyDropdownOpen)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: 'white',
                  minHeight: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '5px'
                }}
              >
                {formData.specialty.length > 0 ? (
                  formData.specialty.map(spec => (
                    <span key={spec} style={{
                      background: '#e0e7ff',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '0.85rem',
                      color: '#4338ca'
                    }}>
                      {spec}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#9ca3af' }}>Оберіть спеціальності...</span>
                )}
              </div>
              
              {specialtyDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginTop: '4px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {['Regen', 'Crowd Control', 'Finisher', 'Charge', 'Push', 'Damage', 'Burst', 'Poke', 'Initiator', 'Magic Damage', 'Mixed Damage', 'Guard', 'Chase', 'Control', 'Support'].map(spec => (
                    <label
                      key={spec}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        background: formData.specialty.includes(spec) ? '#f3f4f6' : 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = formData.specialty.includes(spec) ? '#f3f4f6' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialty.includes(spec)}
                        onChange={() => handleSpecialtyToggle(spec)}
                        style={{ marginRight: '8px' }}
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label>Damage Type</label>
            <select
              name="damage_type"
              value={formData.damage_type}
              onChange={handleInputChange}
            >
              <option value="">Оберіть тип шкоди</option>
              <option value="Physical">Physical</option>
              <option value="Magic">Magic</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          )}

          {/* Base Statistics Tab */}
          {activeTab === 'stats' && (
          <div className="form-section">
            <div className="stats-grid">
              {heroStats.map((stat, index) => (
                <div key={index} className="stat-row">
                  <label>{stat.stat_name}</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, e.target.value)}
                    onBlur={() => handleStatBlur(index)}
                    placeholder="Значення"
                  />
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Description Tab */}
          {activeTab === 'description' && (
          <div className="form-section">
            <textarea
              name="short_description"
              placeholder="Короткий опис"
              value={formData.short_description}
              onChange={handleInputChange}
              rows="2"
            />
            <textarea
              name="full_description"
              placeholder="Повний опис"
              value={formData.full_description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
          <div className="form-section">
            {/* Кнопка перемикання */}
            {skills.length > 0 && skills.some(s => s.is_transformed === 1) && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                background: '#f3f4f6', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowTransformed(!showTransformed)}
                  style={{
                    padding: '8px 16px',
                    background: showTransformed ? '#8b5cf6' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {showTransformed ? '🔄 Базові навички' : '⚡ Трансформовані навички'}
                </button>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  {showTransformed 
                    ? `Трансформовані (${skills.filter(s => s.is_transformed === 1).length})`
                    : `Базові (${skills.filter(s => s.is_transformed !== 1).length})`
                  }
                </span>
              </div>
            )}
            {skills.length > 0 && (
              <div ref={skillsListRef} className="skills-list">
                {skills.filter(skill => showTransformed ? skill.is_transformed === 1 : skill.is_transformed !== 1).map((skill, index) => (
                  <div key={index} className="skill-card">
                    <div className="skill-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {(skill.image || skill.preview) && (
                          <img 
                            src={skill.image || skill.preview} 
                            alt={skill.skill_name} 
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              borderRadius: '8px',
                              border: '2px solid #ddd',
                              backgroundColor: '#2a2a2a'
                            }} 
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <h4>{skill.skill_name}</h4>
                        {skill.is_transformed === 1 && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            background: '#8b5cf6',
                            color: 'white',
                            borderRadius: '10px',
                            fontWeight: '600',
                            marginLeft: '8px'
                          }}>
                            TRANSFORMED
                          </span>
                        )}
                      </div>
                      <span className={`skill-badge ${skill.skill_type}`}>
                        {skill.skill_type === 'passive' ? 'PASSIVE' : 'ACTIVE'}
                      </span>
                    </div>
                    {skill.skill_description && (
                      <p><strong>Опис:</strong> {skill.skill_description}</p>
                    )}
                    {skill.passive_description && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>🟡 Passive:</strong> {skill.passive_description}
                      </div>
                    )}
                    {skill.active_description && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>🔵 Active:</strong> {skill.active_description}
                      </div>
                    )}
                    {skill.effect_types && Array.isArray(skill.effect_types) && skill.effect_types.length > 0 && (
                      <div className="skill-effect" style={{ marginTop: '8px' }}>
                        <strong>Типи ефектів:</strong>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {skill.effect_types.map((eff, idx) => (
                            <span key={idx} style={{ 
                              fontSize: '0.75rem', 
                              padding: '3px 8px', 
                              background: '#dbeafe',
                              color: '#1e40af',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              {eff}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="skill-actions">
                      <button type="button" onClick={() => editSkill(index)}>
                        Редагувати
                      </button>
                      <button type="button" onClick={() => removeSkill(index)} className="delete-btn">
                        Видалити
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Skill Form */}
            <div ref={skillFormRef} className="skill-form">
              <h4>{editingSkillIndex !== null ? 'Редагувати навичку' : 'Додати навичку'}</h4>
              
              <input
                type="text"
                name="skill_name"
                placeholder="Назва навички"
                value={newSkill.skill_name}
                onChange={handleSkillChange}
              />
              
              <textarea
                name="skill_description"
                placeholder="Загальний опис"
                value={newSkill.skill_description}
                onChange={handleSkillChange}
                rows="2"
              />
              
              <textarea
                name="passive_description"
                placeholder="Опис пасивного ефекту (якщо є)"
                value={newSkill.passive_description}
                onChange={handleSkillChange}
                rows="2"
              />
              
              <textarea
                name="active_description"
                placeholder="Опис активного ефекту (якщо є)"
                value={newSkill.active_description}
                onChange={handleSkillChange}
                rows="2"
              />
              
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Типи ефектів (можна вибрати кілька)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                  {['Attach', 'AoE', 'Blink', 'Buff', 'Burst', 'Camouflage', 'Charge', 'Conceal', 'CC', 'CC Immune', 'Damage', 'Death Immunity', 'Debuff', 'Invincible', 'Heal', 'Mobility', 'Morph', 'Reduce DMG', 'Remove CC', 'Shield', 'Slow', 'Speed Up', 'Summon', 'Teleport'].map(effectType => {
                    const isChecked = Array.isArray(newSkill.effect_types) && newSkill.effect_types.includes(effectType);
                    return (
                      <label key={effectType} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '6px 10px',
                        background: isChecked ? '#e0e7ff' : '#f3f4f6',
                        borderRadius: '6px',
                        border: isChecked ? '2px solid #4f46e5' : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEffectTypeToggle(effectType)}
                          style={{ marginRight: '6px' }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>{effectType}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <label>URL skill preview</label>
              <input
                type="text"
                name="preview"
                placeholder="URL превью"
                value={newSkill.preview}
                onChange={handleSkillChange}
              />
              {newSkill.preview && (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <img 
                    src={newSkill.preview} 
                    alt="Skill preview" 
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '100px', 
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      backgroundColor: '#2a2a2a'
                    }} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <label>Тип навички</label>
              <select
                name="skill_type"
                value={newSkill.skill_type}
                onChange={handleSkillChange}
              >
                <option value="active">Active</option>
                <option value="passive">Passive</option>
              </select>

              {/* Skill Parameters */}
              <div className="skill-parameters">
                <h5>Параметри навички</h5>
                {Array.isArray(skillParameters) && skillParameters.map((param, index) => (
                  <div key={index} className="parameter-row">
                    <input
                      type="text"
                      placeholder="Назва (Damage, Cooldown...)"
                      value={param.name}
                      onChange={(e) => updateSkillParameter(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Значення"
                      value={param.value}
                      onChange={(e) => updateSkillParameter(index, 'value', e.target.value)}
                    />
                    <button type="button" onClick={() => removeSkillParameter(index)}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addSkillParameter} className="add-param-btn">
                  + Додати параметр
                </button>
              </div>

              {/* Level Scaling */}
              <div className="level-scaling">
                <h5>Level Scaling (1-6)</h5>
                {Array.isArray(levelScaling) && levelScaling.map((scaling, sIndex) => (
                  <div key={sIndex} className="scaling-section">
                    <div className="scaling-header">
                      <input
                        type="text"
                        placeholder="Назва (Cooldown, Mana Regen...)"
                        value={scaling.name}
                        onChange={(e) => updateLevelScalingName(sIndex, e.target.value)}
                        className="scaling-name"
                      />
                      <button type="button" onClick={() => removeLevelScaling(sIndex)}>
                        ✕
                      </button>
                    </div>
                    <div className="scaling-levels">
                      {[1, 2, 3, 4, 5, 6].map((level, lIndex) => (
                        <div key={lIndex} className="level-input">
                          <label>Lvl {level}</label>
                          <input
                            type="text"
                            value={(scaling.levels && scaling.levels[lIndex]) || ''}
                            onChange={(e) => updateLevelScalingValue(sIndex, lIndex, e.target.value)}
                            placeholder="..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addLevelScaling} className="add-scaling-btn">
                  + Додати Scaling
                </button>
              </div>

              <button type="button" onClick={addOrUpdateSkill} className="add-skill-btn">
                {editingSkillIndex !== null ? 'Оновити навичку' : 'Додати навичку'}
              </button>
            </div>
          </div>
          )}

          {/* Relations Tab */}
          {activeTab === 'relations' && (
          <div className="relations-section">
            <h4>Зв'язки з героями</h4>

            {/* Assist */}
            <div className="relation-group">
              <h5>💚 Assist (Синергія)</h5>
              <label>Опис:</label>
              <textarea
                rows="3"
                value={formData.relation?.assist?.desc || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      assist: {
                        ...formData.relation.assist,
                        desc: e.target.value
                      }
                    }
                  });
                }}
                placeholder="Опис героїв, з якими добре працює..."
              />
              <label>Hero IDs (через кому):</label>
              <input
                type="text"
                value={(formData.relation?.assist?.target_hero_id || []).filter(id => id !== 0).join(', ')}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id).map(id => parseInt(id)).filter(id => !isNaN(id) && id !== 0);
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      assist: {
                        ...formData.relation.assist,
                        target_hero_id: ids
                      }
                    }
                  });
                }}
                placeholder="1, 2, 3..."
              />
              {/* Hero Previews */}
              {formData.relation?.assist?.target_hero && Array.isArray(formData.relation.assist.target_hero) && formData.relation.assist.target_hero.length > 0 && (
                <div className="hero-previews">
                  {formData.relation.assist.target_hero.map((heroData, idx) => {
                    // Try different data structures
                    const heroInfo = heroData?.data || heroData;
                    const imgUrl = heroInfo?.head || heroInfo?.imgPreview || heroInfo?.img;
                    const heroName = heroInfo?.name || `Hero ${idx + 1}`;
                    
                    // Only render if we have an image
                    if (!imgUrl) return null;
                    
                    return (
                      <div key={idx} className="hero-preview-card">
                        <img src={imgUrl} alt={heroName} onError={(e) => e.target.style.display = 'none'} />
                        <span>{heroName}</span>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>

            {/* Strong */}
            <div className="relation-group">
              <h5>⚔️ Strong Against (Сильний проти)</h5>
              <label>Опис:</label>
              <textarea
                rows="3"
                value={formData.relation?.strong?.desc || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      strong: {
                        ...formData.relation.strong,
                        desc: e.target.value
                      }
                    }
                  });
                }}
                placeholder="Опис героїв, проти яких ефективний..."
              />
              <label>Hero IDs (через кому):</label>
              <input
                type="text"
                value={(formData.relation?.strong?.target_hero_id || []).filter(id => id !== 0).join(', ')}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id).map(id => parseInt(id)).filter(id => !isNaN(id) && id !== 0);
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      strong: {
                        ...formData.relation.strong,
                        target_hero_id: ids
                      }
                    }
                  });
                }}
                placeholder="1, 2, 3..."
              />
              {/* Hero Previews */}
              {formData.relation?.strong?.target_hero && Array.isArray(formData.relation.strong.target_hero) && formData.relation.strong.target_hero.length > 0 && (
                <div className="hero-previews">
                  {formData.relation.strong.target_hero.map((heroData, idx) => {
                    const heroInfo = heroData?.data || heroData;
                    const imgUrl = heroInfo?.head || heroInfo?.imgPreview || heroInfo?.img;
                    const heroName = heroInfo?.name || `Hero ${idx + 1}`;
                    
                    if (!imgUrl) return null;
                    
                    return (
                      <div key={idx} className="hero-preview-card">
                        <img src={imgUrl} alt={heroName} onError={(e) => e.target.style.display = 'none'} />
                        <span>{heroName}</span>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>

            {/* Weak */}
            <div className="relation-group">
              <h5>🛡️ Weak Against (Слабкий проти)</h5>
              <label>Опис:</label>
              <textarea
                rows="3"
                value={formData.relation?.weak?.desc || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      weak: {
                        ...formData.relation.weak,
                        desc: e.target.value
                      }
                    }
                  });
                }}
                placeholder="Опис героїв, проти яких слабкий..."
              />
              <label>Hero IDs (через кому):</label>
              <input
                type="text"
                value={(formData.relation?.weak?.target_hero_id || []).filter(id => id !== 0).join(', ')}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id).map(id => parseInt(id)).filter(id => !isNaN(id) && id !== 0);
                  setFormData({
                    ...formData,
                    relation: {
                      ...formData.relation,
                      weak: {
                        ...formData.relation.weak,
                        target_hero_id: ids
                      }
                    }
                  });
                }}
                placeholder="1, 2, 3..."
              />
              {/* Hero Previews */}
              {formData.relation?.weak?.target_hero && Array.isArray(formData.relation.weak.target_hero) && formData.relation.weak.target_hero.length > 0 && (
                <div className="hero-previews">
                  {formData.relation.weak.target_hero.map((heroData, idx) => {
                    const heroInfo = heroData?.data || heroData;
                    const imgUrl = heroInfo?.head || heroInfo?.imgPreview || heroInfo?.img;
                    const heroName = heroInfo?.name || `Hero ${idx + 1}`;
                    
                    if (!imgUrl) return null;
                    
                    return (
                      <div key={idx} className="hero-preview-card">
                        <img src={imgUrl} alt={heroName} onError={(e) => e.target.style.display = 'none'} />
                        <span>{heroName}</span>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Pro Builds Tab */}
          {activeTab === 'pro_builds' && (
            <div className="form-section">
              <h3>Pro Builds (макс. 3)</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
                Кожен білд: 6 основних предметів, 2 додаткових, 1 емблема з 3 талантами та battle spell
              </p>
              
              {proBuilds.map((build, buildIndex) => {
                const selectedEmblem = build.emblem_id ? emblems.find(e => e.id === parseInt(build.emblem_id)) : null;
                const selectedSpell = build.battle_spell_id ? battleSpells.find(s => s.id === parseInt(build.battle_spell_id)) : null;
                
                return (
                  <div key={buildIndex} style={{
                    padding: '14px',
                    background: '#f9fafb',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#111827', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚔️ Білд {buildIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setProBuilds(proBuilds.filter((_, i) => i !== buildIndex))}
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        🗑️ Видалити
                      </button>
                    </div>

                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span style={{ color: '#ef4444' }}>⚔️</span> Основні (6)
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      {[0, 1, 2, 3, 4, 5].map(slotIndex => (
                        <div key={slotIndex} style={{ width: '64px' }}>
                          <ItemSelector
                            items={items}
                            value={build.core_items?.[slotIndex]}
                            onChange={(newItemId) => {
                              const newBuilds = [...proBuilds];
                              if (!newBuilds[buildIndex].core_items) newBuilds[buildIndex].core_items = [];
                              newBuilds[buildIndex].core_items[slotIndex] = newItemId;
                              setProBuilds(newBuilds);
                            }}
                            placeholder={`${slotIndex + 1}`}
                            compact={true}
                            borderColor="#ef4444"
                            size="small"
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span style={{ color: '#8b5cf6' }}>🛡️</span> Додаткові (2)
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      {[0, 1].map(slotIndex => (
                        <div key={slotIndex} style={{ width: '64px' }}>
                          <ItemSelector
                            items={items}
                            value={build.optional_items?.[slotIndex]}
                            onChange={(newItemId) => {
                              const newBuilds = [...proBuilds];
                              if (!newBuilds[buildIndex].optional_items) newBuilds[buildIndex].optional_items = [];
                              newBuilds[buildIndex].optional_items[slotIndex] = newItemId;
                              setProBuilds(newBuilds);
                            }}
                            placeholder="+"
                            compact={true}
                            borderColor="#8b5cf6"
                            size="small"
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ color: '#f59e0b' }}>⚡</span> Емблема, таланти та spell
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', cursor: 'pointer', width: '56px', height: '56px', border: '2px solid #e5e7eb', borderRadius: '8px', background: build.emblem_id ? '#fef3c7' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={selectedEmblem?.name || 'Виберіть емблему'}>
                          {selectedEmblem?.icon_url ? (
                            <img src={selectedEmblem.icon_url} alt={selectedEmblem.name} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.3rem', color: '#d1d5db' }}>⚡</span>
                          )}
                          <select
                            value={build.emblem_id || ''}
                            onChange={(e) => {
                              const newBuilds = [...proBuilds];
                              newBuilds[buildIndex].emblem_id = e.target.value ? parseInt(e.target.value) : null;
                              newBuilds[buildIndex].emblem_talents = [];
                              setProBuilds(newBuilds);
                            }}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          >
                            <option value="">Виберіть емблему</option>
                            {emblems.map(emblem => (
                              <option key={emblem.id} value={emblem.id}>{emblem.name}</option>
                            ))}
                          </select>
                        </div>

                        {build.emblem_id && (
                          <>
                            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #d1d5db 20%, #d1d5db 80%, transparent)' }}></div>
                            {[1, 2, 3].map(tier => {
                              const tierTalents = selectedEmblem?.[`tier${tier}_talents`] || [];
                              const selectedTalent = tierTalents.find(t => t.name === build.emblem_talents?.[tier - 1]);
                              const colors = {
                                1: { bg: '#dbeafe', border: '#3b82f6' },
                                2: { bg: '#e9d5ff', border: '#9333ea' },
                                3: { bg: '#fecaca', border: '#dc2626' }
                              }[tier];

                              return (
                                <div key={tier} style={{ position: 'relative', cursor: 'pointer', width: '48px', height: '48px', border: `2px solid ${selectedTalent ? colors.border : '#e5e7eb'}`, borderRadius: '50%', background: selectedTalent ? colors.bg : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  title={selectedTalent ? `${selectedTalent.name}\n${selectedTalent.effect}` : `Tier ${tier}`}>
                                  {selectedTalent?.icon_url ? (
                                    <img src={selectedTalent.icon_url} alt={selectedTalent.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    <span style={{ fontSize: '1rem', color: '#d1d5db' }}>{'⭐'.repeat(tier)}</span>
                                  )}
                                  <select
                                    value={build.emblem_talents?.[tier - 1] || ''}
                                    onChange={(e) => {
                                      const newBuilds = [...proBuilds];
                                      if (!newBuilds[buildIndex].emblem_talents) newBuilds[buildIndex].emblem_talents = [];
                                      newBuilds[buildIndex].emblem_talents[tier - 1] = e.target.value;
                                      setProBuilds(newBuilds);
                                    }}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                  >
                                    <option value="">Tier {tier}</option>
                                    {tierTalents.map(talent => (
                                      <option key={talent.id} value={talent.name}>{talent.name}</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}
                            <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #d1d5db 20%, #d1d5db 80%, transparent)' }}></div>
                          </>
                        )}

                        <div style={{ position: 'relative', cursor: 'pointer', width: '56px', height: '56px', border: '2px solid #e5e7eb', borderRadius: '8px', background: build.battle_spell_id ? '#ede9fe' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title={selectedSpell?.name || 'Виберіть spell'}>
                          {selectedSpell?.icon_url ? (
                            <img src={selectedSpell.icon_url} alt={selectedSpell.name} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.3rem', color: '#d1d5db' }}>🔮</span>
                          )}
                          <select
                            value={build.battle_spell_id || ''}
                            onChange={(e) => {
                              const newBuilds = [...proBuilds];
                              newBuilds[buildIndex].battle_spell_id = e.target.value ? parseInt(e.target.value) : null;
                              setProBuilds(newBuilds);
                            }}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          >
                            <option value="">Виберіть spell</option>
                            {battleSpells.map(spell => (
                              <option key={spell.id} value={spell.id}>{spell.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {proBuilds.length < 3 && (
                <button
                  type="button"
                  onClick={() => setProBuilds([...proBuilds, { core_items: [], optional_items: [], emblem_id: null, emblem_talents: [], battle_spell_id: null }])}
                  style={{ padding: '12px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}
                >
                  ➕ Додати білд ({proBuilds.length}/3)
                </button>
              )}

              {proBuilds.length >= 3 && (
                <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', color: '#92400e', fontSize: '0.9rem' }}>
                  ℹ️ Досягнуто максимум білдів (3)
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="save-btn">Зберегти</button>
            <button type="button" onClick={onClose} className="cancel-btn">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HeroForm;
