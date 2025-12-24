import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.main}>
                        <p className={styles.copyright}>
                            © {currentYear} Mobile Legends Wiki (Unofficial)
                        </p>
                        <span className={styles.separator}>•</span>
                        <p className={styles.tagline}>
                            Unofficial fan-made community guide
                        </p>
                    </div>
                    <div className={styles.legal}>
                        <p className={styles.disclaimer}>
                            <strong>DISCLAIMER:</strong> This is an unofficial fan-made guide app. Not affiliated with, endorsed, or approved by Moonton. 
                            All game content, images, and trademarks are property of their respective owners.
                        </p>
                        <div className={styles.legalLinks}>
                            <Link to="/legal?tab=privacy" className={styles.link}>
                                Privacy Policy
                            </Link>
                            <span className={styles.separator}>•</span>
                            <Link to="/legal?tab=terms" className={styles.link}>
                                Terms of Service
                            </Link>
                        </div>
                        <p className={styles.trademarks}>
                            Mobile Legends © Moonton Technology Co., Ltd. • Dota 2 © Valve • League of Legends © Riot Games
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
