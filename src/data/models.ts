export type TileType = "skill_band" | "quest" | "achievement" | "utility";
export type TileState = "hidden" | "visible" | "unlocked" | "claimed" | "locked";

export interface Coordinates {
  x: number;
  y: number;
}

export interface SlayerMaster {
  id: string;
  name: string;
  tasks: number;
  keysFound: number;
  keyPool: number;
  requirement: string;
  avatar: string;
}

export interface TilePayload {
  label: string;
  skill?: string;
  questId?: string;
  achievementId?: string;
  band?: [number, number];
}

export interface Tile {
  id: string;
  type: TileType;
  payload: TilePayload;
  coords: Coordinates;
  cost: number;
  state: TileState;
}

export interface Board {
  id: string;
  name: string;
  adjacency: "4-way" | "8-way";
  tiles: Tile[];
}

export interface KeyPool {
  master: string;
  total: number;
  remaining: number;
}

export interface RunState {
  id: string;
  name: string;
  ruleConfigId: string;
  boardId: string;
  gp: number;
  keys: number;
  boardSize?: number;
  offset?: Coordinates;
  masters?: SlayerMaster[];
  keyPools?: KeyPool[];
  history: Array<{
    id: string;
    master: string;
    completedAt: string;
    keysAwarded: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface RuleConfig {
  id: string;
  name: string;
  skillBandSize: number;
  allowTrading: boolean;
  allowGE: boolean;
  groundItemsOnTask: "allowed" | "restricted";
  groundItemsOffTask: "allowed" | "restricted";
  limitCombatToSlayerTasks: boolean;
  offTaskKillsGenerateKeys: boolean;
  deathPenalty: "none" | "lose_key" | "lock_tile";
}

export interface SkillDefinition {
  name: string;
  id: string;
  maxLevel: number;
  elite?: boolean;
}
