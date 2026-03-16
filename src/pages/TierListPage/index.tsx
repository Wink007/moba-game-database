import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroToSlug } from '../../utils/heroSlug';
import { useGameStore } from '../../store/gameStore';
import { useFilterSettingsStore } from '../../store/filterSettingsStore';
import { useHeroRanksQuery, useHeroesQuery } from '../../queries/useHeroesQuery';
import { useAuthStore, authFetch } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';
import { Loader } from '../../components/Loader';
import { getRankOptions } from '../HeroRankPage/constants';
import { HeroRank, Hero } from '../../types';
import { TIERS, TierKey, assignTier } from './constants';
import { LazyImage } from '../../components/LazyImage';
import { getOptimizedImageUrl } from '../../utils/cloudinary';
import { getHeroName } from '../../utils/translation';
import styles from './styles.module.scss';

const LANES = [
  { value: 'all',    labelKey: 'heroes.filters.allLanes' },
  { value: 'exp',    labelKey: 'heroes.filters.expLane',  match: ['Exp Lane', 'EXP Lane'] },
  { value: 'gold',   labelKey: 'heroes.filters.goldLane', match: ['Gold Lane'] },
  { value: 'mid',    labelKey: 'heroes.filters.midLane',  match: ['Mid Lane'] },
  { value: 'jungle', labelKey: 'heroes.filters.jungle',   match: ['Jungle'] },
  { value: 'roam',   labelKey: 'heroes.filters.roam',     match: ['Roam'] },
];

type Mode = 'stats' | 'community';

interface VoteInfo {
  tier: TierKey | null;
  total: number;
  breakdown: Record<TierKey, number>;
}

