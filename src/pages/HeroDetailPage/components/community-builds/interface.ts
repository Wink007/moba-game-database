import type { Item } from '../../../../types/item';
import type { BattleSpell } from '../../../../types';
import type { Emblem, Talent } from '../../../../hooks/useEmblems';

export interface UserBuild {
  id: number;
  name: string;
  items: number[];
  emblem_id: number | null;
  talents: string[];
  spell1_id: number | null;
  spell2_id: number | null;
  notes: string;
  created_at: string;
  author_name?: string;
  author_picture?: string;
}

export interface BuildCardProps {
  build: UserBuild;
  isOwn: boolean;
  itemsMap: Map<number, Item>;
  emblemsMap: Map<number, Emblem>;
  spellsMap: Map<number, BattleSpell>;
  talentsMap: Map<string, Talent>;
  onEdit: (build: UserBuild) => void;
  onDelete: (buildId: number) => void;
}

export interface BuildFormModalProps {
  editingBuild: { id: number } | null;
  buildName: string;
  setBuildName: (v: string) => void;
  selectedItems: number[];
  selectedEmblem: number | null;
  setSelectedEmblem: (v: number | null) => void;
  selectedSpell1: number | null;
  setSelectedSpell1: (v: number | null) => void;
  selectedSpell2: number | null;
  setSelectedSpell2: (v: number | null) => void;
  selectedTalents: string[];
  setSelectedTalents: React.Dispatch<React.SetStateAction<string[]>>;
  notes: string;
  setNotes: (v: string) => void;
  itemSearch: string;
  setItemSearch: (v: string) => void;
  saving: boolean;
  filteredItems: Item[];
  itemsMap: Map<number, Item>;
  spells: BattleSpell[];
  emblems: Emblem[];
  tier1: Talent[];
  tier2: Talent[];
  tier3: Talent[];
  toggleItem: (id: number) => void;
  onSave: () => void;
  onClose: () => void;
}
