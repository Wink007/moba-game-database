import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkillsSectionProps } from './interface';
import { getSkillName, getSkillDescription } from '../../../utils/translation';
import { sanitizeHtml } from '../../../utils/sanitize';
import styles from '../styles.module.scss';

export const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({ 
  displaySkills, 
  selectedSkillIndex, 
  selectedSkill,
  maxTransforms,
  transformIndex,
  changedIndices,
  onSkillSelect,
  onTransformCycle 
}) => {
  const { t, i18n } = useTranslation();
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
              className={`${styles.skillTab} ${selectedSkillIndex === index ? styles.skillTabActive : ''} ${changedIndices.has(index) ? styles.skillTabTransformed : ''}`}
              onClick={() => onSkillSelect(index)}
            >
              {skill.image && (
                <img src={skill.image} alt={getSkillName(skill, i18n.language)} />
              )}
              {skill.skill_type && (
                <div className={`${styles.skillTabBadge} ${styles[skill.skill_type]}`}>
                  {skill.skill_type === 'passive' ? 'P' : 'A'}
                </div>
              )}
              {changedIndices.has(index) && (
                <div className={styles.skillTabChangedDot} />
              )}
            </div>
          ))}
          {maxTransforms > 0 && (
            <button
              onClick={onTransformCycle}
              className={`${styles.transformButton} ${transformIndex > 0 ? styles.transformButtonActive : ''}`}
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
                <h3 className={styles.skillDetailName}>{getSkillName(selectedSkill, i18n.language)}</h3>
                
                {/* Effect Types badges */}
                <div className={styles.skillBadges}>
                  {selectedSkill.effect_types && selectedSkill.effect_types.length > 0 && (
                    selectedSkill.effect_types.map((effectType, idx) => {
                      const displayType = typeof effectType === 'string' 
                        ? effectType 
                        : ((effectType as Record<string, unknown>)?.name as string || JSON.stringify(effectType));
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
                      if (typeof value === 'object' && value !== null && 'levels' in value && Array.isArray((value as Record<string, unknown>).levels)) {
                        displayValue = ((value as Record<string, unknown>).levels as string[]).join(' / ');
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

                {(selectedSkill.skill_description || selectedSkill.skill_description_uk) && (
                  <div 
                    className={styles.skillDetailDescription}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(getSkillDescription(selectedSkill, i18n.language)) }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
