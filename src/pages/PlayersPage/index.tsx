import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/Loader';
import { useSEO } from '../../hooks/useSEO';
import { API_URL } from '../../config';
import styles from './styles.module.scss';

interface MainHero {
  hero_id: number;
  name: string;
  head?: string;
  image?: string;
}

interface PlayerUser {
  id: number;
  name: string;
  picture: string;
  nickname?: string | null;
  created_at: string;
  activity_title?: string | null;
  main_heroes: MainHero[];
}

interface PlayersResponse {
  users: PlayerUser[];
  total: number;
  page: number;
  pages: number;
}

async function fetchPlayers(page: number): Promise<PlayersResponse> {
  const res = await fetch(`${API_URL}/users?page=${page}&limit=20`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export const PlayersPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  useSEO({
    title: t('players.pageTitle'),
    description: t('players.pageDescription'),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['players', page],
    queryFn: () => fetchPlayers(page),
  });

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>{t('common.error')}</div>;

  const users = data?.users ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('players.pageTitle')}</h1>
      {data?.total != null && (
        <p className={styles.count}>{t('players.totalCount', { count: data.total })}</p>
      )}

      <div className={styles.table}>
        {users.map((user, idx) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className={styles.row}
          >
            <span className={styles.rowNum}>{(page - 1) * 20 + idx + 1}</span>
            <img
              src={user.picture}
              alt={user.nickname || user.name}
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
            <div className={styles.info}>
              <span className={styles.nickname}>{user.nickname || user.name}</span>
              {user.activity_title && (
                <span className={styles.activityTitle}>{t(`profile.${user.activity_title}`)}</span>
              )}
            </div>
            <div className={styles.heroes}>
              {user.main_heroes.map(h => (
                <img
                  key={h.hero_id}
                  src={h.head || h.image || ''}
                  alt={h.name}
                  className={styles.heroIcon}
                  title={h.name}
                  loading="lazy"
                />
              ))}
            </div>
            {user.created_at && (
              <span className={styles.joined}>
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ←
          </button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
