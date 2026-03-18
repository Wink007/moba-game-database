import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import(/* webpackChunkName: "locale-en" */ '../../locales/en.json'),
  uk: () => import(/* webpackChunkName: "locale-uk" */ '../../locales/uk.json'),
  id: () => import(/* webpackChunkName: "locale-id" */ '../../locales/id.json'),
};

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng: string) => {
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      const loader = localeLoaders[lng];
      if (loader) {
        const { default: data } = await loader();
        i18n.addResourceBundle(lng, 'translation', data, true, true);
      }
    }
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
      <button
        className={`${styles.langButton} ${i18n.language === 'id' ? styles.active : ''}`}
        onClick={() => changeLanguage('id')}
      >
        ID
      </button>
    </div>
  );
};
