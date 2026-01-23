import React from 'react';
import { PatchSidebarProps } from './interface';
import styles from '../styles.module.scss';

export const PatchSidebar: React.FC<PatchSidebarProps> = ({ 
  patchVersions, 
  selectedPatch, 
  onPatchSelect 
}) => {
  return (
    <aside className={styles.sidebar}>
      <h2>Patch History</h2>
      <div className={styles.patchList}>
        {patchVersions.map((patch) => (
          <button
            key={patch.version}
            className={`${styles.patchItem} ${selectedPatch === patch.version ? styles.active : ''}`}
            onClick={() => onPatchSelect(patch.version)}
          >
            <span className={styles.patchVersion}>Patch {patch.version}</span>
            <span className={styles.patchDate}>{patch.release_date}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
