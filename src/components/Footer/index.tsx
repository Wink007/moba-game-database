import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
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
