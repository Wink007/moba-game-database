import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        className={`${styles.langButton} ${i18n.language === 'en' ? styles.active : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`${styles.langButton} ${i18n.language === 'uk' ? styles.active : ''}`}
        onClick={() => changeLanguage('uk')}
      >
        UA
      </button>
    </div>
  );
};
