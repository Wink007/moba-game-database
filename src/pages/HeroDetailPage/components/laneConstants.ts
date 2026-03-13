export const LANE_POSITIONS: Record<string, { x: number; y: number; mx?: number; my?: number }> = {
  'Gold Lane': { x: 30, y: 24, mx: 32, my: 22 },
  'Exp Lane':  { x: 64, y: 77, mx: 65, my: 73 },
  'EXP Lane':  { x: 64, y: 77, mx: 65, my: 73 },
  'Mid Lane':  { x: 47, y: 42, mx: 43, my: 51 },
  'Jungle':    { x: 40, y: 50, mx: 37, my: 41 },
  'Roam':      { x: 30, y: 35, mx: 32, my: 33 },
};

export interface ArrowConfig {
  ax: number;
  ay: number;
  max?: number;
  may?: number;
  rotation: number;
  color: string;
  glow: string;
}

// Arrow position (ax/ay %), mobile override (max/may %), direction (rotation: 0=→, 90=↓, 180=←, 270=↑), and lane color
export const LANE_ARROWS: Record<string, ArrowConfig[]> = {
  'Gold Lane': [{ ax: 23, ay: 51, max: 22, may: 51, rotation: 276, color: '#F59E0B', glow: 'rgba(245,158,11,0.7)' }],
  'Exp Lane':  [{ ax: 48, ay: 88, max: 49, may: 86, rotation: 0,   color: '#8B5CF6', glow: 'rgba(139,92,246,0.7)' }],
  'EXP Lane':  [{ ax: 48, ay: 88, max: 49, may: 86, rotation: 0,   color: '#8B5CF6', glow: 'rgba(139,92,246,0.7)' }],
  'Mid Lane':  [{ ax: 38, ay: 64, max: 38, may: 61, rotation: 325, color: '#22D3EE', glow: 'rgba(34,211,238,0.7)' }],
  'Jungle':    [
    { ax: 28, ay: 65, max: 26, may: 65, rotation: 300, color: '#10B981', glow: 'rgba(16,185,129,0.7)' },
    { ax: 35, ay: 78, max: 35, may: 75, rotation: 350, color: '#10B981', glow: 'rgba(16,185,129,0.7)' },
  ],
  'Roam':      [{ ax: 23, ay: 51, max: 22, may: 51, rotation: 276, color: '#F472B6', glow: 'rgba(244,114,182,0.7)' }],
};
