import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkillsSectionProps } from './interface';
import styles from '../styles.module.scss';

export const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  displaySkills, 
  selectedSkillIndex, 
  selectedSkill,
  maxTransforms,
  transformIndex,
  onSkillSelect,
  onTransformCycle 
}) => {
  const { t } = useTranslation();
  if (displaySkills.length === 0) return null;

  return (
    <div className={styles.skillsSection}>
      <h2 className={styles.sectionTitle}>{t('heroDetail.abilities')}</h2>
      
      <div className={styles.skillsContainer}>
        {/* Skill Tabs */}
        <div className={styles.skillTabs}>
          {displaySkills.map((skill, index) => (
            <div 
              key={skill.id} 
              className={`${styles.skillTab} ${selectedSkillIndex === index ? styles.skillTabActive : ''}`}
              onClick={() => onSkillSelect(index)}
            >
              {skill.image && (
                <img src={skill.image} alt={skill.skill_name} />
              )}
              {skill.skill_type && (
                <div className={`${styles.skillTabBadge} ${styles[skill.skill_type]}`}>
                  {skill.skill_type === 'passive' ? 'P' : 'A'}
                </div>
              )}
            </div>
          ))}
          {maxTransforms > 0 && (
            <button
              onClick={onTransformCycle}
              className={styles.transformButton}
              title={transformIndex === 0 ? t('heroDetail.showTransformation') : t('heroDetail.transformation', { index: transformIndex })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              {transformIndex > 0 && <span className={styles.transformIndex}>{transformIndex}</span>}
            </button>
          )}
        </div>

        {/* Selected Skill Detail */}
        {selectedSkill && (
          <div className={styles.skillDetail}>
            <div className={styles.skillDetailHeader}>
              <div className={styles.skillDetailInfo}>
                <h3 className={styles.skillDetailName}>{selectedSkill.skill_name}</h3>
                
                {/* Effect Types badges */}
                <div className={styles.skillBadges}>
                  {selectedSkill.effect_types && selectedSkill.effect_types.length > 0 && (
                    selectedSkill.effect_types.map((effectType, idx) => {
                      const displayType = typeof effectType === 'string' 
                        ? effectType 
                        : ((effectType as any)?.name || JSON.stringify(effectType));
                      return (
                        <div key={idx} className={styles.effectTypeBadge}>
                          {displayType}
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Skill Parameters */}
                {selectedSkill.skill_parameters && Object.entries(selectedSkill.skill_parameters).length > 0 && (
                  <div className={styles.skillStatsInline}>
                    {Object.entries(selectedSkill.skill_parameters).map(([key, value]) => {
                      if (typeof value === 'object' && value !== null && 'name' in value) {
                        return null;
                      }
                      
                      let displayValue: string;
                      if (typeof value === 'object' && value !== null && 'levels' in value && Array.isArray((value as any).levels)) {
                        displayValue = (value as any).levels.join(' / ');
                      } else {
                        displayValue = String(value);
                      }
                      
                      return (
                        <span key={key} className={styles.skillStatInline}>
                          {key}: {displayValue}
                        </span>
                      );
                    })}
                  </div>
                )}

                {selectedSkill.skill_description && (
                  <div 
                    className={styles.skillDetailDescription}
                    dangerouslySetInnerHTML={{ __html: selectedSkill.skill_description }}
                  />
                )}
              </div>
            </div>
            
            {/* Level Scaling Table */}
            {selectedSkill.level_scaling && (() => {
              let scalingData: Array<{ levels: any[]; name: string }> = [];
              
              if (typeof selectedSkill.level_scaling === 'string') {
                try {
                  scalingData = JSON.parse(selectedSkill.level_scaling);
                } catch {
                  return null;
                }
              } else if (Array.isArray(selectedSkill.level_scaling)) {
                scalingData = selectedSkill.level_scaling;
              } else {
                return null;
              }

              if (!scalingData.length || !scalingData[0]?.levels || scalingData[0].levels.length === 0) {
                return null;
              }

              let actualMaxLevel = 0;
              scalingData.forEach(param => {
                if (param.levels && Array.isArray(param.levels)) {
                  for (let i = param.levels.length - 1; i >= 0; i--) {
                    if (param.levels[i] !== undefined && param.levels[i] !== null && param.levels[i] !== '') {
                      actualMaxLevel = Math.max(actualMaxLevel, i + 1);
                      break;
                    }
                  }
                }
              });

              if (actualMaxLevel === 0) return null;

              return (
                <div className={styles.levelScaling}>
                  <div className={styles.levelScalingTable}>
                    <table>
                      <thead>
                        <tr>
                          <th></th>
                          {Array.from({ length: actualMaxLevel }, (_, i) => (
                            <th key={i}>Lv.{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {scalingData.map((param, idx) => (
                          <tr key={idx}>
                            <td className={styles.paramName}>{param.name}</td>
                            {Array.from({ length: actualMaxLevel }, (_, levelIdx) => (
                              <td key={levelIdx}>
                                {param.levels && param.levels[levelIdx] !== undefined && param.levels[levelIdx] !== null && param.levels[levelIdx] !== ''
                                  ? param.levels[levelIdx] 
                                  : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
