import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  useSEO({ title: t('notFound.title') });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>{t('notFound.title')}</h2>
        <p className={styles.description}>
          {t('notFound.description')}
        </p>
        <Link to="/" className={styles.homeLink}>
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
};
