import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import styles from './styles.module.scss';

export const NotFoundPage: React.FC = () => {
  useSEO({ title: '404 - Page Not Found' });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles.homeLink}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};
