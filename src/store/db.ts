import Dexie, { type Table } from "dexie";
import { Board, RuleConfig, RunState } from "../data/models";

export class SlayerScapeDB extends Dexie {
  runs!: Table<RunState, string>;
  boards!: Table<Board, string>;
  rules!: Table<RuleConfig, string>;

  constructor() {
    super("slayerscape-rs3");
    this.version(1).stores({
      runs: "id, name, boardId, ruleConfigId, updatedAt",
      boards: "id, name",
      rules: "id, name"
    });
  }
}

export const db = new SlayerScapeDB();

export const seedDefaults = async () => {
  const count = await db.rules.count();
  if (count > 0) return;

  const baseRule: RuleConfig = {
    id: "relaxed-mode",
    name: "Relaxed Slayer Mode",
    skillBandSize: 10,
    allowTrading: true,
    allowGE: true,
    groundItemsOnTask: "allowed",
    groundItemsOffTask: "allowed",
    limitCombatToSlayerTasks: false,
    offTaskKillsGenerateKeys: false,
    deathPenalty: "none"
  };

  await db.rules.add(baseRule);

  const starterBoard: Board = {
    id: "starter-board",
    name: "Starter Board",
    adjacency: "4-way",
    tiles: []
  };

  await db.boards.add(starterBoard);

  const now = new Date().toISOString();
  const run: RunState = {
    id: "demo-run",
    name: "Demo Run",
    ruleConfigId: baseRule.id,
    boardId: starterBoard.id,
    gp: 0,
    keys: 0,
    history: [],
    createdAt: now,
    updatedAt: now
  };

  await db.runs.add(run);
};
