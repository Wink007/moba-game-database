import React, { useState } from 'react';

function HeroList({ heroes, heroSkills = {}, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLane, setSelectedLane] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transformedState, setTransformedState] = useState({});
  const [transformationIndex, setTransformationIndex] = useState({});
  const itemsPerPage = 10;
  
  // Функція для отримання skills героя
  const getHeroSkills = (heroId) => {
    return heroSkills[heroId] || [];
  };

  // Add styles for tooltip
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .skill-tooltip-wrapper:hover .skill-tooltip {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLane, selectedRole]);

  if (heroes.length === 0) {
    return (
      <div className="empty-state">
        <p>🦸 No heroes in this game</p>
        <p>Click "+ Add Hero" to create the first one</p>
      </div>
    );
  }

  const getStatValue = (hero, statName) => {
    if (!hero.hero_stats) return null;
    const stat = hero.hero_stats.find(s => s.stat_name === statName);
    return stat ? stat.value : null;
  };

  // Filtering heroes
  const filteredHeroes = heroes.filter(hero => {
    const matchesSearch = hero.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLane = !selectedLane || (hero.lane && hero.lane.includes(selectedLane));
    const matchesRole = !selectedRole || (hero.roles && hero.roles.includes(selectedRole));
    return matchesSearch && matchesLane && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHeroes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHeroes = filteredHeroes.slice(startIndex, endIndex);

  // Get unique lanes and roles
  const uniqueLanes = [...new Set(heroes.flatMap(h => h.lane || []))];
  const uniqueRoles = [...new Set(heroes.flatMap(h => h.roles || []))];

  return (
    <>
      <div style={{ 
        marginBottom: '15px', 
        display: 'flex', 
        gap: '10px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.9rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            width: '250px'
          }}
        />
        
        <select
          value={selectedLane}
          onChange={(e) => setSelectedLane(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.9rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px'
          }}
        >
          <option value="">All Lanes</option>
          {uniqueLanes.map(lane => (
            <option key={lane} value={lane}>{lane}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.9rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px'
          }}
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        {(searchTerm || selectedLane || selectedRole) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLane('');
              setSelectedRole('');
            }}
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ✖️ Clear
          </button>
        )}

        <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: 'auto' }}>
          Found: {filteredHeroes.length} of {heroes.length} | Page {currentPage} of {totalPages}
        </span>
      </div>

      <table style={{ fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th style={{ width: '40px' }}>ID</th>
          <th style={{ width: '60px' }}>Preview</th>
          <th style={{ width: '120px' }}>Name</th>
          <th style={{ width: '100px' }}>Lane</th>
          <th style={{ width: '120px' }}>Roles</th>
          <th style={{ width: '90px' }}>HP/MP</th>
          <th style={{ width: '200px' }}>Skills</th>
          <th style={{ width: '100px' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentHeroes.map((hero) => (
          <tr key={hero.id}>
            <td>{hero.id}</td>
            <td>
              {hero.image ? (
                <img 
                  src={hero.head} 
                  alt={hero.name} 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    objectFit: 'cover',
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : '-'}
            </td>
            <td><strong>{hero.name}</strong></td>
            <td style={{ fontSize: '0.85rem' }}>
              {hero.lane && hero.lane.length > 0 ? (
                <div style={{ fontSize: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                  {hero.lane.map((lane, idx) => (
                    <span key={idx} style={{ 
                      display: 'inline-block', 
                      background: '#dbeafe', 
                      color: '#1e40af',
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      margin: '1px',
                      fontWeight: '500'
                    }}>
                      {lane}
                    </span>
                  ))}
                </div>
              ) : '-'}
            </td>
            <td>
              {hero.roles && hero.roles.length > 0 ? (
                <div style={{ fontSize: '0.75rem' }}>
                  {hero.roles.map((role, idx) => (
                    <span key={idx} style={{ 
                      display: 'inline-block', 
                      background: '#e5e7eb', 
                      padding: '1px 5px', 
                      borderRadius: '3px',
                      margin: '1px'
                    }}>
                      {role}
                    </span>
                  ))}
                </div>
              ) : '-'}
            </td>
            <td style={{ fontSize: '0.85rem' }}>
              {hero.hero_stats && hero.hero_stats.length > 0 ? (
                <>
                  {getStatValue(hero, 'HP') && <div>❤️ {getStatValue(hero, 'HP')}</div>}
                  {getStatValue(hero, 'Mana') && <div>💧 {getStatValue(hero, 'Mana')}</div>}
                </>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
              )}
            </td>
            <td>
              {(() => {
                const skills = getHeroSkills(hero.id);
                return skills && skills.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: '', gap: '4px' }}>
                  
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {(() => {
                    const currentTransformIndex = transformationIndex[hero.id] || 0;
                    
                    // If showing transformed - replace base skills with transformed ones
                    if (currentTransformIndex > 0) {
                      const baseSkills = skills.filter(s => !s.is_transformed);
                      const transformedSkills = skills.filter(s => s.is_transformed === 1 || s.is_transformed === true);
                      
                      // Create an array of skills to display
                      const skillsToShow = [];
                      
                      baseSkills.forEach(baseSkill => {
                        // Find the transformed skill for this base skill with the required transformation_order
                        const replacement = transformedSkills.find(t => 
                          t.replaces_skill_id === baseSkill.id && 
                          t.transformation_order === currentTransformIndex
                        );
                        
                        if (replacement) {
                          // There is a transformation - show it instead of the base skill
                          skillsToShow.push(replacement);
                        } else {
                          // No transformation - show the base skill
                          skillsToShow.push(baseSkill);
                        }
                      });
                      
                      return skillsToShow.map((skillToShow, idx) => {
                        const isReplacement = skillToShow.is_transformed === 1 || skillToShow.is_transformed === true;
                        
                        return (
                          (skillToShow.image || skillToShow.preview) && (
                            <div 
                              key={idx}
                              className="skill-tooltip-wrapper"
                              style={{ position: 'relative', display: 'inline-block' }}
                            >
                              <img 
                                src={skillToShow.image || skillToShow.preview} 
                                alt={skillToShow.skill_name || skillToShow.name} 
                                style={{ 
                                  width: '36px', 
                                  height: '36px', 
                                  borderRadius: '6px',
                                  border: isReplacement ? '2px solid #8b5cf6' : '2px solid #cbd5e1',
                                  backgroundColor: '#1e293b',
                                  cursor: 'help',
                                  display: 'block'
                                }} 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginBottom: '8px',
                                padding: '6px 10px',
                                backgroundColor: '#1f2937',
                                color: 'white',
                                fontSize: '0.75rem',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                opacity: 0,
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s',
                                zIndex: 1000,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                              }}
                              className="skill-tooltip"
                              >
                                {skillToShow.skill_name || skillToShow.name}
                              </div>
                            </div>
                          )
                        );
                      });
                    } else {
                      // Show only base skills
                      return getHeroSkills(hero.id)
                        .filter(skill => !(skill.is_transformed === 1 || skill.is_transformed === true))
                        .map((skill, idx) => (
                    (skill.image || skill.preview) && (
                      <div 
                        key={idx}
                        className="skill-tooltip-wrapper"
                        style={{ position: 'relative', display: 'inline-block' }}
                      >
                        <img 
                          src={skill.image || skill.preview} 
                          alt={skill.skill_name || skill.name} 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '6px',
                            border: '2px solid #cbd5e1',
                            backgroundColor: '#1e293b',
                            cursor: 'help',
                            display: 'block'
                          }} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: '8px',
                          padding: '6px 10px',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                          opacity: 0,
                          pointerEvents: 'none',
                          transition: 'opacity 0.2s',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                        className="skill-tooltip"
                        >
                          {skill.skill_name || skill.name}
                        </div>
                      </div>
                    )
                  ));
                    }
                  })()}
                  </div>
                  {/* Toggle button if there are transformed skills */}
                  {getHeroSkills(hero.id).some(s => s.is_transformed === 1 || s.is_transformed === true) && (
                    <button
                      type="button"
                      onClick={() => {
                        const transformedSkills = getHeroSkills(hero.id).filter(s => s.is_transformed === 1 || s.is_transformed === true);
                        const maxTransformations = Math.max(
                          ...getHeroSkills(hero.id)
                            .filter(s => !s.is_transformed)
                            .map(baseSkill => 
                              transformedSkills.filter(t => t.replaces_skill_id === baseSkill.id).length
                            )
                        );
                        
                        const currentIndex = transformationIndex[hero.id] || 0;
                        const nextIndex = (currentIndex + 1) % (maxTransformations + 1);
                        
                        setTransformationIndex(prev => ({
                          ...prev,
                          [hero.id]: nextIndex
                        }));
                        
                        setTransformedState(prev => ({
                          ...prev,
                          [hero.id]: nextIndex > 0
                        }));
                      }}
                      style={{
                        padding: '3px 6px',
                        fontSize: '0.65rem',
                        background: transformedState[hero.id] ? '#8b5cf6' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        alignSelf: 'flex-start'
                      }}
                    >
                      {(() => {
                        const currentIndex = transformationIndex[hero.id] || 0;
                        if (currentIndex === 0) return '⚡';
                        
                        const transformedSkills = getHeroSkills(hero.id).filter(s => s.is_transformed === 1 || s.is_transformed === true);
                        const maxTransformations = Math.max(
                          ...getHeroSkills(hero.id)
                            .filter(s => !s.is_transformed)
                            .map(baseSkill => 
                              transformedSkills.filter(t => t.replaces_skill_id === baseSkill.id).length
                            )
                        );
                        
                        return maxTransformations > 1 
                          ? `${currentIndex}/${maxTransformations}`
                          : '🔄';
                      })()}
                    </button>
                  )}
                </div>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
              );
              })()}
            </td>
            <td>
              <div className="actions" style={{ gap: '5px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => onEdit(hero)}
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(hero.id)}
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {totalPages > 1 && (
      <div style={{ 
        marginTop: '20px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '10px'
      }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: currentPage === 1 ? '#f3f4f6' : '#ffffff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#9ca3af' : '#374151'
          }}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: currentPage === page ? '#3b82f6' : '#ffffff',
                color: currentPage === page ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontWeight: currentPage === page ? 'bold' : 'normal'
              }}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: currentPage === totalPages ? '#f3f4f6' : '#ffffff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#9ca3af' : '#374151'
          }}
        >
          Next →
        </button>
      </div>
    )}
    </>
  );
}

export default HeroList;
