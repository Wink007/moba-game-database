export enum Lanes {
    EXP_LANE = 'Exp Lane',
    JUNGLE = 'Jungle',
    MID_LANE = 'Mid Lane',
    ROAM = 'Roam',
    GOLD_LANE = 'Gold Lane',
}

export const LanesIcons: Record<Lanes, string> = {
    [Lanes.EXP_LANE]: '/exp.svg',
    [Lanes.JUNGLE]: '/jungle.svg',
    [Lanes.MID_LANE]: '/mid.svg',
    [Lanes.ROAM]: '/roam.svg',
    [Lanes.GOLD_LANE]: '/gold.svg',
}