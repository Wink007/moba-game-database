import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HeroForm.css';
import ItemSelector from './ItemSelector';

const API_URL = process.env.REACT_APP_API_URL || 'https://web-production-8570.up.railway.app/api';

const EMPTY_RELATION = {
  assist: { desc: '', target_hero_id: [] },
  strong: { desc: '', target_hero_id: [] },
  weak:   { desc: '', target_hero_id: [] },
};

const EMPTY_STATS = {
  hp: '', hp_regen: '', mana: '', mana_regen: '',
  physical_attack: '', magic_power: '',
  physical_defense: '', magic_defense: '',
  attack_speed: '', movement_speed: '',
};

const EMPTY_SKILL = {
  skill_name: '', skill_description: '',
  skill_name_uk: '', skill_description_uk: '',
  preview: '', skill_type: 'active',
  effect_types: [], is_transformed: 0,
};

const LANES        = ['Gold Lane', 'Jungle', 'Mid Lane', 'Exp Lane', 'Roam'];
const ROLES        = ['Assassin', 'Fighter', 'Marksman', 'Mage', 'Support', 'Tank'];
const DAMAGE_TYPES = ['Physical', 'Magic', 'Mixed'];
const SPECIALTIES  = [
  'Regen', 'Crowd Control', 'Finisher', 'Charge', 'Push', 'Damage',
  'Burst', 'Poke', 'Initiator', 'Magic Damage', 'Mixed Damage',
  'Guard', 'Chase', 'Control', 'Support',
];
const EFFECT_TYPES = [
  'Attach','AoE','Blink','Buff','Burst','Camouflage','Charge',
  'Conceal','CC','CC Immune','Damage','Death Immunity','Debuff','Invincible',
  'Heal','Mobility','Morph','Reduce DMG','Remove CC','Shield','Slow','Speed Up','Summon','Teleport',
];

function toArr(v) {
  if (Array.isArray(v)) return v;
  if (v) return [v];
  return [];
}

function statsFromHero(hs) {
  if (!hs || typeof hs !== 'object') return EMPTY_STATS;
  return {
    hp:               String(hs.hp              || ''),
    hp_regen:         String(hs.hp_regen         || ''),
    mana:             String(hs.mana || hs.energy || ''),
    mana_regen:       String(hs.mana_regen || hs.energy_regen || ''),
    physical_attack:  String(hs.physical_attack  || ''),
    magic_power:      String(hs.magic_power      || ''),
    physical_defense: String(hs.physical_defense || ''),
    magic_defense:    String(hs.magic_defense    || ''),
    attack_speed:     String(hs.attack_speed     || ''),
    movement_speed:   String(hs.movement_speed   || ''),
  };
}

function idsToStr(arr) {
  return (arr || []).filter(id => id && id !== 0).join(', ');
}

function strToIds(str) {
  return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n !== 0);
}

