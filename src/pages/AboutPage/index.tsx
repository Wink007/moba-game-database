import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

export const AboutPage = () => {
  const { t } = useTranslation();

  useSEO({
    title: t('about.title') + ' — Mobile Legends: Bang Bang',
    description: t('about.subtitle'),
  });

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{t('about.title')}</h1>
        <p className={styles.subtitle}>{t('about.subtitle')}</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>{t('about.whatTitle')}</h2>
          <p>{t('about.whatP1')}</p>
          <p>{t('about.whatP2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('about.featuresTitle')}</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🧙</span>
              <div><h3>{t('about.f1Title')}</h3><p>{t('about.f1Desc')}</p></div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <div><h3>{t('about.f2Title')}</h3><p>{t('about.f2Desc')}</p></div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚔️</span>
              <div><h3>{t('about.f3Title')}</h3><p>{t('about.f3Desc')}</p></div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔨</span>
              <div><h3>{t('about.f4Title')}</h3><p>{t('about.f4Desc')}</p></div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📋</span>
              <div><h3>{t('about.f5Title')}</h3><p>{t('about.f5Desc')}</p></div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🌐</span>
              <div><h3>{t('about.f6Title')}</h3><p>{t('about.f6Desc')}</p></div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{t('about.whoTitle')}</h2>
          <p>{t('about.whoP1')}</p>
          <p>{t('about.whoP2')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('about.dataTitle')}</h2>
          <p>{t('about.dataP')}</p>
        </section>

        <section className={styles.section}>
          <h2>{t('about.contactTitle')}</h2>
          <p>{t('about.contactP')}</p>
          <ul className={styles.contactList}>
            <li>
              Email:{' '}
              <a href="mailto:contact@mobawiki.com" className={styles.link}>
                contact@mobawiki.com
              </a>
            </li>
            <li>
              GitHub:{' '}
              <a
                href="https://github.com/Wink007/moba-game-database"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                github.com/Wink007/moba-game-database
              </a>
            </li>
          </ul>
        </section>

        <div className={styles.legalLinks}>
          <Link to="/legal?tab=privacy" className={styles.legalLink}>{t('footer.privacyPolicy')}</Link>
          <span>•</span>
          <Link to="/legal?tab=terms" className={styles.legalLink}>{t('footer.termsOfService')}</Link>
          <span>•</span>
          <Link to="/legal?tab=cookies" className={styles.legalLink}>{t('cookieConsent.cookiePolicy', 'Cookie Policy')}</Link>
        </div>
      </div>
    </div>
  );
};
