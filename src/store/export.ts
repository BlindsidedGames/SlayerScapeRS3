import { db } from "./db";
import { Board, RuleConfig, RunState } from "../data/models";

export interface ExportBundle {
  runs: RunState[];
  boards: Board[];
  rules: RuleConfig[];
  exportedAt: string;
  version: string;
}

export const exportAll = async (): Promise<ExportBundle> => {
  const [runs, boards, rules] = await Promise.all([db.runs.toArray(), db.boards.toArray(), db.rules.toArray()]);
  return {
    runs,
    boards,
    rules,
    exportedAt: new Date().toISOString(),
    version: "0.0.1"
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
