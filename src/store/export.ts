import { db } from "./db";
import { AchievementProgress, Board, RuleConfig, RunState } from "../data/models";
import { APP_VERSION } from "../version";

export interface ExportBundle {
  runs: RunState[];
  boards: Board[];
  rules: RuleConfig[];
  achievementProgress?: Record<string, AchievementProgress>;
  playerName?: string;
  exportedAt: string;
  version: string;
}

export interface ExportExtras {
  achievementProgress?: Record<string, AchievementProgress>;
  playerName?: string;
  version?: string;
}

export const exportAll = async (extras?: ExportExtras): Promise<ExportBundle> => {
  const [runs, boards, rules] = await Promise.all([db.runs.toArray(), db.boards.toArray(), db.rules.toArray()]);
  return {
    runs,
    boards,
    rules,
    achievementProgress: extras?.achievementProgress ?? {},
    playerName: extras?.playerName,
    exportedAt: new Date().toISOString(),
    version: extras?.version ?? APP_VERSION
  };
};

export const importBundle = async (bundle: ExportBundle) => {
  await db.transaction("rw", [db.runs, db.boards, db.rules], async () => {
    await Promise.all([db.runs.clear(), db.boards.clear(), db.rules.clear()]);
    await db.rules.bulkAdd(bundle.rules);
    await db.boards.bulkAdd(bundle.boards);
    await db.runs.bulkAdd(bundle.runs);
  });
};