function HeroForm({ hero, gameId, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '', name_uk: '',
    short_description: '', full_description: '',
    short_description_uk: '', full_description_uk: '',
    hero_game_id: '',
    image: '', head: '', painting: '',
    lane: [], roles: [], specialty: [],
    damage_type: '', use_energy: false,
    createdAt: null,
    main_hero_ban_rate: null,
    main_hero_appearance_rate: null,
    main_hero_win_rate: null,
    counter_data: null,
    compatibility_data: null,
    relation: EMPTY_RELATION,
    abilityshow: ['', '', '', ''],
  });

  const [heroStats, setHeroStats]               = useState(EMPTY_STATS);
  const [skills, setSkills]                     = useState([]);
  const [skillsModified, setSkillsModified]     = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [newSkill, setNewSkill]                 = useState(EMPTY_SKILL);
  const [skillParameters, setSkillParameters]   = useState([]);
  const [levelScaling, setLevelScaling]         = useState([]);
  const [updatingSkills, setUpdatingSkills]     = useState(false);
  const [proBuilds, setProBuilds]               = useState([]);
  const [assistIds, setAssistIds]               = useState('');
  const [strongIds, setStrongIds]               = useState('');
  const [weakIds, setWeakIds]                   = useState('');
  const [specialtyOpen, setSpecialtyOpen]       = useState(false);
  const specialtyRef  = useRef(null);
  const skillFormRef  = useRef(null);
  const skillsListRef = useRef(null);
  const [allHeroes, setAllHeroes]       = useState([]);
  const [items, setItems]               = useState([]);
  const [emblems, setEmblems]           = useState([]);
  const [battleSpells, setBattleSpells] = useState([]);

  // Load auxiliary data (items, emblems, spells, heroes for relation display)
  useEffect(() => {
    if (!gameId) return;
    axios.get(`${API_URL}/heroes?game_id=${gameId}`).then(r => setAllHeroes(r.data || [])).catch(() => {});
    axios.get(`${API_URL}/items?game_id=${gameId}`).then(r => setItems(r.data || [])).catch(() => {});
    axios.get(`${API_URL}/emblems?game_id=${gameId}`).then(r => setEmblems(r.data || [])).catch(() => {});
    axios.get(`${API_URL}/battle-spells?game_id=${gameId}`).then(r => setBattleSpells(r.data || [])).catch(() => {});
  }, [gameId]);

  // Close specialty dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (specialtyRef.current && !specialtyRef.current.contains(e.target)) setSpecialtyOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Populate form from hero prop.
  // App.js calls GET /heroes/:id before opening the form, so hero already has:
  //   relation, pro_builds, counter_data, compatibility_data, hero_stats, skills
  useEffect(() => {
    if (!hero) {
      setFormData({
        name: '', name_uk: '', short_description: '', full_description: '',
        short_description_uk: '', full_description_uk: '', hero_game_id: '',
        image: '', head: '', painting: '', lane: [], roles: [], specialty: [],
        damage_type: '', use_energy: false, createdAt: null,
        main_hero_ban_rate: null, main_hero_appearance_rate: null, main_hero_win_rate: null,
        counter_data: null, compatibility_data: null, relation: EMPTY_RELATION,
        abilityshow: ['', '', '', ''],
      });
      setHeroStats(EMPTY_STATS);
      setSkills([]);
      setProBuilds([]);
      setAssistIds(''); setStrongIds(''); setWeakIds('');
      setSkillsModified(false);
      return;
    }

    const rel = hero.relation || EMPTY_RELATION;
    setFormData({
      name:                      hero.name                     || '',
      name_uk:                   hero.name_uk                  || '',
      short_description:         hero.short_description        || '',
      full_description:          hero.full_description         || '',
      short_description_uk:      hero.short_description_uk     || '',
      full_description_uk:       hero.full_description_uk      || '',
      hero_game_id:              hero.hero_game_id             || '',
      image:                     hero.image                    || '',
      head:                      hero.head                     || '',
      painting:                  hero.painting                 || '',
      lane:                      toArr(hero.lane),
      roles:                     toArr(hero.roles),
      specialty:                 toArr(hero.specialty),
      damage_type:               hero.damage_type              || '',
      use_energy:                !!hero.use_energy,
      createdAt:                 hero.createdAt                || null,
      main_hero_ban_rate:        hero.main_hero_ban_rate       ?? null,
      main_hero_appearance_rate: hero.main_hero_appearance_rate ?? null,
      main_hero_win_rate:        hero.main_hero_win_rate       ?? null,
      counter_data:              hero.counter_data             || null,
      compatibility_data:        hero.compatibility_data       || null,
      relation:                  rel,
      abilityshow:               Array.isArray(hero.abilityshow) && hero.abilityshow.length === 4
                                   ? hero.abilityshow.map(v => String(v))
                                   : ['', '', '', ''],
    });
    setHeroStats(statsFromHero(hero.hero_stats));
    setSkills(Array.isArray(hero.skills) ? hero.skills : []);
    setProBuilds(Array.isArray(hero.pro_builds) ? hero.pro_builds : []);
    setAssistIds(idsToStr(rel.assist?.target_hero_id));
    setStrongIds(idsToStr(rel.strong?.target_hero_id));
    setWeakIds(idsToStr(rel.weak?.target_hero_id));
    setSkillsModified(false);
  }, [hero]);

  const getHeroHead = (heroGameId) => {
    const h = allHeroes.find(h => h.hero_game_id === heroGameId);
    return h ? h.head : null;
  };

  const setField    = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  const handleInput = (e) => setField(e.target.name, e.target.value);
  const toggle      = (field, value) => setFormData(prev => ({
    ...prev,
    [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
  }));

  const setStatField = (key, val) => setHeroStats(prev => ({ ...prev, [key]: val }));
  const blurStat     = (key) => {
    const n = parseFloat(String(heroStats[key]).replace(',', '.'));
    if (!isNaN(n)) setStatField(key, String(n));
  };

  const setRelationField = (group, sub, value) =>
    setFormData(prev => ({
      ...prev,
      relation: { ...prev.relation, [group]: { ...(prev.relation?.[group] || {}), [sub]: value } },
    }));

  const commitRelationIds = (group, raw) =>
    setRelationField(group, 'target_hero_id', strToIds(raw));

  // ---------- skills helpers ----------

  const resetSkillForm = () => {
    setNewSkill(EMPTY_SKILL);
    setSkillParameters([]);
    setLevelScaling([]);
    setEditingSkillIndex(null);
  };

  const parseLevelScaling = (raw) => {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    const first = raw[0];
    if (first.name && first.levels) return raw;
    if (first.level !== undefined && first.values) {
      const map = {};
      raw.forEach(({ values }) => {
        if (!values) return;
        Object.entries(values).forEach(([k, v]) => {
          if (!map[k]) map[k] = { name: k, levels: [] };
          map[k].levels.push(v);
        });
      });
      return Object.values(map);
    }
    return [];
  };

  const editSkill = (index) => {
    const s = skills[index];
    setNewSkill({
      skill_name:            s.skill_name            || '',
      skill_description:     s.skill_description     || '',
      skill_name_uk:         s.skill_name_uk         || '',
      skill_description_uk:  s.skill_description_uk  || '',
      preview:               s.preview               || '',
      skill_type:            s.skill_type            || 'active',
      effect_types:          toArr(s.effect_types),
      is_transformed:        s.is_transformed        || 0,
      id:                    s.id,
      display_order:         s.display_order,
      image:                 s.image,
    });
    setSkillParameters(
      s.skill_parameters && typeof s.skill_parameters === 'object'
        ? Object.entries(s.skill_parameters).map(([name, value]) => ({ name, value }))
        : []
    );
    setLevelScaling(parseLevelScaling(s.level_scaling));
    setEditingSkillIndex(index);
    setTimeout(() => skillFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const addOrUpdateSkill = () => {
    if (!newSkill.skill_name.trim()) { alert('Enter skill name'); return; }
    const skill = {
      ...newSkill,
      skill_parameters: skillParameters.reduce((acc, { name, value }) => {
        if (name) acc[name] = value;
        return acc;
      }, {}),
      level_scaling: levelScaling,
      ...(editingSkillIndex !== null && skills[editingSkillIndex]
        ? { id: skills[editingSkillIndex].id, display_order: skills[editingSkillIndex].display_order, image: skills[editingSkillIndex].image }
        : {}),
    };
    if (editingSkillIndex !== null) {
      const updated = [...skills];
      updated[editingSkillIndex] = skill;
      setSkills(updated);
    } else {
      setSkills(prev => [...prev, skill]);
    }
    setSkillsModified(true);
    resetSkillForm();
    setTimeout(() => skillsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const removeSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
    setSkillsModified(true);
  };

  const updateSkillsFromAPI = async () => {
    if (!hero?.name) { alert('Save the hero first'); return; }
    if (!window.confirm(`Update skills for "${hero.name}" from external API?`)) return;
    setUpdatingSkills(true);
    try {
      const { data } = await axios.get(`${API_URL}/external/hero-skills/${encodeURIComponent(hero.name)}`);
      if (!data.success || !data.skills) throw new Error('Invalid API response');

      const seen = new Set();
      const ext = data.skills.filter(s => { if (seen.has(s.skillname)) return false; seen.add(s.skillname); return true; });

      const extNames = new Set(ext.map(s => s.skillname));
      const dbNames  = new Set(skills.map(s => s.skill_name));
      const sameSkills = extNames.size === dbNames.size && [...extNames].every(n => dbNames.has(n));

      let updated = 0;
      if (!sameSkills) {
        for (const s of skills) await axios.delete(`${API_URL}/heroes/${hero.id}/skills/${s.id}`).catch(() => {});
        for (let i = 0; i < ext.length; i++) {
          await axios.post(`${API_URL}/heroes/${hero.id}/skills`, {
            skill_name: ext[i].skillname, skill_description: ext[i].skilldesc || '',
            skill_name_uk: '', skill_description_uk: '', display_order: i,
          });
          updated++;
        }
      } else {
        for (let i = 0; i < ext.length; i++) {
          const match = skills.find(s => s.skill_name === ext[i].skillname);
          if (!match?.id) continue;
          const patch = { display_order: i };
          if (ext[i].skilldesc?.trim()) patch.skill_description = ext[i].skilldesc;
          await axios.put(`${API_URL}/heroes/${hero.id}/skills/${match.id}`, patch);
          updated++;
        }
      }

      if (updated > 0) {
        const { data: fresh } = await axios.get(`${API_URL}/heroes/${hero.id}/skills`);
        setSkills(fresh || []);
        alert(`Updated ${updated} skill(s)`);
      } else {
        alert('No skills updated');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingSkills(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const statsObject = {};
    Object.entries(heroStats).forEach(([k, v]) => {
      const n = parseFloat(String(v).replace(',', '.'));
      if (!isNaN(n)) statsObject[k] = n;
    });
    const abilitshowParsed = formData.abilityshow.map(v => {
      const n = parseInt(String(v), 10);
      return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
    });
    const payload = {
      ...formData,
      game_id:      gameId,
      hero_stats:   Object.keys(statsObject).length > 0 ? statsObject : null,
      pro_builds:   proBuilds,
      abilityshow:  abilitshowParsed,
    };
    if (skillsModified) payload.skills = skills;
    try {
      if (hero) {
        await axios.put(`${API_URL}/heroes/${hero.id}`, payload);
        alert('Hero updated!');
        setSkillsModified(false);
      } else {
        await axios.post(`${API_URL}/heroes`, payload);
        alert('Hero created!');
      }
      onSave();
      onClose();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const TABS = [
    { id: 'basic',       label: 'Basic' },
    { id: 'stats',       label: 'Stats' },
    { id: 'description', label: 'Description' },
    { id: 'skills',      label: 'Skills' },
    { id: 'pro_builds',  label: 'Pro Builds' },
    { id: 'relations',   label: 'Relations' },
  ];

  const ImgPreview = ({ src, size = 100, circle = false }) =>
    src ? (
      <img src={src} alt=""
        onError={e => { e.target.style.display = 'none'; }}
        style={{ maxWidth: size, maxHeight: size, borderRadius: circle ? '50%' : 8,
          border: '2px solid #ddd', objectFit: 'cover', marginTop: 8, marginBottom: 8 }} />
    ) : null;

  const CounterList = ({ items: list }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(list || []).map((item, i) => {
        const head = getHeroHead(item.heroid);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8,
            background: 'white', borderRadius: 4, border: '1px solid #e5e7eb', fontSize: '0.85rem' }}>
            {head && <img src={head} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />}
            <div>
              <div style={{ fontWeight: 600 }}>#{i + 1} ID: {item.heroid}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Win: {item.win_rate}% · Δ{item.increase_win_rate}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ================================ RENDER ================================

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{hero ? `Edit: ${hero.name}` : 'Add Hero'}</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #e5e7eb', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 18px', border: 'none', cursor: 'pointer', borderRadius: '6px 6px 0 0',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color:      activeTab === tab.id ? 'white'   : '#6b7280',
                fontWeight: activeTab === tab.id ? 700       : 400,
                fontSize: '0.9rem' }}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ===== BASIC ===== */}
          {activeTab === 'basic' && (
            <div className="form-section">
              <label>Name (EN)</label>
              <input name="name" value={formData.name} onChange={handleInput} required placeholder="Hero Name" />

              <label>Name (UK)</label>
              <input name="name_uk" value={formData.name_uk} onChange={handleInput} placeholder="Українська назва" />

              <label>Hero Game ID</label>
              <input name="hero_game_id" type="number" value={formData.hero_game_id} onChange={handleInput} />

              <label>Image URL</label>
              <input name="image" value={formData.image} onChange={handleInput} placeholder="https://…" />
              <ImgPreview src={formData.image} size={150} />

              <label>Head URL</label>
              <input name="head" value={formData.head} onChange={handleInput} placeholder="https://…" />
              <ImgPreview src={formData.head} size={80} circle />

              <label>Painting URL</label>
              <input name="painting" value={formData.painting} onChange={handleInput} placeholder="https://…" />
              <ImgPreview src={formData.painting} size={200} />

              <label>Created At</label>
              <input type="datetime-local"
                value={formData.createdAt ? new Date(formData.createdAt).toISOString().slice(0, 16) : ''}
                onChange={e => setField('createdAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />

              {/* Statistics — auto-synced, read-only */}
              <div style={{ marginTop: 20, padding: 15, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Statistics (auto-synced)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[['Ban Rate', 'main_hero_ban_rate'], ['Pick Rate', 'main_hero_appearance_rate'], ['Win Rate', 'main_hero_win_rate']].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</label>
                      <input type="number" step="0.01" value={formData[field] || ''} readOnly
                        style={{ marginTop: 4, fontWeight: 700, color: '#2563eb' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Counter data — read-only */}
              {formData.counter_data && (
                <div style={{ marginTop: 20, padding: 15, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#991b1b' }}>Counter Relationship (auto)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', color: '#dc2626', margin: '0 0 8px' }}>Countered by</h5>
                      <CounterList items={formData.counter_data.best_counters} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', color: '#059669', margin: '0 0 8px' }}>Counters</h5>
                      <CounterList items={formData.counter_data.most_countered_by} />
                    </div>
                  </div>
                </div>
              )}

              {/* Compatibility — read-only */}
              {formData.compatibility_data && (
                <div style={{ marginTop: 20, padding: 15, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#15803d' }}>Team Compatibility (auto)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', color: '#059669', margin: '0 0 8px' }}>Best teammates</h5>
                      <CounterList items={formData.compatibility_data.compatible} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.88rem', color: '#dc2626', margin: '0 0 8px' }}>Bad teammates</h5>
                      <CounterList items={formData.compatibility_data.not_compatible} />
                    </div>
                  </div>
                </div>
              )}

              <label style={{ marginTop: 16, display: 'block' }}>Lane</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {LANES.map(l => (
                  <label key={l} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={formData.lane.includes(l)} onChange={() => toggle('lane', l)} /> {l}
                  </label>
                ))}
              </div>

              <label style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                padding: '5px 10px', background: '#eff6ff', borderRadius: 4, width: 'fit-content', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={formData.use_energy} onChange={e => setField('use_energy', e.target.checked)} />
                Uses Energy (not Mana)
              </label>

              <label style={{ marginTop: 16, display: 'block' }}>Roles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {ROLES.map(r => (
                  <label key={r} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input type="checkbox" checked={formData.roles.includes(r)} onChange={() => toggle('roles', r)} /> {r}
                  </label>
                ))}
              </div>

              <label style={{ marginTop: 16, display: 'block' }}>Specialty</label>
              <div ref={specialtyRef} style={{ position: 'relative', marginBottom: 15 }}>
                <div onClick={() => setSpecialtyOpen(o => !o)}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer',
                    background: 'white', minHeight: 38, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                  {formData.specialty.length > 0
                    ? formData.specialty.map(s => (
                        <span key={s} style={{ background: '#e0e7ff', padding: '2px 8px', borderRadius: 3, fontSize: '0.85rem', color: '#4338ca' }}>{s}</span>
                      ))
                    : <span style={{ color: '#9ca3af' }}>Select…</span>}
                </div>
                {specialtyOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                    border: '1px solid #d1d5db', borderRadius: 6, marginTop: 4, maxHeight: 250, overflowY: 'auto',
                    zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {SPECIALTIES.map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer',
                        background: formData.specialty.includes(s) ? '#f3f4f6' : 'white', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={formData.specialty.includes(s)}
                          onChange={() => toggle('specialty', s)} style={{ marginRight: 8 }} />
                        {s}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <label>Damage Type</label>
              <select name="damage_type" value={formData.damage_type} onChange={handleInput}>
                <option value="">— select —</option>
                {DAMAGE_TYPES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* ===== STATS ===== */}
          {activeTab === 'stats' && (
            <div className="form-section">
              <div className="stats-grid">
                {[
                  ['HP',                                           'hp'],
                  ['HP Regen',                                     'hp_regen'],
                  [formData.use_energy ? 'Energy' : 'Mana',       'mana'],
                  [formData.use_energy ? 'Energy Regen' : 'Mana Regen', 'mana_regen'],
                  ['Physical Attack',  'physical_attack'],
                  ['Magic Power',      'magic_power'],
                  ['Physical Defense', 'physical_defense'],
                  ['Magic Defense',    'magic_defense'],
                  ['Attack Speed',     'attack_speed'],
                  ['Movement Speed',   'movement_speed'],
                ].map(([label, key]) => (
                  <div key={key} className="stat-row">
                    <label>{label}</label>
                    <input type="text" value={heroStats[key]} placeholder="0"
                      onChange={e => setStatField(key, e.target.value)} onBlur={() => blurStat(key)} />
                  </div>
                ))}
              </div>

              {/* Ability Show — 4 bars (0-100) */}
              <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px 0', color: '#334155', fontSize: '0.95rem' }}>Ability Show (0–100)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[['Durability', 0], ['Offense', 1], ['Ability Effects', 2], ['Difficulty', 3]].map(([label, idx]) => {
                    const val = parseInt(formData.abilityshow[idx], 10);
                    const pct = isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
                    const colors = ['#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'];
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{label}</label>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: colors[idx] }}>{pct}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="range" min="0" max="100" value={pct}
                            onChange={e => {
                              const a = [...formData.abilityshow];
                              a[idx] = e.target.value;
                              setField('abilityshow', a);
                            }}
                            style={{ flex: 1, accentColor: colors[idx] }} />
                          <input type="number" min="0" max="100" value={formData.abilityshow[idx]}
                            onChange={e => {
                              const a = [...formData.abilityshow];
                              a[idx] = e.target.value;
                              setField('abilityshow', a);
                            }}
                            style={{ width: 56, textAlign: 'center', fontWeight: 700 }} />
                        </div>
                        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 4 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: colors[idx], borderRadius: 3, transition: 'width 0.1s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== DESCRIPTION ===== */}
          {activeTab === 'description' && (
            <div className="form-section">
              <label>Short Description (EN)</label>
              <textarea name="short_description" value={formData.short_description} onChange={handleInput} rows={3} />

              <label>Full Description (EN)</label>
              <textarea name="full_description" value={formData.full_description} onChange={handleInput} rows={6} />

              <label>Short Description (UK)</label>
              <textarea name="short_description_uk" value={formData.short_description_uk} onChange={handleInput} rows={3} />

              <label>Full Description (UK)</label>
              <textarea name="full_description_uk" value={formData.full_description_uk} onChange={handleInput} rows={6} />
            </div>
          )}

          {/* ===== SKILLS ===== */}
          {activeTab === 'skills' && (
            <div className="form-section">
              {/* API update button */}
              {hero?.id && (
                <div style={{ marginBottom: 20, padding: 15, background: '#f0f9ff', border: '1px solid #3b82f6',
                  borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Update from external API</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#666' }}>mlbb-stats.ridwaanhall.com</p>
                  </div>
                  <button type="button" onClick={updateSkillsFromAPI} disabled={updatingSkills}
                    style={{ padding: '10px 20px', background: updatingSkills ? '#94a3b8' : '#3b82f6', color: 'white',
                      border: 'none', borderRadius: 6, cursor: updatingSkills ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {updatingSkills ? 'Updating…' : 'Update'}
                  </button>
                </div>
              )}

              {/* Skills list */}
              {skills.length > 0 && (
                <div ref={skillsListRef} className="skills-list">
                  {[...skills]
                    .sort((a, b) => {
                      const ta = a.is_transformed ? 1 : 0, tb = b.is_transformed ? 1 : 0;
                      if (ta !== tb) return ta - tb;
                      return (a.display_order || 0) - (b.display_order || 0);
                    })
                    .map((skill, idx) => {
                      const tr = skill.is_transformed === 1 || skill.is_transformed === true;
                      const sanitizeDesc = (s) => s
                        .replace(/<font color="([^"]+)">/g, '<span style="color:#$1">')
                        .replace(/<\/font>/g, '</span>')
                        .replace(/\n/g, '<br/>');
                      return (
                        <div key={idx} className="skill-card"
                          style={{ border: `2px solid ${tr ? '#8b5cf6' : '#3b82f6'}`, background: tr ? '#faf5ff' : '#eff6ff' }}>
                          <div className="skill-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {(skill.image || skill.preview) && (
                                <img src={skill.image || skill.preview} alt={skill.skill_name}
                                  referrerPolicy="no-referrer"
                                  style={{ width: 50, height: 50, borderRadius: 8, border: '2px solid #ddd', objectFit: 'cover', background: '#2a2a2a' }}
                                  onError={e => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect fill=%22%23ccc%22 width=%2250%22 height=%2250%22/%3E%3C/svg%3E'; }} />
                              )}
                              <h4>{skill.skill_name}</h4>
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                                background: tr ? '#8b5cf6' : '#3b82f6', color: 'white' }}>
                                {tr ? 'TRANSFORMED' : 'BASE'}
                              </span>
                            </div>
                            <span className={`skill-badge ${skill.skill_type}`}>
                              {skill.skill_type === 'passive' ? 'PASSIVE' : 'ACTIVE'}
                            </span>
                          </div>
                          {skill.skill_description && (
                            <div style={{ marginTop: 8 }}
                              dangerouslySetInnerHTML={{ __html: '<strong>EN:</strong> ' + sanitizeDesc(skill.skill_description) }} />
                          )}
                          {skill.skill_description_uk && (
                            <div style={{ marginTop: 6 }}
                              dangerouslySetInnerHTML={{ __html: '<strong>UK:</strong> ' + sanitizeDesc(skill.skill_description_uk) }} />
                          )}
                          {skill.effect_types?.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {skill.effect_types.map((et, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', padding: '3px 8px', background: '#dbeafe',
                                  color: '#1e40af', borderRadius: 12, fontWeight: 600 }}>{et}</span>
                              ))}
                            </div>
                          )}
                          <div className="skill-actions">
                            <button type="button" onClick={() => editSkill(idx)}>Edit</button>
                            <button type="button" onClick={() => removeSkill(idx)} className="delete-btn">Delete</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Skill edit/add form */}
              <div ref={skillFormRef} className="skill-form">
                <h4>{editingSkillIndex !== null ? 'Edit Skill' : 'Add Skill'}</h4>

                <input placeholder="Skill Name (EN)" value={newSkill.skill_name}
                  onChange={e => setNewSkill(p => ({ ...p, skill_name: e.target.value }))} />
                <textarea rows={4} value={newSkill.skill_description}
                  placeholder="Description EN (supports <font color='a6aafb'>text</font>)"
                  onChange={e => setNewSkill(p => ({ ...p, skill_description: e.target.value }))} />
                <small style={{ color: '#666', display: 'block', marginBottom: 8 }}>
                  HTML: &lt;font color="a6aafb"&gt;…&lt;/font&gt;
                </small>

                <input placeholder="Skill Name (UK)" value={newSkill.skill_name_uk}
                  onChange={e => setNewSkill(p => ({ ...p, skill_name_uk: e.target.value }))} />
                <textarea rows={4} value={newSkill.skill_description_uk} placeholder="Description UK"
                  onChange={e => setNewSkill(p => ({ ...p, skill_description_uk: e.target.value }))} />

                <label style={{ display: 'block', marginTop: 12, fontWeight: 700 }}>Effect Types</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, marginBottom: 12 }}>
                  {EFFECT_TYPES.map(et => {
                    const on = (newSkill.effect_types || []).includes(et);
                    return (
                      <label key={et} style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', cursor: 'pointer',
                        background: on ? '#e0e7ff' : '#f3f4f6', borderRadius: 6, border: `2px solid ${on ? '#4f46e5' : 'transparent'}` }}>
                        <input type="checkbox" checked={on}
                          onChange={() => setNewSkill(p => ({
                            ...p, effect_types: p.effect_types.includes(et)
                              ? p.effect_types.filter(x => x !== et)
                              : [...p.effect_types, et],
                          }))}
                          style={{ marginRight: 5 }} />
                        {et}
                      </label>
                    );
                  })}
                </div>

                <label>Preview Icon URL</label>
                <input placeholder="Icon URL" value={newSkill.preview}
                  onChange={e => setNewSkill(p => ({ ...p, preview: e.target.value }))} />
                {newSkill.preview && (
                  <img src={newSkill.preview} alt="" onError={e => { e.target.style.display = 'none'; }}
                    style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: '2px solid #ddd',
                      marginTop: 6, marginBottom: 6, objectFit: 'cover', background: '#2a2a2a' }} />
                )}

                <label>Skill Type</label>
                <select value={newSkill.skill_type} onChange={e => setNewSkill(p => ({ ...p, skill_type: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="passive">Passive</option>
                  <option value="ultimate">Ultimate</option>
                </select>

                <label style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox"
                    checked={newSkill.is_transformed === 1 || newSkill.is_transformed === true}
                    onChange={e => setNewSkill(p => ({ ...p, is_transformed: e.target.checked ? 1 : 0 }))}
                    style={{ width: 18, height: 18 }} />
                  Transformed skill (replaces base after morph)
                </label>

                {/* Parameters */}
                <div className="skill-parameters">
                  <h5>Skill Parameters</h5>
                  {skillParameters.map((p, i) => (
                    <div key={i} className="parameter-row">
                      <input type="text" placeholder="Name" value={p.name}
                        onChange={e => { const u = [...skillParameters]; u[i].name = e.target.value; setSkillParameters(u); }} />
                      <input type="text" placeholder="Value" value={p.value}
                        onChange={e => { const u = [...skillParameters]; u[i].value = e.target.value; setSkillParameters(u); }} />
                      <button type="button" onClick={() => setSkillParameters(skillParameters.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="add-param-btn"
                    onClick={() => setSkillParameters(p => [...p, { name: '', value: '' }])}>
                    + Add Parameter
                  </button>
                </div>

                {/* Level scaling */}
                <div className="level-scaling">
                  <h5>Level Scaling (1–6)</h5>
                  {levelScaling.map((s, si) => (
                    <div key={si} className="scaling-section">
                      <div className="scaling-header">
                        <input type="text" placeholder="Name (e.g. Damage)" value={s.name}
                          className="scaling-name"
                          onChange={e => { const u = [...levelScaling]; u[si].name = e.target.value; setLevelScaling(u); }} />
                        <button type="button" onClick={() => setLevelScaling(levelScaling.filter((_, j) => j !== si))}>✕</button>
                      </div>
                      <div className="scaling-levels">
                        {[0, 1, 2, 3, 4, 5].map(li => (
                          <div key={li} className="level-input">
                            <label>Lvl {li + 1}</label>
                            <input type="text" value={s.levels?.[li] || ''} placeholder="…"
                              onChange={e => { const u = [...levelScaling]; u[si].levels[li] = e.target.value; setLevelScaling(u); }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" className="add-scaling-btn"
                    onClick={() => setLevelScaling(p => [...p, { name: '', levels: ['', '', '', '', '', ''] }])}>
                    + Add Scaling
                  </button>
                </div>

                <button type="button" className="add-skill-btn" onClick={addOrUpdateSkill}>
                  {editingSkillIndex !== null ? 'Update Skill' : 'Add Skill'}
                </button>
                {editingSkillIndex !== null && (
                  <button type="button" onClick={resetSkillForm}
                    style={{ marginLeft: 10, padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===== PRO BUILDS ===== */}
          {activeTab === 'pro_builds' && (
            <div className="form-section">
              <h3>Pro Builds (max 3)</h3>
              <p style={{ color: '#6b7280', marginBottom: 20, fontSize: '0.88rem' }}>
                6 core items · 2 optional items · emblem + 3 talents · battle spell
              </p>

              {proBuilds.map((build, bi) => {
                const selEmblem = build.emblem_id ? emblems.find(e => e.id === parseInt(build.emblem_id)) : null;
                const selSpell  = build.battle_spell_id ? battleSpells.find(s => s.id === parseInt(build.battle_spell_id)) : null;
                const setB = (upd) => { const n = [...proBuilds]; n[bi] = { ...n[bi], ...upd }; setProBuilds(n); };

                return (
                  <div key={bi} style={{ padding: 14, background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: 8, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0 }}>Build {bi + 1}</h4>
                      <button type="button"
                        onClick={() => setProBuilds(proBuilds.filter((_, i) => i !== bi))}
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                        Delete
                      </button>
                    </div>

                    {/* Core items */}
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Core (6)</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {[0, 1, 2, 3, 4, 5].map(si => (
                        <div key={si} style={{ width: 64 }}>
                          <ItemSelector items={items} value={build.core_items?.[si]}
                            onChange={id => { const c = [...(build.core_items || [])]; c[si] = id; setB({ core_items: c }); }}
                            placeholder={`${si + 1}`} compact borderColor="#ef4444" size="small" />
                        </div>
                      ))}
                    </div>

                    {/* Optional items */}
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Optional (2)</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                      {[0, 1].map(si => (
                        <div key={si} style={{ width: 64 }}>
                          <ItemSelector items={items} value={build.optional_items?.[si]}
                            onChange={id => { const c = [...(build.optional_items || [])]; c[si] = id; setB({ optional_items: c }); }}
                            placeholder="+" compact borderColor="#8b5cf6" size="small" />
                        </div>
                      ))}
                    </div>

                    {/* Emblem + talents + spell */}
                    <div style={{ paddingTop: 10, borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Emblem · Talents · Spell</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Emblem */}
                        <div style={{ position: 'relative', width: 56, height: 56, border: '2px solid #e5e7eb', borderRadius: 8,
                          background: build.emblem_id ? '#fef3c7' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title={selEmblem?.name || 'Select emblem'}>
                          {selEmblem?.icon_url
                            ? <img src={selEmblem.icon_url} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                            : <span style={{ fontSize: '1.3rem', color: '#d1d5db' }}>⚡</span>}
                          <select value={build.emblem_id || ''} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            onChange={e => setB({ emblem_id: e.target.value ? parseInt(e.target.value) : null, emblem_talents: [] })}>
                            <option value="">— emblem —</option>
                            {emblems.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
                          </select>
                        </div>

                        {/* Talents (3 tiers) */}
                        {build.emblem_id && [1, 2, 3].map(tier => {
                          const tierTalents = selEmblem?.[`tier${tier}_talents`] || [];
                          const selT = tierTalents.find(t => t.name === build.emblem_talents?.[tier - 1]);
                          const colors = { 1: ['#dbeafe', '#3b82f6'], 2: ['#e9d5ff', '#9333ea'], 3: ['#fecaca', '#dc2626'] }[tier];
                          return (
                            <React.Fragment key={tier}>
                              {tier === 1 && <div style={{ width: 1, height: 48, background: '#d1d5db' }} />}
                              <div style={{ position: 'relative', width: 48, height: 48,
                                border: `2px solid ${selT ? colors[1] : '#e5e7eb'}`,
                                borderRadius: '50%', background: selT ? colors[0] : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title={selT?.name || `Tier ${tier}`}>
                                {selT?.icon_url
                                  ? <img src={selT.icon_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                  : <span style={{ color: '#d1d5db' }}>{'*'.repeat(tier)}</span>}
                                <select value={build.emblem_talents?.[tier - 1] || ''} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                  onChange={e => { const t = [...(build.emblem_talents || [])]; t[tier - 1] = e.target.value; setB({ emblem_talents: t }); }}>
                                  <option value="">Tier {tier}</option>
                                  {tierTalents.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                              </div>
                              {tier === 3 && <div style={{ width: 1, height: 48, background: '#d1d5db' }} />}
                            </React.Fragment>
                          );
                        })}

                        {/* Battle spell */}
                        <div style={{ position: 'relative', width: 56, height: 56, border: '2px solid #e5e7eb', borderRadius: 8,
                          background: build.battle_spell_id ? '#ede9fe' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title={selSpell?.name || 'Select battle spell'}>
                          {selSpell?.icon_url
                            ? <img src={selSpell.icon_url} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                            : <span style={{ fontSize: '1.3rem', color: '#d1d5db' }}>?</span>}
                          <select value={build.battle_spell_id || ''} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            onChange={e => setB({ battle_spell_id: e.target.value ? parseInt(e.target.value) : null })}>
                            <option value="">— spell —</option>
                            {battleSpells.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {proBuilds.length < 3
                ? <button type="button"
                    onClick={() => setProBuilds(p => [...p, { core_items: [], optional_items: [], emblem_id: null, emblem_talents: [], battle_spell_id: null }])}
                    style={{ padding: '12px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    + Add build ({proBuilds.length}/3)
                  </button>
                : <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 6, color: '#92400e', fontSize: '0.9rem' }}>
                    Maximum 3 builds reached
                  </div>}
            </div>
          )}

          {/* ===== RELATIONS ===== */}
          {activeTab === 'relations' && (
            <div className="relations-section">
              <h4>Hero Relations</h4>
              {[
                { key: 'assist', label: 'Assist (Synergy)',         setIds: setAssistIds, ids: assistIds },
                { key: 'strong', label: 'Strong Against',           setIds: setStrongIds, ids: strongIds },
                { key: 'weak',   label: 'Weak Against (countered)', setIds: setWeakIds,   ids: weakIds },
              ].map(({ key, label, setIds, ids }) => (
                <div key={key} className="relation-group">
                  <h5>{label}</h5>
                  <label>Description:</label>
                  <textarea rows={3} value={formData.relation?.[key]?.desc || ''}
                    onChange={e => setRelationField(key, 'desc', e.target.value)}
                    placeholder={`Describe ${key} relationship…`} />
                  <label>Hero IDs (comma separated):</label>
                  <input type="text" value={ids}
                    onChange={e => setIds(e.target.value)}
                    onBlur={e => commitRelationIds(key, e.target.value)}
                    placeholder="1, 2, 3…" />
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HeroForm;
