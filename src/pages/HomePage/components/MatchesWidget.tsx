import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatchesQuery, Bo3Match, MatchesMode } from '../hooks/useMatchesQuery';
import { useMatchDetailQuery } from '../hooks/useMatchDetailQuery';
import styles from './MatchesWidget.module.scss';

const TIER_LABEL: Record<string, string> = { s: 'S-Tier', a: 'A-Tier', b: 'B-Tier', c: 'C-Tier' };

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function fmtDuration(secs: number | null) {
  if (!secs) return '';
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

const TeamLogo = memo<{ team: Bo3Match['team1']; size?: number }>(({ team, size = 28 }) =>
  team?.image_versions?.['50x50'] || team?.image_url
    ? <img src={team.image_versions?.['50x50'] ?? team.image_url!} alt={team.name} className={styles.teamLogo} width={size} height={size} loading="lazy" />
    : <div className={styles.teamLogoPlaceholder} style={{ width: size, height: size }}>{team?.name?.[0] ?? '?'}</div>
);

const MatchDetail = memo<{ slug: string; team1Id: number; team2Id: number }>(({ slug, team1Id, team2Id }) => {
  const { data, isLoading } = useMatchDetailQuery(slug);
  const { t } = useTranslation();
  if (isLoading) return <div className={styles.detailLoading}>Loading…</div>;
  if (!data) return null;

  const t1 = data.team1;
  const t2 = data.team2;
  const games = data.mlbb_games.filter(g => g.winner_team_id || g.status === 'live' || g.status === 'ongoing');
  const streams = data.streams ?? [];
  const vods = (data.vods ?? []).filter(v => !v.blocked);

  return (
    <div className={styles.detail}>

      {/* Game-by-game */}
      {games.length > 0 && (
        <div className={styles.detailSection}>
          <div className={styles.detailLabel}>{t('matchesWidget.gameResults')}</div>
          <div className={styles.gamesList}>
            {games.map((g, i) => {
              const t1wins = g.winner_team_id === team1Id;
              const t2wins = g.winner_team_id === team2Id;
              const isLiveGame = !g.winner_team_id;
              return (
                <div key={g.id} className={[styles.gameItem, isLiveGame ? styles.gameItemLive : ''].filter(Boolean).join(' ')}>
                  <div className={[styles.gameCell, styles.gameCellLeft, t1wins ? styles.gameCellWin : t2wins ? styles.gameCellLoss : ''].filter(Boolean).join(' ')}>
                    {t1wins && <span className={styles.gameWinBadge}>✓</span>}
                    <span className={styles.gameCellName}>{t1?.name ?? '??'}</span>
                  </div>
                  <div className={styles.gameCellCenter}>
                    <span className={styles.gameTag}>{isLiveGame ? 'LIVE' : `G${g.game_number ?? i + 1}`}</span>
                    {g.duration ? <span className={styles.gameDur}>{fmtDuration(g.duration)}</span> : null}
                  </div>
                  <div className={[styles.gameCell, styles.gameCellRight, t2wins ? styles.gameCellWin : t1wins ? styles.gameCellLoss : ''].filter(Boolean).join(' ')}>
                    <span className={styles.gameCellName}>{t2?.name ?? '??'}</span>
                    {t2wins && <span className={styles.gameWinBadge}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lineups */}
      {((t1?.players?.length ?? 0) > 0 || (t2?.players?.length ?? 0) > 0) && (
        <div className={styles.detailSection}>
          <div className={styles.detailLabel}>{t('matchesWidget.lineups')}</div>
          <div className={styles.lineups}>
            {[t1, t2].map((team, ti) => team && (
              <div key={ti} className={[styles.lineup, ti === 0 ? styles.lineupTeam1 : styles.lineupTeam2].join(' ')}>
                <div className={styles.lineupHeader}>
                  {(team.image_versions?.['50x50'] || team.image_url) &&
                    <img src={team.image_versions?.['50x50'] ?? team.image_url} alt={team.name} className={styles.lineupTeamLogo} width={16} height={16} />}
                  <span className={styles.lineupTeam}>{team.name}</span>
                </div>
                {team.players.filter(p => !p.is_coach).slice(0, 5).map(p => (
                  <div key={p.id} className={styles.player}>
                    {p.image_versions?.['50x50'] || p.image_url
                      ? <img src={p.image_versions?.['50x50'] ?? p.image_url} alt={p.nickname} className={styles.playerAvatar} width={20} height={20} />
                      : <div className={styles.playerAvatarPlaceholder}>{p.nickname[0]}</div>}
                    <span className={styles.playerNick}>{p.nickname}</span>
                    {p.country && <span className={styles.playerCountry}>{p.country.code}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className={styles.detailLinks}>
        {streams.map((s, i) => (
          <a key={s.id} href={s.raw_url} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
            ▶ {t('matchesWidget.stream')}{streams.length > 1 ? ` ${i + 1}` : ''}
            {s.language && <span className={styles.linkLang}>{s.language.toUpperCase()}</span>}
          </a>
        ))}
        {vods.map((v, i) => (
          <a key={v.id} href={v.raw_url} target="_blank" rel="noopener noreferrer" className={[styles.detailLink, styles.detailLinkVod].join(' ')}>
            ▷ {t('matchesWidget.vod')}{vods.length > 1 ? ` ${i + 1}` : ''}
            {v.language && <span className={styles.linkLang}>{v.language.toUpperCase()}</span>}
          </a>
        ))}
        <a href={`https://bo3.gg/mlbb/matches/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.detailLinkSecondary}>bo3.gg ↗</a>
      </div>
    </div>
  );
});

const MatchRow = memo<{ match: Bo3Match; mode: MatchesMode; expanded: boolean; onToggle: (slug: string) => void }>(
  ({ match, mode, expanded, onToggle }) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished' || mode === 'finished';
  const ai = match.ai_predictions;
  const bet = match.bet_updates;
  const t1Wins = match.team1_score > match.team2_score;
  const t2Wins = match.team2_score > match.team1_score;
  const hasOdds = !isFinished && bet?.team_1?.active && bet?.team_2?.active;
  const handleClick = useCallback(() => onToggle(match.slug), [onToggle, match.slug]);

  return (
    <div className={[styles.matchRow, isLive ? styles.live : '', isFinished ? styles.finished : '', expanded ? styles.expanded : ''].filter(Boolean).join(' ')}>
      <div className={styles.rowMain} onClick={handleClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && handleClick()}>

        {/* Time */}
        <div className={styles.colTime}>
          {isLive
            ? <span className={styles.liveBadge}><span className={styles.liveDot} />LIVE</span>
            : <span className={styles.timeText}>{fmtTime(match.start_date)}</span>
          }
        </div>

        {/* Face-off */}
        <div className={styles.faceoff}>
          <div className={[styles.side, styles.sideLeft, isFinished && t1Wins ? styles.winner : '', isFinished && !t1Wins && match.team1_score !== match.team2_score ? styles.loser : ''].filter(Boolean).join(' ')}>
            <span className={styles.teamName}>{match.team1?.name ?? '??'}</span>
            <TeamLogo team={match.team1} />
          </div>

          <div className={styles.center}>
            {(isFinished || isLive) ? (
              <div className={styles.score}>
                <span className={t1Wins ? styles.scoreW : styles.scoreL}>{match.team1_score}</span>
                <span className={styles.scoreSep}>:</span>
                <span className={t2Wins ? styles.scoreW : styles.scoreL}>{match.team2_score}</span>
              </div>
            ) : (
              <span className={styles.boTag}>BO{match.bo_type}</span>
            )}
          </div>

          <div className={[styles.side, styles.sideRight, isFinished && t2Wins ? styles.winner : '', isFinished && !t2Wins && match.team1_score !== match.team2_score ? styles.loser : ''].filter(Boolean).join(' ')}>
            <TeamLogo team={match.team2} />
            <span className={styles.teamName}>{match.team2?.name ?? '??'}</span>
          </div>
        </div>

        {/* Tournament */}
        <div className={styles.colTournament}>
          {match.tournament && (
            <div className={styles.tournMain}>
              {(match.tournament.image_versions?.['50x50'] || match.tournament.image_url) && (
                <img src={match.tournament.image_versions?.['50x50'] ?? match.tournament.image_url} alt="" className={styles.tournLogo} width={16} height={16} loading="lazy" />
              )}
              <span className={styles.tournName}>{match.tournament.name}</span>
            </div>
          )}
          {match.tier && (
            <span className={styles.tierBadge} data-tier={match.tier}>
              {TIER_LABEL[match.tier] ?? match.tier.toUpperCase()}
            </span>
          )}
        </div>

        {/* Odds */}
        <div className={styles.colOdds}>
          {hasOdds ? (
            <div className={styles.oddsStack}>
              <span className={styles.oddPill}>{bet!.team_1!.coeff.toFixed(2)}</span>
              <span className={styles.oddPill}>{bet!.team_2!.coeff.toFixed(2)}</span>
            </div>
          ) : ai && !isFinished ? (
            <span className={styles.aiChip}>AI {ai.prediction_team1_score}:{ai.prediction_team2_score}</span>
          ) : null}
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>

      </div>
      {expanded && <MatchDetail slug={match.slug} team1Id={match.team1_id} team2Id={match.team2_id} />}
    </div>
  );
});

const SkeletonRow = memo(() => (
  <div className={[styles.matchRow, styles.skeleton].join(' ')}>
    <div className={styles.rowMain}>
      <div className={styles.skelTime} />
      <div className={styles.faceoff}>
        <div className={[styles.side, styles.sideLeft].join(' ')}><div className={styles.skelTeam} /></div>
        <div className={styles.center}><div className={styles.skelCenter} /></div>
        <div className={[styles.side, styles.sideRight].join(' ')}><div className={styles.skelTeam} /></div>
      </div>
      <div className={styles.skelTourn} />
      <div className={styles.skelOdds} />
    </div>
  </div>
));

// Stable skeleton array — no re-creation on every render
const SKELETONS = [0, 1, 2];

export const MatchesWidget: React.FC = () => {
  const [mode, setMode] = useState<MatchesMode>('upcoming');
  const [date, setDate] = useState(todayISO);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const { data, isLoading, isError } = useMatchesQuery(date, mode);
  const { t } = useTranslation();

  const today = todayISO();
  const isToday = date === today;

  useEffect(() => {
    if (!data || data.matches.length > 0) return;
    if (mode === 'finished' && data.prevDate) setDate(data.prevDate);
    if (mode === 'upcoming' && data.nextDate) setDate(data.nextDate);
  }, [data, mode]);

  const handleModeChange = useCallback((m: MatchesMode) => {
    setMode(m);
    setDate(todayISO());
    setExpandedSlug(null);
  }, []);

  const handleToggle = useCallback((slug: string) => {
    setExpandedSlug(prev => prev === slug ? null : slug);
  }, []);

  const handlePrev = useCallback(() => { if (data?.prevDate) setDate(data.prevDate); }, [data?.prevDate]);
  const handleNext = useCallback(() => { if (data?.nextDate) setDate(data.nextDate); }, [data?.nextDate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.pulse} />
          <span className={styles.title}>{t('matchesWidget.title')}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            <button className={[styles.tab, mode === 'upcoming' ? styles.tabActive : ''].join(' ')} onClick={() => handleModeChange('upcoming')}>{t('matchesWidget.upcoming')}</button>
            <button className={[styles.tab, mode === 'finished' ? styles.tabActive : ''].join(' ')} onClick={() => handleModeChange('finished')}>{t('matchesWidget.results')}</button>
          </div>
          <span className={styles.source}>bo3.gg</span>
          <div className={styles.dateNav}>
            <button className={styles.navBtn} onClick={handlePrev} disabled={!data?.prevDate} aria-label="Previous day">‹</button>
            <span className={styles.dateLabel}>{isToday ? t('matchesWidget.today') : fmtDate(date + 'T00:00:00')}</span>
            <button className={styles.navBtn} onClick={handleNext} disabled={!data?.nextDate} aria-label="Next day">›</button>
          </div>
        </div>
      </div>

      <div className={styles.matchList}>
        {isLoading && SKELETONS.map(i => <SkeletonRow key={i} />)}
        {isError && <div className={styles.empty}>{t('matchesWidget.error')}</div>}
        {!isLoading && !isError && data?.matches.length === 0 && <div className={styles.empty}>{t('matchesWidget.empty')}</div>}
        {!isLoading && data?.matches.map(m => (
          <MatchRow
            key={m.id}
            match={m}
            mode={mode}
            expanded={expandedSlug === m.slug}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
};
