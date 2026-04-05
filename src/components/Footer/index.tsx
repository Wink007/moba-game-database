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
                            <span className={styles.separator}>•</span>
                            <a
                                href="https://t.me/vikno_ua"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.telegramLink}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.5l-2.945-.918c-.64-.203-.654-.64.136-.954l11.49-4.43c.532-.194.998.131.833.954l.21-.931z"/></svg>
                                vikno_ua
                            </a>
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
