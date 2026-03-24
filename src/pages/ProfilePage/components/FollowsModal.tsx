import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../../config';
import type { FollowUser, FollowsModalProps } from '../types';
import styles from '../styles.module.scss';

export const FollowsModal: React.FC<FollowsModalProps> = ({ userId, type, onClose }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_URL}/users/${userId}/${type}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) setUsers(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId, type]);

  return (
    <div className={styles.followsOverlay} onClick={onClose}>
      <div className={styles.followsModal} onClick={e => e.stopPropagation()}>
        <div className={styles.followsModalHeader}>
          <h3>{t(`profile.${type}`)}</h3>
          <button className={styles.followsModalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.followsModalBody}>
          {loading && <div className={styles.followsLoader}>{t('common.loading') || '...'}</div>}
          {!loading && users.length === 0 && (
            <div className={styles.followsEmpty}>{t('profile.noUsers') || '—'}</div>
          )}
          {users.map(u => (
            <Link key={u.id} to={`/profile/${u.id}`} className={styles.followsUserRow} onClick={onClose}>
              <img src={u.picture} alt={u.name} className={styles.followsUserAvatar} referrerPolicy="no-referrer" />
              <span className={styles.followsUserName}>{u.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