export const TierListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const rankOpts = useMemo(() => getRankOptions(t), [t]);
  const { selectedGameId } = useGameStore();
  const { defaultRank } = useFilterSettingsStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>('community');
  const [rank, setRank] = useState(() => defaultRank);
  const [lane, setLane] = useState('all');
  const [openPickerId, setOpenPickerId] = useState<number | null>(null);
  const [showLoginHint, setShowLoginHint] = useState(false);
  const [showUnranked, setShowUnranked] = useState(false);

  const year = new Date().getFullYear();
  useSEO({
    title: t('tierList.title'),
    description: t('tierList.description'),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mobawiki.com/' },
          { '@type': 'ListItem', position: 2, name: 'Tier List', item: `https://mobawiki.com/${selectedGameId}/tier-list` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the best hero in Mobile Legends in ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `The best heroes change with each patch. Check our S-tier list on MOBA Wiki — updated daily based on Mythic rank win rates at mobawiki.com.` },
          },
          {
            '@type': 'Question',
            name: 'How often is the MLBB tier list updated?',
            acceptedAnswer: { '@type': 'Answer', text: 'The MOBA Wiki tier list is updated daily, reflecting the latest Mythic rank statistics and patch changes.' },
          },
          {
            '@type': 'Question',
            name: 'What makes a hero S tier in Mobile Legends?',
            acceptedAnswer: { '@type': 'Answer', text: 'S tier heroes typically have win rates above 52%, high ban rates, and are dominant in the current meta.' },
          },
        ],
      },
    ],
  });

  // ─── Stats mode data ─────────────────────────────────────────────────────
  const { data: rankData, isLoading, isError } = useHeroRanksQuery(
    selectedGameId, 1, 999, 1, rank, 'win_rate', 'desc'
  );
  const { data: heroes } = useHeroesQuery(selectedGameId);

  // ─── Community mode data ──────────────────────────────────────────────────
  const { data: communityVotesData, isLoading: votesLoading } = useQuery<{ votes: Record<string, VoteInfo> }>({
    queryKey: ['tier-votes', 'community', selectedGameId],
    queryFn: () => authFetch(`/${selectedGameId}/tier-votes`),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const { data: myVotesData } = useQuery<{ votes: Record<string, TierKey> }>({
    queryKey: ['tier-votes', 'mine', selectedGameId],
    queryFn: () => authFetch(`/${selectedGameId}/tier-votes/mine`),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const voteMutation = useMutation({
    mutationFn: ({ heroId, tier }: { heroId: number; tier: TierKey }) =>
      authFetch(`/${selectedGameId}/tier-votes`, {
        method: 'POST',
        body: JSON.stringify({ hero_id: heroId, tier }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tier-votes', 'community', selectedGameId] });
      queryClient.invalidateQueries({ queryKey: ['tier-votes', 'mine', selectedGameId] });
      setOpenPickerId(null);
    },
  });

  // ─── Click outside picker ─────────────────────────────────────────────────
  useEffect(() => {
    if (!openPickerId) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-vote-wrap]')) {
        setOpenPickerId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPickerId]);

  // ─── Stats grouping ───────────────────────────────────────────────────────
  const tieredHeroes = useMemo(() => {
    if (!rankData) return {} as Record<TierKey, HeroRank[]>;
    const groups: Record<TierKey, HeroRank[]> = { S: [], A: [], B: [], C: [], D: [] };
    for (const hero of rankData) {
      groups[assignTier(hero.win_rate)].push(hero);
    }
    return groups;
  }, [rankData]);

  const laneFilteredIds = useMemo(() => {
    if (lane === 'all' || !heroes) return null;
    const laneConfig = LANES.find(l => l.value === lane);
    if (!laneConfig?.match) return null;
    const ids = new Set<number>();
    for (const h of heroes) {
      const heroLanes = (h.lane || []).map((l: string) => l.toLowerCase());
      if (laneConfig.match!.some(m => heroLanes.includes(m.toLowerCase()))) {
        ids.add(h.id);
      }
    }
    return ids;
  }, [lane, heroes]);

  const displayTieredHeroes = useMemo(() => {
    if (!laneFilteredIds) return tieredHeroes;
    const result: Record<TierKey, HeroRank[]> = { S: [], A: [], B: [], C: [], D: [] };
    for (const key of Object.keys(tieredHeroes) as TierKey[]) {
      result[key] = tieredHeroes[key].filter(h => laneFilteredIds.has(h.hero_id));
    }
    return result;
  }, [tieredHeroes, laneFilteredIds]);

  // ─── Community grouping ───────────────────────────────────────────────────
  const communityVotes = useMemo(() => communityVotesData?.votes ?? {}, [communityVotesData]);
  const myVotes = useMemo(() => myVotesData?.votes ?? {}, [myVotesData]);

  const communityTieredHeroes = useMemo(() => {
    const groups: Record<TierKey | 'Unranked', Hero[]> = { S: [], A: [], B: [], C: [], D: [], Unranked: [] };
    if (!heroes) return groups;
    for (const hero of heroes) {
      if (laneFilteredIds && !laneFilteredIds.has(hero.id)) continue;
      const voteInfo = communityVotes[String(hero.id)];
      const tier = voteInfo?.tier as TierKey | null;
      if (tier && groups[tier]) {
        groups[tier].push(hero);
      } else {
        groups.Unranked.push(hero);
      }
    }
    return groups;
  }, [heroes, communityVotes, laneFilteredIds]);

  const totalVotes = useMemo(
    () => Object.values(communityVotes).reduce((acc, v) => acc + v.total, 0),
    [communityVotes]
  );

  const handleVote = (heroId: number, tier: TierKey) => {
    if (!user) { setShowLoginHint(true); setOpenPickerId(null); return; }
    voteMutation.mutate({ heroId, tier });
  };

  const togglePicker = (heroId: number) => {
    if (!user) { setShowLoginHint(true); return; }
    setOpenPickerId(prev => (prev === heroId ? null : heroId));
  };

  // ─── Loading states ───────────────────────────────────────────────────────
  if (mode === 'stats' && isLoading) return <Loader />;
  if (mode === 'stats' && isError) return <div className={styles.error}>{t('tierList.noData')}</div>;
  if (mode === 'community' && votesLoading && !communityVotesData) return <Loader />;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{t('tierList.title')}</h1>
          <p className={styles.description}>
            {mode === 'community' ? t('tierList.communityDesc') : t('tierList.description')}
          </p>
        </div>
        <div className={styles.headerRight}>
          {mode === 'community' && totalVotes > 0 && (
            <span className={styles.totalVotesBadge}>{totalVotes} {t('tierList.totalVotes')}</span>
          )}
          {mode === 'stats' && (
            <span className={styles.totalBadge}>
              {Object.values(displayTieredHeroes).flat().length} {t('tierList.heroes')}
            </span>
          )}
        </div>
      </div>

      {/* Mode toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'community' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('community')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          {t('tierList.community')}
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'stats' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('stats')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
          {t('tierList.stats')}
        </button>
      </div>

      {/* Login hint */}
      {showLoginHint && !user && (
        <div className={styles.loginHint}>
          <span>{t('tierList.loginToVote')}</span>
          <button className={styles.loginHintDismiss} onClick={() => setShowLoginHint(false)}>✕</button>
        </div>
      )}

      {/* Rank filter — stats only */}
      {mode === 'stats' && (
        <div className={styles.rankFilters}>
          {rankOpts.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.rankPill} ${rank === opt.value ? styles.rankPillActive : ''}`}
              onClick={() => setRank(opt.value as string)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Lane filter */}
      <div className={`${styles.laneFilters} ${mode === 'stats' ? '' : styles.laneFiltersTop}`}>
        {LANES.map(({ value, labelKey }) => (
          <button
            key={value}
            className={`${styles.lanePill} ${lane === value ? styles.lanePillActive : ''}`}
            onClick={() => setLane(value)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* ─── STATS MODE ─── */}
      {mode === 'stats' && (
        <>
          <div className={styles.tierList}>
            {TIERS.map(({ key, color, bg, border }) => {
              const list = displayTieredHeroes[key] ?? [];
              return (
                <div key={key} className={styles.tierSection} style={{ '--tc': color, '--tbg': bg, '--tborder': border } as React.CSSProperties}>
                  <div className={styles.tierHeader}>
                    <div className={styles.tierBadge}><span className={styles.tierLetter}>{key}</span></div>
                    <span className={styles.tierLabel}>{t(`tierList.label_${key}`)}</span>
                    <div className={styles.tierLine} />
                    <span className={styles.tierCount}>{list.length}</span>
                  </div>
                  <div className={styles.heroGrid}>
                    {list.length === 0 ? (
                      <span className={styles.emptyMsg}>{t('tierList.noHeroesInTier')}</span>
                    ) : (
                      list.map((hero) => (
                        <Link key={hero.id} to={`/${selectedGameId}/heroes/${heroToSlug(hero.name)}`} className={styles.heroCard}>
                          <div className={styles.heroImgWrap}>
                            <LazyImage src={getOptimizedImageUrl(hero.head || hero.image, 80)} alt={getHeroName(hero as any, i18n.language)} className={styles.heroImg} fill />
                          </div>
                          <div className={styles.heroInfo}>
                            <span className={styles.heroName}>{hero.name}</span>
                            <span className={styles.heroWr}>{hero.win_rate.toFixed(1)}%</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendTitle}>{t('tierList.winRateThresholds')}</span>
            {TIERS.map(tier => (
              <span key={tier.key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: tier.color }} />
                <strong style={{ color: tier.color }}>{tier.key}</strong>
                <span>{tier.min > 0 ? `≥ ${tier.min}%` : `< ${TIERS[TIERS.length - 2].min}%`}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {/* ─── COMMUNITY MODE ─── */}
      {mode === 'community' && (
        <div className={styles.tierList}>
          {votesLoading && !communityVotesData ? (
            <Loader />
          ) : (
            <>
              {TIERS.map(({ key, color, bg, border }) => {
                const list = communityTieredHeroes[key] ?? [];
                return (
                  <div key={key} className={styles.tierSection} style={{ '--tc': color, '--tbg': bg, '--tborder': border } as React.CSSProperties}>
                    <div className={styles.tierHeader}>
                      <div className={styles.tierBadge}><span className={styles.tierLetter}>{key}</span></div>
                      <span className={styles.tierLabel}>{t(`tierList.label_${key}`)}</span>
                      <div className={styles.tierLine} />
                      <span className={styles.tierCount}>{list.length}</span>
                    </div>
                    <div className={styles.heroGrid}>
                      {list.length === 0 ? (
                        <span className={styles.emptyMsg}>{t('tierList.noHeroesInTier')}</span>
                      ) : (
                        list.map((hero) => {
                          const voteInfo = communityVotes[String(hero.id)];
                          const myTier = myVotes[String(hero.id)] as TierKey | undefined;
                          const tierColor = TIERS.find(t => t.key === myTier)?.color;
                          const isOpen = openPickerId === hero.id;
                          return (
                            <div key={hero.id} className={styles.communityCard} data-vote-wrap="">
                              <Link to={`/${selectedGameId}/heroes/${heroToSlug(hero.name)}`} className={styles.communityCardLink}>
                                <div className={styles.heroImgWrap}>
                                  <LazyImage src={getOptimizedImageUrl(hero.head || hero.image, 80)} alt={getHeroName(hero as any, i18n.language)} className={styles.heroImg} fill />
                                </div>
                                <div className={styles.heroInfo}>
                                  <span className={styles.heroName}>{hero.name}</span>
                                  {voteInfo?.total > 0 && (
                                    <span className={styles.communityVoteCount}>{voteInfo.total} {t('tierList.votes')}</span>
                                  )}
                                </div>
                              </Link>
                              <button
                                className={styles.castVoteBtn}
                                style={myTier ? { '--vc': tierColor } as React.CSSProperties : undefined}
                                onClick={(e) => { e.preventDefault(); togglePicker(hero.id); }}
                                title={t('tierList.vote')}
                                aria-haspopup="listbox"
                                aria-expanded={isOpen}
                              >
                                <span className={styles.castVoteBtnText}>{myTier ? myTier : '+'}</span>
                              </button>
                              {isOpen && (
                                <div className={styles.votePicker} role="listbox" aria-label={t('tierList.placeTo')}>
                                  <span className={styles.votePickerLabel}>{t('tierList.placeTo')}</span>
                                  <div className={styles.votePickerBtns}>
                                    {TIERS.map(t2 => (
                                      <button
                                        key={t2.key}
                                        role="option"
                                        aria-selected={myTier === t2.key}
                                        className={`${styles.votePickerBtn} ${myTier === t2.key ? styles.votePickerBtnActive : ''}`}
                                        style={{ '--tc': t2.color, '--tbg': t2.bg } as React.CSSProperties}
                                        onClick={() => handleVote(hero.id, t2.key)}
                                        disabled={voteMutation.isPending}
                                      >
                                        {t2.key}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Unranked */}
              {communityTieredHeroes.Unranked.length > 0 && (
                <div className={styles.tierSection} style={{ '--tc': '#475569', '--tbg': 'rgba(71,85,105,0.08)', '--tborder': 'rgba(71,85,105,0.2)' } as React.CSSProperties}>
                  <div className={styles.tierHeader} style={{ cursor: 'pointer' }} onClick={() => setShowUnranked(v => !v)}>
                    <div className={styles.tierBadge}><span className={styles.tierLetter} style={{ fontSize: '0.7rem' }}>?</span></div>
                    <span className={styles.tierLabel}>{t('tierList.unranked')}</span>
                    <div className={styles.tierLine} />
                    <span className={styles.tierCount}>{communityTieredHeroes.Unranked.length}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, opacity: 0.5, transform: showUnranked ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M7 10l5 5 5-5z"/></svg>
                  </div>
                  {showUnranked && <div className={styles.heroGrid}>
                    {communityTieredHeroes.Unranked.map((hero) => {
                      const myTier = myVotes[String(hero.id)] as TierKey | undefined;
                      const tierColor = TIERS.find(t => t.key === myTier)?.color;
                      const isOpen = openPickerId === hero.id;
                      return (
                        <div key={hero.id} className={styles.communityCard} data-vote-wrap="">
                          <Link to={`/${selectedGameId}/heroes/${heroToSlug(hero.name)}`} className={styles.communityCardLink}>
                            <div className={styles.heroImgWrap}>
                              <LazyImage src={getOptimizedImageUrl(hero.head || hero.image, 80)} alt={getHeroName(hero as any, i18n.language)} className={styles.heroImg} fill />
                            </div>
                            <div className={styles.heroInfo}>
                              <span className={styles.heroName}>{hero.name}</span>
                              <span className={styles.communityVoteCount} style={{ opacity: 0.4 }}>{t('tierList.noVotes')}</span>
                            </div>
                          </Link>
                          <button
                            className={styles.castVoteBtn}
                            style={myTier ? { '--vc': tierColor } as React.CSSProperties : undefined}
                            onClick={(e) => { e.preventDefault(); togglePicker(hero.id); }}
                            title={t('tierList.vote')}
                            aria-haspopup="listbox"
                            aria-expanded={isOpen}
                          >
                            <span className={styles.castVoteBtnText}>{myTier ? myTier : '+'}</span>
                          </button>
                          {isOpen && (
                            <div className={styles.votePicker} role="listbox" aria-label={t('tierList.placeTo')}>
                              <span className={styles.votePickerLabel}>{t('tierList.placeTo')}</span>
                              <div className={styles.votePickerBtns}>
                                {TIERS.map(t2 => (
                                  <button
                                    key={t2.key}
                                    role="option"
                                    aria-selected={myTier === t2.key}
                                    className={`${styles.votePickerBtn} ${myTier === t2.key ? styles.votePickerBtnActive : ''}`}
                                    style={{ '--tc': t2.color, '--tbg': t2.bg } as React.CSSProperties}
                                    onClick={() => handleVote(hero.id, t2.key)}
                                    disabled={voteMutation.isPending}
                                  >
                                    {t2.key}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

