import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore';
import { useItemsQuery } from '../../../queries/useItemsQuery';
import { useEmblems, useEmblemTalents } from '../../../hooks/useEmblems';
import type { Emblem, Talent } from '../../../hooks/useEmblems';
import { useGoogleAuth } from '../../../hooks/useGoogleAuth';
import { useEscapeKey } from '../../../hooks/useEscapeKey';
import { API_URL } from '../../../config';
import { fetcherRaw } from '../../../api/http/fetcher';
import { Item } from '../../../types/item';
import styles from '../styles.module.scss';
import { STALE_5_MIN, queryKeys } from '../../../queries/keys';
import type { BattleSpell } from '../../../types';
import { BuildCard } from './community-builds/BuildCard';
import { BuildFormModal } from './community-builds/BuildFormModal';
import { BuildSkeleton } from './community-builds/BuildSkeleton';
import { useBuildForm } from './community-builds/useBuildForm';
import type { UserBuild } from './community-builds/interface';
import type { CommunityBuildsSectionProps } from './interface';

export const CommunityBuildsSection: React.FC<CommunityBuildsSectionProps> = ({ heroId, gameId, showOnly }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Data queries
  const { data: items = [] } = useItemsQuery(gameId);
  const { data: emblems = [] } = useEmblems(String(gameId));
  const { tier1, tier2, tier3 } = useEmblemTalents(String(gameId));
  const { data: spells = [] } = useQuery<BattleSpell[]>({
    queryKey: queryKeys.spells.all(gameId),
    queryFn: () => fetcherRaw<BattleSpell[]>(`/battle-spells?game_id=${gameId}`),
    enabled: !!gameId,
    staleTime: STALE_5_MIN,
  });

  const { data: communityBuilds = [], isLoading: loadingCommunity, refetch: refetchCommunity } = useQuery<UserBuild[]>({
    queryKey: queryKeys.builds.community(heroId, user?.id),
    queryFn: async () => {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/heroes/${heroId}/builds`, { headers });
      if (!res.ok) throw new Error('Failed to load builds');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!heroId,
    staleTime: 60 * 1000,
  });

  // Form state & handlers (extracted hook)
  const form = useBuildForm(heroId, refetchCommunity);

  useEscapeKey(useCallback(() => form.setShowForm(false), [form]), form.showForm);

  const googleLogin = useGoogleAuth(() => setShowLoginPrompt(false));

  const handleCreateClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => googleLogin(), 500);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    form.openForm();
  };

  // Lookup maps
  const itemsMap = React.useMemo(() => {
    const map = new Map<number, Item>();
    items.forEach((item: Item) => map.set(item.id, item));
    return map;
  }, [items]);

  const emblemsMap = React.useMemo(() => {
    const map = new Map<number, Emblem>();
    (emblems as Emblem[]).forEach((e) => map.set(e.id, e));
    return map;
  }, [emblems]);

  const spellsMap = React.useMemo(() => {
    const map = new Map<number, BattleSpell>();
    spells.forEach((s) => map.set(s.id, s));
    return map;
  }, [spells]);

  const talentsMap = React.useMemo(() => {
    const map = new Map<string, Talent>();
    [...tier1, ...tier2, ...tier3].forEach((t) => map.set(t.name, t));
    return map;
  }, [tier1, tier2, tier3]);

  const filteredItems = React.useMemo(() => {
    let filtered = items.filter((item: Item) => String(item.tier) === '3');
    if (form.itemSearch) {
      const q = form.itemSearch.toLowerCase();
      filtered = filtered.filter((item: Item) => item.name?.toLowerCase().includes(q));
    }
    return filtered;
  }, [items, form.itemSearch]);

  return (
    <div className={styles.cbContainer}>
      {/* My Builds */}
      {(!showOnly || showOnly === 'my') && (
        <div className={styles.cbSection}>
          <div className={styles.cbSectionHeader}>
            <h3 className={styles.sectionTitle}>{t('builds.myBuilds')}</h3>
            <button className={styles.cbCreateBtn} onClick={handleCreateClick}>
              + {t('builds.create')}
            </button>
          </div>
          {showLoginPrompt && (
            <p className={styles.cbLoginPrompt}>{t('builds.loginToCreate')}</p>
          )}
          {!user ? (
            <p className={styles.cbEmpty}>{t('builds.loginToCreate')}</p>
          ) : form.loadingMyBuilds ? (
            <BuildSkeleton count={2} />
          ) : form.myBuilds.length === 0 ? (
            <p className={styles.cbEmpty}>{t('builds.noBuilds')}</p>
          ) : (
            form.myBuilds.map(b => (
              <BuildCard
                key={b.id}
                build={b}
                isOwn
                itemsMap={itemsMap}
                emblemsMap={emblemsMap}
                spellsMap={spellsMap}
                talentsMap={talentsMap}
                onEdit={form.openForm}
                onDelete={form.handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Community Builds */}
      {(!showOnly || showOnly === 'community') && (loadingCommunity || communityBuilds.length > 0) && (
        <div className={styles.cbSection}>
          <h3 className={styles.sectionTitle}>{t('builds.communityBuilds')}</h3>
          {loadingCommunity ? (
            <BuildSkeleton count={3} />
          ) : (
            communityBuilds.map(b => (
              <BuildCard
                key={b.id}
                build={b}
                isOwn={false}
                itemsMap={itemsMap}
                emblemsMap={emblemsMap}
                spellsMap={spellsMap}
                talentsMap={talentsMap}
                onEdit={form.openForm}
                onDelete={form.handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Build Form Modal */}
      {form.showForm && (
        <BuildFormModal
          editingBuild={form.editingBuild}
          buildName={form.buildName}
          setBuildName={form.setBuildName}
          selectedItems={form.selectedItems}
          selectedEmblem={form.selectedEmblem}
          setSelectedEmblem={form.setSelectedEmblem}
          selectedSpell1={form.selectedSpell1}
          setSelectedSpell1={form.setSelectedSpell1}
          selectedSpell2={form.selectedSpell2}
          setSelectedSpell2={form.setSelectedSpell2}
          selectedTalents={form.selectedTalents}
          setSelectedTalents={form.setSelectedTalents}
          notes={form.notes}
          setNotes={form.setNotes}
          itemSearch={form.itemSearch}
          setItemSearch={form.setItemSearch}
          saving={form.saving}
          filteredItems={filteredItems}
          itemsMap={itemsMap}
          spells={spells}
          emblems={emblems as Emblem[]}
          tier1={tier1}
          tier2={tier2}
          tier3={tier3}
          toggleItem={form.toggleItem}
          onSave={form.handleSave}
          onClose={() => form.setShowForm(false)}
        />
      )}
    </div>
  );
};
