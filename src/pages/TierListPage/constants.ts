export const TIERS = [
  { key: 'S', min: 53, color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)'   },
  { key: 'A', min: 51, color: '#f97316', bg: 'rgba(249,115,22,0.10)',  border: 'rgba(249,115,22,0.30)'  },
  { key: 'B', min: 49, color: '#eab308', bg: 'rgba(234,179,8,0.10)',   border: 'rgba(234,179,8,0.30)'   },
  { key: 'C', min: 47, color: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.30)'   },
  { key: 'D', min: 0,  color: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.25)' },
] as const;

export type TierKey = typeof TIERS[number]['key'];

export function assignTier(winRate: number): TierKey {
  for (const tier of TIERS) {
    if (winRate >= tier.min) return tier.key;
  }
  return 'D';
}
