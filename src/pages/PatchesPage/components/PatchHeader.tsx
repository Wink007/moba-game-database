import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatchHeaderProps } from './interface';
import styles from '../styles.module.scss';

export const PatchHeader: React.FC<PatchHeaderProps> = ({ 
  version, 
  releaseDate, 
  designersNote 
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.patchHeader}>
        <h1>{t('patches.version')} {version}</h1>
        <p className={styles.releaseDate}>{releaseDate}</p>
      </div>

      {designersNote && designersNote.trim() && (
        <div className={styles.section}>
          <div className={styles.designersNote}>
            <h2>Designer's Note</h2>
            <p className={styles.noteContent} dangerouslySetInnerHTML={{ __html: designersNote }} />
          </div>
        </div>
      )}
    </>
  );
};
