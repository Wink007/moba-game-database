import { useState, useCallback, useEffect } from 'react';
import { useAuthStore, authFetch } from '../../../../store/authStore';
import type { UserBuild } from './interface';

export const useBuildForm = (heroId: number, refetchCommunity: () => void) => {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBuild, setEditingBuild] = useState<UserBuild | null>(null);
  const [myBuilds, setMyBuilds] = useState<UserBuild[]>([]);
  const [loadingMyBuilds, setLoadingMyBuilds] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [buildName, setBuildName] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedEmblem, setSelectedEmblem] = useState<number | null>(null);
  const [selectedSpell1, setSelectedSpell1] = useState<number | null>(null);
  const [selectedSpell2, setSelectedSpell2] = useState<number | null>(null);
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const fetchMyBuilds = useCallback(async () => {
    if (!user) return;
    setLoadingMyBuilds(true);
    try {
      const data = await authFetch(`/builds?hero_id=${heroId}`);
      setMyBuilds(data);
    } catch {
      // ignore
    } finally {
      setLoadingMyBuilds(false);
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
    setSelectedTalents([]);
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
      setSelectedTalents(build.talents || []);
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
      const body = {
        name: buildName,
        items: selectedItems,
        emblem_id: selectedEmblem,
        talents: selectedTalents,
        spell1_id: selectedSpell1,
        spell2_id: selectedSpell2,
        notes,
      };
      if (editingBuild) {
        await authFetch(`/builds/${editingBuild.id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await authFetch('/builds', { method: 'POST', body: JSON.stringify({ hero_id: heroId, ...body }) });
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

  return {
    showForm, setShowForm,
    editingBuild,
    myBuilds, loadingMyBuilds,
    saving,
    buildName, setBuildName,
    selectedItems, selectedEmblem, setSelectedEmblem,
    selectedSpell1, setSelectedSpell1,
    selectedSpell2, setSelectedSpell2,
    selectedTalents, setSelectedTalents,
    notes, setNotes,
    itemSearch, setItemSearch,
    openForm, handleSave, handleDelete, toggleItem,
  };
};
