import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import styles from './styles.module.scss';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mobawiki.mlbb';
const isWeb = !Capacitor.isNativePlatform();

export const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {isWeb && (
                        <div className={styles.appBadge}>
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.playBadgeLink}
                                aria-label="Get it on Google Play"
                            >
                                <img
                                    src="/google-play-badge.png"
                                    alt="Get it on Google Play"
                                    className={styles.playBadgeImg}
                                    width={180}
                                    height={53}
                                />
                            </a>
                        </div>
                    )}
                    <div className={styles.main}>
                        <p className={styles.copyright}>
                            © {currentYear} {t('footer.copyright')}
                        </p>
                        <span className={styles.separator}>•</span>
                        <p className={styles.tagline}>
                            {t('footer.tagline')}
                        </p>
                    </div>
                    <div className={styles.legal}>
                        <p className={styles.disclaimer}>
                            <strong>DISCLAIMER:</strong> {t('footer.disclaimer')}
                        </p>
                        <div className={styles.legalLinks}>
                            <Link to="/about" className={styles.link}>
                                {t('footer.about', 'About')}
                            </Link>
                            <span className={styles.separator}>•</span>
                            <Link to="/legal?tab=privacy" className={styles.link}>
                                {t('footer.privacyPolicy')}
                            </Link>
                            <span className={styles.separator}>•</span>
                            <Link to="/legal?tab=terms" className={styles.link}>
                                {t('footer.termsOfService')}
                            </Link>
                        </div>
                        <p className={styles.trademarks}>
                            {t('footer.trademarks')}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
