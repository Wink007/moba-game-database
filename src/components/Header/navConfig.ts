import { FF_SOCIAL, FF_PLAYERS } from '../../config';
import type { NavItem } from './types';
import {
  HeroesIcon, ItemsIcon, EmblemsIcon, SpellsIcon, PatchesIcon,
  FavoritesIcon, CounterPickIcon, TierListIcon, RankingsIcon, PlayersIcon,
} from './icons';

export const MORE_BTN_W = 52;

export const NAV_ITEMS: NavItem[] = [
  { key: 'heroes',      path: 'heroes',       Icon: HeroesIcon },
  { key: 'items',       path: 'items',        Icon: ItemsIcon },
  { key: 'emblems',     path: 'emblems',      Icon: EmblemsIcon },
  { key: 'spells',      path: 'spells',       Icon: SpellsIcon },
  { key: 'tierList',    path: 'tier-list',    Icon: TierListIcon },
  { key: 'heroRank',    path: 'hero-ranks',   Icon: RankingsIcon },
  { key: 'counterPick', path: 'counter-pick', Icon: CounterPickIcon },
  { key: 'patches',     path: 'patches',      Icon: PatchesIcon },
  { key: 'favorites',   path: 'favorites',    Icon: FavoritesIcon, mobileOnly: true },
  { key: 'players',     path: '/players',     Icon: PlayersIcon, absolute: true, playersOnly: true },
];

export const DESKTOP_NAV = NAV_ITEMS.filter(
  i => !i.mobileOnly && (!i.socialOnly || FF_SOCIAL) && (!i.playersOnly || FF_PLAYERS)
);

export const BOTTOM_NAV_MAIN: NavItem[] = [
  { key: 'heroes',      path: 'heroes',       Icon: HeroesIcon },
  { key: 'items',       path: 'items',        Icon: ItemsIcon },
  { key: 'counterPick', path: 'counter-pick', Icon: CounterPickIcon },
];

export const BOTTOM_NAV_KEYS = new Set(BOTTOM_NAV_MAIN.map(i => i.key));

export const SHEET_NAV_ITEMS = NAV_ITEMS.filter(
  i => !BOTTOM_NAV_KEYS.has(i.key) && (!i.socialOnly || FF_SOCIAL) && (!i.playersOnly || FF_PLAYERS)
);
