import React, { useState, useMemo } from 'react';
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

async function fetchPlayers(page: number): Promise<PlayersResponse> {
  const res = await fetch(`${API_URL}/users?page=${page}&limit=20`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export const PlayersPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);

  useSEO({
    title: t('players.pageTitle'),
    description: t('players.pageDescription'),
    noindex: true,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['players', page],
    queryFn: () => fetchPlayers(page),
  });

  const users = useMemo(() => {
    const list = [...(data?.users ?? [])];
    list.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [data, sortAsc]);

  if (isLoading) return <Loader />;
  if (isError) return <div className={styles.error}>{t('common.error')}</div>;

  const totalPages = data?.pages ?? 1;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{t('players.pageTitle')}</h1>
          {data?.total != null && (
            <p className={styles.count}>{t('players.totalCount', { count: data.total })}</p>
          )}
        </div>
        <button className={styles.sortBtn} onClick={() => setSortAsc(v => !v)}>
          {t('players.colDate')} {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      <div className={styles.grid}>
        {users.map((user, idx) => (
          <Link
            key={user.id}
            to={`/profile/${user.id}`}
            className={styles.card}
          >
            <span className={styles.cardNum}>{(page - 1) * 20 + idx + 1}</span>
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
              {user.created_at && (
                <span className={styles.joined}>{formatDate(user.created_at)}</span>
              )}
            </div>
            {user.main_heroes.length > 0 && (
              <div className={styles.heroes}>
                {user.main_heroes.slice(0, 3).map(h => (
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
