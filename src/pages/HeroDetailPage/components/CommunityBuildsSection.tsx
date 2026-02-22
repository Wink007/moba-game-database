import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore, authFetch } from '../../../store/authStore';
import { useItemsQuery } from '../../../queries/useItemsQuery';
import { useEmblems } from '../../../hooks/useEmblems';
import { API_URL } from '../../../config';
import { Item } from '../../../types/item';
import styles from '../styles.module.scss';

interface BattleSpell {
  id: number;
  game_id: number;
  name: string;
  icon_url?: string;
}

interface UserBuild {
  id: number;
  name: string;
  items: number[];
  emblem_id: number | null;
  spell1_id: number | null;
  spell2_id: number | null;
  notes: string;
  created_at: string;
  author_name?: string;
  author_picture?: string;
}

interface CommunityBuildsSectionProps {
  heroId: number;
  gameId: number;
}

export const CommunityBuildsSection: React.FC<CommunityBuildsSectionProps> = ({ heroId, gameId }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [myBuilds, setMyBuilds] = useState<UserBuild[]>([]);
  const [editingBuild, setEditingBuild] = useState<UserBuild | null>(null);

  // Build form state
  const [buildName, setBuildName] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedEmblem, setSelectedEmblem] = useState<number | null>(null);
  const [selectedSpell1, setSelectedSpell1] = useState<number | null>(null);
  const [selectedSpell2, setSelectedSpell2] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // Data queries
  const { data: items = [] } = useItemsQuery(gameId);
  const { data: emblems = [] } = useEmblems(String(gameId));
  const { data: spells = [] } = useQuery<BattleSpell[]>({
    queryKey: ['battle-spells', gameId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/battle-spells?game_id=${gameId}`);
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  });

  // Community builds (exclude own builds if logged in)
  const { data: communityBuilds = [], refetch: refetchCommunity } = useQuery<UserBuild[]>({
    queryKey: ['community-builds', heroId, user?.id],
    queryFn: async () => {
      const token = useAuthStore.getState().token;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}/heroes/${heroId}/builds`, { headers });
      return res.json();
    },
    enabled: !!heroId,
    staleTime: 60 * 1000,
  });

  // Lookup maps
  const itemsMap = React.useMemo(() => {
    const map = new Map<number, Item>();
    items.forEach((item: Item) => map.set(item.id, item));
    return map;
  }, [items]);

  const emblemsMap = React.useMemo(() => {
    const map = new Map<number, any>();
    (emblems as any[]).forEach((e: any) => map.set(e.id, e));
    return map;
  }, [emblems]);

  const spellsMap = React.useMemo(() => {
    const map = new Map<number, BattleSpell>();
    spells.forEach((s) => map.set(s.id, s));
    return map;
  }, [spells]);

  // Filter items (only Tier 3 / final items for builds, exclude jungle items usually)
  const filteredItems = React.useMemo(() => {
    let filtered = items.filter((item: Item) => (String(item.tier) === '3' || String(item.tier) === '2'));
    if (itemSearch) {
      const q = itemSearch.toLowerCase();
      filtered = filtered.filter((item: Item) => item.name?.toLowerCase().includes(q));
    }
    return filtered.slice(0, 30); // limit to 30 results
  }, [items, itemSearch]);

  // Fetch my builds for this hero
  const fetchMyBuilds = useCallback(async () => {
    if (!user) return;
    try {
      const data = await authFetch(`/builds?hero_id=${heroId}`);
      setMyBuilds(data);
    } catch {
      // ignore
    }
  }, [user, heroId]);

  useEffect(() => {
    fetchMyBuilds();
  }, [fetchMyBuilds]);

  const resetForm = () => {
    setBuildName('');
    setSelectedItems([]);
    setSelectedEmblem(null);
    setSelectedSpell1(null);
    setSelectedSpell2(null);
    setNotes('');
    setEditingBuild(null);
    setItemSearch('');
  };

  const openForm = (build?: UserBuild) => {
    if (build) {
      setEditingBuild(build);
      setBuildName(build.name);
      setSelectedItems(build.items || []);
      setSelectedEmblem(build.emblem_id);
      setSelectedSpell1(build.spell1_id);
      setSelectedSpell2(build.spell2_id);
      setNotes(build.notes || '');
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!buildName.trim() || selectedItems.length === 0) return;
    setSaving(true);
    try {
      if (editingBuild) {
        await authFetch(`/builds/${editingBuild.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: buildName,
            items: selectedItems,
            emblem_id: selectedEmblem,
            spell1_id: selectedSpell1,
            spell2_id: selectedSpell2,
            notes,
          }),
        });
      } else {
        await authFetch('/builds', {
          method: 'POST',
          body: JSON.stringify({
            hero_id: heroId,
            name: buildName,
            items: selectedItems,
            emblem_id: selectedEmblem,
            spell1_id: selectedSpell1,
            spell2_id: selectedSpell2,
            notes,
          }),
        });
      }
      setShowForm(false);
      resetForm();
      fetchMyBuilds();
      refetchCommunity();
    } catch (err) {
      console.error('Failed to save build:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (buildId: number) => {
    try {
      await authFetch(`/builds/${buildId}`, { method: 'DELETE' });
      fetchMyBuilds();
      refetchCommunity();
    } catch (err) {
      console.error('Failed to delete build:', err);
    }
  };

  const toggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) return prev.filter(id => id !== itemId);
      if (prev.length >= 6) return prev;
      return [...prev, itemId];
    });
  };

  const renderBuildCard = (build: UserBuild, isOwn: boolean) => {
    const buildItems = (build.items || []).map(id => itemsMap.get(id)).filter(Boolean);
    const emblem = build.emblem_id ? emblemsMap.get(build.emblem_id) : null;
    const spell1 = build.spell1_id ? spellsMap.get(build.spell1_id) : null;
    const spell2 = build.spell2_id ? spellsMap.get(build.spell2_id) : null;

    return (
      <div key={build.id} className={styles.cbCard}>
        <div className={styles.cbCardHeader}>
          <div className={styles.cbCardTitle}>
            <strong>{build.name}</strong>
            {build.author_name && !isOwn && (
              <span className={styles.cbAuthor}>
                {build.author_picture && (
                  <img src={build.author_picture} alt="" className={styles.cbAuthorPic} referrerPolicy="no-referrer" />
                )}
                {build.author_name}
              </span>
            )}
          </div>
          {isOwn && (
            <div className={styles.cbCardActions}>
              <button onClick={() => openForm(build)} className={styles.cbActionBtn} title={t('builds.edit')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(build.id)} className={styles.cbActionBtn} title={t('builds.delete')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Items */}
        <div className={styles.pbItemsRow}>
          {buildItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className={styles.pbItemArrow}>›</span>}
              <div className={styles.pbItem} title={item?.name}>
                {item?.icon_url ? (
                  <img src={item.icon_url} alt={item.name} className={styles.pbItemImg} loading="lazy" />
                ) : (
                  <div className={styles.pbItemEmpty}>{idx + 1}</div>
                )}
                <span className={styles.pbItemLabel}>{item?.name || '???'}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Spell + Emblem */}
        <div className={styles.pbSetupRow}>
          {spell1 && (
            <div className={styles.pbSetupGroup}>
              <span className={styles.pbSetupGroupLabel}>Spell</span>
              <div className={styles.pbSetupItem}>
                {spell1.icon_url && <img src={spell1.icon_url} alt={spell1.name} className={styles.pbSetupIcon} loading="lazy" />}
                <span className={styles.pbSetupLabel}>{spell1.name}</span>
              </div>
              {spell2 && (
                <div className={styles.pbSetupItem}>
                  {spell2.icon_url && <img src={spell2.icon_url} alt={spell2.name} className={styles.pbSetupIcon} loading="lazy" />}
                  <span className={styles.pbSetupLabel}>{spell2.name}</span>
                </div>
              )}
            </div>
          )}
          {emblem && (
            <>
              {spell1 && <span className={styles.pbSetupDivider} />}
              <div className={styles.pbSetupGroup}>
                <span className={styles.pbSetupGroupLabel}>Emblem</span>
                <div className={styles.pbSetupItem}>
                  {emblem.icon_url && <img src={emblem.icon_url} alt={emblem.name} className={styles.pbSetupIcon} loading="lazy" />}
                  <span className={styles.pbSetupLabel}>{emblem.name}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {build.notes && <div className={styles.cbNotes}>{build.notes}</div>}
      </div>
    );
  };

  return (
    <div className={styles.cbContainer}>
      {/* My Builds */}
      {user && (
        <div className={styles.cbSection}>
          <div className={styles.cbSectionHeader}>
            <h3 className={styles.sectionTitle}>{t('builds.myBuilds')}</h3>
            <button className={styles.cbCreateBtn} onClick={() => openForm()}>
              + {t('builds.create')}
            </button>
          </div>
          {myBuilds.length === 0 ? (
            <p className={styles.cbEmpty}>{t('builds.noBuilds')}</p>
          ) : (
            myBuilds.map(b => renderBuildCard(b, true))
          )}
        </div>
      )}

      {/* Community Builds */}
      <div className={styles.cbSection}>
        <h3 className={styles.sectionTitle}>{t('builds.communityBuilds')}</h3>
        {communityBuilds.length === 0 ? (
          <p className={styles.cbEmpty}>{t('builds.noCommunityBuilds')}</p>
        ) : (
          communityBuilds.map(b => renderBuildCard(b, false))
        )}
      </div>

      {/* Build Form Modal */}
      {showForm && (
        <div className={styles.cbOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.cbModal} onClick={e => e.stopPropagation()}>
            <div className={styles.cbModalHeader}>
              <h3>{editingBuild ? t('builds.edit') : t('builds.create')}</h3>
              <button className={styles.cbCloseBtn} onClick={() => setShowForm(false)}>×</button>
            </div>

            <div className={styles.cbFormBody}>
              {/* Build Name */}
              <div className={styles.cbFormGroup}>
                <label>{t('builds.name')}</label>
                <input
                  type="text"
                  value={buildName}
                  onChange={e => setBuildName(e.target.value)}
                  placeholder={t('builds.namePlaceholder')}
                  className={styles.cbInput}
                  maxLength={50}
                />
              </div>

              {/* Items Selection */}
              <div className={styles.cbFormGroup}>
                <label>{t('builds.items')} ({selectedItems.length}/6)</label>

                {/* Selected items */}
                <div className={styles.cbSelectedItems}>
                  {[0, 1, 2, 3, 4, 5].map(slot => {
                    const itemId = selectedItems[slot];
                    const item = itemId ? itemsMap.get(itemId) : null;
                    return (
                      <div
                        key={slot}
                        className={`${styles.cbSlot} ${item ? styles.cbSlotFilled : ''}`}
                        onClick={() => item && toggleItem(item.id)}
                        title={item ? `${item.name} (${t('builds.clickToRemove')})` : t('builds.emptySlot')}
                      >
                        {item?.icon_url ? (
                          <img src={item.icon_url} alt={item.name} />
                        ) : (
                          <span>{slot + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Item picker */}
                <input
                  type="text"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                  placeholder={t('builds.searchItems')}
                  className={styles.cbInput}
                />
                <div className={styles.cbItemGrid}>
                  {filteredItems.map((item: Item) => (
                    <button
                      key={item.id}
                      className={`${styles.cbItemPick} ${selectedItems.includes(item.id) ? styles.cbItemPicked : ''}`}
                      onClick={() => toggleItem(item.id)}
                      title={item.name}
                      disabled={selectedItems.length >= 6 && !selectedItems.includes(item.id)}
                    >
                      {item.icon_url ? (
                        <img src={item.icon_url} alt={item.name} loading="lazy" />
                      ) : (
                        <span>{item.name?.slice(0, 2)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spell Selection */}
              <div className={styles.cbFormGroup}>
                <label>{t('builds.spells')}</label>
                <div className={styles.cbSpellRow}>
                  {spells.map(spell => (
                    <button
                      key={spell.id}
                      className={`${styles.cbSpellPick} ${
                        selectedSpell1 === spell.id || selectedSpell2 === spell.id ? styles.cbSpellPicked : ''
                      }`}
                      onClick={() => {
                        if (selectedSpell1 === spell.id) setSelectedSpell1(null);
                        else if (selectedSpell2 === spell.id) setSelectedSpell2(null);
                        else if (!selectedSpell1) setSelectedSpell1(spell.id);
                        else if (!selectedSpell2) setSelectedSpell2(spell.id);
                      }}
                      title={spell.name}
                    >
                      {spell.icon_url && <img src={spell.icon_url} alt={spell.name} loading="lazy" />}
                      <span>{spell.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emblem Selection */}
              <div className={styles.cbFormGroup}>
                <label>{t('builds.emblem')}</label>
                <div className={styles.cbEmblemRow}>
                  {(emblems as any[]).map((emblem: any) => (
                    <button
                      key={emblem.id}
                      className={`${styles.cbEmblemPick} ${selectedEmblem === emblem.id ? styles.cbEmblemPicked : ''}`}
                      onClick={() => setSelectedEmblem(selectedEmblem === emblem.id ? null : emblem.id)}
                      title={emblem.name}
                    >
                      {emblem.icon_url && <img src={emblem.icon_url} alt={emblem.name} loading="lazy" />}
                      <span>{emblem.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className={styles.cbFormGroup}>
                <label>{t('builds.notes')}</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('builds.notesPlaceholder')}
                  className={styles.cbTextarea}
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.cbModalFooter}>
              <button className={styles.cbCancelBtn} onClick={() => setShowForm(false)}>
                {t('builds.cancel')}
              </button>
              <button
                className={styles.cbSaveBtn}
                onClick={handleSave}
                disabled={saving || !buildName.trim() || selectedItems.length === 0}
              >
                {saving ? '...' : t('builds.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
