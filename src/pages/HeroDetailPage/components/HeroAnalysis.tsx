import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Hero } from '../../../types';
import styles from '../styles.module.scss';

interface HeroAnalysisProps {
  hero: Hero;
}

function getStrengths(hero: Hero, t: (key: string) => string): string[] {
  const result: string[] = [];
  const [dur, off, cc, diff] = (hero.abilityshow || []).map(Number);
  const rolesLower = (hero.roles || []).map(r => r.toLowerCase());

  if (dur >= 65) result.push(t('heroDetail.strength_highDurability'));
  if (off >= 65) result.push(t('heroDetail.strength_highOffense'));
  if (cc >= 65) result.push(t('heroDetail.strength_highCC'));
  if (!isNaN(diff) && diff < 40) result.push(t('heroDetail.strength_easyToLearn'));

  if (rolesLower.some(r => r.includes('tank'))) result.push(t('heroDetail.strength_tankAbsorb'));
  if (rolesLower.some(r => r.includes('fighter'))) result.push(t('heroDetail.strength_fighterSustain'));
  if (rolesLower.some(r => r.includes('mage'))) result.push(t('heroDetail.strength_mageRange'));
  if (rolesLower.some(r => r.includes('assassin'))) result.push(t('heroDetail.strength_assassinMobility'));
  if (rolesLower.some(r => r.includes('marksman'))) result.push(t('heroDetail.strength_marksmanDPS'));
  if (rolesLower.some(r => r.includes('support'))) result.push(t('heroDetail.strength_supportUtil'));

  return result.slice(0, 4);
}

function getWeaknesses(hero: Hero, t: (key: string) => string): string[] {
  const result: string[] = [];
  const [dur, off, , diff] = (hero.abilityshow || []).map(Number);

  if (!isNaN(dur) && dur < 35) result.push(t('heroDetail.weakness_lowDurability'));
  if (!isNaN(off) && off < 35) result.push(t('heroDetail.weakness_lowOffense'));
  if (!isNaN(diff) && diff >= 65) result.push(t('heroDetail.weakness_highDifficulty'));

  return result.slice(0, 3);
}

function getRoleTips(hero: Hero, t: (key: string) => string): string[] {
  const rolesLower = (hero.roles || []).map(r => r.toLowerCase());

  const tipKey = rolesLower.some(r => r.includes('tank'))
    ? 'tank'
    : rolesLower.some(r => r.includes('assassin'))
    ? 'assassin'
    : rolesLower.some(r => r.includes('mage'))
    ? 'mage'
    : rolesLower.some(r => r.includes('marksman'))
    ? 'marksman'
    : rolesLower.some(r => r.includes('support'))
    ? 'support'
    : rolesLower.some(r => r.includes('fighter'))
    ? 'fighter'
    : null;

  if (!tipKey) return [];
  return [
    t(`heroDetail.tip_${tipKey}_1`),
    t(`heroDetail.tip_${tipKey}_2`),
    t(`heroDetail.tip_${tipKey}_3`),
  ];
}

export const HeroAnalysis: React.FC<HeroAnalysisProps> = React.memo(({ hero }) => {
  const { t } = useTranslation();

  const strengths = useMemo(() => getStrengths(hero, t), [hero, t]);
  const weaknesses = useMemo(() => getWeaknesses(hero, t), [hero, t]);
  const tips = useMemo(() => getRoleTips(hero, t), [hero, t]);

  if (!strengths.length && !weaknesses.length && !tips.length) return null;

  return (
    <div className={styles.wikiAnalysisSection}>
      <div className={styles.wikiAnalysisHeader}>
        <h3 className={styles.wikiAnalysisTitle}>{t('heroDetail.wikiAnalysis')}</h3>
        <span className={styles.wikiAnalysisBadge}>{t('heroDetail.wikiAnalysisBadge')}</span>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className={styles.swGrid}>
          {strengths.length > 0 && (
            <div className={styles.swCard} data-type="strengths">
              <h4 className={styles.swCardTitle}>{t('heroDetail.strengths')}</h4>
              <ul className={styles.swList}>
                {strengths.map((s, i) => (
                  <li key={i} className={styles.swItem} data-type="strength">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className={styles.swCard} data-type="weaknesses">
              <h4 className={styles.swCardTitle}>{t('heroDetail.weaknesses')}</h4>
              <ul className={styles.swList}>
                {weaknesses.map((w, i) => (
                  <li key={i} className={styles.swItem} data-type="weakness">{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tips.length > 0 && (
        <div className={styles.tipsSection}>
          <h4 className={styles.tipsSectionTitle}>{t('heroDetail.playstyleTips')}</h4>
          <ol className={styles.tipsList}>
            {tips.map((tip, i) => (
              <li key={i} className={styles.tipsItem}>{tip}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
});
