import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../../store/gameStore';
import styles from './WikiIntroSection.module.scss';

export const WikiIntroSection = () => {
  const { t } = useTranslation();
  const { selectedGameId } = useGameStore();
  const gid = selectedGameId || 2;

  const features = [
    t('home.intro.f1'),
    t('home.intro.f2'),
    t('home.intro.f3'),
    t('home.intro.f4'),
    t('home.intro.f5'),
    t('home.intro.f6'),
  ];

  return (
    <section className={styles.wrapper} aria-label="About MOBA Wiki">
      <div className={styles.inner}>
        <h2 className={styles.title}>{t('home.intro.title')}</h2>
        <p className={styles.lead}>{t('home.intro.p1')}</p>

        <div className={styles.features}>
          <h3 className={styles.featuresTitle}>{t('home.intro.featuresTitle')}</h3>
          <ul className={styles.featureList}>
            {features.map((f, i) => (
              <li key={i} className={styles.featureItem}>{f}</li>
            ))}
          </ul>
        </div>

        <div className={styles.about}>
          <h3 className={styles.aboutTitle}>{t('home.intro.aboutTitle')}</h3>
          <p>{t('home.intro.p2')}</p>
          <p>{t('home.intro.p3')}</p>
        </div>

        <nav className={styles.quickLinks} aria-label="Quick navigation">
          <Link to={`/${gid}/tier-list`} className={styles.link}>{t('header.tierList')}</Link>
          <Link to={`/${gid}/heroes`} className={styles.link}>{t('header.heroes')}</Link>
          <Link to={`/${gid}/hero-ranks`} className={styles.link}>{t('header.heroRank')}</Link>
          <Link to={`/${gid}/counter-pick`} className={styles.link}>{t('header.counterPick')}</Link>
          <Link to={`/${gid}/items`} className={styles.link}>{t('header.items')}</Link>
          <Link to="/about" className={styles.link}>{t('footer.about')}</Link>
        </nav>

        <p className={styles.disclaimer}>{t('home.intro.disclaimer')}</p>
      </div>
    </section>
  );
};
